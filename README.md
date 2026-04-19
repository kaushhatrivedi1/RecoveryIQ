# RecoveryIQ — Adaptive Recovery Intelligence

AI-powered practitioner console for the Hydrawav3 wellness device. Built for GlobeHack Season 1 · April 2025 · Team HRVengers.

## What it does

- **3D interactive body map** — click zones to select areas of focus
- **Voice intake** — AI asks 5 questions via TTS, patient speaks, answers auto-fill the form
- **Biometric scan** — 10-second webcam rPPG scan extracts resting HR, HRV, and breath rate
- **Motion capture & scoring** — live camera captures movement, MediaPipe computes real-time joint angles, scores ROM and movement quality
- **AI client brief** — Claude generates a practitioner summary from intake + biometrics
- **MQTT session control** — start, pause, resume, stop the Hydrawav3 device
- **Patient journey** — streaks, XP, recovery score, home routine

---

## Running locally

You need two terminals — one for the frontend, one for the backend.

### 1. Frontend (React + Vite)

```bash
cd RecoveryIQ
npm install
npm run dev
```

Opens at `http://localhost:5173`. Log in with `annie@hydrawav3demo.com` / `demo1234`.

### 2. Python backend (CV pipeline)

> **Requires Python 3.12.** Python 3.13+ is not supported by MediaPipe yet.
> On macOS, Python 3.12 is available via Homebrew: `brew install python@3.12`

The easiest way — use the start script, which creates the venv and installs deps automatically:

```bash
cd RecoveryIQ/backend
bash start.sh
```

Or manually:

```bash
cd RecoveryIQ/backend
/opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

Runs at `http://localhost:8000`. Confirm with:

```bash
curl http://localhost:8000/health
```

The frontend works without the backend but motion capture scoring and biometric analysis will show "Backend not running" and fall back to demo values.

---

## Environment variables

Create a `.env` file in the project root:

```env
VITE_CLAUDE_KEY=sk-ant-...       # Anthropic API key — AI briefs + assessment reports
VITE_ELEVEN_KEY=sk_...           # ElevenLabs API key — TTS voice questions (optional, falls back to browser TTS)
VITE_MQTT_BASE=http://54.241.236.53:8080   # Hydrawav3 MQTT base URL
```

The backend reads `CLAUDE_KEY` (no `VITE_` prefix):

```bash
export CLAUDE_KEY=sk-ant-...
bash start.sh
```

All keys are optional — the app falls back gracefully to keyword extraction, browser TTS, and demo values.

---

## Backend API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/analyze-speech` | Transcript → structured intake JSON |
| POST | `/api/detect-sign` | Webcam frame → ASL gesture letter |
| POST | `/api/analyze-pose` | Webcam frame → joint angles + asymmetry (visibility-filtered) |
| POST | `/api/analyze-movement` | Frame buffer → ROM ranges, quality score, movement flags |
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
| Backend | Python 3.12, FastAPI, MediaPipe 0.10.14, OpenCV, NumPy, SciPy |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Device | Hydrawav3 MQTT API |

---

## Project structure

```
RecoveryIQ/
├── src/
│   ├── pages/
│   │   ├── Login.jsx               # Demo login
│   │   ├── Dashboard.jsx           # Patient list + AI insights
│   │   ├── Intake.jsx              # Guided intake (3D map + voice + biometrics)
│   │   ├── Journey.jsx             # Patient progress + home routine
│   │   └── Pricing.jsx
│   ├── components/
│   │   ├── Body3D.jsx              # React Three Fiber 3D body model
│   │   ├── VoiceIntake.jsx         # 5-question voice conversation flow
│   │   ├── CameraAssessment.jsx    # rPPG biometric scan UI
│   │   ├── GuidedAssessment.jsx    # ROM tests + motion capture + scoring
│   │   ├── SessionPlan.jsx         # AI session plan + pad placement
│   │   └── AppChrome.jsx           # PageShell + BrandLockup layout
│   ├── services/api.js             # Claude, ElevenLabs, MQTT helpers
│   ├── context/AppContext.jsx
│   └── data/mockData.js            # ROM tests, body zones, session goals
└── backend/
    ├── main.py                     # FastAPI — rPPG, pose, motion analysis, ASL, speech
    ├── rom_reference.py            # ROM scoring reference ranges
    ├── requirements.txt            # Python dependencies (pin to Python 3.12)
    └── start.sh                    # One-command backend launcher
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| `mediapipe` install fails | Use Python 3.12 — `mediapipe 0.10.14` does not support 3.13/3.14 |
| Camera shows black | Allow camera permissions in browser; reload the page |
| Score shows 0 / Unknown | Backend is not running — run `bash backend/start.sh` |
| `mp.solutions` AttributeError | Wrong mediapipe version installed — delete `.venv` and re-run `start.sh` |
| CORS error in console | Make sure backend is running on port 8000 |
