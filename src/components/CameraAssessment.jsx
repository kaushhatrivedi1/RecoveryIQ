/**
 * CameraAssessment — live camera component that captures ~10s of frames,
 * sends to /api/analyze-video (rPPG + pose) and renders the vitals + movement quality.
 * Used on the Intake page for pre-session biometric scan.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, CameraOff, Activity, Heart, Wind, Zap, CheckCircle } from 'lucide-react';

const BACKEND = 'http://localhost:8000';
const CAPTURE_SECONDS = 10;
const CAPTURE_FPS = 8;
const TOTAL_FRAMES = CAPTURE_SECONDS * CAPTURE_FPS;

export default function CameraAssessment({ patientName, onAssessmentComplete, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [phase, setPhase] = useState('idle'); // idle | starting | capturing | analyzing | done | error
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    clearInterval(intervalRef.current);
    stopStream();
  }, [stopStream]);

  async function startCapture() {
    setPhase('starting');
    setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('capturing');

      const captured = [];
      intervalRef.current = setInterval(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 320, 240);
        const b64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        captured.push(b64);
        setProgress(Math.round((captured.length / TOTAL_FRAMES) * 100));

        if (captured.length >= TOTAL_FRAMES) {
          clearInterval(intervalRef.current);
          stopStream();
          setPhase('analyzing');
          analyzeFrames(captured);
        }
      }, 1000 / CAPTURE_FPS);
    } catch (e) {
      setPhase('error');
      setErrorMsg(e.message || 'Camera access denied');
    }
  }

  async function analyzeFrames(capturedFrames) {
    try {
      const res = await fetch(`${BACKEND}/api/analyze-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frames_b64: capturedFrames,
          fps: CAPTURE_FPS,
          patient_name: patientName,
        }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('done');
      if (onAssessmentComplete) onAssessmentComplete(data);
    } catch {
      // Demo fallback
      const demo = {
        vitals: { hr_bpm: 68, hrv_sdnn_ms: 44, breath_rate_bpm: 14, confidence: 0, source: 'demo_fallback' },
        pose: null,
        frames_analyzed: capturedFrames.length,
      };
      setResult(demo);
      setPhase('done');
      if (onAssessmentComplete) onAssessmentComplete(demo);
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    stopStream();
    setPhase('idle');
    setProgress(0);
    setResult(null);
  }

  const vitals = result?.vitals;
  const pose = result?.pose;
  const isDemo = vitals?.source === 'demo_fallback';

  return (
    <div className="riq-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-transparent px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${phase === 'capturing' ? 'bg-rose-500 animate-pulse' : phase === 'done' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="text-sm font-semibold text-slate-900">Biometric Scan — {patientName || 'Client'}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
            Skip
          </button>
        )}
      </div>

      <div className="p-6">
        {phase === 'idle' && (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 border border-sky-200">
              <Camera size={28} className="text-sky-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Pre-Session Biometric Scan</h3>
            <p className="mb-5 text-sm text-slate-500 max-w-xs mx-auto">
              10-second facial scan measures resting heart rate, HRV, and breath rate via remote photoplethysmography.
            </p>
            <button onClick={startCapture} className="riq-button mx-auto">
              <Camera size={16} /> Start Scan
            </button>
          </div>
        )}

        {(phase === 'starting' || phase === 'capturing') && (
          <div>
            <div className="relative mb-4 overflow-hidden rounded-[1.5rem] bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <canvas ref={canvasRef} className="hidden" />
              {phase === 'capturing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
                  <div className="w-48 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="mt-2 text-xs text-white/80">Scanning… {progress}%</span>
                </div>
              )}
            </div>
            {phase === 'starting' && (
              <p className="text-center text-sm text-slate-500">Starting camera…</p>
            )}
            {phase === 'capturing' && (
              <p className="text-center text-sm text-slate-600">
                Keep your face visible and stay still. Measuring heart rate from skin tone.
              </p>
            )}
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-sky-200 border-t-sky-500 animate-spin" />
            <p className="text-sm font-medium text-slate-700">Analyzing biometrics…</p>
            <p className="text-xs text-slate-400 mt-1">Running rPPG + pose analysis</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="py-6 text-center">
            <CameraOff size={40} className="mx-auto mb-3 text-rose-400" />
            <p className="text-sm font-semibold text-slate-800 mb-1">Camera unavailable</p>
            <p className="text-xs text-slate-500 mb-4">{errorMsg}</p>
            <button onClick={reset} className="riq-button mx-auto">Retry</button>
          </div>
        )}

        {phase === 'done' && vitals && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-emerald-500" />
              <span className="text-sm font-semibold text-slate-900">Scan Complete</span>
              {isDemo && (
                <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">Demo values</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <VitalCard icon={<Heart size={16} className="text-rose-500" />} label="Heart Rate" value={`${vitals.hr_bpm}`} unit="BPM" />
              <VitalCard icon={<Activity size={16} className="text-sky-500" />} label="HRV (SDNN)" value={`${vitals.hrv_sdnn_ms}`} unit="ms" />
              <VitalCard icon={<Wind size={16} className="text-emerald-500" />} label="Breath Rate" value={`${vitals.breath_rate_bpm}`} unit="/min" />
            </div>

            {pose?.asymmetry_flags?.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
                <div className="mb-1.5 text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <Zap size={12} /> Movement Patterns Noted
                </div>
                {pose.asymmetry_flags.map((f, i) => (
                  <p key={i} className="text-xs text-amber-700 leading-5">• {f}</p>
                ))}
              </div>
            )}

            {pose?.joint_angles && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="mb-2 text-xs font-semibold text-slate-600">Joint Angles</p>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                  {Object.entries(pose.joint_angles).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-400">{k.replace(/_/g, ' ')}</span>
                      <span className="font-medium text-slate-700">{v}°</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} className="mt-4 w-full rounded-full border border-slate-200 py-2.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
              Re-scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VitalCard({ icon, label, value, unit }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
      <div className="mb-1.5 flex justify-center">{icon}</div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-400">{unit}</div>
      <div className="mt-0.5 text-[10px] font-medium text-slate-500">{label}</div>
    </div>
  );
}
