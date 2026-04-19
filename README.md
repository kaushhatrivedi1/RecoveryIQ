# RecoveryIQ — Adaptive Recovery Intelligence

AI-powered practitioner console for the Hydrawav3 wellness device. Built for GlobeHack Season 1 · April 2025 · Team HRVengers.

## What it does

- **3D interactive body map** — click zones to select areas of focus
- **Voice intake** — AI asks 5 questions via TTS, patient speaks, answers auto-fill the form
- **Biometric scan** — 10-second webcam rPPG scan extracts resting HR, HRV, and breath rate
- **AI client brief** — Claude generates a practitioner summary from intake + biometrics
- **MQTT session control** — start, pause, resume, stop the Hydrawav3 device
- **Patient journey** — streaks, XP, recovery score, home routine

---

## Running locally

### 1. Frontend (React + Vite)

```bash
cd RecoveryIQ
npm install
cp .env.example .env   # then fill in your keys (see below)
npm run dev
```

Opens at `http://localhost:5173`. Log in with `annie@hydrawav3demo.com` / `demo1234`.

### 2. Python backend (CV pipeline)

Required for voice analysis, pose detection, rPPG biometrics, and sign language.

```bash
cd RecoveryIQ/backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Runs at `http://localhost:8000`. Check `http://localhost:8000/health` to confirm.

> Python 3.10+ required. On macOS you may need `pip install opencv-python` instead of `opencv-python-headless` if the camera fails.

---

## Environment variables

Create a `.env` file in the project root:

```env
VITE_CLAUDE_KEY=sk-ant-...       # Anthropic API key — powers AI briefs and assessment reports
VITE_ELEVEN_KEY=sk_...           # ElevenLabs API key — powers TTS voice questions (optional, falls back to browser TTS)
VITE_MQTT_BASE=http://54.241.236.53:8080   # Hydrawav3 MQTT base URL
```

The backend also reads `CLAUDE_KEY` (no `VITE_` prefix) from environment:

```bash
export CLAUDE_KEY=sk-ant-...
python main.py
```

All keys are optional for demo — the app falls back gracefully to keyword extraction, browser TTS, and demo biometric values.

---

## Backend API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/analyze-speech` | Transcript → structured intake JSON |
| POST | `/api/detect-sign` | Webcam frame → ASL gesture letter |
| POST | `/api/analyze-pose` | Webcam frame → joint angles + asymmetry |
| POST | `/api/analyze-video` | Frame buffer → rPPG HR/HRV + breath rate + pose |
| POST | `/api/full-assessment` | All signals → structured bundle + Claude recovery report |

---

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| 3D | React Three Fiber, Three.js, @react-three/drei |
| Charts | Recharts |
| Voice | Web Speech API (STT), ElevenLabs / browser TTS |
| Backend | Python FastAPI, MediaPipe, OpenCV, NumPy, SciPy |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Device | Hydrawav3 MQTT API |

---

## Project structure

```
RecoveryIQ/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Demo login
│   │   ├── Dashboard.jsx      # Patient list + AI insights
│   │   ├── Intake.jsx         # Guided intake (3D map + voice + biometrics)
│   │   ├── Journey.jsx        # Patient progress + home routine
│   │   └── Pricing.jsx
│   ├── components/
│   │   ├── Body3D.jsx         # React Three Fiber 3D body model
│   │   ├── VoiceIntake.jsx    # 5-question voice conversation flow
│   │   ├── CameraAssessment.jsx  # rPPG biometric scan UI
│   │   └── AppChrome.jsx      # PageShell + BrandLockup layout
│   ├── services/api.js        # Claude, ElevenLabs, MQTT helpers
│   ├── context/AppContext.jsx
│   └── data/mockData.js
└── backend/
    ├── main.py                # FastAPI — rPPG, pose, ASL, speech analysis
    └── requirements.txt
```
