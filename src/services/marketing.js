const BACKEND = 'http://localhost:8000';

export async function submitLead(payload) {
  const res = await fetch(`${BACKEND}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Lead create failed (${res.status})`);
  const data = await res.json();
  return data.lead;
}

export async function trackEvent(event, meta = {}) {
  try {
    await fetch(`${BACKEND}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        path: globalThis.window?.location?.pathname || '',
        source: meta.source || '',
        meta,
      }),
    });
  } catch {
    // Non-blocking analytics.
  }
}
