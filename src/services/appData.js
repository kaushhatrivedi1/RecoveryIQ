const BACKEND = 'http://localhost:8000';

export async function fetchClients(query = '') {
  const url = new URL(`${BACKEND}/api/clients`);
  if (query.trim()) url.searchParams.set('q', query.trim());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Client fetch failed (${res.status})`);
  const data = await res.json();
  return data.clients || [];
}

export async function createClient(payload) {
  const res = await fetch(`${BACKEND}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Client create failed (${res.status})`);
  const data = await res.json();
  return data.client;
}

export async function persistClientScore(clientId, payload) {
  const res = await fetch(`${BACKEND}/api/clients/${clientId}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Client score update failed (${res.status})`);
  const data = await res.json();
  return data.client;
}

export async function persistClientSession(clientId, payload) {
  const res = await fetch(`${BACKEND}/api/clients/${clientId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Client session update failed (${res.status})`);
  const data = await res.json();
  return data.client;
}
