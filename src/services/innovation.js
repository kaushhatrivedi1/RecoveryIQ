import { BODY_ZONES, PAD_PLACEMENT_MAP, PROTOCOLS } from '../data/mockData';

function zoneLabel(zoneId) {
  return BODY_ZONES.find((zone) => zone.id === zoneId)?.label || zoneId.replaceAll('_', ' ');
}

const TEST_ZONE_MAP = {
  forward_bend: ['lower_back', 'left_hip', 'right_hip'],
  squat: ['left_knee', 'right_knee', 'left_hip', 'right_hip'],
  trunk_rotation: ['upper_back', 'lower_back'],
  ankle_dorsiflexion: ['left_calf', 'right_calf', 'left_foot', 'right_foot'],
  shoulder_flexion: ['left_shoulder', 'right_shoulder', 'upper_back', 'neck'],
  neck_flexion: ['neck', 'upper_back'],
  neck_rotation: ['neck', 'upper_back'],
  hip_flexion: ['left_hip', 'right_hip', 'lower_back'],
};

const ACTIVITY_ZONE_HINTS = {
  Sitting: ['neck', 'upper_back', 'lower_back', 'left_hip', 'right_hip'],
  Standing: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_calf', 'right_calf'],
  Walking: ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_calf', 'right_calf', 'left_foot', 'right_foot'],
  'Bending Forward': ['lower_back', 'left_hip', 'right_hip'],
  Lifting: ['lower_back', 'upper_back', 'left_shoulder', 'right_shoulder'],
  'Reaching Overhead': ['left_shoulder', 'right_shoulder', 'upper_back', 'neck'],
  Exercise: ['left_knee', 'right_knee', 'left_hip', 'right_hip', 'left_shoulder', 'right_shoulder'],
  'Long Drives': ['lower_back', 'left_hip', 'right_hip', 'neck'],
};

function createZoneMap(zoneIds = []) {
  return zoneIds.reduce((acc, zoneId) => {
    acc[zoneId] = { zoneId, label: zoneLabel(zoneId), score: 0, reasons: [] };
    return acc;
  }, {});
}

function addScore(zoneMap, zoneId, points, reason) {
  if (!zoneMap[zoneId]) {
    zoneMap[zoneId] = { zoneId, label: zoneLabel(zoneId), score: 0, reasons: [] };
  }
  zoneMap[zoneId].score += points;
  if (reason && !zoneMap[zoneId].reasons.includes(reason)) {
    zoneMap[zoneId].reasons.push(reason);
  }
}

function normalizeProtocolName(protocol) {
  return protocol.name.toLowerCase();
}

function pickProtocol(topZoneId, readinessScore, severityScore) {
  const candidates = PROTOCOLS.filter((protocol) => {
    if (!topZoneId) return true;
    const normalized = topZoneId.replace(/^(left|right)_/, '');
    return protocol.best_for.some((hint) => normalized.includes(hint) || hint.includes(normalized));
  });

  const preferred =
    readinessScore < 50
      ? candidates.find((protocol) => normalizeProtocolName(protocol).includes('signature short')) ||
        candidates.find((protocol) => normalizeProtocolName(protocol).includes('polarwave 18'))
      : severityScore >= 70
        ? candidates.find((protocol) => normalizeProtocolName(protocol).includes('deep session')) ||
          candidates.find((protocol) => normalizeProtocolName(protocol).includes('polarwave 36'))
        : candidates.find((protocol) => normalizeProtocolName(protocol).includes('mobility surge')) ||
          candidates.find((protocol) => normalizeProtocolName(protocol).includes('polarwave 9'));

  return preferred || candidates[0] || PROTOCOLS[0];
}

function buildCompensationFlags(romFindings = []) {
  const flags = [];

  romFindings.forEach((finding) => {
    const bodyPart = (finding.body_part || '').toLowerCase();
    if (finding.test === 'trunk_rotation' && bodyPart.includes('lower back')) {
      flags.push('Thoracic rotation is likely offloading into the lumbar spine.');
    }
    if (finding.test === 'shoulder_flexion' && (bodyPart.includes('neck') || bodyPart.includes('upper back'))) {
      flags.push('Overhead motion is likely borrowing from the cervicothoracic region.');
    }
    if (finding.test === 'squat' && (bodyPart.includes('ankle') || bodyPart.includes('calf'))) {
      flags.push('Squat depth appears limited by ankle mobility and downstream knee loading.');
    }
    if (finding.test === 'forward_bend' && bodyPart.includes('hip')) {
      flags.push('Forward bend suggests hip mobility demand is transferring into the lumbar region.');
    }
  });

  return [...new Set(flags)].slice(0, 3);
}

function buildAsymmetrySignals(zones = [], romFindings = []) {
  const unilateralZones = zones.filter((zone) => zone.startsWith('left_') || zone.startsWith('right_'));
  const leftCount = unilateralZones.filter((zone) => zone.startsWith('left_')).length;
  const rightCount = unilateralZones.filter((zone) => zone.startsWith('right_')).length;
  const signals = [];

  if (leftCount > rightCount + 1) {
    signals.push('Left-sided load pattern is stronger than right-sided involvement.');
  }
  if (rightCount > leftCount + 1) {
    signals.push('Right-sided load pattern is stronger than left-sided involvement.');
  }

  romFindings.forEach((finding) => {
    if (finding.side === 'Left' || finding.side === 'Right') {
      signals.push(`${finding.side}-sided ROM sensitivity noted during ${finding.test.replaceAll('_', ' ')}.`);
    }
  });

  return [...new Set(signals)].slice(0, 3);
}

function buildReadiness(scanData) {
  const vitals = scanData?.vitals;
  if (!vitals) {
    return {
      score: 60,
      label: 'Moderate',
      rationale: ['No biometric scan available, so readiness is estimated from movement inputs only.'],
    };
  }

  let score = 62;
  const rationale = [];

  if (vitals.hrv_sdnn_ms >= 45) {
    score += 14;
    rationale.push('HRV suggests the client has enough recovery bandwidth for a normal session.');
  } else if (vitals.hrv_sdnn_ms < 30) {
    score -= 14;
    rationale.push('Lower HRV suggests a gentler session bias is appropriate.');
  }

  if (vitals.hr_bpm <= 66) {
    score += 6;
    rationale.push('Resting heart rate is calm relative to baseline recovery work.');
  } else if (vitals.hr_bpm >= 78) {
    score -= 6;
    rationale.push('Resting heart rate is elevated, which reduces intensity tolerance.');
  }

  if (vitals.breath_rate_bpm >= 18) {
    score -= 4;
    rationale.push('Breath rate is elevated, pointing to lower readiness for aggressive loading.');
  }

  score = Math.max(35, Math.min(90, Math.round(score)));
  const label = score >= 78 ? 'Excellent' : score >= 66 ? 'Good' : score >= 52 ? 'Moderate' : 'Low';
  return { score, label, rationale };
}

export function buildMovementIntelligence({ assessmentData, scanData }) {
  const zones = assessmentData?.zones || [];
  const zoneDetails = assessmentData?.zoneDetails || {};
  const romFindings = assessmentData?.romFindings || [];
  const activities = assessmentData?.activities || {};
  const zoneMap = createZoneMap(zones);

  zones.forEach((zoneId) => {
    const detail = zoneDetails[zoneId];
    const discomfort = detail?.discomfort ?? assessmentData?.primaryDiscomfort ?? 5;
    addScore(zoneMap, zoneId, discomfort * 5, `${discomfort}/10 reported discomfort`);

    if ((detail?.behavior || '').toLowerCase().includes('stiff')) {
      addScore(zoneMap, zoneId, 6, 'Stiffness-dominant presentation');
    }
    if ((detail?.duration || '').toLowerCase().includes('acute')) {
      addScore(zoneMap, zoneId, 4, 'Acute pattern with higher reversibility');
    }
  });

  romFindings.forEach((finding) => {
    const linkedZones = TEST_ZONE_MAP[finding.test] || zones;
    const sensationWeight = (finding.sensations || []).length * 3;
    const sideWeight = finding.side === 'Bilateral' ? 8 : 4;
    linkedZones.forEach((zoneId) => {
      addScore(zoneMap, zoneId, 8 + sensationWeight + sideWeight, `ROM finding from ${finding.test.replaceAll('_', ' ')}`);
    });
  });

  (activities.makes_worse || []).forEach((factor) => {
    (ACTIVITY_ZONE_HINTS[factor] || []).forEach((zoneId) => {
      addScore(zoneMap, zoneId, 5, `${factor} aggravates symptoms`);
    });
  });

  if ((activities.position_tolerance || '').toLowerCase() === 'neither') {
    ['lower_back', 'upper_back', 'left_hip', 'right_hip'].forEach((zoneId) => {
      addScore(zoneMap, zoneId, 4, 'Low tolerance to both sitting and standing');
    });
  }

  const rankedZones = Object.values(zoneMap)
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      priority: index + 1,
      hasPlacements: Boolean(PAD_PLACEMENT_MAP[entry.zoneId]),
    }));

  const topZone = rankedZones[0]?.zoneId || zones[0] || null;
  const restrictionScore = Math.max(0, Math.min(100, Math.round((rankedZones[0]?.score || 0) * 1.2)));
  const readiness = buildReadiness(scanData);
  const compensationFlags = buildCompensationFlags(romFindings);
  const asymmetrySignals = buildAsymmetrySignals(zones, romFindings);
  const recommendedProtocol = pickProtocol(topZone, readiness.score, restrictionScore);

  return {
    restrictionScore,
    readiness,
    rankedZones,
    targetZones: rankedZones.filter((entry) => entry.hasPlacements).slice(0, 3),
    compensationFlags,
    asymmetrySignals,
    recommendedProtocol: {
      id: recommendedProtocol.id,
      name: recommendedProtocol.name,
      duration: recommendedProtocol.duration,
    },
    summary:
      topZone
        ? `${zoneLabel(topZone)} appears to be the highest-priority restriction, with session readiness rated ${readiness.label.toLowerCase()}.`
        : `Movement readiness is ${readiness.label.toLowerCase()}, but no priority region was identified.`,
  };
}
