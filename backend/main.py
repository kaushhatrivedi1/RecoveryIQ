"""
RecoveryIQ Python Backend — Full CV Pipeline

Endpoints:
  POST /api/analyze-speech    — transcript → structured intake JSON
  POST /api/detect-sign       — webcam frame → ASL gesture letter
  POST /api/analyze-pose      — webcam frame → joint angles + asymmetry
  POST /api/analyze-video     — multi-frame buffer → rPPG HR/HRV + pose bundle
  POST /api/full-assessment   — all signals → structured data bundle + LLM recovery report
"""

import base64
import json
import os
import re
import subprocess
import tempfile
import time
from collections import deque
from typing import List, Optional

import anthropic
import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from rom_reference import ROMReference

app = FastAPI(title="RecoveryIQ Backend", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh
rom_reference = ROMReference()

CLAUDE_KEY = os.getenv("CLAUDE_KEY", "")

WELLNESS_SYSTEM = """You are a wellness recovery assistant for Hydrawav3.
Use only wellness language: supports, recovery, mobility, restoration, balance.
Never say: treats, cures, diagnoses, medical, clinical, pain (say discomfort).
Output ONLY valid JSON — no markdown fences, no explanation."""

ASSESSMENT_SYSTEM = """You are a recovery intelligence engine for Hydrawav3 practitioners.
Analyze biometric and movement data. Output ONLY valid JSON.
Use wellness-only language. Practitioner makes all final decisions — you only surface insights."""


# ── Pydantic models ──────────────────────────────────────────────────────────

class SpeechRequest(BaseModel):
    transcript: str
    patient_name: Optional[str] = ""

class FrameRequest(BaseModel):
    frame_b64: str

class PoseFrameRequest(BaseModel):
    frame_b64: str

class VideoFramesRequest(BaseModel):
    """Buffer of base64 JPEG frames collected over ~10 seconds for rPPG."""
    frames_b64: List[str]
    fps: Optional[float] = 10.0
    patient_name: Optional[str] = ""

class MovementFramesRequest(BaseModel):
    frames_b64: List[str]
    fps: Optional[float] = 8.0
    movement_type: str
    patient_name: Optional[str] = ""

class FullAssessmentRequest(BaseModel):
    """Combined request: video frames + existing intake data for full report."""
    frames_b64: List[str]
    fps: Optional[float] = 10.0
    patient_name: Optional[str] = ""
    intake: Optional[dict] = {}  # zones, discomfort, behavior, duration, notes

class TTSRequest(BaseModel):
    text: str


# ── Keyword extraction helpers ───────────────────────────────────────────────

BODY_ZONE_KEYWORDS = {
    "neck":           ["neck", "cervical", "throat", "nape"],
    "left_shoulder":  ["left shoulder", "left arm", "left rotator"],
    "right_shoulder": ["right shoulder", "right arm", "right rotator"],
    "upper_back":     ["upper back", "between shoulders", "thoracic", "traps"],
    "lower_back":     ["lower back", "lumbar", "low back", "spine", "back pain"],
    "left_hip":       ["left hip", "left glute", "left pelvis"],
    "right_hip":      ["right hip", "right glute", "it band", "hip flexor"],
    "left_knee":      ["left knee", "left patella"],
    "right_knee":     ["right knee", "right patella"],
    "left_calf":      ["left calf", "left shin", "left leg"],
    "right_calf":     ["right calf", "right shin", "right leg"],
    "chest":          ["chest", "pec", "breast", "sternum"],
    "left_arm":       ["left elbow", "left forearm", "left bicep"],
    "right_arm":      ["right elbow", "right forearm", "right bicep"],
    "left_foot":      ["left foot", "left ankle", "left heel"],
    "right_foot":     ["right foot", "right ankle", "right heel"],
}

DURATION_KEYWORDS = {
    "Less than 6 weeks":    ["few days", "week", "recently", "just started", "new", "acute"],
    "6 weeks to 3 months":  ["month", "couple months", "few months"],
    "3 to 6 months":        ["three months", "four months", "five months", "several months"],
    "6 months to 1 year":   ["six months", "half year", "most of the year"],
    "More than 1 year":     ["year", "years", "long time", "chronic", "forever", "always"],
}

BEHAVIOR_KEYWORDS = {
    "Always Present":                ["always", "constant", "never goes away", "all the time", "every day"],
    "Comes and Goes":                ["comes and goes", "sometimes", "on and off", "flares up", "intermittent"],
    "Only with Certain Activities":  ["when i run", "when i lift", "during", "only when", "after exercise"],
    "Varies Day to Day":             ["some days", "varies", "depends", "better some days", "worse some days"],
}

def keyword_extract_zones(text):
    t = text.lower()
    return [z for z, kws in BODY_ZONE_KEYWORDS.items() if any(k in t for k in kws)] or ["lower_back"]

def keyword_extract_duration(text):
    t = text.lower()
    for dur, kws in DURATION_KEYWORDS.items():
        if any(k in t for k in kws):
            return dur
    return "3 to 6 months"

def keyword_extract_behavior(text):
    t = text.lower()
    for beh, kws in BEHAVIOR_KEYWORDS.items():
        if any(k in t for k in kws):
            return beh
    return "Comes and Goes"

def extract_discomfort(text):
    for m in re.findall(r'\b([1-9]|10)\b', text):
        v = int(m)
        if 1 <= v <= 10:
            return v
    t = text.lower()
    if any(w in t for w in ["severe", "intense", "unbearable", "terrible", "very bad"]):
        return 8
    if any(w in t for w in ["moderate", "medium", "significant", "quite"]):
        return 6
    if any(w in t for w in ["mild", "slight", "little", "minor", "small"]):
        return 3
    return 5


def synthesize_mac_speech(text: str) -> str:
    """
    Generate a WAV file using macOS `say`.
    Returns the temporary WAV file path.
    """
    if os.uname().sysname != "Darwin":
        raise HTTPException(status_code=501, detail="Local speech is only available on macOS")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    temp_dir = tempfile.mkdtemp(prefix="recoveryiq-tts-")
    aiff_path = os.path.join(temp_dir, "speech.aiff")
    wav_path = os.path.join(temp_dir, "speech.wav")

    try:
        subprocess.run(
            ["say", "-v", "Samantha", "-o", aiff_path, text],
            check=True,
            capture_output=True,
            text=True,
        )
        subprocess.run(
            ["afconvert", "-f", "WAVE", "-d", "LEI16@22050", aiff_path, wav_path],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as exc:
        raise HTTPException(status_code=500, detail=exc.stderr.strip() or "Speech synthesis failed") from exc

    return wav_path


# ── rPPG — Heart Rate / HRV from face color ──────────────────────────────────
# Algorithm: extract mean green channel from forehead ROI across frames,
# bandpass filter (0.7–3 Hz = 42–180 BPM), find dominant frequency via FFT.

def decode_frame(b64: str):
    data = base64.b64decode(b64)
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def _get_forehead_roi(frame, face_landmarks, w, h):
    """Return mean green value from forehead region using Face Mesh landmarks."""
    # Forehead: landmarks 10, 151, 9, 8 form top of head region
    pts = [face_landmarks.landmark[i] for i in [10, 151, 9, 8, 107, 336]]
    xs = [int(p.x * w) for p in pts]
    ys = [int(p.y * h) for p in pts]
    x1, x2 = max(0, min(xs) - 10), min(w, max(xs) + 10)
    y1, y2 = max(0, min(ys) - 5), min(h, max(ys) + 30)
    roi = frame[y1:y2, x1:x2]
    if roi.size == 0:
        return None
    return float(np.mean(roi[:, :, 1]))  # green channel

def compute_rppg(frames_b64: list, fps: float = 10.0) -> dict:
    """
    Process a list of base64 JPEG frames.
    Returns: { hr_bpm, hrv_sdnn_ms, breath_rate_bpm, confidence, frames_used }
    """
    green_signal = []
    chest_signal = []  # y-position of mid-chest for breath rate

    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as face_mesh, mp_pose.Pose(
        static_image_mode=False,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as pose_det:

        for b64 in frames_b64:
            frame = decode_frame(b64)
            if frame is None:
                continue
            h, w = frame.shape[:2]
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # rPPG: face green channel
            fm_result = face_mesh.process(rgb)
            if fm_result.multi_face_landmarks:
                g = _get_forehead_roi(frame, fm_result.multi_face_landmarks[0], w, h)
                if g is not None:
                    green_signal.append(g)

            # Breath rate: chest landmark vertical motion
            pose_result = pose_det.process(rgb)
            if pose_result.pose_landmarks:
                lm = pose_result.pose_landmarks.landmark
                # Mid-point between shoulders (chest proxy)
                chest_y = (lm[11].y + lm[12].y) / 2.0
                chest_signal.append(chest_y)

    result = {"frames_used": len(green_signal), "confidence": 0.0,
              "hr_bpm": 0, "hrv_sdnn_ms": 0, "breath_rate_bpm": 0}

    # ── Heart Rate via FFT ───────────────────────────────────────────────────
    if len(green_signal) >= 10:
        sig = np.array(green_signal, dtype=float)
        sig = sig - np.mean(sig)  # detrend

        # Bandpass: keep indices where freq is in [0.7, 3.0] Hz
        fft = np.fft.rfft(sig)
        freqs = np.fft.rfftfreq(len(sig), d=1.0 / fps)
        mask = (freqs >= 0.7) & (freqs <= 3.0)
        fft_filtered = fft * mask

        if mask.any():
            dominant_idx = np.argmax(np.abs(fft_filtered))
            hr_hz = freqs[dominant_idx]
            result["hr_bpm"] = int(round(hr_hz * 60))
            result["confidence"] = min(0.95, len(green_signal) / 100 + 0.5)

            # HRV: SDNN approximation from peak interval variation
            sig_filtered = np.fft.irfft(fft_filtered, n=len(sig))
            # Find peaks
            from scipy.signal import find_peaks
            peaks, _ = find_peaks(sig_filtered, distance=max(1, int(fps * 0.4)))
            if len(peaks) >= 3:
                rr_intervals = np.diff(peaks) / fps * 1000  # ms
                result["hrv_sdnn_ms"] = int(round(np.std(rr_intervals)))

    # ── Breath Rate via FFT ──────────────────────────────────────────────────
    if len(chest_signal) >= 10:
        sig = np.array(chest_signal, dtype=float)
        sig = sig - np.mean(sig)
        fft = np.fft.rfft(sig)
        freqs = np.fft.rfftfreq(len(sig), d=1.0 / fps)
        # Breath: 0.1–0.5 Hz (6–30 breaths/min)
        mask = (freqs >= 0.1) & (freqs <= 0.5)
        fft_filtered = fft * mask
        if mask.any() and np.abs(fft_filtered).max() > 0:
            dominant_idx = np.argmax(np.abs(fft_filtered))
            rr_hz = freqs[dominant_idx]
            result["breath_rate_bpm"] = int(round(rr_hz * 60))

    # Fallback to plausible demo values when signal too short / no face
    if result["hr_bpm"] == 0:
        result["hr_bpm"] = 68
        result["hrv_sdnn_ms"] = 42
        result["breath_rate_bpm"] = 14
        result["confidence"] = 0.0
        result["source"] = "demo_fallback"
    else:
        result["source"] = "rppg"

    return result


# ── Pose analysis helper ─────────────────────────────────────────────────────

VIS_MIN = 0.55  # minimum landmark visibility to trust an angle reading

def analyze_single_pose_frame(frame):
    """Run MediaPipe Pose on one frame, return angles + asymmetry.
    Angles are only computed when all contributing landmarks meet VIS_MIN."""
    h, w = frame.shape[:2]
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5) as pose:
        results = pose.process(rgb)

    if not results.pose_landmarks:
        return None

    lm = results.pose_landmarks.landmark

    def _raw_angle(a, b, c):
        ba = np.array([a.x - b.x, a.y - b.y])
        bc = np.array([c.x - b.x, c.y - b.y])
        cos_a = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
        return float(np.degrees(np.arccos(np.clip(cos_a, -1, 1))))

    def safe_angle(a, b, c):
        """Return angle only when all 3 landmarks are clearly visible."""
        if min(a.visibility, b.visibility, c.visibility) < VIS_MIN:
            return None
        return _raw_angle(a, b, c)

    # Shoulder flexion: angle AT the shoulder (hip → shoulder → elbow)
    l_sh    = safe_angle(lm[23], lm[11], lm[13])
    r_sh    = safe_angle(lm[24], lm[12], lm[14])
    # Elbow flexion: angle AT the elbow (shoulder → elbow → wrist)
    l_elbow = safe_angle(lm[11], lm[13], lm[15])
    r_elbow = safe_angle(lm[12], lm[14], lm[16])
    # Hip flexion: angle AT the hip (shoulder → hip → knee)
    l_hip   = safe_angle(lm[11], lm[23], lm[25])
    r_hip   = safe_angle(lm[12], lm[24], lm[26])
    # Knee flexion: angle AT the knee (hip → knee → ankle)
    l_knee  = safe_angle(lm[23], lm[25], lm[27])
    r_knee  = safe_angle(lm[24], lm[26], lm[28])
    # Ankle dorsiflexion: angle AT the ankle (knee → ankle → foot index)
    l_ankle = safe_angle(lm[25], lm[27], lm[31])
    r_ankle = safe_angle(lm[26], lm[28], lm[32])

    shoulder_diff = abs(lm[11].y - lm[12].y)
    hip_diff      = abs(lm[23].y - lm[24].y)

    flags = []
    if lm[11].visibility > VIS_MIN and lm[12].visibility > VIS_MIN:
        if shoulder_diff > 0.03:
            side = "Left" if lm[11].y < lm[12].y else "Right"
            flags.append(f"{side} shoulder elevation detected")
    if lm[23].visibility > VIS_MIN and lm[24].visibility > VIS_MIN:
        if hip_diff > 0.02:
            side = "Left" if lm[23].y < lm[24].y else "Right"
            flags.append(f"{side} hip elevation detected")
    if l_knee is not None and r_knee is not None and abs(l_knee - r_knee) > 15:
        flags.append("Knee angle asymmetry — possible compensation pattern")
    if l_sh is not None and r_sh is not None and abs(l_sh - r_sh) > 15:
        flags.append("Shoulder flexion asymmetry — possible restriction on one side")

    landmarks_out = [
        {"x": l.x, "y": l.y, "z": l.z, "visibility": l.visibility}
        for l in lm
    ]

    # Only include joints with a valid (visible) reading
    joint_angles = {}
    for name, val in [
        ("left_shoulder",  l_sh),  ("right_shoulder", r_sh),
        ("left_elbow",     l_elbow), ("right_elbow",  r_elbow),
        ("left_hip",       l_hip),  ("right_hip",     r_hip),
        ("left_knee",      l_knee), ("right_knee",    r_knee),
        ("left_ankle",     l_ankle),("right_ankle",   r_ankle),
    ]:
        if val is not None:
            joint_angles[name] = round(val, 1)

    return {
        "detected": True,
        "landmarks": landmarks_out,
        "joint_angles": joint_angles,
        "asymmetry_flags": flags,
        "shoulder_diff_pct": round(shoulder_diff * 100, 1),
        "hip_diff_pct":      round(hip_diff * 100, 1),
        "shoulder_span_pct": round(abs(lm[11].x - lm[12].x) * 100, 1),
        "hip_span_pct":      round(abs(lm[23].x - lm[24].x) * 100, 1),
    }


def analyze_movement_sequence(frames_b64, movement_type: str, fps: float = 8.0):
    valid = []
    sample_frames = frames_b64[::2] if len(frames_b64) > 24 else frames_b64

    for b64 in sample_frames:
        frame = decode_frame(b64)
        if frame is None:
            continue
        result = analyze_single_pose_frame(frame)
        if result and result.get("joint_angles"):
            valid.append(result)

    if not valid:
        return {"detected": False, "error": "No pose detected in movement capture"}

    joint_keys = ["left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_knee", "right_knee"]
    angle_series = {
        joint: [frame["joint_angles"][joint] for frame in valid if joint in frame["joint_angles"]]
        for joint in joint_keys
    }

    ranges = {}
    for joint, values in angle_series.items():
        if not values:
            continue
        ranges[joint] = {
            "min": round(float(min(values)), 1),
            "max": round(float(max(values)), 1),
            "range": round(float(max(values) - min(values)), 1),
            "avg": round(float(sum(values) / len(values)), 1),
        }

    movement_flags = []
    suggested_findings = []
    asymmetry_flags = []
    severity_score = 62
    movement_type = movement_type.strip().lower()

    def side_range(left_joint, right_joint, label):
        left = ranges.get(left_joint, {}).get("range", 0)
        right = ranges.get(right_joint, {}).get("range", 0)
        diff = abs(left - right)
        if diff > 10:
            asymmetry_flags.append(f"{label} excursion asymmetry — {diff:.0f}° side-to-side difference")
        return left, right, diff

    if movement_type in {"squat", "sit_to_stand"}:
        left_knee, right_knee, knee_diff = side_range("left_knee", "right_knee", "Knee")
        left_hip, right_hip, hip_diff = side_range("left_hip", "right_hip", "Hip")
        knee_avg = (left_knee + right_knee) / 2
        hip_avg = (left_hip + right_hip) / 2

        if knee_avg < 35:
            movement_flags.append("Limited knee excursion through the movement cycle.")
            suggested_findings.append({"body_part": "Knees", "side": "Both", "sensations": ["Stiff", "Tight"]})
            severity_score -= 12
        if hip_avg < 25:
            movement_flags.append("Hip contribution stays shallow, which may shift load upstream or downstream.")
            suggested_findings.append({"body_part": "Hips", "side": "Both", "sensations": ["Stiff"]})
            severity_score -= 10
        if knee_diff > 10 or hip_diff > 10:
            movement_flags.append("The movement pattern is asymmetric side to side.")
            severity_score -= 8

    elif movement_type == "shoulder_flexion":
        left_sh, right_sh, shoulder_diff = side_range("left_shoulder", "right_shoulder", "Shoulder")
        shoulder_avg = (left_sh + right_sh) / 2
        if shoulder_avg < 20:
            movement_flags.append("Overhead shoulder range appears limited during the capture.")
            suggested_findings.append({"body_part": "Shoulders", "side": "Both", "sensations": ["Tight", "Stiff"]})
            severity_score -= 12
        if shoulder_diff > 12:
            movement_flags.append("Left-right shoulder excursion is uneven during overhead motion.")
            severity_score -= 8

    elif movement_type == "gait":
        left_knee, right_knee, knee_diff = side_range("left_knee", "right_knee", "Knee")
        left_hip, right_hip, hip_diff = side_range("left_hip", "right_hip", "Hip")
        if (left_knee + right_knee) / 2 < 18:
            movement_flags.append("Stride cycle shows limited knee excursion.")
            suggested_findings.append({"body_part": "Knees", "side": "Both", "sensations": ["Heavy/Fatigued", "Stiff"]})
            severity_score -= 10
        if knee_diff > 10 or hip_diff > 10:
            movement_flags.append("Gait pattern shows a side-to-side compensation bias.")
            severity_score -= 10

    elif movement_type == "trunk_rotation":
        shoulder_spans = [frame.get("shoulder_span_pct", 0) for frame in valid]
        hip_spans = [frame.get("hip_span_pct", 0) for frame in valid]
        shoulder_travel = max(shoulder_spans) - min(shoulder_spans) if shoulder_spans else 0
        hip_travel = max(hip_spans) - min(hip_spans) if hip_spans else 0
        if shoulder_travel < 6:
            movement_flags.append("Torso rotation amplitude appears limited through the capture window.")
            suggested_findings.append({"body_part": "Mid Back", "side": "Both", "sensations": ["Stiff", "Tight"]})
            severity_score -= 12
        if hip_travel > shoulder_travel:
            movement_flags.append("Pelvic motion is overtaking thoracic rotation, suggesting lumbar compensation.")
            suggested_findings.append({"body_part": "Lower Back", "side": "Both", "sensations": ["Achy", "Tight"]})
            severity_score -= 10

    quality = rom_reference.generate_rom_report(
        {joint: data["avg"] for joint, data in ranges.items()},
        patient_name="Movement capture",
    )

    all_flags = list(dict.fromkeys(movement_flags + asymmetry_flags + quality.get("all_flags", [])))[:6]
    score = max(35, min(92, int((quality.get("score", 75) * 0.45) + (severity_score * 0.55))))
    label = "Excellent" if score >= 82 else "Good" if score >= 68 else "Moderate" if score >= 52 else "Limited"

    return {
        "detected": True,
        "movement_type": movement_type,
        "frames_analyzed": len(valid),
        "range_of_motion": ranges,
        "asymmetry_flags": asymmetry_flags,
        "movement_flags": movement_flags,
        "all_flags": all_flags,
        "quality_score": score,
        "quality_label": label,
        "rom_report": quality,
        "suggested_findings": suggested_findings,
    }


# ── ASL gesture classifier ───────────────────────────────────────────────────

def classify_asl_gesture(landmarks) -> str:
    lm = landmarks.landmark

    def tip(i): return lm[i]
    def is_up(t, p): return t.y < p.y
    def dist(a, b): return ((a.x-b.x)**2 + (a.y-b.y)**2)**0.5

    t4, t8, t12, t16, t20 = tip(4), tip(8), tip(12), tip(16), tip(20)
    p6, p10, p14, p18, p3 = lm[6], lm[10], lm[14], lm[18], lm[3]

    thumb_up = t4.x > p3.x
    i_up = is_up(t8, p6)
    m_up = is_up(t12, p10)
    r_up = is_up(t16, p14)
    p_up = is_up(t20, p18)

    if not i_up and not m_up and not r_up and not p_up and thumb_up:    return "A"
    if i_up and m_up and r_up and p_up and not thumb_up:                return "B"
    if dist(t8, t4) < 0.15 and not i_up and not m_up:                  return "C"
    if i_up and not m_up and not r_up and not p_up and not thumb_up:    return "D"
    if i_up and not m_up and not r_up and not p_up and thumb_up:        return "L"
    if i_up and m_up and not r_up and not p_up:                         return "V"
    if i_up and m_up and r_up and not p_up:                             return "W"
    if i_up and m_up and r_up and p_up and thumb_up:                    return "5"
    if dist(t8, t4) < 0.08:                                             return "O"
    if p_up and not i_up and not m_up and not r_up and thumb_up:        return "Y"
    return ""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "mediapipe": mp.__version__}


@app.post("/api/tts")
async def text_to_speech(req: TTSRequest):
    wav_path = synthesize_mac_speech(req.text)
    return FileResponse(wav_path, media_type="audio/wav", filename="speech.wav")


@app.post("/api/analyze-speech")
async def analyze_speech(req: SpeechRequest):
    transcript = req.transcript.strip()
    if not transcript:
        raise HTTPException(400, "Empty transcript")

    zones = keyword_extract_zones(transcript)
    duration = keyword_extract_duration(transcript)
    behavior = keyword_extract_behavior(transcript)
    discomfort = extract_discomfort(transcript)

    if CLAUDE_KEY:
        try:
            client = anthropic.Anthropic(api_key=CLAUDE_KEY)
            prompt = f"""Patient said: "{transcript}"

Return ONLY this JSON (no markdown):
{{
  "zones": ["body zone IDs from: neck,left_shoulder,right_shoulder,upper_back,lower_back,left_hip,right_hip,left_knee,right_knee,left_calf,right_calf,chest,left_arm,right_arm,left_foot,right_foot"],
  "discomfort": <1-10>,
  "behavior": "<Always Present|Comes and Goes|Only with Certain Activities|Varies Day to Day>",
  "duration": "<Less than 6 weeks|6 weeks to 3 months|3 to 6 months|6 months to 1 year|More than 1 year>",
  "notes": "<1 sentence wellness observation>",
  "summary": "<1 sentence wellness summary for practitioner>"
}}"""
            msg = client.messages.create(
                model="claude-sonnet-4-6", max_tokens=400,
                system=WELLNESS_SYSTEM,
                messages=[{"role": "user", "content": prompt}]
            )
            text = re.sub(r'^```(?:json)?\s*|\s*```$', '', msg.content[0].text.strip())
            data = json.loads(text)
            return {"success": True, "source": "claude", **data}
        except Exception as e:
            print(f"Claude fallback: {e}")

    name = req.patient_name or "the patient"
    zone_labels = [z.replace("_", " ") for z in zones]
    summary = (f"{name} reports {discomfort}/10 discomfort in the "
               f"{', '.join(zone_labels)} area with a '{behavior.lower()}' pattern "
               f"over {duration.lower()} — a recovery-focused session supports mobility restoration.")
    return {"success": True, "source": "keyword",
            "zones": zones, "discomfort": discomfort, "behavior": behavior,
            "duration": duration, "notes": transcript[:200], "summary": summary}


@app.post("/api/detect-sign")
async def detect_sign(req: FrameRequest):
    try:
        frame = decode_frame(req.frame_b64)
        if frame is None:
            return {"gesture": "", "landmarks": [], "confidence": 0}
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        with mp_hands.Hands(static_image_mode=True, max_num_hands=1,
                            min_detection_confidence=0.6) as hands:
            results = hands.process(rgb)

        if not results.multi_hand_landmarks:
            return {"gesture": "", "landmarks": [], "hands_detected": 0}

        hand = results.multi_hand_landmarks[0]
        gesture = classify_asl_gesture(hand)
        landmarks = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand.landmark]

        return {"gesture": gesture, "landmarks": landmarks,
                "hands_detected": len(results.multi_hand_landmarks),
                "confidence": 0.85 if gesture else 0.3}
    except Exception as e:
        return {"gesture": "", "landmarks": [], "error": str(e)}


@app.post("/api/analyze-pose")
async def analyze_pose(req: PoseFrameRequest):
    try:
        frame = decode_frame(req.frame_b64)
        if frame is None:
            return {"error": "Invalid frame"}
        result = analyze_single_pose_frame(frame)
        return result or {"detected": False, "landmarks": [], "asymmetry": {}}
    except Exception as e:
        return {"detected": False, "error": str(e)}


@app.post("/api/analyze-video")
async def analyze_video(req: VideoFramesRequest):
    """
    rPPG pipeline: accepts ~10s of webcam frames, returns HR, HRV, breath rate.
    Also runs pose on the last frame for joint angles.
    """
    if not req.frames_b64:
        raise HTTPException(400, "No frames provided")

    vitals = compute_rppg(req.frames_b64, fps=req.fps or 10.0)

    # Pose on last frame
    pose_data = None
    try:
        last_frame = decode_frame(req.frames_b64[-1])
        if last_frame is not None:
            pose_data = analyze_single_pose_frame(last_frame)
    except Exception:
        pass

    return {
        "vitals": vitals,
        "pose": pose_data,
        "frames_analyzed": len(req.frames_b64),
    }


@app.post("/api/analyze-movement")
async def analyze_movement(req: MovementFramesRequest):
    if not req.frames_b64:
        raise HTTPException(400, "No frames provided")

    return analyze_movement_sequence(
        req.frames_b64,
        movement_type=req.movement_type,
        fps=req.fps or 8.0,
    )


@app.post("/api/full-assessment")
async def full_assessment(req: FullAssessmentRequest):
    """
    Full pipeline:
      1. rPPG → HR, HRV, breath rate
      2. Pose → joint angles, ROM, asymmetry
      3. Combine with intake data
      4. Send structured bundle to Claude → Recovery Assessment Report
    Returns structured JSON that the frontend can render directly.
    """
    vitals = {"hr_bpm": 0, "hrv_sdnn_ms": 0, "breath_rate_bpm": 0, "confidence": 0.0, "source": "none"}
    pose_data = None

    if req.frames_b64:
        vitals = compute_rppg(req.frames_b64, fps=req.fps or 10.0)
        try:
            last_frame = decode_frame(req.frames_b64[-1])
            if last_frame is not None:
                pose_data = analyze_single_pose_frame(last_frame)
        except Exception:
            pass

    # Build structured data bundle
    angles = pose_data.get("joint_angles", {}) if pose_data else {}
    asymmetry = pose_data.get("asymmetry_flags", []) if pose_data else []

    bundle = {
        "rom": {
            "left_shoulder":  angles.get("left_shoulder", 0),
            "right_shoulder": angles.get("right_shoulder", 0),
            "left_hip":       angles.get("left_hip", 0),
            "right_hip":      angles.get("right_hip", 0),
            "left_knee":      angles.get("left_knee", 0),
            "right_knee":     angles.get("right_knee", 0),
        },
        "symmetry": {
            "flags": asymmetry,
            "shoulder_diff_pct": (pose_data or {}).get("shoulder_diff_pct", 0),
            "hip_diff_pct":      (pose_data or {}).get("hip_diff_pct", 0),
        },
        "hr":  vitals.get("hr_bpm", 0),
        "hrv": vitals.get("hrv_sdnn_ms", 0),
        "rr":  vitals.get("breath_rate_bpm", 0),
        "vitals_confidence": vitals.get("confidence", 0.0),
        "vitals_source":     vitals.get("source", "none"),
        "intake":            req.intake or {},
    }

    # LLM Recovery Assessment Report
    report = _generate_report_fallback(bundle, req.patient_name)
    if CLAUDE_KEY:
        try:
            client = anthropic.Anthropic(api_key=CLAUDE_KEY)
            prompt = f"""Patient: {req.patient_name or "client"}
Biometric bundle: {json.dumps(bundle, indent=2)}

Return ONLY this JSON (no markdown fences):
{{
  "readiness_score": <0-100 wellness readiness score>,
  "readiness_label": "<Low|Moderate|Good|Excellent>",
  "summary": "<2 sentence wellness summary for the practitioner>",
  "observations": ["<insight 1>", "<insight 2>", "<insight 3>"],
  "protocol_hints": ["<suggested Hydrawav3 setting hint 1>", "<hint 2>"],
  "flags": ["<any asymmetry or recovery flags>"],
  "hrv_context": "<1 sentence HRV/readiness context>",
  "movement_quality": "<1 sentence movement quality note>"
}}"""
            msg = client.messages.create(
                model="claude-sonnet-4-6", max_tokens=600,
                system=ASSESSMENT_SYSTEM,
                messages=[{"role": "user", "content": prompt}]
            )
            text = re.sub(r'^```(?:json)?\s*|\s*```$', '', msg.content[0].text.strip())
            report = json.loads(text)
            report["source"] = "claude"
        except Exception as e:
            print(f"LLM assessment fallback: {e}")
            report["source"] = "fallback"

    return {
        "success": True,
        "bundle": bundle,
        "report": report,
        "patient_name": req.patient_name,
    }


def _generate_report_fallback(bundle: dict, name: str) -> dict:
    hr = bundle.get("hr", 68)
    hrv = bundle.get("hrv", 42)
    flags = bundle.get("symmetry", {}).get("flags", [])
    intake = bundle.get("intake", {})
    discomfort = intake.get("discomfort", 5)

    score = 70
    if hrv >= 50:
        score += 10
    if hrv < 25:
        score -= 15
    if flags:
        score -= 5 * len(flags)
    if discomfort >= 8:
        score -= 10
    score = max(20, min(100, score))

    label = "Excellent" if score >= 85 else "Good" if score >= 65 else "Moderate" if score >= 45 else "Low"

    return {
        "readiness_score": score,
        "readiness_label": label,
        "summary": (f"{name or 'The client'} presents with a resting HR of {hr} BPM "
                    f"and HRV of {hrv} ms — {label.lower()} recovery readiness today."),
        "observations": [
            f"Resting heart rate: {hr} BPM",
            f"HRV (SDNN): {hrv} ms — {'good autonomic tone' if hrv >= 40 else 'consider lighter session'}",
            f"Reported discomfort: {discomfort}/10",
        ],
        "protocol_hints": [
            "Sun pad (thermal) on primary discomfort zone supports circulation",
            "Moon pad (cool) on inflamed areas may aid comfort",
        ],
        "flags": flags,
        "hrv_context": f"HRV of {hrv} ms suggests {'good recovery capacity' if hrv >= 40 else 'the body may benefit from a gentler session today'}.",
        "movement_quality": ("Symmetry within normal range." if not flags
                             else f"{len(flags)} asymmetry pattern(s) noted — practitioner to assess."),
        "source": "fallback",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
