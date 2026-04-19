import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Camera,
  Gauge,
  HeartPulse,
  Layers3,
  Microscope,
  ShieldCheck,
  Sparkles,
  Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './HackathonResources.css';

const essentials = [
  {
    label: 'Watch First',
    title: 'Live Demo — Mock Client Session Using the App',
    desc: 'See real session data from a previous client session to understand what the device and app does.',
    url: 'https://vimeo.com/1184430448?share=copy&fl=sv&fe=ci',
    urlLabel: 'vimeo.com',
  },
  {
    label: 'Deck',
    title: 'Hackathon Presentation Deck',
    desc: 'The slide deck presented at the hackathon kickoff.',
    url: 'https://docs.google.com/presentation/d/1jyN164bKIfGiR5Ym9HF6ZFFxXleKF8wB/edit?usp=sharing&ouid=114898918706115769478&rtpof=true&sd=true',
    urlLabel: 'Google Slides',
  },
  {
    label: 'Protocols',
    title: 'Hydrawav3 Protocol Library',
    desc: 'All the protocols the device can run via the app. Browse what is possible.',
    url: 'https://www.hydrawav3.com/protocols',
    urlLabel: 'hydrawav3.com/protocols',
  },
  {
    label: 'Tutorial',
    title: 'App Walkthrough Videos',
    desc: 'Step-by-step tutorials showing how to navigate the Hydrawav3 app.',
    url: 'https://www.hydrawav3.com/start-session-videos',
    urlLabel: 'hydrawav3.com/start-session-videos',
  },
  {
    label: 'All Files',
    title: 'Google Drive — Complete Resource Folder',
    desc: 'Everything in one place: docs, assets, and reference materials.',
    url: 'https://drive.google.com/drive/folders/1xnGe4xfHqqy51fHDRbKhtY7L0lhR-rH5?usp=sharing',
    urlLabel: 'Google Drive',
  },
];

const socialLinks = [
  ['Instagram', 'https://www.instagram.com/hydrawav3'],
  ['LinkedIn', 'https://www.linkedin.com/company/105906629/admin/dashboard/'],
  ['YouTube', 'https://www.youtube.com/@Hydrawav3'],
  ['Facebook', 'https://www.facebook.com/profile.php?id=61585906700680'],
];

const movementDatasets = [
  {
    title: 'UI-PRMD — Univ. of Idaho Physical Rehab Movement Data',
    items: [
      '10 PT exercises including squat, lunge, sit-to-stand, and shoulder abductions',
      '10 subjects × 10 reps = 100 movement sequences',
      'Joint positions and angles with correct and incorrect examples',
      'License: Open Data Commons Public Domain',
    ],
    links: [['Download', 'http://webpages.uidaho.edu/ui-prmd/']],
  },
  {
    title: 'OpenCap — Stanford',
    items: [
      '3D human movement from multi-camera smartphone videos',
      'Includes squats, sit-to-stand, drop jumps, walking, and field study data',
      'RGB video, OpenSim models, kinematics, and inverse dynamics',
      'Can also be used for live capture with your own phones',
    ],
    links: [
      ['Live Capture', 'https://app.opencap.ai'],
      ['Data', 'https://simtk.org/projects/opencap'],
    ],
  },
  {
    title: 'REHAB24-6 — Multi-Modal Rehabilitation Exercises',
    items: [
      'RGB videos and skeleton sequences with correct and incorrect form labels',
      'Diverse exercises, views, body heights, and lighting conditions',
    ],
    links: [['Download (direct)', 'https://zenodo.org/records/13305826']],
  },
  {
    title: 'MobiPhysio — Physiotherapy Exercise Videos',
    items: [
      '3,686 videos of 9 active ROM physiotherapy exercises',
      '58 participants in real-world conditions with expert assessment scores',
    ],
    links: [['Access', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12992533/']],
  },
  {
    title: 'UCO Physical Rehabilitation Dataset',
    items: [
      '2,160 video sequences at about 30 seconds each',
      '5 RGB cameras at 1280×720',
      '4 upper-body and 4 lower-body exercises on both sides',
    ],
    links: [['Access', 'https://github.com/AVAuco/ucophyrehab']],
  },
  {
    title: 'AddBiomechanics — Largest Biomechanics Dataset',
    items: [
      '70+ hours of motion, 273 subjects, and 24M+ frames',
      'Gaits, squats, jumps, running, and sports',
      'License: CC BY 4.0',
    ],
    links: [['Download', 'https://addbiomechanics.org/download_data.html']],
  },
  {
    title: 'Health & Gait Dataset',
    items: [
      '398 participants and 1,564 walking videos',
      'Silhouettes, segmentation, optical flow, and 2D pose',
    ],
    links: [['Access', 'https://github.com/AVAuco/healthgait']],
  },
  {
    title: 'GAVD — Gait Abnormality in Video Dataset',
    items: [
      'Large gait video collection with clinical annotations',
      'Videos sourced from public YouTube material',
    ],
    links: [['Access', 'https://github.com/Rahmyyy/GAVD']],
  },
  {
    title: 'Kaggle — Physiotherapy Exercise Classification',
    items: ['Pre-processed physiotherapy exercise data ready for ML workflows'],
    links: [['Download', 'https://www.kaggle.com/datasets/rabieelkharoua/classification-of-physiotherapy-exercises-dataset']],
  },
];

const vitalDatasets = [
  {
    title: 'UBFC-rPPG',
    items: [
      'Facial videos at 30fps with ground-truth PPG signals',
      '42 participants, webcam capture, and pulse oximeter ground truth',
    ],
    links: [['Download', 'https://sites.google.com/view/ybenezeth/ubfcrppg']],
  },
  {
    title: 'PURE',
    items: [
      'Controlled facial videos with ground-truth heart rate',
      'Includes sitting still, talking, head rotation, and walking conditions',
    ],
    links: [['TU Ilmenau (registration required)', 'https://pure.tu-ilmenau.de/']],
  },
  {
    title: 'COHFACE',
    items: [
      'Face videos with PPG and respiratory ground truth',
      'Natural and forced lighting conditions',
    ],
    links: [],
  },
  {
    title: '"Gaze into the Heart" (2025)',
    items: ['600 subjects, multi-camera, 13 biomarkers, at rest and post-exercise'],
    links: [['Paper', 'https://arxiv.org/html/2508.17924v1']],
  },
];

const extractionRows = [
  ['Joint Angles / ROM', 'Pose landmarks + trigonometry', 'High', 'green', 'Full body visible'],
  ['Movement Quality', 'Compare angles against reference models', 'High', 'green', 'Reference dataset like UI-PRMD'],
  ['Asymmetry', 'Left vs. right side comparison', 'High', 'green', 'Both sides visible'],
  ['Gait Analysis', 'Step length, cadence, symmetry', 'High', 'green', 'Walking video, side angle'],
  ['Heart Rate', 'rPPG via skin color changes in the face', '±5-10 bpm', 'yellow', 'Clear face, stable lighting, 15-30s'],
  ['Breath Rate', 'Chest and shoulder rise-fall tracking', '±1-2 /min', 'yellow', 'Torso visible'],
  ['HRV', 'Beat-to-beat intervals from heart rate', 'Moderate', 'yellow', '60+ sec clean HR data'],
  ['Stress Level', 'Derived from HR and HRV trends', 'Estimated', 'gray', 'Longer recording'],
  ['Fatigue', 'Movement speed decay + HR recovery', 'Estimated', 'gray', 'Movement and face data'],
  ['SpO2', 'Not possible from RGB camera', 'N/A', 'red', 'Needs infrared'],
  ['Skin Temperature', 'Not possible from RGB camera', 'N/A', 'red', 'Needs thermal camera'],
];

const tools = [
  ['Google MediaPipe', '33-landmark pose detection, real-time, mobile-ready', 'pip install mediapipe', null],
  ['OpenPose (CMU)', '135-keypoint detection for body, face, hands, and feet', 'GitHub', 'https://github.com/CMU-Perceptual-Computing-Lab/openpose'],
  ['OpenCap', 'Smartphone video to 3D kinematics', 'app.opencap.ai', 'https://app.opencap.ai'],
  ['rPPG-Toolbox', 'Complete HR-from-video pipeline with multiple DL models', 'GitHub', 'https://github.com/ubicomplab/rPPG-Toolbox'],
  ['pyVHR', 'Video-based heart rate estimation', 'pip install pyVHR', null],
  ['hrv-analysis', 'HRV metrics from RR intervals', 'pip install hrv-analysis', null],
  ['respmon', 'Webcam respiratory monitoring', 'GitHub', 'https://github.com/kevroy314/respmon'],
  ['OpenCV', 'Video processing, frame extraction, and face detection', 'pip install opencv-python', null],
  ['SciPy', 'Signal filtering and frequency analysis', 'pip install scipy', null],
];

const quickReference = [
  ['UI-PRMD', 'Movement (PT exercises)', 'Joint positions + angles', 'Download', 'http://webpages.uidaho.edu/ui-prmd/'],
  ['OpenCap', 'Movement (3D kinematics)', 'RGB video + OpenSim', 'Download', 'https://simtk.org/projects/opencap'],
  ['REHAB24-6', 'Movement (rehab)', 'RGB video + skeleton', 'Download', 'https://zenodo.org/records/13305826'],
  ['MobiPhysio', 'Movement (ROM)', 'RGB smartphone video', 'Access', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12992533/'],
  ['UCO Rehab', 'Movement (multi-cam)', 'RGB video (5 cameras)', 'Access', 'https://github.com/AVAuco/ucophyrehab'],
  ['AddBiomechanics', 'Movement (70+ hrs)', 'Mocap + models', 'Download', 'https://addbiomechanics.org/download_data.html'],
  ['Health & Gait', 'Gait analysis', 'RGB video + pose', 'Access', 'https://github.com/AVAuco/healthgait'],
  ['GAVD', 'Abnormal gait', 'YouTube + annotations', 'Access', 'https://github.com/Rahmyyy/GAVD'],
  ['Kaggle Physio', 'Exercise classification', 'Pre-processed', 'Download', 'https://www.kaggle.com/datasets/rabieelkharoua/classification-of-physiotherapy-exercises-dataset'],
  ['UBFC-rPPG', 'Heart rate', 'RGB face + PPG', 'Download', 'https://sites.google.com/view/ybenezeth/ubfcrppg'],
  ['COHFACE', 'HR + breathing', 'RGB face + PPG + resp', 'Registration required', null],
  ['Gaze into Heart', '13 biomarkers', 'RGB multi-cam', 'Paper', 'https://arxiv.org/html/2508.17924v1'],
];

const architectureDiagram = `Video Input (camera, phone, or dataset file)
       │
       ├─── BODY (full frame) ─────────────────── FACE (crop) ───┐
       │                                                          │
       ▼                                                          ▼
  Pose Extraction                                          rPPG Extraction
  33 landmarks/frame                                       Skin color analysis
       │                                                          │
       ▼                                                          ▼
  Joint Angles + ROM              ┌──────────────┐          Heart Rate
  Movement Quality                │ Chest Motion  │          HRV Metrics
  Asymmetry Detection             │ = Breath Rate │               │
       │                          └──────────────┘               │
       │                                 │                        │
       └─────────────┬──────────────────┴────────────────────────┘
                     │
                     ▼
             Structured Data Bundle
             {rom, angles, symmetry, hr, rr, hrv}
                     │
                     ▼
             LLM Analysis (Claude API or OpenAI)
                     │
                     ▼
          ┌──────────────────────────────┐
          │   RECOVERY ASSESSMENT REPORT │
          │                              │
          │   Right Knee ROM: 118°       │
          │   Left Knee ROM: 125°        │
          │   Asymmetry Flag: YES (5.9%) │
          │   Heart Rate: 72 bpm         │
          │   Breath Rate: 16/min        │
          │   HRV (RMSSD): 42ms          │
          │                              │
          │   → Right knee limited       │
          │     flexion vs. left side    │
          │   → HRV suggests moderate    │
          │     recovery state           │
          └──────────────────────────────┘`;

const limitations = [
  ['Lighting matters', 'rPPG works best in stable, good lighting. Outdoor and exercise conditions are harder.'],
  ['Motion artifacts', 'Active exercise makes heart rate extraction noisier. Stabilization helps.'],
  ['Accuracy ceiling', 'Video-based HR is about ±5-10 bpm versus clinical ±1-2 bpm. This is screening, not diagnosis.'],
  ['Privacy', 'Face video requires consent. Get it before filming.'],
  ['Multi-camera > single camera', 'OpenCap with 2+ phones significantly outperforms a single angle.'],
];

const buildFlow = [
  {
    step: '01',
    title: 'Area of Focus',
    body: 'Start by identifying where discomfort lives in the body map. This is the intake anchor and the first screen practitioners use to localize concern.',
  },
  {
    step: '02',
    title: 'Range of Motion',
    body: 'Capture how the patient moves through the painful zone, compare left versus right, and translate mobility into measurable motion limits.',
  },
  {
    step: '03',
    title: 'Daily Activities',
    body: 'Rank what makes symptoms worse during work, training, posture, and day-to-day life so the system understands functional impact, not just raw pain.',
  },
  {
    step: '04',
    title: 'Final Remarks',
    body: 'Finish with practitioner notes, synthesis, and a clear recommendation that can feed a protocol choice, report, or next-step recovery summary.',
  },
];

const statCards = [
  { label: 'Movement datasets', value: '9', icon: Layers3 },
  { label: 'Vitals datasets', value: '4', icon: HeartPulse },
  { label: 'Signals to extract', value: '11', icon: Gauge },
  { label: 'Starter tools', value: '9', icon: Microscope },
];

const challengeCards = [
  {
    title: 'Camera-first intake',
    body: 'Use body landmarks, voice, and visible biometrics to create a calmer intake flow before the session begins.',
    icon: Camera,
  },
  {
    title: 'Recovery intelligence',
    body: 'Combine ROM, asymmetry, and HRV into a single clinician-facing readiness or recovery layer.',
    icon: BrainCircuit,
  },
  {
    title: 'Protocol matching',
    body: 'Map detected movement patterns and physiological state to the right Hydrawav3 protocol sequence.',
    icon: Waves,
  },
];

const sessionFlowCards = [
  {
    step: 'Step 1',
    title: 'Area of Focus',
    detail: 'Body map selection, discomfort zone targeting, and side-specific context.',
  },
  {
    step: 'Step 2',
    title: 'Range of Motion',
    detail: 'Mobility measurement, asymmetry checks, and movement behavior capture.',
  },
  {
    step: 'Step 3',
    title: 'Daily Activities',
    detail: 'Activity ranking, aggravating factors, sleep posture, and functional patterns.',
  },
  {
    step: 'Step 4',
    title: 'Final Remarks',
    detail: 'Clinician notes, summary output, and report generation before device setup.',
  },
];

const overviewCards = [
  {
    value: '01',
    title: 'Product-first flow',
    body: 'Anchored to the same 4-step practitioner journey shown in the Hydrawav3 assessment screens.',
  },
  {
    value: '13',
    title: 'Datasets and references',
    body: 'Movement and contactless vitals sources for camera-based recovery intelligence and rehab scoring.',
  },
  {
    value: '11',
    title: 'Extractable signals',
    body: 'ROM, gait, asymmetry, HR, breathing, HRV, and the practical limits of RGB-based inference.',
  },
  {
    value: 'AI',
    title: 'Prototype direction',
    body: 'Turn raw body and face signals into intake support, protocol matching, and report generation.',
  },
];

function ExternalLink({ href, children, className }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function HackathonResources() {
  return (
    <div className="hackathon-page">
      <div className="hackathon-orb hackathon-orb-left" />
      <div className="hackathon-orb hackathon-orb-right" />

      <Link to="/login" className="hackathon-top-link">
        <ArrowLeft size={16} />
        Back to app
      </Link>

      <header className="hackathon-hero">
        <div className="hackathon-hero-grid">
          <div className="hackathon-hero-copy">
            <div className="hackathon-kicker">
              <Sparkles size={14} />
              Hydrawav3 hackathon command center
            </div>
            <h1>
              Build a <span>future-facing recovery experience</span> from camera, movement, and
              wellness data.
            </h1>
            <p className="hackathon-tagline">
              Everything you need is here: demo links, app credentials, movement datasets,
              contactless vitals references, extraction targets, tools, architecture, and the
              practical constraints that should shape the product.
            </p>

            <div className="hackathon-hero-actions">
              <a href="#start-here" className="hackathon-primary-button">
                Open resources
                <ArrowRight size={16} />
              </a>
              <a href="#architecture" className="hackathon-secondary-button">
                View pipeline
              </a>
            </div>

            <div className="hackathon-stat-row">
              {statCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="hackathon-stat-card">
                    <div className="hackathon-stat-icon">
                      <Icon size={18} />
                    </div>
                    <div className="hackathon-stat-value">{item.value}</div>
                    <div className="hackathon-stat-label">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hackathon-hero-panel">
            <div className="hackathon-panel-shell">
              <div className="hackathon-panel-header">
                <div>
                  <div className="hackathon-label">Build Flow</div>
                  <h2 className="hackathon-panel-title">How teams should approach the hackathon</h2>
                </div>
                <span className="hackathon-panel-badge">GlobeHack 2026</span>
              </div>

              <div className="hackathon-flow-list">
                {buildFlow.map((item) => (
                  <div key={item.step} className="hackathon-flow-item">
                    <div className="hackathon-flow-step">{item.step}</div>
                    <div>
                      <div className="hackathon-flow-title">{item.title}</div>
                      <p>{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hackathon-signal-board">
                <div className="hackathon-signal-heading">
                  <ShieldCheck size={16} />
                  Build around measurable outputs
                </div>
                <div className="hackathon-signal-grid">
                  <span>ROM</span>
                  <span>Asymmetry</span>
                  <span>Gait</span>
                  <span>Heart rate</span>
                  <span>Breath rate</span>
                  <span>HRV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="hackathon-section-nav">
        {[
          ['#start-here', 'Start Here'],
          ['#app-access', 'App Access'],
          ['#datasets', 'Movement Data'],
          ['#vitals', 'Vitals Data'],
          ['#extraction', 'Extractable Signals'],
          ['#tools', 'Tools'],
          ['#architecture', 'Architecture'],
          ['#limitations', 'Limitations'],
          ['#quick-ref', 'Quick Reference'],
        ].map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </nav>

      <main className="hackathon-container">
        <section className="hackathon-overview-band">
          {overviewCards.map((item) => (
            <div key={item.title} className="hackathon-overview-card">
              <div className="hackathon-overview-value">{item.value}</div>
              <div className="hackathon-overview-title">{item.title}</div>
              <p>{item.body}</p>
            </div>
          ))}
        </section>

        <section className="hackathon-step-rail-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Hydrawav3 Session Flow</div>
              <h2>The 4 practitioner steps from the original product flow</h2>
            </div>
            <p>
              This is the sequence shown in your screenshots. A strong hackathon prototype should
              support or improve this exact progression rather than replacing it with something
              unrelated.
            </p>
          </div>
          <div className="hackathon-step-rail">
            <div className="hackathon-step-line" />
            {sessionFlowCards.map((item, index) => (
              <div key={item.step} className="hackathon-step-card">
                <div className="hackathon-step-marker">
                  <span className="hackathon-step-dot">{index + 1}</span>
                  {index < sessionFlowCards.length - 1 ? <span className="hackathon-step-connector" /> : null}
                </div>
                <div className="hackathon-step-topline">
                  <span className="hackathon-step-pill">{item.step}</span>
                  <span className="hackathon-step-index">Active flow</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="hackathon-strip">
          {challengeCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="hackathon-strip-card">
                <div className="hackathon-strip-icon">
                  <Icon size={18} />
                </div>
                <div className="hackathon-strip-title">{item.title}</div>
                <p>{item.body}</p>
              </div>
            );
          })}
        </section>

        <section id="start-here" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Start Here</div>
              <h2>Core resources for the team</h2>
            </div>
            <p>
              These are the fastest entry points into the product, the workflow, and the full
              resource set.
            </p>
          </div>
          <div className="hackathon-essentials">
            {essentials.map((item) => (
              <ExternalLink key={item.title} href={item.url} className="hackathon-big-link">
                <div className="hackathon-link-topline">
                  <span className="hackathon-label">{item.label}</span>
                  <span className="hackathon-link-chip">Open</span>
                </div>
                <div className="hackathon-big-link-title">{item.title}</div>
                <div className="hackathon-desc">{item.desc}</div>
                <div className="hackathon-url">{item.urlLabel} →</div>
              </ExternalLink>
            ))}
          </div>
        </section>

        <section id="app-access" className="hackathon-section">
          <div className="hackathon-split-grid">
            <div className="hackathon-cred-box">
              <div className="hackathon-label">Login Credentials</div>
              <h2 className="hackathon-panel-title">Hydrawav3 app access</h2>
              <div className="hackathon-cred-row">
                <div>
                  <strong>URL:</strong>{' '}
                  <ExternalLink href="https://www.hydrawav3.studio" className="hackathon-card-link">
                    www.Hydrawav3.studio
                  </ExternalLink>{' '}
                  (use Chrome or Edge)
                </div>
              </div>
              <div className="hackathon-cred-row">
                <div>
                  <strong>Username:</strong> annierae
                </div>
                <div>
                  <strong>Password:</strong> anniesturm
                </div>
              </div>
              <div className="hackathon-cred-note">
                After logging in, select your organization. If the loading icon hangs, refresh and
                select the organization again.
              </div>
            </div>

            <div className="hackathon-follow-box">
              <div className="hackathon-label">Social Proof</div>
              <h2 className="hackathon-panel-title">Testimonials and real-world channels</h2>
              <p className="hackathon-desc">
                Use these when you need public-facing examples, traction, or visual proof points
                for your deck and prototype narrative.
              </p>
              <div className="hackathon-social-row">
                {socialLinks.map(([label, href]) => (
                  <ExternalLink key={label} href={href} className="hackathon-social-link">
                    {label}
                  </ExternalLink>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="datasets" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Movement & Range Of Motion</div>
              <h2>Datasets for pose, form, gait, and rehab analysis</h2>
            </div>
            <p>
              These sources are the main training and benchmarking pool for movement quality,
              corrective exercise, and kinematic reasoning.
            </p>
          </div>
          <div className="hackathon-callout-row">
            <ExternalLink
              href="https://zenodo.org/records/13305826"
              className="hackathon-callout-card"
            >
              <div className="hackathon-label">Recommended Source</div>
              <h3>REHAB24-6 on Zenodo</h3>
              <p>
                Strong fit for correct versus incorrect rehab form detection, which maps well to
                Step 2 range-of-motion analysis and guided intake feedback.
              </p>
              <span className="hackathon-card-link">Open dataset →</span>
            </ExternalLink>
            <ExternalLink
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12992533/"
              className="hackathon-callout-card"
            >
              <div className="hackathon-label">Recommended Source</div>
              <h3>MobiPhysio study</h3>
              <p>
                Useful for active ROM exercise footage in real-world settings if you want a more
                practical movement baseline for rehab-oriented scoring.
              </p>
              <span className="hackathon-card-link">Open paper →</span>
            </ExternalLink>
          </div>
          <div className="hackathon-dataset-grid">
            {movementDatasets.map((dataset, index) => (
              <div key={dataset.title} className="hackathon-card">
                <div className="hackathon-card-head">
                  <span className="hackathon-card-num">{index + 1}</span>
                  <h3 className="hackathon-card-heading">{dataset.title}</h3>
                </div>
                <ul>
                  {dataset.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="hackathon-card-links">
                  {dataset.links.map(([label, href]) => (
                    <ExternalLink key={label} href={href} className="hackathon-card-link">
                      {label} →
                    </ExternalLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="vitals" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Contactless Vitals</div>
              <h2>Datasets for heart rate, breathing, and HRV from video</h2>
            </div>
            <p>
              This is the camera biometrics lane. It is useful for recovery state, readiness, and
              low-friction intake signals.
            </p>
          </div>
          <div className="hackathon-vitals-intro">
            For extracting heart rate, breath rate, and HRV from camera video. Uses <strong>remote
            photoplethysmography (rPPG)</strong> so the camera detects micro-changes in skin color
            caused by blood flow.
          </div>
          <div className="hackathon-dataset-grid hackathon-vitals-grid">
            {vitalDatasets.map((dataset, index) => (
              <div key={dataset.title} className="hackathon-card">
                <div className="hackathon-card-head">
                  <span className="hackathon-card-num">{index + 1}</span>
                  <h3 className="hackathon-card-heading">{dataset.title}</h3>
                </div>
                <ul>
                  {dataset.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="hackathon-card-links">
                  {dataset.links.length
                    ? dataset.links.map(([label, href]) => (
                        <ExternalLink key={label} href={href} className="hackathon-card-link">
                          {label} →
                        </ExternalLink>
                      ))
                    : <span className="hackathon-muted-inline">Reference only</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="extraction" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Output Layer</div>
              <h2>What you can realistically extract from video</h2>
            </div>
            <p>
              This table should drive product scope. Some signals are strong and practical now,
              while others remain estimated or not feasible with standard RGB capture.
            </p>
          </div>
          <div className="hackathon-table-wrap">
            <table className="hackathon-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>How</th>
                  <th>Accuracy</th>
                  <th>What You Need</th>
                </tr>
              </thead>
              <tbody>
                {extractionRows.map(([metric, how, accuracy, badgeColor, need]) => (
                  <tr key={metric}>
                    <td>
                      <strong>{metric}</strong>
                    </td>
                    <td>{how}</td>
                    <td>
                      <span className={`hackathon-badge hackathon-badge-${badgeColor}`}>{accuracy}</span>
                    </td>
                    <td>{need}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="tools" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Implementation Stack</div>
              <h2>Tools that can get a prototype moving quickly</h2>
            </div>
            <p>
              These are the most direct libraries and platforms for pose extraction, signal
              processing, and report generation.
            </p>
          </div>
          <div className="hackathon-table-wrap">
            <table className="hackathon-table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>What It Does</th>
                  <th>Get It</th>
                </tr>
              </thead>
              <tbody>
                {tools.map(([name, desc, getIt, href]) => (
                  <tr key={name}>
                    <td>
                      <strong>{name}</strong>
                    </td>
                    <td>{desc}</td>
                    <td>
                      {href ? (
                        <ExternalLink href={href} className="hackathon-card-link">
                          {getIt}
                        </ExternalLink>
                      ) : (
                        <code>{getIt}</code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="architecture" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Reference Pipeline</div>
              <h2>Suggested architecture for a camera-to-insight product</h2>
            </div>
            <p>
              This is the core system story: capture, split body and face analysis, derive metrics,
              and convert them into clinician-facing guidance.
            </p>
          </div>
          <div className="hackathon-arch-box">
            <pre>{architectureDiagram}</pre>
          </div>
        </section>

        <section id="limitations" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Constraints</div>
              <h2>Limitations teams should design around</h2>
            </div>
            <p>
              Strong concepts acknowledge what is easy, what is noisy, and what should remain
              clearly labeled as estimation instead of diagnosis.
            </p>
          </div>
          <div className="hackathon-limits">
            {limitations.map(([title, body]) => (
              <div key={title} className="hackathon-limit-item">
                <strong>{title}</strong> — {body}
              </div>
            ))}
          </div>
        </section>

        <section id="quick-ref" className="hackathon-section">
          <div className="hackathon-section-heading">
            <div>
              <div className="hackathon-label">Quick Reference</div>
              <h2>All datasets in one lookup table</h2>
            </div>
            <p>
              Keep this section open while deciding whether your build is motion-heavy,
              biometrics-heavy, or a hybrid.
            </p>
          </div>
          <div className="hackathon-table-wrap">
            <table className="hackathon-table">
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {quickReference.map(([name, type, format, linkLabel, href]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{type}</td>
                    <td>{format}</td>
                    <td>
                      {href ? (
                        <ExternalLink href={href} className="hackathon-card-link">
                          {linkLabel}
                        </ExternalLink>
                      ) : (
                        linkLabel
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="hackathon-footer">
        Hydrawav3 Hackathon — April 2026 | <a href="mailto:shiva@hydrawav3.com">shiva@hydrawav3.com</a> |{' '}
        <ExternalLink href="https://www.hydrawav3.com">hydrawav3.com</ExternalLink>
      </footer>
    </div>
  );
}
