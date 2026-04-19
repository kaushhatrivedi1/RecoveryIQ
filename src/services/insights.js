const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_KEY || '';

const WELLNESS_SYSTEM_PROMPT = `You are a wellness assistant for Hydrawav3 practitioners. You support practitioners — you never replace them.
Output only wellness language. Use: supports, empowers, mobility, recovery, wellness indicator, movement insight.
Never use: treats, cures, diagnoses, clinical, medical, reduces inflammation, heals.
Keep every response to 1-2 sentences maximum. You are summarizing — not deciding.
The practitioner is the expert. You are their assistant.`;

async function callClaude(prompt, { maxTokens = 150 } = {}) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: WELLNESS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function zonesToNames(zones = []) {
  return zones.map((zone) => zone.replaceAll('_', ' ')).join(', ');
}

export async function generateClientBrief(intakeData) {
  const { name, zones, discomfort, behavior, duration, hrv, notes } = intakeData;
  const zoneNames = zonesToNames(zones);
  const prompt = `Patient: ${name}. Focus areas: ${zoneNames}. Discomfort level: ${discomfort}/10. Pattern: ${behavior}. Duration: ${duration}. HRV: ${hrv || 'not provided'}. Notes: ${notes || 'none'}. Write a 1-2 sentence wellness summary for the practitioner.`;

  if (!CLAUDE_KEY) {
    return `${name} presents with ${discomfort}/10 discomfort in the ${zoneNames} area, with a ${behavior.toLowerCase()} pattern over ${duration.toLowerCase()} — a recovery-focused session supports mobility restoration and wellness.`;
  }

  try {
    return (await callClaude(prompt)) || 'Recovery-focused session recommended based on intake signals.';
  } catch {
    return `${name} presents with ${discomfort}/10 discomfort in the ${zoneNames} area — a recovery-focused session supports mobility restoration.`;
  }
}

export async function generateDashboardInsight(patient) {
  const scores = patient.recovery_scores.slice(-5);
  const trend = scores.map((score) => score.score).join(', ');
  const prompt = `Patient ${patient.name} has had recovery scores: ${trend} over the last 5 days. Their check-ins were: ${scores.map((score) => score.check_in || 'none').join(', ')}. Write 1 insight sentence for the practitioner.`;

  if (!CLAUDE_KEY) {
    const latest = scores[scores.length - 1]?.score || 0;
    const first = scores[0]?.score || 0;
    if (latest > first) return `${patient.name}'s recovery signals are trending upward — current momentum supports continuing the current protocol.`;
    if (latest < first) return `${patient.name} has had 3 declining wellness check-ins this week — consider scheduling a follow-up session.`;
    return `${patient.name}'s recovery score has been stable — a new session may help restart upward mobility momentum.`;
  }

  try {
    return (await callClaude(prompt, { maxTokens: 100 })) || 'Session review recommended based on recent check-in patterns.';
  } catch {
    return 'Session review recommended based on recent check-in patterns.';
  }
}

export function buildFallbackSessionPlan({ name, zones, vitals, movementIntel }) {
  const zoneNames = zonesToNames(zones);
  const topZone = movementIntel?.targetZones?.[0]?.label || zoneNames;
  const compensationLine = movementIntel?.compensationFlags?.[0];
  const asymmetryLine = movementIntel?.asymmetrySignals?.[0];
  const readinessLine = movementIntel?.readiness?.label;
  const recommendedProtocol = movementIntel?.recommendedProtocol?.name;

  return {
    analysis_1: `${name || 'Client'} presents with the strongest movement restriction around ${topZone}. ROM findings indicate a targeted mobility bottleneck that should be addressed first before progressing to adjacent regions.${compensationLine ? ` ${compensationLine}` : ''}`,
    analysis_2: vitals
      ? `Resting HR of ${vitals.hr_bpm} BPM and HRV of ${vitals.hrv_sdnn_ms} ms indicate ${vitals.hrv_sdnn_ms >= 40 ? 'adequate recovery capacity for an active session' : 'a reduced autonomic tone — a gentler recovery protocol is recommended today'}.${readinessLine ? ` Overall readiness is ${readinessLine.toLowerCase()}.` : ''}${asymmetryLine ? ` ${asymmetryLine}` : ''}`
      : 'Biometric scan not performed — session intensity should be guided by reported discomfort levels and movement quality observations.',
    protocol_recommendation: recommendedProtocol || 'PolarWave 36 "Restore"',
    protocol_reason: recommendedProtocol
      ? `This protocol matches the current restriction pattern and today's ${movementIntel?.readiness?.label?.toLowerCase() || 'moderate'} readiness profile.`
      : 'Restorative thermal alternation supports tissue mobility and recovery readiness.',
    readiness_score: movementIntel?.readiness?.score || (vitals ? (vitals.hrv_sdnn_ms >= 40 ? 68 : 52) : 60),
    readiness_label: movementIntel?.readiness?.label || (vitals ? (vitals.hrv_sdnn_ms >= 40 ? 'Good' : 'Moderate') : 'Moderate'),
    session_focus: `${topZone} mobility restoration`,
    innovation: movementIntel || null,
  };
}

export async function generateSessionPlan({
  name,
  zones,
  romFindings,
  activities,
  notes,
  vitals,
  movementIntel,
}) {
  const zoneNames = zonesToNames(zones);
  const romSummary = romFindings.length
    ? romFindings
        .map(
          (finding) =>
            `${finding.test.replace(/_/g, ' ')}: ${finding.body_part} (${finding.side}) — ${finding.sensations.join(', ')}`,
        )
        .join('; ')
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
Movement intelligence summary: ${movementIntel?.summary || 'Not available'}.
Top target zones: ${(movementIntel?.targetZones || []).map((zone) => `${zone.label} (${zone.score})`).join(', ') || 'Not available'}.
Compensation flags: ${(movementIntel?.compensationFlags || []).join(' | ') || 'None detected'}.
Asymmetry signals: ${(movementIntel?.asymmetrySignals || []).join(' | ') || 'None detected'}.
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

  const fallback = buildFallbackSessionPlan({ name, zones, vitals, movementIntel });
  if (!CLAUDE_KEY) return fallback;

  try {
    const text = await callClaude(prompt, { maxTokens: 500 });
    const clean = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    return { ...fallback, ...JSON.parse(clean) };
  } catch {
    return fallback;
  }
}
