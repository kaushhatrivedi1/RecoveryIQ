const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_KEY || '';
const MQTT_BASE = import.meta.env.VITE_MQTT_BASE || 'http://54.241.236.53:8080';
let lastVoiceDebug = { status: 'idle', mode: null, detail: '' };

const SYSTEM_PROMPT = `You are a wellness assistant for Hydrawav3 practitioners. You support practitioners — you never replace them.
Output only wellness language. Use: supports, empowers, mobility, recovery, wellness indicator, movement insight.
Never use: treats, cures, diagnoses, clinical, medical, reduces inflammation, heals.
Keep every response to 1-2 sentences maximum. You are summarizing — not deciding.
The practitioner is the expert. You are their assistant.`;

export async function generateClientBrief(intakeData) {
  const { name, zones, discomfort, behavior, duration, hrv, notes } = intakeData;
  const zoneNames = zones.map(z => z.replaceAll('_', ' ')).join(', ');
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

function getPreferredBrowserVoice() {
  if (typeof globalThis.window === 'undefined' || !('speechSynthesis' in globalThis)) return null;
  const voices = globalThis.speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.name === 'Samantha') ||
    voices.find((voice) => voice.lang?.startsWith('en-US')) ||
    voices.find((voice) => voice.lang?.startsWith('en')) ||
    voices[0] ||
    null
  );
}

export function getLastVoiceDebug() {
  return lastVoiceDebug;
}

export function speakWithBrowserTTS(text) {
  if (typeof globalThis.window === 'undefined' || !('speechSynthesis' in globalThis)) {
    console.warn('Browser speech synthesis is not available');
    lastVoiceDebug = { status: 'failed', mode: 'browser', detail: 'speechSynthesis unavailable' };
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const synth = globalThis.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = getPreferredBrowserVoice();

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    lastVoiceDebug = {
      status: 'starting',
      mode: 'browser',
      detail: selectedVoice ? `voice=${selectedVoice.name}` : 'voice=default',
    };

    utterance.volume = 1;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    let finished = false;
    const complete = (ok) => {
      if (finished) return;
      finished = true;
      resolve(ok);
    };

    utterance.onstart = () => {
      globalThis.clearTimeout(startTimeout);
      lastVoiceDebug = {
        status: 'speaking',
        mode: 'browser',
        detail: selectedVoice ? `voice=${selectedVoice.name}` : 'voice=default',
      };
    };
    utterance.onend = () => {
      lastVoiceDebug = {
        status: 'finished',
        mode: 'browser',
        detail: selectedVoice ? `voice=${selectedVoice.name}` : 'voice=default',
      };
      complete(true);
    };
    utterance.onerror = (event) => {
      if (event.error === 'canceled' && synth.speaking) {
        return;
      }
      console.warn('Browser speech synthesis error', event.error);
      lastVoiceDebug = {
        status: 'failed',
        mode: 'browser',
        detail: `error=${event.error}`,
      };
      complete(false);
    };

    synth.cancel();
    synth.resume();
    synth.speak(utterance);
    globalThis.setTimeout(() => synth.resume(), 150);
    globalThis.setTimeout(() => synth.resume(), 500);

    const startTimeout = globalThis.setTimeout(() => {
      if (!synth.speaking && !finished) {
        console.warn('Browser speech synthesis did not start');
        lastVoiceDebug = {
          status: 'failed',
          mode: 'browser',
          detail: 'speech did not start',
        };
        complete(false);
      }
    }, 1200);
  });
}

export async function speakText(text) {
  try {
    lastVoiceDebug = { status: 'starting', mode: 'vite-tts', detail: 'requesting /api/tts' };
    const controller = new AbortController();
    const requestTimeout = globalThis.setTimeout(() => controller.abort(), 5000);
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ text }),
    });
    globalThis.clearTimeout(requestTimeout);

    if (!response.ok) {
      lastVoiceDebug = { status: 'failed', mode: 'vite-tts', detail: `http=${response.status}` };
      return speakWithBrowserTTS(text);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return await new Promise((resolve) => {
      const playbackTimeout = globalThis.setTimeout(() => {
        URL.revokeObjectURL(url);
        lastVoiceDebug = { status: 'failed', mode: 'vite-tts', detail: 'audio playback timeout' };
        resolve(speakWithBrowserTTS(text));
      }, 12000);

      audio.onplay = () => {
        lastVoiceDebug = { status: 'speaking', mode: 'vite-tts', detail: 'macOS say playback started' };
      };
      audio.onended = () => {
        globalThis.clearTimeout(playbackTimeout);
        URL.revokeObjectURL(url);
        lastVoiceDebug = { status: 'finished', mode: 'vite-tts', detail: 'macOS say playback complete' };
        resolve(true);
      };
      audio.onerror = () => {
        globalThis.clearTimeout(playbackTimeout);
        URL.revokeObjectURL(url);
        lastVoiceDebug = { status: 'failed', mode: 'vite-tts', detail: 'audio element error' };
        resolve(speakWithBrowserTTS(text));
      };
      audio.play().catch(() => {
        globalThis.clearTimeout(playbackTimeout);
        URL.revokeObjectURL(url);
        lastVoiceDebug = { status: 'failed', mode: 'vite-tts', detail: 'audio.play blocked' };
        resolve(speakWithBrowserTTS(text));
      });
    });
  } catch (error) {
    lastVoiceDebug = {
      status: 'failed',
      mode: 'vite-tts',
      detail: error?.name === 'AbortError' ? 'tts request timeout' : (error?.message || 'request error'),
    };
    return speakWithBrowserTTS(text);
  }
}

export async function generateSessionPlan({ name, zones, romFindings, activities, notes, vitals }) {
  const zoneNames = zones.map(z => z.replaceAll('_', ' ')).join(', ');
  const romSummary = romFindings.length
    ? romFindings.map(f => `${f.test.replace(/_/g, ' ')}: ${f.body_part} (${f.side}) — ${f.sensations.join(', ')}`).join('; ')
    : 'No ROM tests recorded';
  const actSummary = activities.ranked.length ? activities.ranked.join(', ') : 'Not specified';
  const vitalsSummary = vitals
    ? `HR ${vitals.hr_bpm} BPM, HRV ${vitals.hrv_sdnn_ms} ms, Breath rate ${vitals.breath_rate_bpm}/min`
    : 'Not measured';

  const prompt = `Practitioner assessment for ${name || 'client'}.
Active zones: ${zoneNames}.
ROM findings: ${romSummary}.
Daily activities (ranked by time): ${actSummary}.
Sleep posture: ${activities.sleep_posture || 'not specified'}.
Makes discomfort worse: ${(activities.makes_worse || []).join(', ') || 'not specified'}.
Position tolerance: ${activities.position_tolerance || 'not specified'}.
Vitals: ${vitalsSummary}.
Notes: ${notes || 'none'}.

Return ONLY this JSON:
{
  "analysis_1": "<2-3 sentence clinical observation for the practitioner covering primary drivers of discomfort based on zones and ROM findings>",
  "analysis_2": "<2-3 sentence biometric and movement quality insight covering vitals, asymmetry risk, and readiness>",
  "protocol_recommendation": "<name of the most appropriate protocol from: PolarWave 36 Restore, PolarWave 18 Release, PolarWave 9 Balance, Mobility Surge, Deep Session, Contrast Pulse 9>",
  "protocol_reason": "<1 sentence explaining why this protocol suits this client today>",
  "readiness_score": <0-100>,
  "readiness_label": "<Low|Moderate|Good|Excellent>",
  "session_focus": "<1 short phrase: primary therapeutic intent for this session>"
}`;

  const fallback = {
    analysis_1: `${name || 'Client'} presents with primary discomfort in the ${zoneNames} area. ROM findings indicate restricted mobility patterns that may benefit from targeted thermal contrast work. Recommend addressing the primary zone first before progressing to adjacent areas.`,
    analysis_2: vitals
      ? `Resting HR of ${vitals.hr_bpm} BPM and HRV of ${vitals.hrv_sdnn_ms} ms indicate ${vitals.hrv_sdnn_ms >= 40 ? 'adequate recovery capacity for an active session' : 'a reduced autonomic tone — a gentler recovery protocol is recommended today'}.`
      : 'Biometric scan not performed — session intensity should be guided by reported discomfort levels and movement quality observations.',
    protocol_recommendation: 'PolarWave 36 "Restore"',
    protocol_reason: 'Restorative thermal alternation supports tissue mobility and recovery readiness.',
    readiness_score: vitals ? (vitals.hrv_sdnn_ms >= 40 ? 68 : 52) : 60,
    readiness_label: vitals ? (vitals.hrv_sdnn_ms >= 40 ? 'Good' : 'Moderate') : 'Moderate',
    session_focus: `${zoneNames} mobility restoration`,
  };

  if (!CLAUDE_KEY) return fallback;

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
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    return { ...fallback, ...JSON.parse(clean) };
  } catch {
    return fallback;
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
