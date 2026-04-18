"""
RecoveryIQ Python Backend
- /api/analyze-speech  : Transcribes patient's spoken/typed words → structured intake JSON via Claude
- /api/detect-sign     : Receives webcam frame → MediaPipe Hands → ASL gesture → letter/word
- /api/analyze-pose    : Receives webcam frame → MediaPipe Pose → joint angles, asymmetry flags
"""

import base64
import json
import os
import re
import numpy as np
import cv2
import mediapipe as mp
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import anthropic

app = FastAPI(title="RecoveryIQ Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe setup
mp_hands = mp.solutions.hands
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

CLAUDE_KEY = os.getenv("CLAUDE_KEY", "")

SYSTEM_PROMPT = """You are a wellness intake assistant for Hydrawav3. Extract structured wellness information.
Output ONLY valid JSON. Never use clinical language. Use: supports, recovery, mobility, wellness.
Never say: treats, cures, diagnoses, medical, clinical."""


# ── Models ──────────────────────────────────────────────────────────────────

class SpeechRequest(BaseModel):
    transcript: str
    patient_name: Optional[str] = ""

class FrameRequest(BaseModel):
    frame_b64: str  # base64-encoded JPEG frame from webcam

class PoseFrameRequest(BaseModel):
    frame_b64: str


# ── Helpers ──────────────────────────────────────────────────────────────────

BODY_ZONE_KEYWORDS = {
    "neck": ["neck", "cervical", "throat", "nape"],
    "left_shoulder": ["left shoulder", "left arm", "left rotator"],
    "right_shoulder": ["right shoulder", "right arm", "right rotator"],
    "upper_back": ["upper back", "between shoulders", "thoracic", "traps"],
    "lower_back": ["lower back", "lumbar", "low back", "spine", "back pain"],
    "left_hip": ["left hip", "left glute", "left pelvis"],
    "right_hip": ["right hip", "right glute", "it band", "hip flexor"],
    "left_knee": ["left knee", "left patella"],
    "right_knee": ["right knee", "right patella"],
    "left_calf": ["left calf", "left shin", "left leg"],
    "right_calf": ["right calf", "right shin", "right leg"],
    "chest": ["chest", "pec", "breast", "sternum"],
    "left_arm": ["left elbow", "left forearm", "left bicep"],
    "right_arm": ["right elbow", "right forearm", "right bicep"],
    "left_foot": ["left foot", "left ankle", "left heel"],
    "right_foot": ["right foot", "right ankle", "right heel"],
}

DURATION_KEYWORDS = {
    "Less than 6 weeks": ["few days", "week", "recently", "just started", "new", "acute"],
    "6 weeks to 3 months": ["month", "couple months", "few months"],
    "3 to 6 months": ["three months", "four months", "five months", "several months"],
    "6 months to 1 year": ["six months", "half year", "most of the year"],
    "More than 1 year": ["year", "years", "long time", "chronic", "forever", "always"],
}

BEHAVIOR_KEYWORDS = {
    "Always Present": ["always", "constant", "never goes away", "all the time", "every day"],
    "Comes and Goes": ["comes and goes", "sometimes", "on and off", "flares up", "intermittent"],
    "Only with Certain Activities": ["when i run", "when i lift", "during", "only when", "after exercise"],
    "Varies Day to Day": ["some days", "varies", "depends", "better some days", "worse some days"],
}

def keyword_extract_zones(text: str) -> list[str]:
    text_lower = text.lower()
    found = []
    for zone, keywords in BODY_ZONE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(zone)
    return found or ["lower_back"]

def keyword_extract_duration(text: str) -> str:
    text_lower = text.lower()
    for duration, keywords in DURATION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return duration
    return "3 to 6 months"

def keyword_extract_behavior(text: str) -> str:
    text_lower = text.lower()
    for behavior, keywords in BEHAVIOR_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return behavior
    return "Comes and Goes"

def extract_discomfort(text: str) -> int:
    # Look for numbers 1-10
    matches = re.findall(r'\b([1-9]|10)\b', text)
    for m in matches:
        val = int(m)
        if 1 <= val <= 10:
            return val
    # Qualitative
    text_lower = text.lower()
    if any(w in text_lower for w in ["severe", "intense", "unbearable", "terrible", "very bad"]):
        return 8
    if any(w in text_lower for w in ["moderate", "medium", "significant", "quite"]):
        return 6
    if any(w in text_lower for w in ["mild", "slight", "little", "minor", "small"]):
        return 3
    return 5


# ── ASL Gesture Classifier ────────────────────────────────────────────────────
# Uses MediaPipe hand landmarks (21 points) to classify basic ASL hand shapes.
# This is a rule-based classifier for hackathon speed — not ML model.

def classify_asl_gesture(landmarks) -> str:
    """
    Classifies basic ASL letters from 21 MediaPipe hand landmarks.
    Returns letter or empty string.
    """
    if not landmarks:
        return ""

    lm = landmarks.landmark

    def tip(i): return lm[i]
    def base(i): return lm[i]

    # Finger tip indices: thumb=4, index=8, middle=12, ring=16, pinky=20
    # Finger pip (middle joint): thumb=3, index=6, middle=10, ring=14, pinky=18

    thumb_tip = tip(4)
    index_tip = tip(8)
    middle_tip = tip(12)
    ring_tip = tip(16)
    pinky_tip = tip(20)

    index_pip = base(6)
    middle_pip = base(10)
    ring_pip = base(14)
    pinky_pip = base(18)
    thumb_ip = base(3)

    wrist = lm[0]

    def is_up(tip, pip): return tip.y < pip.y  # finger extended upward
    def dist(a, b): return ((a.x-b.x)**2 + (a.y-b.y)**2)**0.5

    thumb_up = thumb_tip.x > thumb_ip.x  # thumb extended sideways (right hand)
    index_up = is_up(index_tip, index_pip)
    middle_up = is_up(middle_tip, middle_pip)
    ring_up = is_up(ring_tip, ring_pip)
    pinky_up = is_up(pinky_tip, pinky_pip)

    fingers_up = sum([index_up, middle_up, ring_up, pinky_up])

    # A — fist, thumb on side
    if not index_up and not middle_up and not ring_up and not pinky_up and thumb_up:
        return "A"

    # B — all 4 fingers up, thumb tucked
    if index_up and middle_up and ring_up and pinky_up and not thumb_up:
        return "B"

    # C — curved hand (all fingers curved, open C shape)
    if dist(index_tip, thumb_tip) < 0.15 and not index_up and not middle_up:
        return "C"

    # D — index up, others curved, touching thumb
    if index_up and not middle_up and not ring_up and not pinky_up:
        return "D"

    # L — index and thumb up (L shape)
    if index_up and not middle_up and not ring_up and not pinky_up and thumb_up:
        return "L"

    # V — index and middle up, others down (peace sign)
    if index_up and middle_up and not ring_up and not pinky_up:
        return "V"

    # W — index, middle, ring up
    if index_up and middle_up and ring_up and not pinky_up:
        return "W"

    # 5 — all fingers up including thumb
    if index_up and middle_up and ring_up and pinky_up and thumb_up:
        return "5"

    # O — index and thumb pinched
    if dist(index_tip, thumb_tip) < 0.08:
        return "O"

    # Y — pinky and thumb out
    if pinky_up and not index_up and not middle_up and not ring_up and thumb_up:
        return "Y"

    return ""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "mediapipe": mp.__version__}


@app.post("/api/analyze-speech")
async def analyze_speech(req: SpeechRequest):
    """
    Takes patient's spoken words (transcript) and returns structured intake JSON.
    Falls back to keyword extraction if no Claude key.
    """
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

Extract wellness intake information and return ONLY this JSON (no markdown, no explanation):
{{
  "zones": ["list of body zone IDs from: neck, left_shoulder, right_shoulder, upper_back, lower_back, left_hip, right_hip, left_knee, right_knee, left_calf, right_calf, chest, left_arm, right_arm, left_foot, right_foot"],
  "discomfort": <number 1-10>,
  "behavior": "<one of: Always Present, Comes and Goes, Only with Certain Activities, Varies Day to Day>",
  "duration": "<one of: Less than 6 weeks, 6 weeks to 3 months, 3 to 6 months, 6 months to 1 year, More than 1 year>",
  "notes": "<any other wellness observations in 1 sentence>",
  "summary": "<1 sentence wellness summary for practitioner using only wellness language>"
}}"""

            msg = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=300,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            text = msg.content[0].text.strip()
            # Strip markdown code blocks if present
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            data = json.loads(text)
            return {"success": True, "source": "claude", **data}
        except Exception as e:
            print(f"Claude error: {e} — falling back to keyword extraction")

    # Fallback: keyword extraction
    name = req.patient_name or "the patient"
    zone_labels = [z.replace("_", " ") for z in zones]
    summary = f"{name} reports {discomfort}/10 discomfort in the {', '.join(zone_labels)} area with a '{behavior.lower()}' pattern over {duration.lower()} — a recovery-focused session supports mobility restoration."

    return {
        "success": True,
        "source": "keyword",
        "zones": zones,
        "discomfort": discomfort,
        "behavior": behavior,
        "duration": duration,
        "notes": transcript[:200],
        "summary": summary,
    }


@app.post("/api/detect-sign")
async def detect_sign(req: FrameRequest):
    """
    Receives a base64 webcam frame, runs MediaPipe Hands,
    returns detected ASL gesture letter and hand landmarks.
    """
    try:
        img_bytes = base64.b64decode(req.frame_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"gesture": "", "landmarks": [], "confidence": 0}

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        with mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.6
        ) as hands:
            results = hands.process(rgb)

        if not results.multi_hand_landmarks:
            return {"gesture": "", "landmarks": [], "hands_detected": 0}

        hand = results.multi_hand_landmarks[0]
        gesture = classify_asl_gesture(hand)

        # Serialize landmarks for frontend visualization
        landmarks = [
            {"x": lm.x, "y": lm.y, "z": lm.z}
            for lm in hand.landmark
        ]

        return {
            "gesture": gesture,
            "landmarks": landmarks,
            "hands_detected": len(results.multi_hand_landmarks),
            "confidence": 0.85 if gesture else 0.3,
        }

    except Exception as e:
        return {"gesture": "", "landmarks": [], "error": str(e)}


@app.post("/api/analyze-pose")
async def analyze_pose(req: PoseFrameRequest):
    """
    Receives a base64 webcam frame, runs MediaPipe Pose,
    returns joint angles and asymmetry flags.
    """
    try:
        img_bytes = base64.b64decode(req.frame_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"error": "Invalid frame"}

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        with mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5
        ) as pose:
            results = pose.process(rgb)

        if not results.pose_landmarks:
            return {"detected": False, "landmarks": [], "asymmetry": {}}

        lm = results.pose_landmarks.landmark

        def angle_3pts(a, b, c):
            """Angle at point b formed by a-b-c"""
            ba = np.array([a.x - b.x, a.y - b.y])
            bc = np.array([c.x - b.x, c.y - b.y])
            cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
            return float(np.degrees(np.arccos(np.clip(cos_angle, -1, 1))))

        # Key joint angles
        left_shoulder_angle = angle_3pts(lm[11], lm[13], lm[15])   # shoulder-elbow-wrist
        right_shoulder_angle = angle_3pts(lm[12], lm[14], lm[16])
        left_hip_angle = angle_3pts(lm[11], lm[23], lm[25])         # shoulder-hip-knee
        right_hip_angle = angle_3pts(lm[12], lm[24], lm[26])
        left_knee_angle = angle_3pts(lm[23], lm[25], lm[27])        # hip-knee-ankle
        right_knee_angle = angle_3pts(lm[24], lm[26], lm[28])

        # Shoulder height asymmetry
        shoulder_diff = abs(lm[11].y - lm[12].y)
        hip_diff = abs(lm[23].y - lm[24].y)

        asymmetry_flags = []
        if shoulder_diff > 0.03:
            side = "left" if lm[11].y < lm[12].y else "right"
            asymmetry_flags.append(f"{side.capitalize()} shoulder elevation detected")
        if hip_diff > 0.02:
            side = "left" if lm[23].y < lm[24].y else "right"
            asymmetry_flags.append(f"{side.capitalize()} hip elevation detected")
        if abs(left_knee_angle - right_knee_angle) > 15:
            asymmetry_flags.append("Knee angle asymmetry detected — possible compensation pattern")

        landmarks_out = [
            {"x": l.x, "y": l.y, "z": l.z, "visibility": l.visibility}
            for l in lm
        ]

        return {
            "detected": True,
            "landmarks": landmarks_out,
            "joint_angles": {
                "left_shoulder": round(left_shoulder_angle, 1),
                "right_shoulder": round(right_shoulder_angle, 1),
                "left_hip": round(left_hip_angle, 1),
                "right_hip": round(right_hip_angle, 1),
                "left_knee": round(left_knee_angle, 1),
                "right_knee": round(right_knee_angle, 1),
            },
            "asymmetry_flags": asymmetry_flags,
            "shoulder_diff_px": round(shoulder_diff * 100, 1),
            "hip_diff_px": round(hip_diff * 100, 1),
        }

    except Exception as e:
        return {"detected": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
