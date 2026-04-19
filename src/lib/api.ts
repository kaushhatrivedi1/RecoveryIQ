const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const MQTT_BASE = process.env.NEXT_PUBLIC_MQTT_BASE || "https://api.hydrawav3.studio";

// ── Backend API ───────────────────────────────────────────────────────────────

export interface IntakeResult {
  success: boolean;
  source: "claude" | "keyword";
  zones: string[];
  discomfort: number;
  behavior: string;
  duration: string;
  notes: string;
  summary: string;
}

export async function analyzeAssessment(transcript: string, patientName?: string): Promise<IntakeResult> {
  const res = await fetch(`${BACKEND_URL}/api/analyze-speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, patient_name: patientName ?? "" }),
  });
  if (!res.ok) throw new Error(`analyze-speech failed: ${res.status}`);
  return res.json();
}

export interface SignResult {
  gesture: string;
  landmarks: { x: number; y: number; z: number }[];
  hands_detected: number;
  confidence: number;
}

export async function detectSign(frameB64: string): Promise<SignResult> {
  const res = await fetch(`${BACKEND_URL}/api/detect-sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frame_b64: frameB64 }),
  });
  if (!res.ok) throw new Error(`detect-sign failed: ${res.status}`);
  return res.json();
}

export interface PoseResult {
  detected: boolean;
  landmarks: { x: number; y: number; z: number; visibility: number }[];
  joint_angles: Record<string, number>;
  asymmetry_flags: string[];
  shoulder_diff_px: number;
  hip_diff_px: number;
}

export async function analyzePose(frameB64: string): Promise<PoseResult> {
  const res = await fetch(`${BACKEND_URL}/api/analyze-pose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ frame_b64: frameB64 }),
  });
  if (!res.ok) throw new Error(`analyze-pose failed: ${res.status}`);
  return res.json();
}

// ── MQTT Device Control ───────────────────────────────────────────────────────

export async function mqttAuth(
  username = process.env.NEXT_PUBLIC_MQTT_USER ?? "",
  password = process.env.NEXT_PUBLIC_MQTT_PASS ?? ""
): Promise<string | null> {
  const res = await fetch(`${MQTT_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, rememberMe: true }),
  });
  const data = await res.json();
  return data.JWT_ACCESS_TOKEN?.replace("Bearer ", "") ?? null;
}

export async function mqttCommand(token: string, payload: object): Promise<boolean> {
  const res = await fetch(`${MQTT_BASE}/api/v1/mqtt/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topic: "HydraWav3Pro/config", payload: JSON.stringify(payload) }),
  });
  return res.ok;
}

export function buildStartPayload(mac: string, durationSeconds = 540) {
  return {
    mac,
    sessionCount: 3,
    sessionPause: 30,
    sDelay: 0,
    cycle1: 1,
    cycle5: 1,
    edgeCycleDuration: 9,
    cycleRepetitions: [6, 6, 3],
    cycleDurations: [3, 3, 3],
    cyclePauses: [3, 3, 3],
    pauseIntervals: [3, 3, 3],
    leftFuncs: ["leftColdBlue", "leftHotRed", "leftCold"],
    rightFuncs: ["rightHotRed", "rightColdBlue", "rightHotRed"],
    pwmValues: { hot: [90, 90, 90], cold: [250, 250, 250] },
    playCmd: 1,
    led: 1,
    hotDrop: 5,
    coldDrop: 3,
    vibMin: 15,
    vibMax: 222,
    totalDuration: durationSeconds,
  };
}
