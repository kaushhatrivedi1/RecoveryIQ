"""
RecoveryIQ Python Backend
- /api/analyze-speech  : Transcript -> structured intake JSON via Claude
- /api/detect-sign     : Stub (ASL runs in browser)
- /api/analyze-pose    : Stub (Pose runs in browser via MediaPipe JS)
"""

import json
import os
import re
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

CLAUDE_KEY = os.getenv("CLAUDE_KEY", "")

SYSTEM_PROMPT = """You are a wellness intake assistant for Hydrawav3. Extract structured wellness information.
Output ONLY valid JSON. Never use clinical language. Use: supports, recovery, mobility, wellness.
Never say: treats, cures, diagnoses, medical, clinical."""


# ── Models ──────────────────────────────────────────────────────────────────

class SpeechRequest(BaseModel):
    transcript: str
    patient_name: Optional[str] = ""

class FrameRequest(BaseModel):
    frame_b64: str

class PoseFrameRequest(BaseModel):
    frame_b64: str


# ── Keyword helpers ──────────────────────────────────────────────────────────

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
    "chest": ["chest", "pec", "sternum"],
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

def keyword_extract_zones(text):
    text_lower = text.lower()
    found = []
    for zone, keywords in BODY_ZONE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(zone)
    return found or ["lower_back"]

def keyword_extract_duration(text):
    text_lower = text.lower()
    for duration, keywords in DURATION_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return duration
    return "3 to 6 months"

def keyword_extract_behavior(text):
    text_lower = text.lower()
    for behavior, keywords in BEHAVIOR_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return behavior
    return "Comes and Goes"

def extract_discomfort(text):
    matches = re.findall(r'\b([1-9]|10)\b', text)
    for m in matches:
        val = int(m)
        if 1 <= val <= 10:
            return val
    text_lower = text.lower()
    if any(w in text_lower for w in ["severe", "intense", "unbearable", "terrible"]):
        return 8
    if any(w in text_lower for w in ["moderate", "medium", "significant"]):
        return 6
    if any(w in text_lower for w in ["mild", "slight", "little", "minor"]):
        return 3
    return 5


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "claude": bool(CLAUDE_KEY)}


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

Extract wellness intake information and return ONLY this JSON (no markdown):
{{
  "zones": ["zone IDs from: neck, left_shoulder, right_shoulder, upper_back, lower_back, left_hip, right_hip, left_knee, right_knee, chest, left_foot, right_foot"],
  "discomfort": <1-10>,
  "behavior": "<Always Present|Comes and Goes|Only with Certain Activities|Varies Day to Day>",
  "duration": "<Less than 6 weeks|6 weeks to 3 months|3 to 6 months|6 months to 1 year|More than 1 year>",
  "notes": "<brief wellness observation>",
  "summary": "<1 sentence wellness summary for practitioner>"
}}"""

            msg = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=300,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}]
            )
            text = msg.content[0].text.strip()
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            data = json.loads(text)
            return {"success": True, "source": "claude", **data}
        except Exception as e:
            print(f"Claude error: {e} — using keyword fallback")

    name = req.patient_name or "the patient"
    zone_labels = [z.replace("_", " ") for z in zones]
    summary = f"{name} reports {discomfort}/10 discomfort in the {', '.join(zone_labels)} area with a '{behavior.lower()}' pattern — a recovery-focused session supports mobility restoration."

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


# Stubs — these run in the browser via MediaPipe JS
@app.post("/api/detect-sign")
async def detect_sign(req: FrameRequest):
    return {"gesture": "", "landmarks": [], "hands_detected": 0, "note": "ASL detection runs in browser"}

@app.post("/api/analyze-pose")
async def analyze_pose(req: PoseFrameRequest):
    return {"detected": False, "note": "Pose analysis runs in browser via MediaPipe JS"}


if __name__ == "__main__":
    import uvicorn
    print("RecoveryIQ backend starting...")
    print(f"Claude API: {'configured' if CLAUDE_KEY else 'not configured — keyword fallback mode'}")
    print("Listening on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)