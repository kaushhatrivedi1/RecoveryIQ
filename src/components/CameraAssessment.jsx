// src/components/CameraAssessment.jsx
// Member 1 — Camera-Based Assessment Pipeline
// npm install @mediapipe/pose @mediapipe/camera_utils @mediapipe/drawing_utils

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── rPPG Processor ───────────────────────────────────────────────────────────
class RPPGProcessor {
  constructor() {
    this.greenBuffer = [];
    this.timestamps = [];
    this.windowSec = 30;
  }

  addFrame(videoEl) {
    const canvas = document.createElement('canvas');
    const w = 60, h = 40;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      videoEl,
      videoEl.videoWidth * 0.3, videoEl.videoHeight * 0.05,
      videoEl.videoWidth * 0.4, videoEl.videoHeight * 0.25,
      0, 0, w, h
    );
    const data = ctx.getImageData(0, 0, w, h).data;
    let green = 0;
    for (let i = 0; i < data.length; i += 4) green += data[i + 1];
    this.greenBuffer.push(green / (w * h));
    this.timestamps.push(Date.now());
    this._trim();
  }

  _trim() {
    const cutoff = Date.now() - this.windowSec * 1000;
    while (this.timestamps.length && this.timestamps[0] < cutoff) {
      this.timestamps.shift();
      this.greenBuffer.shift();
    }
  }

  getHR() {
    if (this.greenBuffer.length < 60) return null;
    const mean = this.greenBuffer.reduce((a, b) => a + b, 0) / this.greenBuffer.length;
    const signal = this.greenBuffer.map(v => v - mean);
    const duration = (this.timestamps[this.timestamps.length - 1] - this.timestamps[0]) / 1000;
    if (duration < 5) return null;
    let peaks = 0;
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > 0.3) peaks++;
    }
    const hr = Math.round((peaks / duration) * 60);
    return hr > 40 && hr < 180 ? hr : null;
  }

  getHRV() {
    if (this.greenBuffer.length < 90) return null;
    const mean = this.greenBuffer.reduce((a, b) => a + b, 0) / this.greenBuffer.length;
    const signal = this.greenBuffer.map(v => v - mean);
    const peakIdx = [];
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > 0.3) peakIdx.push(i);
    }
    if (peakIdx.length < 4) return null;
    const rr = [];
    for (let i = 1; i < peakIdx.length; i++) {
      rr.push(this.timestamps[peakIdx[i]] - this.timestamps[peakIdx[i - 1]]);
    }
    const diffs = rr.slice(1).map((v, i) => Math.pow(v - rr[i], 2));
    const rmssd = Math.sqrt(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    return Math.round(rmssd) || null;
  }
}

// ─── Angle helpers ─────────────────────────────────────────────────────────────
function calcAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2) * Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (mag === 0) return 0;
  return Math.round(Math.acos(Math.min(1, Math.max(-1, dot / mag))) * (180 / Math.PI));
}

function extractROM(landmarks) {
  if (!landmarks || landmarks.length < 33) return null;
  const lm = landmarks;
  const leftShoulder  = lm[11], rightShoulder = lm[12];
  const leftElbow     = lm[13], rightElbow    = lm[14];
  const leftWrist     = lm[15], rightWrist    = lm[16];
  const leftHip       = lm[23], rightHip      = lm[24];
  const leftKnee      = lm[25], rightKnee     = lm[26];
  const leftAnkle     = lm[27], rightAnkle    = lm[28];

  const leftShoulderAngle  = calcAngle(leftElbow,  leftShoulder,  leftHip);
  const rightShoulderAngle = calcAngle(rightElbow, rightShoulder, rightHip);
  const leftElbowAngle     = calcAngle(leftShoulder,  leftElbow,  leftWrist);
  const rightElbowAngle    = calcAngle(rightShoulder, rightElbow, rightWrist);
  const leftHipAngle       = calcAngle(leftShoulder,  leftHip,    leftKnee);
  const rightHipAngle      = calcAngle(rightShoulder, rightHip,   rightKnee);
  const leftKneeAngle      = calcAngle(leftHip,  leftKnee,  leftAnkle);
  const rightKneeAngle     = calcAngle(rightHip, rightKnee, rightAnkle);

  const shoulderAsymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
  const hipAsymmetry      = Math.abs(leftHip.y - rightHip.y);
  const asymmetryScore    = Math.round((shoulderAsymmetry + hipAsymmetry) * 100);

  return {
    leftShoulder: leftShoulderAngle,   rightShoulder: rightShoulderAngle,
    leftElbow:    leftElbowAngle,      rightElbow:    rightElbowAngle,
    leftHip:      leftHipAngle,        rightHip:      rightHipAngle,
    leftKnee:     leftKneeAngle,       rightKnee:     rightKneeAngle,
    shoulderAsymmetry: Math.round(shoulderAsymmetry * 100),
    hipAsymmetry:      Math.round(hipAsymmetry * 100),
    asymmetryScore,
    asymmetryFlag: asymmetryScore > 8,
  };
}

// ─── Mock fallback ─────────────────────────────────────────────────────────────
function getMockAssessment() {
  return {
    rom: {
      leftShoulder: 142, rightShoulder: 128,
      leftElbow: 168,    rightElbow: 171,
      leftHip: 172,      rightHip: 165,
      leftKnee: 174,     rightKnee: 178,
      shoulderAsymmetry: 14, hipAsymmetry: 7,
      asymmetryScore: 14, asymmetryFlag: true,
    },
    hr: 72, hrv: 42, breathRate: 16,
    flags: [
      'Right shoulder mobility limited vs left (14 point difference)',
      'HRV signals moderate recovery state — recovery-focused session recommended',
    ],
    source: 'mock',
  };
}

// ─── Plain function — draw skeleton overlay (NOT a hook, no ordering issue) ───
function drawOverlay(results, canvasRef, videoRef) {
  const canvas = canvasRef.current;
  const video  = videoRef.current;
  if (!canvas || !video) return;
  const ctx = canvas.getContext('2d');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!results.poseLandmarks) return;

  const connections = [
    [11,12],[11,13],[13,15],[12,14],[14,16],
    [11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],
  ];
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth   = 2;
  connections.forEach(([a, b]) => {
    const pa = results.poseLandmarks[a];
    const pb = results.poseLandmarks[b];
    if (pa && pb && pa.visibility > 0.5 && pb.visibility > 0.5) {
      ctx.beginPath();
      ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
      ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
      ctx.stroke();
    }
  });
  results.poseLandmarks.forEach((lm) => {
    if (lm.visibility > 0.5) {
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fillStyle   = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#c69e83';
      ctx.lineWidth   = 2;
      ctx.stroke();
    }
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CameraAssessment({ onAssessmentComplete, patientName = 'Patient' }) {
  const videoRef       = useRef(null);
  const canvasRef      = useRef(null);
  const streamRef      = useRef(null);
  const poseRef        = useRef(null);
  const rppgRef        = useRef(new RPPGProcessor());
  const frameCountRef  = useRef(0);
  const latestROMRef   = useRef(null);
  const animFrameRef   = useRef(null);
  const timerRef       = useRef(null);
  // Stable ref so loop callbacks can always call the latest finishScan
  const finishScanRef  = useRef(null);
  // Stable ref for the process loop itself (avoids circular useCallback deps)
  const processLoopRef = useRef(null);

  const [phase,     setPhase]     = useState('idle');
  const [countdown, setCountdown] = useState(60);
  const [liveROM,   setLiveROM]   = useState(null);
  const [liveHR,    setLiveHR]    = useState(null);
  const [liveHRV,   setLiveHRV]   = useState(null);
  const [flags,     setFlags]     = useState([]);
  const [useMock,   setUseMock]   = useState(false);

  // ── finishScan — defined as callback, stored in ref so timer can call it ──
  const finishScan = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current)     clearInterval(timerRef.current);
    if (streamRef.current)    streamRef.current.getTracks().forEach(t => t.stop());
    setPhase('complete');

    const rom = latestROMRef.current;
    const hr  = rppgRef.current.getHR();
    const hrv = rppgRef.current.getHRV();

    const assessmentFlags = [];
    if (rom?.asymmetryFlag)
      assessmentFlags.push(`Shoulder asymmetry: ${rom.asymmetryScore} point difference between sides`);
    if (Math.abs((rom?.leftHip || 0) - (rom?.rightHip || 0)) > 10)
      assessmentFlags.push('Hip imbalance detected — possible compensation pattern');
    if (hrv && hrv < 50)
      assessmentFlags.push('HRV below 50ms — recovery-focused session recommended');
    if (hrv && hrv > 70)
      assessmentFlags.push('HRV above 70ms — activation protocol may be appropriate');

    const result = { rom: rom || {}, hr: hr || null, hrv: hrv || null, breathRate: 16, flags: assessmentFlags, source: 'camera' };
    if (onAssessmentComplete) onAssessmentComplete(result);
  }, [onAssessmentComplete]);

  // Keep ref in sync with latest finishScan
  useEffect(() => { finishScanRef.current = finishScan; }, [finishScan]);

  // ── Process loop stored in ref — avoids self-referential useCallback ──
  useEffect(() => {
    processLoopRef.current = async () => {
      if (!videoRef.current || !poseRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(() => processLoopRef.current?.());
        return;
      }
      await poseRef.current.send({ image: videoRef.current });
      animFrameRef.current = requestAnimationFrame(() => processLoopRef.current?.());
    };
  });

  // ── Load MediaPipe Pose ──
  const loadPose = useCallback(async () => {
    try {
      const { Pose } = await import('@mediapipe/pose');
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1, smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
      });
      pose.onResults((results) => {
        // Plain function call — no hook ordering issue
        drawOverlay(results, canvasRef, videoRef);

        if (results.poseLandmarks) {
          const rom = extractROM(results.poseLandmarks);
          latestROMRef.current = rom;
          setLiveROM(rom);
          const newFlags = [];
          if (rom.asymmetryFlag)
            newFlags.push(`Shoulder asymmetry detected (${rom.asymmetryScore} point difference)`);
          if (Math.abs(rom.leftHip - rom.rightHip) > 10)
            newFlags.push('Hip imbalance detected — possible compensation pattern');
          setFlags(newFlags);
        }

        frameCountRef.current++;
        if (frameCountRef.current % 3 === 0 && videoRef.current) {
          rppgRef.current.addFrame(videoRef.current);
          const hr  = rppgRef.current.getHR();
          const hrv = rppgRef.current.getHRV();
          if (hr)  setLiveHR(hr);
          if (hrv) setLiveHRV(hrv);
        }
      });
      poseRef.current = pose;
      return true;
    } catch (e) {
      console.warn('MediaPipe failed to load:', e);
      return false;
    }
  }, []);

  // ── Start scan ──
  const startScan = useCallback(async () => {
    setPhase('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const loaded = await loadPose();
      if (!loaded) throw new Error('MediaPipe unavailable');

      setPhase('scanning');
      setCountdown(60);
      animFrameRef.current = requestAnimationFrame(() => processLoopRef.current?.());

      let count = 60;
      timerRef.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(timerRef.current);
          // Call via ref — always has the latest version
          finishScanRef.current?.();
        }
      }, 1000);
    } catch (e) {
      console.warn('Camera start failed:', e);
      setPhase('error');
    }
  }, [loadPose]);

  // ── Mock data ──
  const useMockData = useCallback(() => {
    setUseMock(true);
    setPhase('complete');
    const mock = getMockAssessment();
    setLiveROM(mock.rom);
    setLiveHR(mock.hr);
    setLiveHRV(mock.hrv);
    setFlags(mock.flags);
    if (onAssessmentComplete) onAssessmentComplete(mock);
  }, [onAssessmentComplete]);

  // ── Reset ──
  const resetScan = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current)     clearInterval(timerRef.current);
    if (streamRef.current)    streamRef.current.getTracks().forEach(t => t.stop());
    setPhase('idle'); setLiveROM(null); setLiveHR(null);
    setLiveHRV(null); setFlags([]); setUseMock(false);
    rppgRef.current      = new RPPGProcessor();
    latestROMRef.current = null;
  }, []);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current)     clearInterval(timerRef.current);
      if (streamRef.current)    streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const hrvInfo = liveHRV
    ? liveHRV < 50
      ? { label: 'Recovery Focus',   color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' }
      : liveHRV > 70
        ? { label: 'Activation Ready', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' }
        : { label: 'Balanced',          color: 'text-blue-400',  bg: 'bg-blue-400/10  border-blue-400/30'  }
    : null;

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-lg">Camera Assessment</h3>
          <p className="text-[#888] text-sm mt-0.5">60-second scan · Pose + Vitals</p>
        </div>
        {phase === 'scanning' && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-mono font-bold">{countdown}s</span>
          </div>
        )}
        {phase === 'complete' && (
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
            Complete {useMock ? '(Demo Mode)' : ''}
          </span>
        )}
      </div>

      {/* Camera feed */}
      {(phase === 'scanning' || phase === 'starting') && (
        <div className="relative bg-black">
          <video ref={videoRef} className="w-full max-h-64 object-cover" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: 'screen' }} />
          {phase === 'starting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#c69e83] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white text-sm">Starting camera...</p>
              </div>
            </div>
          )}
          {phase === 'scanning' && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
              <span className="text-xs bg-black/60 text-[#c69e83] px-2 py-1 rounded">Pose tracking active</span>
              {liveHR && <span className="text-xs bg-black/60 text-red-400 px-2 py-1 rounded">♥ {liveHR} bpm</span>}
            </div>
          )}
        </div>
      )}

      {/* Idle */}
      {phase === 'idle' && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#c69e83]/10 border border-[#c69e83]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#c69e83]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <p className="text-white font-medium mb-1">Scan {patientName}</p>
          <p className="text-[#888] text-sm mb-6">60 seconds · ROM · Heart Rate · Asymmetry</p>
          <div className="flex gap-3 justify-center">
            <button onClick={startScan} className="px-5 py-2.5 bg-[#c69e83] text-[#1a1a1a] rounded-xl font-semibold text-sm hover:bg-[#d4ae93] transition-colors">
              Start Scan
            </button>
            <button onClick={useMockData} className="px-5 py-2.5 bg-[#2a2a2a] text-[#aaa] rounded-xl font-semibold text-sm hover:bg-[#333] transition-colors">
              Use Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="p-8 text-center">
          <p className="text-red-400 font-medium mb-1">Camera unavailable</p>
          <p className="text-[#888] text-sm mb-6">Permission denied or MediaPipe failed to load.</p>
          <button onClick={useMockData} className="px-5 py-2.5 bg-[#c69e83] text-[#1a1a1a] rounded-xl font-semibold text-sm hover:bg-[#d4ae93] transition-colors">
            Continue with Demo Data
          </button>
        </div>
      )}

      {/* Live metrics */}
      {phase === 'scanning' && (
        <div className="grid grid-cols-3 gap-px bg-[#2a2a2a] border-t border-[#2a2a2a]">
          {[
            { label: 'Heart Rate', value: liveHR  ? `${liveHR} bpm` : 'Reading...', sub: 'Camera' },
            { label: 'HRV',        value: liveHRV ? `${liveHRV} ms` : 'Reading...', sub: 'Beat interval' },
            { label: 'Asymmetry',  value: liveROM ? `${liveROM.asymmetryScore}` : 'Reading...', sub: liveROM?.asymmetryFlag ? 'flagged' : 'normal' },
          ].map((m) => (
            <div key={m.label} className="bg-[#111] px-4 py-3 text-center">
              <div className="text-[#c69e83] font-mono text-lg font-bold">{m.value}</div>
              <div className="text-[#888] text-xs">{m.label}</div>
              <div className="text-[#555] text-xs">{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Finish early */}
      {phase === 'scanning' && (
        <div className="px-6 py-3 flex justify-end border-t border-[#2a2a2a]">
          <button onClick={finishScan} className="text-sm text-[#888] hover:text-white transition-colors">
            Finish early →
          </button>
        </div>
      )}

      {/* Results */}
      {phase === 'complete' && liveROM && (
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[#888] text-xs uppercase tracking-wider mb-3">Range of Motion</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'L Shoulder', val: liveROM.leftShoulder,  comp: liveROM.rightShoulder },
                { label: 'R Shoulder', val: liveROM.rightShoulder, comp: liveROM.leftShoulder  },
                { label: 'L Hip',      val: liveROM.leftHip,       comp: liveROM.rightHip      },
                { label: 'R Hip',      val: liveROM.rightHip,      comp: liveROM.leftHip       },
                { label: 'L Knee',     val: liveROM.leftKnee,      comp: liveROM.rightKnee     },
                { label: 'R Knee',     val: liveROM.rightKnee,     comp: liveROM.leftKnee      },
              ].map((item) => {
                const flagged = item.comp != null && Math.abs(item.val - item.comp) > 10;
                return (
                  <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${flagged ? 'bg-amber-400/5 border-amber-400/20' : 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                    <span className="text-[#aaa] text-xs">{item.label}</span>
                    <span className={`font-mono font-bold text-sm ${flagged ? 'text-amber-400' : 'text-white'}`}>{item.val}°</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-center">
              <div className="text-red-400 font-mono font-bold text-xl">{liveHR ?? '—'}</div>
              <div className="text-[#888] text-xs">bpm</div>
              <div className="text-[#555] text-xs">Heart Rate</div>
            </div>
            <div className={`rounded-lg p-3 text-center border ${hrvInfo?.bg ?? 'bg-[#1a1a1a] border-[#2a2a2a]'}`}>
              <div className={`font-mono font-bold text-xl ${hrvInfo?.color ?? 'text-white'}`}>{liveHRV ?? '—'}</div>
              <div className="text-[#888] text-xs">ms</div>
              <div className={`text-xs ${hrvInfo?.color ?? 'text-[#555]'}`}>{hrvInfo?.label ?? 'HRV'}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 text-center">
              <div className={`font-mono font-bold text-xl ${liveROM.asymmetryFlag ? 'text-amber-400' : 'text-green-400'}`}>{liveROM.asymmetryScore}</div>
              <div className="text-[#888] text-xs">pts</div>
              <div className="text-[#555] text-xs">Asymmetry</div>
            </div>
          </div>

          {flags.length > 0 && (
            <div className="space-y-2">
              <p className="text-[#888] text-xs uppercase tracking-wider">Movement Insights</p>
              {flags.map((f, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
                  <span className="text-amber-400 text-xs mt-0.5">⚠</span>
                  <span className="text-amber-200 text-xs">{f}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={resetScan} className="w-full py-2 text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] rounded-xl transition-colors">
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}