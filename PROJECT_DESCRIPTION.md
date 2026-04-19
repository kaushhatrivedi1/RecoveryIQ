# RecoveryIQ — Project Description & Technical Deep Dive

## Executive Summary

**RecoveryIQ** is the full-stack platform layer for Hydrawav3, enabling practitioners (physical therapists, chiropractors, trainers, spa therapists) to deliver personalized wellness sessions with AI-powered insights.

**Hydrawav3** is a hands-off wellness device — practitioners place it on patients, leave, and the device does the work. RecoveryIQ closes the loop by providing:

1. **KNOW:** Pre-session intelligence (patient intake, ROM assessment, protocol recommendation)
2. **ACT:** Session delivery (device control via MQTT, real-time monitoring)
3. **LEARN:** Post-session analytics (recovery tracking, personalized guidance, outcome visualization)

---

## The Problem We Solve

### Before RecoveryIQ
- Practitioners had a device but no software ecosystem
- No way to track patient data across sessions
- No AI insights to guide protocol selection
- No structured reports for follow-up planning
- Recovery tracking was manual/paper-based

### After RecoveryIQ
- Practitioners log in, see all patients with recovery trends
- AI recommends optimal protocol based on assessment data
- Session gets remotely controlled via IoT
- Professional PDF report auto-generates post-session
- Patient recovery data feeds personalized guidance
- Practitioner can track outcomes and optimize protocols

---

## Technical Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                     │
│  Member 2: Login, Intake form, 3D body map, Dashboard        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (fetch)
┌────────────────────────┴────────────────────────────────────┐
│              BACKEND SERVICES (Member 3 — You)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Authentication Layer                                 │  │
│  │ - JWT token generation/validation (InsForge)        │  │
│  │ - Protected routes + context management             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Service Layer                                    │  │
│  │ - InForge CRUD: practitioners, patients, intakes,   │  │
│  │   sessions, recovery_scores, s3_exports            │  │
│  │ - Claude API: brief, recommendation, insight, guide │  │
│  │ - Hydrawav3 MQTT: start, stop, pause, resume       │  │
│  │ - ElevenLabs TTS (via Member 4)                    │  │
│  │ - S3 export with presigned URLs                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Business Logic                                       │  │
│  │ - Recovery score calculation                         │  │
│  │ - XP/Level system                                    │  │
│  │ - Streak tracking                                    │  │
│  │ - PDF report generation (jsPDF)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼───────────────┐
        │                │               │
        ▼                ▼               ▼
   InsForge DB      Claude API     Hydrawav3 MQTT
   (PostgreSQL)   (claude-sonnet)   (IoT Device)
                          │
                          ▼
                      ElevenLabs TTS
```

---

## Member 3 Deliverables (You)

### **Deliverable 1: Claude API Integration** 
**Files:** `src/services/claudeApi.js`

**4 Functions:**

#### 1A. `generateClientBrief(intakeData)`
Takes raw assessment data, returns practitioner-friendly summary.
```javascript
Input: {
  zones: [{name: "right_hip", discomfort: 7, behavior: "comes_and_goes", duration: "3-6 months"}],
  hrv: 42,
  camera_data: {rom_left: 85, rom_right: 72, asymmetry_score: 15.4}
}

Output: "Maria presents with moderate discomfort in the right hip (7/10, recurring 
over 3-6 months) with asymmetry suggesting compensation in the lower back. HRV of 
42ms indicates a recovery-focused session is recommended."
```

**Why:** Practitioner sees the key data in one sentence, not raw JSON. Summarization is AI's job, decision-making is theirs.

#### 1B. `recommendProtocol(assessmentData)`
Claude picks the best protocol from 6+ options and explains why.
```javascript
Input: { zones, discomfort_level, behavior, duration, hrv, camera_assessment }

Output: {
  protocol_name: "Signature Short",
  rationale: "Thermal contrast supports tissue adaptation after extended IT band tightness.",
  sun_placement: "Right hip",
  moon_placement: "Lower back",
  intensity: "moderate",
  duration_minutes: 9
}
```

**Why:** Instead of guessing, practitioners get data-driven recommendations. The device has 20+ protocols — Claude picks the best fit.

#### 1C. `generateInsightCard(patientData)`
Quick insight for dashboard showing patient progress.
```javascript
Input: {
  patient_name: "Maria",
  recent_scores: [55, 62, 68, 74],
  recent_checkins: ["great", "great", "okay"],
  sessions_count: 4,
  last_protocol: "Signature Short"
}

Output: "Maria's ROM has improved 18% over 4 sessions — current protocol is working well."
```

**Why:** Dashboard needs real-time insights, not just pretty charts. Practitioners see at a glance if something is working.

#### 1D. `generateWellnessGuidance(sessionData)`
Personalized home exercises + recovery timeline post-session.
```javascript
Input: {
  zone_treated: "right_hip",
  protocol_used: "Signature Short",
  rom_before: 72,
  rom_after: 87,
  hrv: 42,
  patient_age: 42
}

Output: {
  exercises: [
    {
      name: "Hip flexor stretch",
      description: "Standing quad stretch, pull heel toward glute...",
      duration_minutes: 2,
      reps: "3x per side"
    },
    // 3-4 more exercises
  ],
  recovery_timeline: "Hours 1-6: Increased mobility expected. Days 1-3: Gentle movement...",
  hydration_tip: "8-10 glasses today",
  sleep_tip: "7-8 hours recommended tonight",
  next_session_suggestion: "Consider ContrastPulse 18 for deeper recovery focus"
}
```

**Why:** Patients get personalized homework + recovery expectations. This extends the value of the session beyond the 9 minutes.

---

### **Deliverable 2: PostgreSQL Backend with CRUD + Seed Data**
**Files:** `src/services/insforgeApi.js`, `src/data/seedData.js`

#### Database Schema (6 Tables)

**practitioners** — Practitioner accounts
```
id | email | password_hash | name | practice_name | created_at
```

**patients** — Patient roster (belongs to practitioner)
```
id | practitioner_id | name | dob | age | sport_activity | notes | created_at
```

**intakes** — Intake assessment (what Member 1 captured)
```
id | patient_id | zones (JSONB) | hrv | camera_data (JSONB) | 
contraindications | client_brief | notes | timestamp
```
*zones* example: `[{name: "right_hip", discomfort: 7, behavior: "comes_and_goes", duration: "3-6 months"}]`

**sessions** — Session history (what device actually delivered)
```
id | patient_id | intake_id | protocol_used | protocol_rationale | 
duration_minutes | device_mac | sun_placement | moon_placement | intensity | 
mobility_before | mobility_after | started_at | ended_at
```

**recovery_scores** — Daily recovery tracking (gamification + trend)
```
id | patient_id | date | score (0-100) | check_in_type (great/okay/rough) | 
streak_count | xp_earned | total_xp | level | notes | created_at
```

**s3_exports** — PDF reports storage tracking
```
id | patient_id | session_id | file_key | file_url | report_type | created_at
```

#### CRUD Functions
```javascript
// Intakes
createIntake(token, intakeData)
getPatientIntakes(token, patientId)

// Sessions
createSession(token, sessionData)
getPatientSessions(token, patientId)

// Recovery Scores
createRecoveryScore(token, scoreData)
getPatientScores(token, patientId)

// Practitioners
getAllPatientsForPractitioner(token, practitionerId)

// S3 Exports
uploadToS3(token, file, metadata)
getExports(token, patientId)
```

#### Seed Data (3 Mock Patients)
Pre-seed the database so the dashboard has data on day 1.

**Patient 1 — Maria (42, Marathon Runner)**
- Chief complaint: Right hip IT band pain (7/10, recurring 3-6 months)
- Sessions: 4 over 2 weeks (realistic dates)
  - Session 1: Signature Short, mobility 4→6
  - Session 2: Signature Short, mobility 6→7
  - Session 3: ContrastPulse 18, mobility 7→8
  - Session 4: Signature Short, mobility 8→9
- Recovery scores: 55 → 62 → 68 → 74 (📈 **trending UP**)
- HRV: 42-55ms (improving)
- Camera: rom_left 85°, rom_right 72°, asymmetry 12%
- Intakes: 2 (initial + post-session check-in)

**Patient 2 — Marcus (35, Desk Worker)**
- Chief complaint: Left shoulder pain (6/10, from computer posture)
- Sessions: 3 over 10 days
  - Session 1: HeatWave 9, mobility 3→4
  - Session 2: ContrastPulse 18, mobility 4→5
  - Session 3: Signature Short, mobility 5→5 (no change)
- Recovery scores: 48 → 50 → 49 (⚠️ **plateauing**)
- HRV: 58-65ms (stable but not improving)
- Insight: Protocol isn't working, recommend trying different approach
- Intakes: 1

**Patient 3 — Elena (28, Post-Surgical)**
- Chief complaint: Lower back recovery post-microsurgery
- Sessions: 5 over 3 weeks
  - Session 1: ColdPack 9, mobility 2→3
  - Session 2: Signature Short, mobility 3→4
  - Session 3: ContrastPulse 18, mobility 4→6
  - Session 4: ContrastPulse 18, mobility 6→8
  - Session 5: Signature Short, mobility 8→9
- Recovery scores: 32 → 41 → 52 → 63 → 71 (🚀 **strongly improving**)
- HRV: 38 → 62ms (major improvement)
- Insight: ContrastPulse 18 is unlocking her recovery
- Intakes: 2

---

### **Deliverable 3: JWT Authentication (Login + Context + Protected Routes)**
**Files:** `src/context/AuthContext.jsx`, `src/components/LoginPage.jsx`, `src/components/ProtectedRoute.jsx`

#### AuthContext
Manages authentication state globally:
```javascript
const { token, user, login, logout, isAuthenticated } = useContext(AuthContext)

// State: { token, user: {id, email, name, practice_name} }
// Provides: login(email, password), logout()
// Protects: token stored in React state, NOT localStorage
// On expiry: Auto-redirect to /login
```

#### LoginPage
Simple, clean login form:
- Email input
- Password input
- Submit button (calls `login()`)
- Error display (invalid credentials)
- Success redirect to `/intake` or `/dashboard`
- Tailwind styling (minimal, professional)

#### ProtectedRoute
Wrapper component:
```javascript
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```
If no token → redirect to /login. Otherwise render component.

---

### **Deliverable 4: MQTT Device Control (Session Controller + Device API)**
**Files:** `src/services/mqttApi.js`, `src/components/SessionController.jsx`

#### MQTT API Functions
Real device communication via Hydrawav3 MQTT endpoint.

```javascript
// Step 1: Get JWT from Hydrawav3
const jwtToken = await getHydrawav3JWT(MQTT_USERNAME, MQTT_PASSWORD)

// Step 2: Send commands
startSession(token, deviceMac, protocolConfig)
pauseSession(token, deviceMac)
resumeSession(token, deviceMac)
stopSession(token, deviceMac)
```

#### Protocol Configuration Payload
```javascript
{
  mac: "AA:BB:CC:DD:EE:FF",
  sessionCount: 1,
  cycleRepetitions: [3, 3, 3],           // thermal cycles
  cycleDurations: [180, 180, 180],       // seconds per cycle
  leftFuncs: {
    leftColdBlue: true,
    leftHotRed: false,
    leftCold: true
  },
  rightFuncs: {
    rightColdBlue: false,
    rightHotRed: true,
    rightCold: false
  },
  pwmValues: {
    hot: [90, 90, 90],                   // intensity levels
    cold: [250, 250, 250]
  },
  playCmd: 1,                             // 1=start, 2=pause, 3=stop, 4=resume
  led: 1,                                 // LED on/off
  hotDrop: 10,                            // temperature change speed
  coldDrop: 10,
  vibMin: 30,                             // vibration range
  vibMax: 80,
  totalDuration: 540                      // 9 min = 540 sec
}
```

#### SessionController Component
Interactive UI for device control:
- Protocol dropdown (Signature Short, Signature Long, ContrastPulse 18, etc.)
- Zone selection (Sun: right hip, Moon: lower back, etc.)
- Intensity slider (low/moderate/high)
- **Start Session** button (green, prominent)
- **Pause/Resume** toggle (amber)
- **Stop Session** button (red)
- **Timer** showing elapsed time (00:00 / 09:00)
- **Status indicator:** Idle → Running → Paused → Completed
- **Network feedback** (loading spinners, error messages)

Flow:
1. Practitioner selects protocol + zones + intensity
2. Clicks **Start**
3. Component calls `startSession()` → MQTT fires
4. Timer starts ticking
5. Display shows device is running
6. Practitioner can Pause/Resume/Stop
7. On Stop → save session end time to InsForge → trigger report generation

---

### **Deliverable 5: PDF Report Generation (jsPDF)**
**Files:** `src/services/reportGenerator.js`

#### Report Structure (2 Pages)

**PAGE 1 — Session Report**
```
┌─────────────────────────────────────────┐
│  HYDRAWAV3 SESSION REPORT               │
│  RecoveryIQ                              │
├─────────────────────────────────────────┤
│  Patient: Maria Rodriguez    Date: 4/19  │
│  Practitioner: Dr. Smith     Session: #4 │
│  Age: 42 | Sport: Marathon Running       │
├─────────────────────────────────────────┤
│  ASSESSMENT INTAKE                       │
│  Primary zone: Right hip (7/10)          │
│  Behavior: Comes and goes, 3-6 months   │
│  HRV: 42ms (recovery-focused)           │
│  ROM: Left 85° | Right 72° (12% asymmetry)
│  Client Brief:                           │
│  "Maria presents with moderate           │
│  discomfort..."                          │
├─────────────────────────────────────────┤
│  3D ANATOMY VISUAL                       │
│  [PNG image from Three.js canvas]        │
│  Sun pad: Right hip                      │
│  Moon pad: Lower back                    │
├─────────────────────────────────────────┤
│  SESSION DETAILS                         │
│  Protocol: Signature Short (9 min)       │
│  Intensity: Moderate                     │
│  Sun: 90 PWM | Moon: 250 PWM             │
│  Modalities: Thermal + Light + Vibration │
├─────────────────────────────────────────┤
│  OUTCOMES                                │
│  Mobility Before: 4/10 → After: 7/10    │
│  ROM Change: +15° hip rotation           │
│  Recovery Score: 74 (+6 from last)       │
│  Level: 4 | XP Earned: 50               │
└─────────────────────────────────────────┘
```

**PAGE 2 — Wellness Guidance**
```
┌─────────────────────────────────────────┐
│  PERSONALIZED WELLNESS GUIDANCE          │
│                                          │
│  Home Exercises (Next 3 Days)            │
│                                          │
│  1. Hip Flexor Stretch                   │
│     Standing quad stretch, pull heel     │
│     toward glute. Hold 60 seconds.       │
│     Perform: 3x per side                 │
│                                          │
│  2. Pigeon Pose                          │
│     Deep hip opener. Hold 90 seconds     │
│     each side. Perform: Daily            │
│                                          │
│  3. Standing IT Band Stretch              │
│     Cross behind, lean away. 60 sec.     │
│     Perform: 3x per side                 │
│                                          │
│  Recovery Timeline                       │
│  ──────────────────                      │
│  Hours 1-6: Increased mobility expected. │
│  Days 1-3: Gentle movement recommended. │
│  Week 1: Gradual return to full activity.│
│                                          │
│  Hydration: 8-10 glasses today           │
│  Sleep: 7-8 hours recommended tonight    │
│                                          │
│  Next Session: Consider ContrastPulse 18 │
│  for deeper recovery focus (3-5 days)    │
│                                          │
├─────────────────────────────────────────┤
│  Generated by RecoveryIQ                 │
│  hydrawav3 — the body heals itself       │
│  Date: April 19, 2026                    │
└─────────────────────────────────────────┘
```

#### Function Signature
```javascript
generateSessionReport({
  patient,              // {name, age, dob}
  intake,               // {zones, hrv, camera_data, client_brief}
  session,              // {protocol_used, intensity, sun_placement, moon_placement, 
                        //   mobility_before, mobility_after, duration_minutes, 
                        //   started_at, ended_at}
  recoveryScore,        // {score, streak, level, xp_earned, total_xp}
  wellnessGuidance,     // from generateWellnessGuidance() 
  anatomyImageBase64    // from Member 2's Three.js canvas.toDataURL()
})
→ Blob (PDF file ready for upload)
```

#### Design
- Warm colors: #C67A3C (accent), #1A1A2E (dark)
- Professional layout, not text-dump
- Embedded 3D anatomy image (PNG base64)
- Clear sections with borders
- Easy-to-read typography

---

### **Deliverable 6: S3 Export (Cloud Upload + URL Tracking)**
**Files:** `src/services/s3Export.js`, `src/components/ReportButton.jsx`

#### Export Flow
```javascript
// 1. Generate PDF
const pdfBlob = await generateSessionReport({...})

// 2. Upload to S3 via InsForge
const { fileUrl, fileKey } = await exportReportToS3(
  token,
  pdfBlob,
  patientId,
  sessionId
)

// 3. Get back public download URL
// 4. Save to s3_exports table
// 5. UI shows download link
```

#### ReportButton Component
```jsx
<ReportButton session={session} patient={patient} />

// Renders:
// - [Generate Report] button (triggers PDF generation)
// - [Uploading...] state (shows progress)
// - [Download] link (points to S3 URL)
// - Copy link button (for sharing with patient)
```

---

## Integration Checklist (How This Connects)

### **Member 1 → You**
Member 1 captures camera data + ROM analysis. They POST to your `/intakes` endpoint:
```javascript
// Member 1 sends this:
{
  patient_id: 1,
  zones: [{name: "right_hip", discomfort: 7, behavior: "comes_and_goes", duration: "3-6 months"}],
  hrv: 42,
  camera_data: {
    rom_left: 85,
    rom_right: 72,
    asymmetry_score: 15.4,
    hr: 68,
    breath_rate: 14
  }
}

// You receive this → immediately call:
const brief = await generateClientBrief({zones, hrv, camera_data})
const protocol = await recommendProtocol({zones, hrv, camera_data, ...})

// Store both in intakes table
// Return to UI
```

### **Member 2 → You**
Member 2 builds the React UI (login, intake form, session controller, dashboard). They:
- Call your `createIntake()`, `createSession()`, `createRecoveryScore()` functions
- Pass your return values to charts + displays
- Export canvas as `canvas.toDataURL('image/png')` → you embed in PDF

### **You → Member 4**
Member 4 (Integration) needs your data endpoints:
```javascript
// Member 4 calls:
const scores = await getPatientScores(token, patientId)
const sessions = await getPatientSessions(token, patientId)
const patients = await getAllPatientsForPractitioner(token)
const insight = await generateInsightCard(patientData)

// They feed Recharts + build dashboard insights
```

---

## Language Restrictions (CRITICAL)

Every piece of text you generate — whether from Claude or hardcoded — must follow these rules.

### ✅ Wellness Language (USE THESE)
- "supports", "empowers", "enhances"
- "recovery", "wellness", "mobility", "performance"
- "movement insight", "wellness indicator"
- "the body heals itself"

### ❌ Medical Language (NEVER USE)
- "treats", "cures", "diagnoses", "heals" (as verb)
- "clinical", "medical device", "diagnostic"
- "reduces inflammation", "condition", "injury", "symptom"
- "replaces the practitioner"

**Example:** 
❌ "This protocol treats IT band syndrome"  
✅ "This protocol supports hip mobility and recovery from IT band discomfort"

---

## Recovery Score Formula

```javascript
function calculateRecoveryScore(params) {
  const {
    mobilityToday,      // 0-10 user self-report
    lastSessionDaysAgo, // how long since last session
    streakDays,         // consecutive days with check-ins
    hrv                 // may be null
  } = params;

  const mobilityComponent = (mobilityToday / 10) * 40;      // 40% weight
  const recencyComponent = Math.max(0, (7 - lastSessionDaysAgo) / 7) * 30;  // 30%
  const streakComponent = Math.min(streakDays / 14, 1) * 20;                // 20%
  const hrvComponent = hrv ? Math.min(hrv / 100, 1) * 10 : 5;               // 10%, default 5 if null

  return Math.round(mobilityComponent + recencyComponent + streakComponent + hrvComponent);
}

// Example: 
// mobilityToday: 7 → 40 points
// lastSessionDaysAgo: 2 → 21.4 points
// streakDays: 5 → 7.1 points
// hrv: 42 → 4.2 points
// Total: 72.7 → 73
```

---

## XP & Leveling System

**XP Earned:**
- 50 XP per session completed
- 20 XP per daily check-in
- 30 XP per streak milestone (3, 7, 14, 30 days)

**Levels:**
- Level 1: Start at 0 XP
- Level 2: Unlock at 200 XP
- Level 3: Unlock at 500 XP
- Level 4: Unlock at 1000 XP
- Level 5: Unlock at 2000 XP

---

## Environment Configuration

Your `.env` file needs access to all external services:

```env
# InsForge API
VITE_INSFORGE_URL=https://api.insforge.com
VITE_INSFORGE_JWT_SECRET=<from-member-6>
VITE_INSFORGE_S3_BUCKET=recovery-iq-exports

# Claude API
VITE_CLAUDE_API_KEY=sk-ant-<from-anthropic-console>

# Hydrawav3 Device
VITE_MQTT_USERNAME=<from-workshop>
VITE_MQTT_PASSWORD=<from-workshop>
VITE_DEVICE_MAC=AA:BB:CC:DD:EE:FF

# ElevenLabs (for Member 4)
VITE_ELEVENLABS_KEY=<from-elevenlabs>
```

---

## Success Criteria

By the end of GlobeHack, RecoveryIQ is "done" when:

✅ Practitioners can login  
✅ Patient intake data flows from Member 1 → Claude → UI  
✅ Protocol recommendations show in session controller  
✅ Session starts/stops real device via MQTT  
✅ Post-session PDF generates with 3D anatomy + wellness guidance  
✅ Recovery scores track patient progress over time  
✅ Dashboard shows insights card + patient list + trends  
✅ All text is wellness-first language (zero medical jargon)  
✅ Seed data demonstrates full flow for Member 2/4

---

## Open Questions for Member 6 (Workshop Output)

1. **InsForge Endpoints:** What's the exact POST URL for creating intakes? Is it `/api/intakes` or something else?
2. **S3 Endpoint:** What's the presigned URL generation process? Do we get a temporary URL or permanent?
3. **JWT Expiry:** How long before tokens expire? Should we implement refresh?
4. **MQTT Topic:** Is `HydraWav3Pro/config` always the right topic, or does it vary by device?
5. **Database Seeding:** Should seed script run on every app start, or just during initial setup?

---

## Timeline (2 Days)

**Day 1 (April 18) — Afternoon**
- [ ] All 6 environment variables working
- [ ] claudeApi.js — test with mock data (console.log outputs)
- [ ] seedData.js — 3 patients pre-loaded
- [ ] insforgeApi.js — CRUD functions stubbed (placeholder endpoints)
- [ ] AuthContext.jsx + LoginPage.jsx working

**Day 2 (April 19) — Morning**
- [ ] mqttApi.js + SessionController.jsx connected to real device
- [ ] reportGenerator.js producing valid PDFs
- [ ] s3Export.js uploading to cloud
- [ ] Full flow: Intake → Protocol Rec → Session → Report → Download

**Day 2 — Afternoon**
- [ ] Dashboard consuming your data (Member 4)
- [ ] Insights cards showing real patient trends
- [ ] Recovery scores reflecting accurate algorithm
- [ ] Live demo with all 6 team members

---

**Built by Member 3 (Backend/AI) for ASU GlobeHack 2026**  
**Track:** Hydrawav3 Recovery Intelligence  
**Device:** Hydrawav3 (hands-off wellness platform)  
**Vision:** The body heals itself — we just provide the data.
