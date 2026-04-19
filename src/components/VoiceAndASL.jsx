// src/components/VoiceAndASL.jsx
// Member 4 — ElevenLabs Voice + Animated ASL Finger-spelling
// No external ASL API needed — pure SVG animation, works everywhere

import { useState, useEffect, useRef } from 'react';
import { speakText } from '../services/api';

// ─── ASL hand shapes per letter (SVG-based) ───────────────────────────────────
const HAND = {
  A: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="70" rx="22" ry="24"/>
      <ellipse cx="14" cy="60" rx="8" ry="6" transform="rotate(-20 14 60)"/>
      <rect x="22" y="42" width="9" height="16" rx="4"/>
      <rect x="33" y="40" width="9" height="18" rx="4"/>
      <rect x="44" y="41" width="9" height="17" rx="4"/>
      <rect x="54" y="44" width="8" height="14" rx="4"/>
    </g>,
  B: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="75" rx="22" ry="20"/>
      <rect x="22" y="20" width="9" height="52" rx="4"/>
      <rect x="33" y="18" width="9" height="54" rx="4"/>
      <rect x="44" y="19" width="9" height="53" rx="4"/>
      <rect x="54" y="22" width="8" height="48" rx="4"/>
      <ellipse cx="16" cy="68" rx="7" ry="5" transform="rotate(10 16 68)"/>
    </g>,
  C: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <path d="M60 30 Q20 20 15 50 Q12 75 55 80" fill="none" stroke="#c8956a" strokeWidth="18" strokeLinecap="round"/>
      <path d="M60 30 Q20 20 15 50 Q12 75 55 80" fill="none" stroke="#f0c090" strokeWidth="14" strokeLinecap="round"/>
    </g>,
  D: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="28" y="18" width="10" height="52" rx="5"/>
      <rect x="40" y="45" width="9" height="25" rx="4"/>
      <rect x="50" y="47" width="8" height="23" rx="4"/>
      <ellipse cx="16" cy="62" rx="8" ry="6" transform="rotate(-15 16 62)"/>
    </g>,
  E: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="20" y="45" width="9" height="22" rx="4"/>
      <rect x="31" y="43" width="9" height="24" rx="4"/>
      <rect x="42" y="44" width="9" height="23" rx="4"/>
      <rect x="52" y="47" width="8" height="20" rx="4"/>
      <ellipse cx="16" cy="65" rx="7" ry="5"/>
    </g>,
  F: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="33" y="18" width="9" height="50" rx="4"/>
      <rect x="44" y="20" width="9" height="48" rx="4"/>
      <rect x="54" y="24" width="8" height="42" rx="4"/>
      <circle cx="22" cy="48" r="10" fill="none" stroke="#c8956a" strokeWidth="3"/>
    </g>,
  G: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="42" cy="65" rx="20" ry="22" transform="rotate(-15 42 65)"/>
      <rect x="28" y="30" width="9" height="32" rx="4" transform="rotate(-15 28 30)"/>
      <ellipse cx="60" cy="50" rx="14" ry="6" transform="rotate(-10 60 50)"/>
    </g>,
  H: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="68" rx="20" ry="22" transform="rotate(-20 40 68)"/>
      <rect x="25" y="32" width="9" height="32" rx="4" transform="rotate(-15 25 32)"/>
      <rect x="36" y="35" width="9" height="30" rx="4" transform="rotate(-15 36 35)"/>
    </g>,
  I: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="22" y="48" width="9" height="22" rx="4"/>
      <rect x="33" y="50" width="9" height="20" rx="4"/>
      <rect x="44" y="49" width="9" height="21" rx="4"/>
      <rect x="54" y="20" width="8" height="48" rx="4"/>
      <ellipse cx="16" cy="66" rx="7" ry="5"/>
    </g>,
  J: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="22" y="48" width="9" height="22" rx="4"/>
      <rect x="33" y="50" width="9" height="20" rx="4"/>
      <rect x="44" y="49" width="9" height="21" rx="4"/>
      <path d="M58 20 L58 60 Q58 75 45 78" fill="none" stroke="#f0c090" strokeWidth="9" strokeLinecap="round"/>
      <path d="M58 20 L58 60 Q58 75 45 78" fill="none" stroke="#c8956a" strokeWidth="2" strokeLinecap="round"/>
    </g>,
  K: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="75" rx="22" ry="20"/>
      <rect x="28" y="20" width="9" height="52" rx="4"/>
      <rect x="40" y="30" width="9" height="28" rx="4" transform="rotate(20 40 30)"/>
      <ellipse cx="20" cy="55" rx="9" ry="6" transform="rotate(30 20 55)"/>
    </g>,
  L: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="42" cy="72" rx="20" ry="22"/>
      <rect x="33" y="20" width="9" height="50" rx="4"/>
      <ellipse cx="14" cy="58" rx="14" ry="7" transform="rotate(5 14 58)"/>
      <rect x="44" y="52" width="8" height="18" rx="4"/>
      <rect x="53" y="54" width="8" height="16" rx="4"/>
    </g>,
  M: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="20" y="52" width="9" height="18" rx="4"/>
      <rect x="31" y="50" width="9" height="20" rx="4"/>
      <rect x="42" y="52" width="9" height="18" rx="4"/>
      <rect x="52" y="55" width="8" height="15" rx="4"/>
      <ellipse cx="14" cy="62" rx="8" ry="6"/>
    </g>,
  N: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="20" y="52" width="9" height="18" rx="4"/>
      <rect x="31" y="50" width="9" height="20" rx="4"/>
      <rect x="42" y="53" width="9" height="17" rx="4"/>
      <rect x="52" y="55" width="8" height="15" rx="4"/>
      <ellipse cx="14" cy="60" rx="8" ry="6"/>
    </g>,
  O: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="68" rx="22" ry="24"/>
      <circle cx="40" cy="48" r="14" fill="none" stroke="#c8956a" strokeWidth="4"/>
      <ellipse cx="18" cy="62" rx="9" ry="6"/>
    </g>,
  P: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="60" rx="22" ry="22" transform="rotate(30 40 60)"/>
      <rect x="28" y="20" width="9" height="38" rx="4" transform="rotate(20 28 20)"/>
      <rect x="40" y="28" width="9" height="30" rx="4" transform="rotate(20 40 28)"/>
    </g>,
  Q: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="55" rx="22" ry="22" transform="rotate(20 40 55)"/>
      <ellipse cx="30" cy="80" rx="14" ry="7" transform="rotate(-10 30 80)"/>
      <rect x="38" y="28" width="9" height="30" rx="4" transform="rotate(20 38 28)"/>
    </g>,
  R: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="28" y="20" width="9" height="50" rx="4" transform="rotate(5 28 20)"/>
      <rect x="38" y="22" width="9" height="48" rx="4" transform="rotate(-5 38 22)"/>
      <rect x="48" y="50" width="8" height="20" rx="4"/>
      <rect x="57" y="52" width="7" height="18" rx="4"/>
      <ellipse cx="16" cy="66" rx="7" ry="5"/>
    </g>,
  S: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="70" rx="22" ry="24"/>
      <rect x="20" y="44" width="9" height="24" rx="4"/>
      <rect x="31" y="42" width="9" height="26" rx="4"/>
      <rect x="42" y="43" width="9" height="25" rx="4"/>
      <rect x="52" y="46" width="8" height="22" rx="4"/>
      <ellipse cx="16" cy="58" rx="8" ry="6" transform="rotate(10 16 58)"/>
    </g>,
  T: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="20" y="50" width="9" height="20" rx="4"/>
      <rect x="31" y="48" width="9" height="22" rx="4"/>
      <rect x="42" y="50" width="9" height="20" rx="4"/>
      <rect x="52" y="52" width="8" height="18" rx="4"/>
      <ellipse cx="28" cy="46" rx="8" ry="6" transform="rotate(-15 28 46)"/>
    </g>,
  U: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="75" rx="22" ry="20"/>
      <rect x="28" y="20" width="9" height="52" rx="4"/>
      <rect x="39" y="20" width="9" height="52" rx="4"/>
      <rect x="50" y="50" width="8" height="22" rx="4"/>
      <rect x="58" y="52" width="7" height="20" rx="4"/>
      <ellipse cx="16" cy="68" rx="7" ry="5"/>
    </g>,
  V: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="75" rx="22" ry="20"/>
      <rect x="26" y="20" width="9" height="52" rx="4" transform="rotate(-8 26 20)"/>
      <rect x="40" y="20" width="9" height="52" rx="4" transform="rotate(8 40 20)"/>
      <rect x="50" y="52" width="8" height="20" rx="4"/>
      <rect x="58" y="54" width="7" height="18" rx="4"/>
      <ellipse cx="16" cy="68" rx="7" ry="5"/>
    </g>,
  W: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="75" rx="22" ry="20"/>
      <rect x="22" y="20" width="9" height="52" rx="4" transform="rotate(-5 22 20)"/>
      <rect x="33" y="18" width="9" height="54" rx="4"/>
      <rect x="44" y="20" width="9" height="52" rx="4" transform="rotate(5 44 20)"/>
      <rect x="55" y="52" width="7" height="20" rx="4"/>
      <ellipse cx="14" cy="68" rx="7" ry="5"/>
    </g>,
  X: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <path d="M28 30 Q35 50 28 55" fill="none" stroke="#f0c090" strokeWidth="10" strokeLinecap="round"/>
      <path d="M28 30 Q35 50 28 55" fill="none" stroke="#c8956a" strokeWidth="2" strokeLinecap="round"/>
      <rect x="39" y="50" width="9" height="22" rx="4"/>
      <rect x="50" y="52" width="8" height="20" rx="4"/>
      <ellipse cx="16" cy="66" rx="7" ry="5"/>
    </g>,
  Y: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <rect x="22" y="48" width="9" height="22" rx="4"/>
      <rect x="33" y="50" width="9" height="20" rx="4"/>
      <rect x="44" y="51" width="9" height="19" rx="4"/>
      <rect x="55" y="20" width="8" height="48" rx="4"/>
      <ellipse cx="14" cy="55" rx="14" ry="7" transform="rotate(5 14 55)"/>
    </g>,
  Z: <g fill="#f0c090" stroke="#c8956a" strokeWidth="1.5">
      <ellipse cx="40" cy="72" rx="22" ry="22"/>
      <path d="M25 30 L55 30 L25 55 L55 55" fill="none" stroke="#f0c090" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 30 L55 30 L25 55 L55 55" fill="none" stroke="#c8956a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>,
  ' ': <g opacity="0.1">
      <ellipse cx="40" cy="72" rx="22" ry="22" fill="#f0c090"/>
    </g>,
};

function HandShape({ char }) {
  const key = char.toUpperCase();
  const shape = HAND[key] || HAND[' '];
  return (
    <svg viewBox="0 0 80 100" className="w-full h-full">
      {shape}
    </svg>
  );
}

// ─── Animated finger-spelling display ─────────────────────────────────────────
function ASLSpeller({ text, active }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [flip, setFlip] = useState(false);
  const timerRef = useRef(null);

  const chars = (text || '')
    .toUpperCase()
    .split('')
    .filter(c => /[A-Z ]/.test(c))
    .slice(0, 50);

  const charsLen = chars.length;

  useEffect(() => {
    if (!active || charsLen === 0) {
      clearInterval(timerRef.current);
      // Use startTransition to avoid synchronous setState in effect
      const t = setTimeout(() => {
        setIdx(0);
        setDone(false);
      }, 0);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setIdx(0);
      setDone(false);
    }, 0);

    timerRef.current = setInterval(() => {
      setFlip(f => !f);
      setIdx(prev => {
        if (prev >= charsLen - 1) {
          clearInterval(timerRef.current);
          setDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 580);

    return () => {
      clearTimeout(t);
      clearInterval(timerRef.current);
    };
  }, [active, text, charsLen]);

  const currentChar = chars[idx] || ' ';
  const progress = chars.length > 0 ? Math.round(((idx + 1) / chars.length) * 100) : 0;
  const trail = chars.slice(Math.max(0, idx - 5), idx + 1);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Hand with flip animation on change */}
      <div className="relative w-20 h-24">
        <div
          key={`${idx}-${flip}`}
          className="w-full h-full"
          style={{
            animation: active ? 'asl-pop 0.25s ease-out' : 'none',
            filter: active && !done ? 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' : 'none',
          }}
        >
          <HandShape char={currentChar} />
        </div>
        {/* Current letter */}
        <div className="absolute -bottom-1 -right-2 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
          <span className="text-white text-[11px] font-bold font-mono">
            {currentChar === ' ' ? '·' : currentChar}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full space-y-1">
        <div className="w-full h-1 rounded-full bg-blue-500/15 overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-blue-400/50">
          <span>{idx + 1}/{chars.length} letters</span>
          <span>{done ? '✓ Complete' : active ? 'Signing...' : 'Ready'}</span>
        </div>
      </div>

      {/* Letter trail */}
      <div className="flex gap-1 flex-wrap justify-center min-h-5">
        {trail.map((c, i) => (
          <span
            key={i}
            className="text-[10px] font-mono px-1 py-0.5 rounded border transition-all"
            style={{
              opacity: 0.3 + (i / trail.length) * 0.7,
              borderColor: i === trail.length - 1 ? '#60a5fa' : 'rgba(99,102,241,0.3)',
              color: i === trail.length - 1 ? '#93c5fd' : '#818cf8',
              background: i === trail.length - 1 ? 'rgba(96,165,250,0.08)' : 'transparent',
              transform: i === trail.length - 1 ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {c === ' ' ? '·' : c}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes asl-pop {
          0% { transform: scale(0.88); opacity: 0.6; }
          60% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── ASL Bridge panel ─────────────────────────────────────────────────────────
function ASLBridge({ text, enabled }) {
  const [active, setActive] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setActive(false);
      setStarted(false);
    }, 0);
    return () => clearTimeout(t);
  }, [text]);

  const handleSign = () => {
    setActive(false);
    setTimeout(() => {
      setActive(true);
      setStarted(true);
    }, 60);
  };

  if (!enabled) return null;

  return (
    <div className="border border-blue-500/20 rounded-xl overflow-hidden bg-blue-500/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 7a2 2 0 00-2-2 2 2 0 00-2 2v2.171A2 2 0 0015 11a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 00-2 2v6a6 6 0 006 6h2a6 6 0 006-6V7z"/>
            </svg>
          </div>
          <div>
            <p className="text-blue-300 text-sm font-medium">ASL Translation</p>
            <p className="text-blue-400/60 text-xs">Finger-spelling · American Sign Language</p>
          </div>
        </div>
        <button
          onClick={handleSign}
          disabled={!text}
          className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-40"
        >
          {started ? '↺ Replay' : 'Sign It'}
        </button>
      </div>

      <div className="border-t border-blue-500/20 px-4 pb-4">
        {!started ? (
          <div className="text-center py-6 opacity-30">
            <svg viewBox="0 0 80 100" className="w-12 h-14 mx-auto">
              {HAND['H']}
            </svg>
            <p className="text-blue-400 text-xs mt-2">Press Sign It to begin</p>
          </div>
        ) : (
          <ASLSpeller text={text} active={active} />
        )}

        {text && (
          <p className="text-blue-300/40 text-[10px] text-center mt-2 line-clamp-1">
            "{text.slice(0, 55)}{text.length > 55 ? '…' : ''}"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main VoicePanel export ───────────────────────────────────────────────────
export function VoicePanel({ text, label = 'Read Aloud' }) {
  const [playing, setPlaying] = useState(false);
  const [aslEnabled, setAslEnabled] = useState(false);

  const handleSpeak = async () => {
    if (!text || playing) return;
    setPlaying(true);
    await speakText(text);
    const ms = Math.max(2000, text.split(' ').length * 420);
    setTimeout(() => setPlaying(false), ms);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Voice button */}
        <button
          onClick={handleSpeak}
          disabled={playing || !text}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            playing
              ? 'bg-[#c69e83]/20 text-[#c69e83] border border-[#c69e83]/30'
              : 'bg-[#c69e83] text-[#1a1a1a] hover:bg-[#d4ae93]'
          } disabled:opacity-40`}
        >
          {playing ? (
            <>
              <span className="flex gap-0.5 items-end h-4">
                {[0,1,2].map(i => (
                  <span
                    key={i}
                    className="w-0.5 bg-[#c69e83] rounded-full"
                    style={{
                      height: `${8 + i*4}px`,
                      animation: 'voice-bar 0.8s ease-in-out infinite alternate',
                      animationDelay: `${i*150}ms`,
                    }}
                  />
                ))}
              </span>
              Playing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              {label}
            </>
          )}
        </button>

        {/* ASL toggle */}
        <button
          onClick={() => setAslEnabled(v => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all ${
            aslEnabled
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-white/5 border-slate-300/20 text-slate-500 hover:text-slate-700 hover:border-slate-300/40'
          }`}
          title="Sign language for deaf/HoH patients"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 7a2 2 0 00-2-2 2 2 0 00-2 2v2.171A2 2 0 0015 11a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 00-2 2v6a6 6 0 006 6h2a6 6 0 006-6V7z"/>
          </svg>
          ASL
        </button>
      </div>

      <ASLBridge text={text} enabled={aslEnabled} />

      <style>{`
        @keyframes voice-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}

export default VoicePanel;