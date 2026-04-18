export const PROTOCOLS = [
  { id: 'signature_short', name: 'Signature Short (Recovery & Relief)', duration: 9, best_for: ['hip', 'shoulder', 'lower_back'] },
  { id: 'signature_long', name: 'Signature Long (Recovery & Relief)', duration: 26, best_for: ['lower_back', 'glutes'] },
  { id: 'polarwave_36', name: 'PolarWave 36 — "Restore"', duration: 7, best_for: ['lower_back', 'glutes'] },
  { id: 'polarwave_18', name: 'PolarWave 18 — "Release"', duration: 4, best_for: ['shoulder', 'neck'] },
  { id: 'polarwave_9', name: 'PolarWave 9 — "Balance"', duration: 5, best_for: ['hip', 'knee'] },
  { id: 'polarwave_6', name: 'PolarWave 6 — "Activate"', duration: 5, best_for: ['arms', 'calves'] },
  { id: 'polarwave_3', name: 'PolarWave 3 — "Awaken"', duration: 4, best_for: ['feet', 'hands'] },
  { id: 'contrast_36', name: 'Contrast Pulse 36', duration: 7, best_for: ['lower_back', 'glutes'] },
  { id: 'contrast_18', name: 'Contrast Pulse 18', duration: 4, best_for: ['shoulder', 'knee'] },
  { id: 'contrast_9', name: 'Contrast Pulse 9', duration: 8, best_for: ['hip', 'lower_back'] },
  { id: 'mobility_surge', name: 'Mobility Surge', duration: 7, best_for: ['hip', 'knee', 'shoulder'] },
  { id: 'deep_session', name: 'Deep Session', duration: 18, best_for: ['lower_back', 'glutes'] },
  { id: 'precision_cryo', name: 'Precision Cryo', duration: 8, best_for: ['shoulder', 'knee'] },
  { id: 'energizing', name: 'Energizing', duration: 6, best_for: ['arms', 'calves'] },
  { id: 'hydraflush', name: 'HydraFlush', duration: 9, best_for: ['lower_back', 'glutes'] },
];

export const BODY_ZONES = [
  { id: 'neck', label: 'Neck', x: 195, y: 68, r: 14 },
  { id: 'left_shoulder', label: 'Left Shoulder', x: 152, y: 108, r: 14 },
  { id: 'right_shoulder', label: 'Right Shoulder', x: 238, y: 108, r: 14 },
  { id: 'upper_back', label: 'Upper Back', x: 195, y: 115, r: 14 },
  { id: 'left_arm', label: 'Left Arm', x: 135, y: 160, r: 12 },
  { id: 'right_arm', label: 'Right Arm', x: 255, y: 160, r: 12 },
  { id: 'chest', label: 'Chest', x: 195, y: 145, r: 14 },
  { id: 'lower_back', label: 'Lower Back', x: 195, y: 185, r: 14 },
  { id: 'left_hip', label: 'Left Hip', x: 162, y: 215, r: 13 },
  { id: 'right_hip', label: 'Right Hip', x: 228, y: 215, r: 13 },
  { id: 'left_knee', label: 'Left Knee', x: 168, y: 295, r: 13 },
  { id: 'right_knee', label: 'Right Knee', x: 222, y: 295, r: 13 },
  { id: 'left_calf', label: 'Left Calf', x: 168, y: 345, r: 12 },
  { id: 'right_calf', label: 'Right Calf', x: 222, y: 345, r: 12 },
  { id: 'left_foot', label: 'Left Foot', x: 168, y: 395, r: 11 },
  { id: 'right_foot', label: 'Right Foot', x: 222, y: 395, r: 11 },
];

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const MOCK_PATIENTS = [
  {
    id: 'maria-001',
    name: 'Maria Chen',
    age: 42,
    dob: '1983-06-15',
    condition: 'IT Band / Hip Restriction',
    practitioner_id: 'prac-001',
    avatar: 'MC',
    sessions: [
      { id: 's1', date: daysAgo(14), protocol: 'Signature Short (Recovery & Relief)', duration: 9, before_score: 4, after_score: 7, zones: ['right_hip'] },
      { id: 's2', date: daysAgo(10), protocol: 'Mobility Surge', duration: 7, before_score: 5, after_score: 8, zones: ['right_hip', 'lower_back'] },
      { id: 's3', date: daysAgo(5), protocol: 'Contrast Pulse 9', duration: 8, before_score: 6, after_score: 9, zones: ['right_hip'] },
    ],
    recovery_scores: [
      { date: daysAgo(6), score: 58, check_in: 'okay', streak: 1, xp: 20 },
      { date: daysAgo(5), score: 65, check_in: 'great', streak: 2, xp: 70 },
      { date: daysAgo(4), score: 68, check_in: 'great', streak: 3, xp: 120 },
      { date: daysAgo(3), score: 71, check_in: 'okay', streak: 4, xp: 140 },
      { date: daysAgo(2), score: 74, check_in: 'great', streak: 5, xp: 190 },
      { date: daysAgo(1), score: 76, check_in: 'great', streak: 6, xp: 240 },
      { date: daysAgo(0), score: 78, check_in: null, streak: 6, xp: 240 },
    ],
  },
  {
    id: 'marcus-002',
    name: 'Marcus Williams',
    age: 35,
    dob: '1990-03-22',
    condition: 'Shoulder Tension / Desk Worker',
    practitioner_id: 'prac-001',
    avatar: 'MW',
    sessions: [
      { id: 's4', date: daysAgo(20), protocol: 'PolarWave 18 — "Release"', duration: 4, before_score: 3, after_score: 6, zones: ['left_shoulder'] },
      { id: 's5', date: daysAgo(12), protocol: 'Contrast Pulse 18', duration: 4, before_score: 4, after_score: 6, zones: ['left_shoulder', 'neck'] },
    ],
    recovery_scores: [
      { date: daysAgo(6), score: 62, check_in: 'great', streak: 3, xp: 110 },
      { date: daysAgo(5), score: 60, check_in: 'okay', streak: 4, xp: 130 },
      { date: daysAgo(4), score: 55, check_in: 'rough', streak: 5, xp: 130 },
      { date: daysAgo(3), score: 52, check_in: 'rough', streak: 0, xp: 130 },
      { date: daysAgo(2), score: 50, check_in: 'rough', streak: 0, xp: 130 },
      { date: daysAgo(1), score: 48, check_in: 'okay', streak: 1, xp: 150 },
      { date: daysAgo(0), score: 51, check_in: null, streak: 1, xp: 150 },
    ],
  },
  {
    id: 'elena-003',
    name: 'Elena Rodriguez',
    age: 55,
    dob: '1970-11-08',
    condition: 'Post-Surgical Lower Back Recovery',
    practitioner_id: 'prac-001',
    avatar: 'ER',
    sessions: [
      { id: 's6', date: daysAgo(30), protocol: 'Deep Session', duration: 18, before_score: 2, after_score: 5, zones: ['lower_back'] },
      { id: 's7', date: daysAgo(22), protocol: 'Signature Long (Recovery & Relief)', duration: 26, before_score: 3, after_score: 6, zones: ['lower_back', 'left_hip'] },
      { id: 's8', date: daysAgo(15), protocol: 'HydraFlush', duration: 9, before_score: 5, after_score: 7, zones: ['lower_back'] },
      { id: 's9', date: daysAgo(7), protocol: 'Deep Session', duration: 18, before_score: 5, after_score: 8, zones: ['lower_back', 'right_hip'] },
    ],
    recovery_scores: [
      { date: daysAgo(6), score: 55, check_in: 'okay', streak: 2, xp: 90 },
      { date: daysAgo(5), score: 59, check_in: 'great', streak: 3, xp: 140 },
      { date: daysAgo(4), score: 63, check_in: 'great', streak: 4, xp: 190 },
      { date: daysAgo(3), score: 67, check_in: 'great', streak: 5, xp: 240 },
      { date: daysAgo(2), score: 70, check_in: 'okay', streak: 6, xp: 260 },
      { date: daysAgo(1), score: 72, check_in: 'great', streak: 7, xp: 310 },
      { date: daysAgo(0), score: 74, check_in: null, streak: 7, xp: 310 },
    ],
  },
];

export const MOCK_PRACTITIONER = {
  id: 'prac-001',
  name: 'Dr. Annie Sturm',
  practice: 'ASU Wellness Center',
  email: 'annie@hydrawav3demo.com',
};

export function getPatientStatus(patient) {
  const scores = patient.recovery_scores;
  if (scores.length < 2) return 'amber';
  const last2 = scores.slice(-3, -1);
  const latest = scores[scores.length - 1];
  const avg = last2.reduce((s, r) => s + r.score, 0) / last2.length;
  if (latest.score >= avg + 3) return 'green';
  if (latest.score <= avg - 2) return 'red';
  return 'amber';
}

export function calcRecoveryScore({ mobility, sessionRecency, streak, hrv }) {
  const mobilityScore = (mobility / 10) * 40;
  const recencyScore = Math.min(sessionRecency, 30);
  const streakScore = Math.min(streak * 2, 20);
  const hrvScore = hrv ? (hrv > 70 ? 10 : hrv > 50 ? 7 : 4) : 5;
  return Math.round(mobilityScore + recencyScore + streakScore + hrvScore);
}
