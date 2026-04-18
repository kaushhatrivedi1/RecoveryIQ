const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_KEY || '';
const ELEVEN_KEY = import.meta.env.VITE_ELEVEN_KEY || '';
const MQTT_BASE = import.meta.env.VITE_MQTT_BASE || 'https://api.hydrawav3.studio';

const SYSTEM_PROMPT = `You are a wellness assistant for Hydrawav3 practitioners. You support practitioners — you never replace them.
Output only wellness language. Use: supports, empowers, mobility, recovery, wellness indicator, movement insight.
Never use: treats, cures, diagnoses, clinical, medical, reduces inflammation, heals.
Keep every response to 1-2 sentences maximum. You are summarizing — not deciding.
The practitioner is the expert. You are their assistant.`;

export async function generateClientBrief(intakeData) {
  const { name, zones, discomfort, behavior, duration, hrv, notes } = intakeData;
  const zoneNames = zones.map(z => z.replace(/_/g, ' ')).join(', ');
  const prompt = `Patient: ${name}. Focus areas: ${zoneNames}. Discomfort level: ${discomfort}/10. Pattern: ${behavior}. Duration: ${duration}. HRV: ${hrv || 'not provided'}. Notes: ${notes || 'none'}. Write a 1-2 sentence wellness summary for the practitioner.`;

  if (!CLAUDE_KEY) {
    return `${name} presents with ${discomfort}/10 discomfort in the ${zoneNames} area, with a ${behavior.toLowerCase()} pattern over ${duration.toLowerCase()} — a recovery-focused session supports mobility restoration and wellness.`;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'Recovery-focused session recommended based on intake signals.';
  } catch {
    return `${name} presents with ${discomfort}/10 discomfort in the ${zoneNames} area — a recovery-focused session supports mobility restoration.`;
  }
}

export async function generateDashboardInsight(patient) {
  const scores = patient.recovery_scores.slice(-5);
  const trend = scores.map(s => s.score).join(', ');
  const prompt = `Patient ${patient.name} has had recovery scores: ${trend} over the last 5 days. Their check-ins were: ${scores.map(s => s.check_in || 'none').join(', ')}. Write 1 insight sentence for the practitioner.`;

  if (!CLAUDE_KEY) {
    const latest = scores[scores.length - 1]?.score || 0;
    const first = scores[0]?.score || 0;
    if (latest > first) return `${patient.name}'s recovery signals are trending upward — current momentum supports continuing the current protocol.`;
    if (latest < first) return `${patient.name} has had 3 declining wellness check-ins this week — consider scheduling a follow-up session.`;
    return `${patient.name}'s recovery score has been stable — a new session may help restart upward mobility momentum.`;
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 100,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || 'Session review recommended based on recent check-in patterns.';
  } catch {
    return 'Session review recommended based on recent check-in patterns.';
  }
}

export async function speakText(text, apiKey) {
  const key = apiKey || ELEVEN_KEY;
  if (!key) {
    console.warn('No ElevenLabs key — voice disabled');
    return;
  }
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (e) {
    console.error('ElevenLabs error:', e);
  }
}

export async function mqttAuth(baseUrl, username, password) {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, rememberMe: true }),
  });
  const data = await res.json();
  return data.JWT_ACCESS_TOKEN?.replace('Bearer ', '') || null;
}

export async function mqttCommand(baseUrl, token, payload) {
  const res = await fetch(`${baseUrl}/api/v1/mqtt/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      topic: 'HydraWav3Pro/config',
      payload: JSON.stringify(payload),
    }),
  });
  return res.ok;
}

export function buildStartPayload(mac, protocol) {
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
    leftFuncs: ['leftColdBlue', 'leftHotRed', 'leftCold'],
    rightFuncs: ['rightHotRed', 'rightColdBlue', 'rightHotRed'],
    pwmValues: { hot: [90, 90, 90], cold: [250, 250, 250] },
    playCmd: 1,
    led: 1,
    hotDrop: 5,
    coldDrop: 3,
    vibMin: 15,
    vibMax: 222,
    totalDuration: protocol?.duration ? protocol.duration * 60 : 540,
  };
}
