# RecoveryIQ — Hydrawav3 Recovery Intelligence Platform

**ASU GlobeHack 2026** | Hydrawav3 Recovery Intelligence Track | April 18-19

RecoveryIQ is a full-stack platform for Hydrawav3 practitioners to deliver personalized recovery sessions with AI-powered insights. The platform creates a complete loop: **KNOW** (intake assessment) → **ACT** (device session control) → **LEARN** (recovery tracking & personalized guidance).

![Status](https://img.shields.io/badge/status-BuildingLive-red) ![Track](https://img.shields.io/badge/track-Recovery%20Intelligence-orange)

---

## 🎯 Project Vision

**Hydrawav3** is a hands-off wellness device with dual Sun (heating, red) and Moon (cooling, blue) pads. It delivers 3 modalities in 9-minute sessions:
- **Thermal Contrast** — alternating heat/cold stress for adaptation
- **Photobiomodulation** — Red 660nm + Blue 450nm LED therapy
- **Vibro-Acoustic Stimulation** — whole-body vibrational resonance

**RecoveryIQ** transforms this device into an intelligent recovery ecosystem for:
- Physical therapists
- Chiropractors
- Sports trainers
- Spa/wellness practitioners

---

## 👥 Team Structure (6 Members)

| Role | Deliverables | Integration Point |
|------|--------------|-------------------|
| **Member 1** (CV/ML) | Body scanning + ROM/asymmetry analysis | Outputs JSON → InsForge via claudeApi |
| **Member 2** (Frontend/3D) | React UI, SVG body map, Three.js 3D model | Calls our CRUD functions, provides canvas export |
| **Member 3** (Backend/AI) | **THIS REPO** → Services layer + auth + device control | Central integration hub |
| **Member 4** (Integration) | Dashboard charts, ElevenLabs voice, insights | Consumes our API data |
| **Member 5** (Design) | Pricing page, wellness content, UX | Content for our reports |
| **Member 6** (DevOps/Workshop) | InsForge setup, MQTT credentials, S3 bucket | Provides env vars |

---

## 🏗️ Tech Stack (Non-negotiable)

```
Frontend:  React 18 + Vite + Tailwind CSS (CDN) + Plain JavaScript (NO TypeScript)
Backend:   InsForge (PostgreSQL + JWT Auth + S3 storage)
LLM:       Claude API (claude-sonnet-4-6) via fetch() — NO SDK
Voice:     ElevenLabs TTS API via fetch()
Device:    Hydrawav3 MQTT API via fetch()
Reports:   jsPDF (npm install jspdf)
Charts:    Recharts (already installed)
State:     React useState + useContext (NO Redux, NO localStorage)
```

---

## 📦 6 Deliverables (Member 3 — Backend/AI)

### **Deliverable 1: Claude API Integration** ✍️
Four reusable LLM functions for wellness insights:

1. **Client Brief** — 1-2 sentence practitioner summary (zones + HRV + camera → text)
2. **Protocol Recommendation** — Select optimal Hydrawav3 protocol (assessment → JSON config)
3. **Insight Card** — Dashboard insights based on patient trends (recovery scores → 1 sentence)
4. **Wellness Guidance** — Personalized post-session exercises & tips (session data → JSON)

**Files:** `src/services/claudeApi.js`

### **Deliverable 2: PostgreSQL Backend** 🗄️
6-table schema with full CRUD API:

```
practitioners (email, password_hash, name, practice_name)
patients (practitioner_id, name, dob, age, sport_activity, notes)
intakes (patient_id, zones, hrv, camera_data, client_brief, contraindications)
sessions (patient_id, protocol_used, duration, device_mac, mobility_before/after)
recovery_scores (patient_id, score 0-100, check_in_type, streak, xp, level)
s3_exports (patient_id, session_id, file_key, report_type)
```

**Files:** `src/services/insforgeApi.js`, `src/data/seedData.js`

### **Deliverable 3: JWT Authentication** 🔐
Practitioner login & protected routes:

- Login page (email/password → token)
- AuthContext (stores JWT in React state, NOT localStorage)
- Protected route wrapper
- Logout on token expiry

**Files:** `src/context/AuthContext.jsx`, `src/components/LoginPage.jsx`

### **Deliverable 4: MQTT Device Control** 📱
Real Hydrawav3 device integration:

- Start/Stop/Pause/Resume session commands
- Protocol configuration with placement, intensity, duration
- Session timer & status indicator
- Network feedback (loading, success, error states)

**Files:** `src/services/mqttApi.js`, `src/components/SessionController.jsx`

### **Deliverable 5: PDF Report Generation** 📄
Professional 2-page post-session report:

- Page 1: Assessment summary (zones, HRV, asymmetry) + 3D anatomy image + session details
- Page 2: Wellness guidance (exercises, recovery timeline, hydration/sleep tips)
- Warm branding (#C67A3C amber, #1A1A2E dark)
- jsPDF with embedded Three.js canvas export

**Files:** `src/services/reportGenerator.js`

### **Deliverable 6: S3 Export** ☁️
Upload PDFs to cloud & track:

- Upload PDF blob to InsForge S3 endpoint
- Get public download URL
- Save metadata to s3_exports table

**Files:** `src/services/s3Export.js`, `src/components/ReportButton.jsx`

---

## 🔧 Setup & Environment

### Install Dependencies
```bash
npm install jspdf
# Recharts + other deps already installed
```

### Environment Variables (`.env`)
```env
# Frontend
VITE_INSFORGE_URL=https://api.insforge.io          # From workshop
VITE_INSFORGE_JWT_SECRET=your-secret-key           # From workshop
VITE_INSFORGE_S3_BUCKET=recovery-iq-exports        # From workshop
VITE_CLAUDE_API_KEY=sk-ant-...                     # From Anthropic Console
VITE_ELEVENLABS_KEY=...                            # From ElevenLabs
VITE_MQTT_USERNAME=practitioner_username           # From Hydrawav3 workshop (3:30 PM)
VITE_MQTT_PASSWORD=practitioner_password           # From Hydrawav3 workshop (3:30 PM)
VITE_DEVICE_MAC=AA:BB:CC:DD:EE:FF                  # From Hydrawav3 workshop
```

### Development Server
```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
```

---

## 📊 Database Schema

```sql
CREATE TABLE practitioners (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  practice_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  practitioner_id INTEGER REFERENCES practitioners(id),
  name VARCHAR(255) NOT NULL,
  dob DATE,
  age INTEGER,
  sport_activity VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE intakes (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  zones JSONB NOT NULL,
  hrv INTEGER,
  camera_data JSONB,
  contraindications JSONB,
  client_brief TEXT,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  intake_id INTEGER REFERENCES intakes(id),
  protocol_used VARCHAR(255) NOT NULL,
  protocol_rationale TEXT,
  duration_minutes INTEGER,
  device_mac VARCHAR(50),
  sun_placement VARCHAR(255),
  moon_placement VARCHAR(255),
  intensity VARCHAR(20),
  mobility_before INTEGER,
  mobility_after INTEGER,
  started_at TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE TABLE recovery_scores (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  check_in_type VARCHAR(20),
  streak_count INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE s3_exports (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  session_id INTEGER REFERENCES sessions(id),
  file_key VARCHAR(500),
  file_url VARCHAR(500),
  report_type VARCHAR(50) DEFAULT 'session_report',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 💪 Recovery Score Algorithm

```javascript
score = (mobility/10 × 40%) + (recency/7 × 30%) + (streak/14 × 20%) + (hrv/100 × 10%)
// 0-100 scale
```

**XP System:**
- 50 XP per session completed
- 20 XP per daily check-in
- 30 XP per streak milestone (3, 7, 14, 30 days)

**Levels:**
- Level 1: 0 XP
- Level 2: 200 XP
- Level 3: 500 XP
- Level 4: 1000 XP
- Level 5: 2000 XP

---

## 🎨 Wellness Language Rules (HARDCODED)

**System Prompt for ALL Claude API calls:**
> "You are a wellness assistant for Hydrawav3 practitioners. You support practitioners — you never replace them. Output only wellness language. Use: supports, empowers, mobility, recovery, wellness indicator, movement insight. Never use: treats, cures, diagnoses, clinical, medical, reduces inflammation, heals. Keep every response to 1-2 sentences maximum. You are summarizing — not deciding. The practitioner is the expert. You are their assistant."

**NEVER use:**
- "medical device", "clinical", "diagnostic"
- "treats", "cures", "diagnoses", "heals"
- "reduces inflammation"
- "replaces the practitioner"
- "symptom", "condition", "injury"

**ALWAYS use:**
- "recovery", "wellness", "mobility", "performance"
- "supports", "empowers", "enhances"
- "practitioner-first", "hands-off"
- "the body heals itself"

---

## 📁 File Structure (Build Order)

```
src/
├── services/
│   ├── claudeApi.js          [Deliverable 1] — 4 Claude functions
│   ├── insforgeApi.js        [Deliverable 2] — CRUD for 6 tables
│   ├── mqttApi.js            [Deliverable 4] — Device Start/Stop/Pause/Resume
│   ├── reportGenerator.js    [Deliverable 5] — jsPDF builder
│   └── s3Export.js           [Deliverable 6] — S3 upload
├── context/
│   └── AuthContext.jsx       [Deliverable 3] — JWT + login/logout + protected route
├── components/
│   ├── LoginPage.jsx         [Deliverable 3] — Login form
│   ├── SessionController.jsx [Deliverable 4] — Device controls
│   ├── ReportButton.jsx      [Deliverable 6] — Generate + export + download
│   └── ProtectedRoute.jsx    [Deliverable 3] — Route guard
├── data/
│   └── seedData.js           [Deliverable 2] — 3 mock patients with history
└── utils/
    └── recoveryScore.js      — Score calculator

Build sequence:
1. claudeApi.js (test with console.log)
2. seedData.js (mock data)
3. insforgeApi.js (CRUD)
4. AuthContext.jsx + LoginPage.jsx (auth)
5. mqttApi.js + SessionController.jsx (device)
6. reportGenerator.js (PDF)
7. s3Export.js + ReportButton.jsx (export)
8. recoveryScore.js (calculator)
```

---

## 🔗 Team Integration Points

### → Member 1 (CV/ML) Provides:
```javascript
// Camera output JSON
{
  rom_left: 85,      // degrees
  rom_right: 72,     // degrees (restricted side)
  asymmetry_score: 15.4,  // percentage
  hr: 68,
  breath_rate: 14,
  hrv: 42             // milliseconds
}
```
**You receive this** via intake creation endpoint and pass to `generateClientBrief()` and `recommendProtocol()`.

### → Member 2 (Frontend/3D) Receives:
```javascript
// Your CRUD functions
createIntake(token, intakeData)
createSession(token, sessionData)
createRecoveryScore(token, scoreData)
getPatientSessions(token, patientId)
getPatientIntakes(token, patientId)
```
**They provide:** `canvas.toDataURL('image/png')` → you embed in `generateSessionReport()`

### → Member 4 (Integration) Receives:
```javascript
// Your data endpoints
getPatientScores(token, patientId)        // → Recharts
getPatientSessions(token, patientId)      // → Charts
getAllPatientsForPractitioner(token)      // → Dashboard table
generateInsightCard(patientData)          // → Dashboard cards
```

---

## 📝 Mock Data (Deliverable 2)

**3 Pre-seeded Patients with Realistic History:**

**Patient 1 — Maria (42, Marathon Runner)**
- Chief complaint: Right hip IT band pain (7/10)
- Sessions: 4 over 2 weeks
- Recovery scores: 55 → 62 → 68 → 74 (✅ **trending UP**)
- Protocol: Signature Short (9 min)
- HRV: 42-55ms

**Patient 2 — Marcus (35, Desk Worker)**
- Chief complaint: Left shoulder pain (6/10)
- Sessions: 3 over 10 days
- Recovery scores: 48 → 50 → 49 (⚠️ **plateauing**)
- Protocol: Multiple trials
- HRV: 58-65ms

**Patient 3 — Elena (28, Post-Surgical)**
- Chief complaint: Lower back recovery
- Sessions: 5 over 3 weeks
- Recovery scores: 32 → 41 → 52 → 63 → 71 (🚀 **strongly improving**)
- Protocol: ContrastPulse 18
- HRV: 38 → 62ms (improving)

Each patient: 5-7 recovery_scores, 3-5 sessions, 1-2 intakes, realistic dates over last 2-3 weeks.

---

## 🚀 Quick Start Checklist

- [ ] `npm install jspdf`
- [ ] Add all env vars to `.env`
- [ ] Create `src/services/claudeApi.js` (Deliverable 1)
- [ ] Create `src/data/seedData.js` (Deliverable 2)
- [ ] Create `src/services/insforgeApi.js` (Deliverable 2)
- [ ] Create `src/context/AuthContext.jsx` + `src/components/LoginPage.jsx` (Deliverable 3)
- [ ] Create `src/services/mqttApi.js` + `src/components/SessionController.jsx` (Deliverable 4)
- [ ] Create `src/services/reportGenerator.js` (Deliverable 5)
- [ ] Create `src/services/s3Export.js` + `src/components/ReportButton.jsx` (Deliverable 6)
- [ ] Test auth flow on `/login`
- [ ] Test session controller with mock MQTT
- [ ] Pre-seed database with seedData.js
- [ ] Generate sample report

---

## 🎓 Key Concepts

### **Practitioner-First Design**
The AI never replaces practitioner judgment — it surfaces data and recommendations. Practitioners make the final call on protocol, placement, and progression.

### **Wellness != Medical**
We support, empower, and enhance recovery. We never claim to treat, cure, or diagnose. All language is recovery-focused, not clinical.

### **Full-Loop Platform**
- **KNOW:** Intake → Assessment → Claude brief + recommendation
- **ACT:** Start session → MQTT control → Real device delivery
- **LEARN:** Recovery tracking → Score calculation → Personalized guidance

### **24/7 Practitioner Availability**
Thanks to the hands-off device + AI insights, practitioners can safely enable remote sessions. RecoveryIQ provides the context they need to make decisions asynchronously.

---

## 📞 Support & Credits

**Built by Member 3 (Backend/AI)** for ASU GlobeHack 2026  
**Track:** Hydrawav3 Recovery Intelligence  
**Device:** Hydrawav3 (Sun + Moon dual-pad therapy)  
**Platform:** RecoveryIQ (hands-off recovery ecosystem)

---

**Last Updated:** April 19, 2026 | **Status:** In Development | **Track:** 🟠 Recovery Intelligence
