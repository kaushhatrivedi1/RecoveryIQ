import { ArrowLeft } from 'lucide-react';
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
      <Link to="/login" className="hackathon-top-link">
        <ArrowLeft size={16} />
        Back to app
      </Link>

      <div className="hackathon-hero">
        <h1>
          <span>Hydrawav3</span> Hackathon
        </h1>
        <p className="hackathon-tagline">
          Use camera input to capture human movement, extract wellness data, and build something
          that helps people recover better.
        </p>
      </div>

      <div className="hackathon-section-nav">
        {[
          ['#start-here', 'Start Here'],
          ['#app-access', 'App Access'],
          ['#datasets', 'Datasets'],
          ['#vitals', 'Vitals Datasets'],
          ['#extraction', 'What You Can Extract'],
          ['#tools', 'Tools'],
          ['#architecture', 'Architecture'],
          ['#limitations', 'Limitations'],
          ['#quick-ref', 'Quick Reference'],
        ].map(([href, label]) => (
          <a key={href} href={href}>
            {label}
          </a>
        ))}
      </div>

      <div className="hackathon-container">
        <section id="start-here" className="hackathon-section">
          <h2>Start Here</h2>
          <div className="hackathon-essentials">
            {essentials.map((item) => (
              <ExternalLink key={item.title} href={item.url} className="hackathon-big-link">
                <div className="hackathon-label">{item.label}</div>
                <div className="hackathon-big-link-title">{item.title}</div>
                <div className="hackathon-desc">{item.desc}</div>
                <div className="hackathon-url">{item.urlLabel} →</div>
              </ExternalLink>
            ))}
          </div>
        </section>

        <section id="app-access" className="hackathon-section">
          <h2>Hydrawav3 App Access</h2>
          <div className="hackathon-cred-box">
            <div className="hackathon-label">Login Credentials</div>
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
              After logging in, select your organization. The loading icon may not stop. Refresh
              your browser and select the organization again.
            </div>
          </div>
        </section>

        <section className="hackathon-section">
          <h2>Follow Hydrawav3 — Testimonials &amp; Real Results</h2>
          <div className="hackathon-social-row">
            {socialLinks.map(([label, href]) => (
              <ExternalLink key={label} href={href} className="hackathon-social-link">
                {label}
              </ExternalLink>
            ))}
          </div>
        </section>

        <section id="datasets" className="hackathon-section">
          <h2>Movement &amp; Range of Motion Datasets</h2>
          <div className="hackathon-dataset-grid">
            {movementDatasets.map((dataset, index) => (
              <div key={dataset.title} className="hackathon-card">
                <span className="hackathon-card-num">{index + 1}</span>
                <h3 className="hackathon-card-heading">{dataset.title}</h3>
                <ul>
                  {dataset.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div>
                  {dataset.links.length > 0
                    ? dataset.links.map(([label, href]) => (
                        <ExternalLink key={label} href={href} className="hackathon-card-link">
                          {label} →
                        </ExternalLink>
                      ))
                    : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="vitals" className="hackathon-section">
          <h2>Contactless Vitals Datasets</h2>
          <div className="hackathon-vitals-intro">
            For extracting heart rate, breath rate, and HRV from camera video. Uses <strong>remote
            photoplethysmography (rPPG)</strong> so the camera detects micro-changes in skin color
            caused by blood flow.
          </div>
          <div className="hackathon-dataset-grid" style={{ marginTop: 16 }}>
            {vitalDatasets.map((dataset, index) => (
              <div key={dataset.title} className="hackathon-card">
                <span className="hackathon-card-num">{index + 1}</span>
                <h3 className="hackathon-card-heading">{dataset.title}</h3>
                <ul>
                  {dataset.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {dataset.links.map(([label, href]) => (
                  <ExternalLink key={label} href={href} className="hackathon-card-link">
                    {label} →
                  </ExternalLink>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section id="extraction" className="hackathon-section">
          <h2>What You Can Extract from Video</h2>
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
          <h2>Tools</h2>
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
                    <td>{href ? <ExternalLink href={href} className="hackathon-card-link">{getIt}</ExternalLink> : <code>{getIt}</code>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="architecture" className="hackathon-section">
          <h2>Architecture</h2>
          <div className="hackathon-arch-box">
            <pre>{architectureDiagram}</pre>
          </div>
        </section>

        <section id="limitations" className="hackathon-section">
          <h2>Limitations</h2>
          <div className="hackathon-limits">
            {limitations.map(([title, body]) => (
              <div key={title} className="hackathon-limit-item">
                <strong>{title}</strong> — {body}
              </div>
            ))}
          </div>
        </section>

        <section id="quick-ref" className="hackathon-section">
          <h2>All Datasets — Quick Reference</h2>
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
                    <td>{href ? <ExternalLink href={href} className="hackathon-card-link">{linkLabel}</ExternalLink> : linkLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="hackathon-footer">
        Hydrawav3 Hackathon — April 2026 |{' '}
        <a href="mailto:shiva@hydrawav3.com">shiva@hydrawav3.com</a> |{' '}
        <ExternalLink href="https://www.hydrawav3.com">hydrawav3.com</ExternalLink>
      </footer>
    </div>
  );
}
