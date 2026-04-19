// ── ROM movement tests ───────────────────────────────────────────────────────
export const ROM_TESTS = [
  { id: 'forward_bend',       label: 'Forward Bend',       icon: '🧍', region: 'LOWER BACK/PELVIS',    body_parts: ['Lower Back', 'Mid Back', 'Hamstrings', 'Hips'] },
  { id: 'squat',              label: 'Squat',              icon: '🏋️', region: 'KNEES',                body_parts: ['Left Knee', 'Right Knee', 'Hips', 'Ankles'] },
  { id: 'sit_to_stand',       label: 'Sit to Stand',       icon: '🪑', region: 'HIPS/KNEES',           body_parts: ['Left Knee', 'Right Knee', 'Hips', 'Lower Back'] },
  { id: 'trunk_rotation',     label: 'Trunk Rotation',     icon: '🔄', region: 'MID-BACK/THORACIC',    body_parts: ['Mid Back', 'Lower Back', 'Shoulders'] },
  { id: 'ankle_dorsiflexion', label: 'Ankle Dorsiflexion', icon: '🦶', region: 'ANKLES/LOWER LEG',     body_parts: ['Left Ankle', 'Right Ankle', 'Left Calf', 'Right Calf'] },
  { id: 'shoulder_flexion',   label: 'Shoulder Flexion',   icon: '💪', region: 'SHOULDERS',            body_parts: ['Left Shoulder', 'Right Shoulder', 'Upper Back', 'Neck'] },
  { id: 'gait',               label: 'Gait',               icon: '🚶', region: 'WALKING PATTERN',      body_parts: ['Left Hip', 'Right Hip', 'Left Knee', 'Right Knee', 'Left Foot', 'Right Foot'] },
  { id: 'neck_flexion',       label: 'Neck Flexion',       icon: '🫀', region: 'NECK/CERVICAL SPINE',  body_parts: ['Neck', 'Upper Trap', 'Cervical Spine'] },
  { id: 'neck_rotation',      label: 'Neck Rotation',      icon: '↩️', region: 'NECK/CERVICAL SPINE',  body_parts: ['Neck', 'Upper Trap', 'SCM'] },
  { id: 'hip_flexion',        label: 'Hip Flexion',        icon: '🦵', region: 'HIPS/PELVIS',          body_parts: ['Left Hip', 'Right Hip', 'Hip Flexors', 'Lower Back'] },
  { id: 'manual_entry',       label: 'Manual Entry',       icon: '⚙️', region: 'CUSTOM TEST',          body_parts: [] },
];

export const SENSATION_TAGS = ['Tight', 'Stiff', 'Achy', 'Heavy/Fatigued', 'Sharp', 'Burning', 'Tingling', 'Numb'];

export const DAILY_ACTIVITIES = [
  'Office / Desk Work', 'Standing Work', 'Manual Work',
  'Sports / Training', 'Yoga / Mobility', 'Running / Cycling', 'Prolonged Driving',
];

export const SLEEP_POSTURES = ['On Back', 'On Stomach', 'Left Side', 'Right Side', 'Change Positions'];

export const AGGRAVATING_FACTORS = [
  'Sitting', 'Standing', 'Walking', 'Bending Forward', 'Lifting',
  'Reaching Overhead', 'Exercise', 'Rest', 'Morning', 'Evening',
  'Heat', 'Cold', 'Stress', 'Long Drives',
];

export const POSITION_TOLERANCE = ['Standing', 'Sitting', 'Both', 'Neither'];

// ── Session goals (match Hydrawav3 app categories) ────────────────────────────
export const SESSION_GOALS = [
  { id: 'polar_alternate',    label: 'Polar — Alternate',       protocols: ['polarwave_36', 'polarwave_18', 'polarwave_9', 'polarwave_6', 'polarwave_3'] },
  { id: 'contrast_balance',   label: 'Contrast — Balance',      protocols: ['contrast_36', 'contrast_18', 'contrast_9'] },
  { id: 'mobility_strengthen',label: 'Mobility — Strengthen',   protocols: ['mobility_surge'] },
  { id: 'recovery_restore',   label: 'Recovery — Restore',      protocols: ['signature_long', 'deep_session', 'hydraflush'] },
  { id: 'performance_prime',  label: 'Performance — Prime',     protocols: ['signature_short', 'energizing'] },
  { id: 'light_illuminate',   label: 'Light — Illuminate',      protocols: ['polarwave_3', 'polarwave_6'] },
  { id: 'relax_unwind',       label: 'Relax — Unwind',          protocols: ['deep_session', 'precision_cryo'] },
];

// ── Pad placement map: zone → [option1, option2] ──────────────────────────────
// sun = thermal pad (hot), moon = cryo pad (cold)
export const PAD_PLACEMENT_MAP = {
  neck: [
    { option: 1, name: 'Cervical Extensors', sun: 'Left Upper Trap', moon: 'Right Upper Trap',
      desc: 'Place the sun pad on the left upper trapezius and the moon pad on the right upper trapezius for bilateral cervical support.' },
    { option: 2, name: 'SCM / Suboccipital', sun: 'Left SCM', moon: 'Right Suboccipital',
      desc: 'Place the sun pad on the left sternocleidomastoid and the moon pad on the right suboccipital region.' },
  ],
  left_shoulder: [
    { option: 1, name: 'Rotator Cuff', sun: 'Left Anterior Deltoid', moon: 'Left Posterior Cuff',
      desc: 'Sun pad on the left anterior deltoid; moon pad on the left posterior rotator cuff for anterior-posterior balance.' },
    { option: 2, name: 'Pec / Upper Trap', sun: 'Left Pec Minor', moon: 'Left Upper Trapezius',
      desc: 'Sun pad on the left pectoralis minor; moon pad on the left upper trapezius.' },
  ],
  right_shoulder: [
    { option: 1, name: 'Rotator Cuff', sun: 'Right Anterior Deltoid', moon: 'Right Posterior Cuff',
      desc: 'Sun pad on the right anterior deltoid; moon pad on the right posterior rotator cuff.' },
    { option: 2, name: 'Pec / Upper Trap', sun: 'Right Pec Minor', moon: 'Right Upper Trapezius',
      desc: 'Sun pad on the right pectoralis minor; moon pad on the right upper trapezius.' },
  ],
  upper_back: [
    { option: 1, name: 'Rhomboids / Mid Trap', sun: 'Left Rhomboid', moon: 'Right Rhomboid',
      desc: 'Sun pad on the left rhomboid; moon pad on the right rhomboid to support thoracic symmetry.' },
    { option: 2, name: 'Thoracic Extensors', sun: 'Left T-Spine Paraspinals', moon: 'Right T-Spine Paraspinals',
      desc: 'Place pads bilaterally on the thoracic paraspinal muscles, flanking the spine.' },
  ],
  lower_back: [
    { option: 1, name: 'Lumbar Paraspinals', sun: 'Left Lumbar Paraspinals', moon: 'Right Lumbar Paraspinals',
      desc: 'Place pads bilaterally on the lumbar paraspinals — sun left, moon right — for bilateral lumbar support.' },
    { option: 2, name: 'QL / Psoas Complex', sun: 'Left Quadratus Lumborum', moon: 'Right Quadratus Lumborum',
      desc: 'Sun pad on the left QL region; moon pad on the right QL region for lateral lumbar balance.' },
  ],
  chest: [
    { option: 1, name: 'Pectoralis Major', sun: 'Left Pec', moon: 'Right Pec',
      desc: 'Sun pad on the left pectoralis; moon pad on the right pectoralis for bilateral chest work.' },
    { option: 2, name: 'Intercostals', sun: 'Left Intercostals', moon: 'Right Intercostals',
      desc: 'Sun pad on the left intercostal region; moon pad on the right for respiratory support.' },
  ],
  left_hip: [
    { option: 1, name: 'Glute / IT Band', sun: 'Left Glute Max', moon: 'Left IT Band',
      desc: 'Sun pad on the left gluteus maximus; moon pad on the left IT band for hip-lateral complex.' },
    { option: 2, name: 'Hip Flexor / Glute Med', sun: 'Left Hip Flexor', moon: 'Left Glute Medius',
      desc: 'Sun pad on the left hip flexor (TFL/psoas area); moon pad on the left glute medius.' },
  ],
  right_hip: [
    { option: 1, name: 'Glute / IT Band', sun: 'Right Glute Max', moon: 'Right IT Band',
      desc: 'Sun pad on the right gluteus maximus; moon pad on the right IT band.' },
    { option: 2, name: 'Hip Flexor / Glute Med', sun: 'Right Hip Flexor', moon: 'Right Glute Medius',
      desc: 'Sun pad on the right hip flexor; moon pad on the right glute medius.' },
  ],
  left_knee: [
    { option: 1, name: 'Quadriceps', sun: 'Left Quads', moon: 'Left Hamstring',
      desc: 'Sun pad on the left quadriceps; moon pad on the left hamstrings for anterior-posterior knee balance.' },
    { option: 2, name: 'IT Band / Gracilis', sun: 'Left Gracilis', moon: 'Left IT Band',
      desc: 'Sun pad on the left inner thigh (gracilis); moon pad on the left IT band.' },
  ],
  right_knee: [
    { option: 1, name: 'Quadriceps', sun: 'Right Quads', moon: 'Right Hamstring',
      desc: 'Sun pad on the right quadriceps; moon pad on the right hamstrings.' },
    { option: 2, name: 'IT Band / Gracilis', sun: 'Right Gracilis', moon: 'Right IT Band',
      desc: 'Sun pad on the right inner thigh (gracilis); moon pad on the right IT band.' },
  ],
  left_arm: [
    { option: 1, name: 'Biceps / Triceps', sun: 'Left Biceps', moon: 'Left Triceps',
      desc: 'Sun pad on the left biceps; moon pad on the left triceps for elbow flexor-extensor balance.' },
    { option: 2, name: 'Forearm Flexors / Extensors', sun: 'Left Forearm Flexors', moon: 'Left Forearm Extensors',
      desc: 'Sun pad on the left forearm flexors; moon pad on the left forearm extensors.' },
  ],
  right_arm: [
    { option: 1, name: 'Biceps / Triceps', sun: 'Right Biceps', moon: 'Right Triceps',
      desc: 'Sun pad on the right biceps; moon pad on the right triceps.' },
    { option: 2, name: 'Forearm Flexors / Extensors', sun: 'Right Forearm Flexors', moon: 'Right Forearm Extensors',
      desc: 'Sun pad on the right forearm flexors; moon pad on the right forearm extensors.' },
  ],
  left_calf: [
    { option: 1, name: 'Gastrocnemius / Soleus', sun: 'Left Gastrocnemius', moon: 'Left Soleus',
      desc: 'Sun pad on the left gastrocnemius; moon pad on the left soleus for calf complex support.' },
    { option: 2, name: 'Anterior Compartment', sun: 'Left Tibialis Anterior', moon: 'Left Peroneals',
      desc: 'Sun pad on the left tibialis anterior; moon pad on the left peroneals.' },
  ],
  right_calf: [
    { option: 1, name: 'Gastrocnemius / Soleus', sun: 'Right Gastrocnemius', moon: 'Right Soleus',
      desc: 'Sun pad on the right gastrocnemius; moon pad on the right soleus.' },
    { option: 2, name: 'Anterior Compartment', sun: 'Right Tibialis Anterior', moon: 'Right Peroneals',
      desc: 'Sun pad on the right tibialis anterior; moon pad on the right peroneals.' },
  ],
  left_foot: [
    { option: 1, name: 'Plantar / Achilles', sun: 'Left Plantar Fascia', moon: 'Left Achilles',
      desc: 'Sun pad on the left plantar fascia; moon pad on the left Achilles tendon.' },
    { option: 2, name: 'Dorsal Extensors', sun: 'Left Extensor Digitorum', moon: 'Left Peroneals',
      desc: 'Sun pad on the left extensor digitorum; moon pad on the left peroneal region.' },
  ],
  right_foot: [
    { option: 1, name: 'Plantar / Achilles', sun: 'Right Plantar Fascia', moon: 'Right Achilles',
      desc: 'Sun pad on the right plantar fascia; moon pad on the right Achilles tendon.' },
    { option: 2, name: 'Dorsal Extensors', sun: 'Right Extensor Digitorum', moon: 'Right Peroneals',
      desc: 'Sun pad on the right extensor digitorum; moon pad on the right peroneal region.' },
  ],
};

// ── At-home exercise recommendations per zone ─────────────────────────────────
export const HOME_EXERCISES_MAP = {
  neck: [
    { name: 'Chin Tucks', sets: 3, reps: '10 reps', desc: 'Gently retract chin straight back, hold 3s. Improves cervical alignment.' },
    { name: 'Upper Trap Stretch', sets: 2, reps: '30s each side', desc: 'Tilt ear to shoulder, gently press with hand. Releases upper trap tension.' },
    { name: 'Levator Scapulae Stretch', sets: 2, reps: '30s each side', desc: 'Turn head 45° and look down. Targets levator scapulae from neck to scapula.' },
    { name: 'Neck Rolls (half)', sets: 2, reps: '5 each direction', desc: 'Slow semicircle from ear to ear through chin. Avoid full extension.' },
  ],
  left_shoulder: [
    { name: 'Pendulum Swings', sets: 2, reps: '30s each direction', desc: 'Lean forward, let arm hang and swing in small circles. Decompresses the shoulder joint.' },
    { name: 'Doorway Stretch', sets: 3, reps: '30s', desc: 'Place forearm on doorframe at 90°, lean forward. Stretches pec minor and anterior capsule.' },
    { name: 'Wall Slides', sets: 3, reps: '10 reps', desc: 'Arms on wall in W, slide up to Y. Activates lower trap and serratus.' },
    { name: 'Band Pull-Apart', sets: 3, reps: '15 reps', desc: 'Hold band at chest width, pull apart to T. Strengthens posterior shoulder.' },
  ],
  right_shoulder: [
    { name: 'Pendulum Swings', sets: 2, reps: '30s each direction', desc: 'Let arm hang and swing in small circles. Decompresses the shoulder joint.' },
    { name: 'Doorway Stretch', sets: 3, reps: '30s', desc: 'Place forearm on doorframe at 90°, lean forward. Stretches anterior capsule.' },
    { name: 'Wall Slides', sets: 3, reps: '10 reps', desc: 'Arms on wall in W, slide up to Y. Activates lower trap and serratus.' },
    { name: 'Band Pull-Apart', sets: 3, reps: '15 reps', desc: 'Hold band at chest width, pull apart to T. Strengthens posterior shoulder.' },
  ],
  upper_back: [
    { name: 'Thoracic Extension on Foam Roller', sets: 2, reps: '60s', desc: 'Roll along thoracic spine with roller across the back. Restores thoracic extension ROM.' },
    { name: 'Cat-Cow', sets: 3, reps: '10 reps', desc: 'Alternate spinal flexion and extension on hands and knees. Mobilizes the whole spine.' },
    { name: 'Thread the Needle', sets: 2, reps: '8 each side', desc: 'From all-fours, thread one arm under body. Rotates the thoracic spine.' },
    { name: 'Prone Y Raise', sets: 3, reps: '12 reps', desc: 'Lie face down, raise arms in Y overhead. Activates lower and mid trapezius.' },
  ],
  lower_back: [
    { name: 'Cat-Cow', sets: 3, reps: '10 reps', desc: 'Alternate lumbar flexion and extension. Core mobility and neural gliding.' },
    { name: "Child's Pose", sets: 2, reps: '60s', desc: 'Kneel and reach arms forward with hips back. Decompresses the lumbar spine.' },
    { name: 'Dead Bug', sets: 3, reps: '8 each side', desc: 'Opposite arm-leg extension from supine. Core stability without spinal loading.' },
    { name: 'Hip Hinge Drill', sets: 3, reps: '10 reps', desc: 'Dowel on spine, hinge at hips. Teaches proper lumbar neutral under load.' },
  ],
  chest: [
    { name: 'Pec Stretch on Doorframe', sets: 3, reps: '30s', desc: 'Forearm on doorframe, turn away. Stretches pec major and anterior shoulder.' },
    { name: 'Open Book', sets: 2, reps: '10 each side', desc: 'Side-lying thoracic rotation with arm sweep. Opens chest and thoracic spine.' },
    { name: 'Deep Breathing Expansion', sets: 3, reps: '5 breaths', desc: 'Inhale 360° expansion into ribs. Restores intercostal mobility.' },
  ],
  left_hip: [
    { name: 'Hip Flexor Stretch', sets: 3, reps: '45s each side', desc: 'Kneeling lunge, posterior pelvic tilt. Lengthens left iliopsoas.' },
    { name: 'Pigeon Pose', sets: 2, reps: '60s each side', desc: 'Figure-4 floor stretch. Targets piriformis and deep external rotators.' },
    { name: 'Clamshells', sets: 3, reps: '15 each side', desc: 'Side-lying hip external rotation with band. Activates glute medius.' },
    { name: 'Glute Bridge', sets: 3, reps: '15 reps', desc: 'Supine, drive hips to ceiling. Activates glute max and reduces hip flexor dominance.' },
  ],
  right_hip: [
    { name: 'Hip Flexor Stretch', sets: 3, reps: '45s each side', desc: 'Kneeling lunge, posterior pelvic tilt. Lengthens right iliopsoas.' },
    { name: 'Pigeon Pose', sets: 2, reps: '60s each side', desc: 'Figure-4 floor stretch. Targets piriformis and deep external rotators.' },
    { name: 'Clamshells', sets: 3, reps: '15 each side', desc: 'Side-lying hip external rotation with band. Activates glute medius.' },
    { name: 'Glute Bridge', sets: 3, reps: '15 reps', desc: 'Supine, drive hips to ceiling. Activates glute max and reduces hip flexor dominance.' },
  ],
  left_knee: [
    { name: 'Terminal Knee Extension (TKE)', sets: 3, reps: '15 reps', desc: 'Band behind knee, fully extend against resistance. VMO activation and knee stability.' },
    { name: 'Step-Ups', sets: 3, reps: '12 each side', desc: 'Step onto a box with control. Builds quad strength in functional range.' },
    { name: 'Straight Leg Raise', sets: 3, reps: '15 reps', desc: 'Supine, raise straight leg to 45°. Quad activation without knee joint compression.' },
    { name: 'Wall Sit', sets: 3, reps: '30s', desc: 'Hold 90° quad isometric. Builds endurance without joint stress.' },
  ],
  right_knee: [
    { name: 'Terminal Knee Extension (TKE)', sets: 3, reps: '15 reps', desc: 'Band behind knee, fully extend against resistance. VMO activation and knee stability.' },
    { name: 'Step-Ups', sets: 3, reps: '12 each side', desc: 'Step onto a box with control. Builds quad strength in functional range.' },
    { name: 'Straight Leg Raise', sets: 3, reps: '15 reps', desc: 'Supine, raise straight leg to 45°. Quad activation without knee joint compression.' },
    { name: 'Wall Sit', sets: 3, reps: '30s', desc: 'Hold 90° quad isometric. Builds endurance without joint stress.' },
  ],
  left_arm: [
    { name: 'Wrist Flexor Stretch', sets: 3, reps: '30s', desc: 'Extend arm, pull fingers back. Stretches forearm flexors and carpal tunnel region.' },
    { name: 'Eccentric Wrist Curls', sets: 3, reps: '10 reps', desc: 'Slow lowering phase with light dumbbell. Builds forearm flexor strength.' },
    { name: 'Elbow Flexor Stretch', sets: 2, reps: '30s', desc: 'Extend arm and supinate forearm. Lengthens biceps and brachialis.' },
  ],
  right_arm: [
    { name: 'Wrist Flexor Stretch', sets: 3, reps: '30s', desc: 'Extend arm, pull fingers back. Stretches forearm flexors.' },
    { name: 'Eccentric Wrist Curls', sets: 3, reps: '10 reps', desc: 'Slow lowering with light weight. Builds forearm flexor strength.' },
    { name: 'Elbow Flexor Stretch', sets: 2, reps: '30s', desc: 'Extend arm and supinate. Lengthens biceps and brachialis.' },
  ],
  left_calf: [
    { name: 'Calf Raises (eccentric)', sets: 3, reps: '15 reps', desc: 'Rise on two feet, lower on one. Eccentric loading for Achilles and calf health.' },
    { name: 'Standing Calf Stretch', sets: 3, reps: '45s', desc: 'Heel off step, hold stretch. Lengthens gastrocnemius and soleus.' },
    { name: 'Ankle Alphabet', sets: 2, reps: '1 full alphabet', desc: 'Trace alphabet with toe. Ankle mobility and proprioception.' },
    { name: 'Single Leg Balance', sets: 3, reps: '30s', desc: 'Stand on one leg, eyes closed. Ankle stability and neuromuscular control.' },
  ],
  right_calf: [
    { name: 'Calf Raises (eccentric)', sets: 3, reps: '15 reps', desc: 'Rise on two feet, lower on one. Eccentric loading for calf health.' },
    { name: 'Standing Calf Stretch', sets: 3, reps: '45s', desc: 'Heel off step, hold. Lengthens gastrocnemius and soleus.' },
    { name: 'Ankle Alphabet', sets: 2, reps: '1 full alphabet', desc: 'Trace alphabet with toe. Ankle mobility and proprioception.' },
    { name: 'Single Leg Balance', sets: 3, reps: '30s', desc: 'Stand on one leg. Ankle stability and neuromuscular control.' },
  ],
  left_foot: [
    { name: 'Towel Scrunches', sets: 3, reps: '20 reps', desc: 'Scrunch towel with toes. Intrinsic foot muscle activation.' },
    { name: 'Plantar Fascia Stretch', sets: 3, reps: '30s', desc: 'Pull toes back toward shin. Lengthens plantar fascia.' },
    { name: 'Single Leg Balance on Foam', sets: 3, reps: '30s', desc: 'Balance on unstable surface. Foot intrinsic and ankle stability.' },
    { name: 'Heel Raise + Toe Spread', sets: 3, reps: '10 reps', desc: 'Rise on toes, spread digits. Arch activation and proprioception.' },
  ],
  right_foot: [
    { name: 'Towel Scrunches', sets: 3, reps: '20 reps', desc: 'Scrunch towel with toes. Intrinsic foot muscle activation.' },
    { name: 'Plantar Fascia Stretch', sets: 3, reps: '30s', desc: 'Pull toes back toward shin. Lengthens plantar fascia.' },
    { name: 'Single Leg Balance on Foam', sets: 3, reps: '30s', desc: 'Balance on unstable surface. Foot and ankle stability.' },
    { name: 'Heel Raise + Toe Spread', sets: 3, reps: '10 reps', desc: 'Rise on toes, spread digits. Arch activation.' },
  ],
};

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
    height: 66,
    weight: 152,
    unit_system: 'imperial',
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
    height: 72,
    weight: 198,
    unit_system: 'imperial',
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
    height: 64,
    weight: 164,
    unit_system: 'imperial',
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
  let hrvScore = 5;
  if (hrv) {
    if (hrv > 70) { hrvScore = 10; }
    else if (hrv > 50) { hrvScore = 7; }
    else { hrvScore = 4; }
  }
  return Math.round(mobilityScore + recencyScore + streakScore + hrvScore);
}
