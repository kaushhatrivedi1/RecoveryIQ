const HYDRAWAV_API_BASE =
  import.meta.env.VITE_MQTT_BASE || 'http://54.241.236.53:8080';

export function getHydrawavBaseUrl(overrideBaseUrl) {
  return overrideBaseUrl || HYDRAWAV_API_BASE;
}

export async function hydrawavLogin({
  baseUrl = HYDRAWAV_API_BASE,
  username,
  password,
}) {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, rememberMe: true }),
  });

  if (!res.ok) {
    throw new Error(`Hydrawav login failed (${res.status})`);
  }

  const data = await res.json();
  return data.JWT_ACCESS_TOKEN?.replace('Bearer ', '') || null;
}

export async function hydrawavPublish({
  baseUrl = HYDRAWAV_API_BASE,
  token,
  topic = 'HydraWav3Pro/config',
  payload,
}) {
  const res = await fetch(`${baseUrl}/api/v1/mqtt/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      topic,
      payload: JSON.stringify(payload),
    }),
  });

  if (!res.ok) {
    throw new Error(`Hydrawav publish failed (${res.status})`);
  }

  return true;
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
    leftFuncs: ['leftColdBlue', 'leftHotRed', 'leftColdBlue'],
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

export function buildPausePayload(mac) {
  return { mac, playCmd: 2 };
}

export function buildStopPayload(mac) {
  return { mac, playCmd: 3 };
}

export function buildResumePayload(mac) {
  return { mac, playCmd: 4 };
}
