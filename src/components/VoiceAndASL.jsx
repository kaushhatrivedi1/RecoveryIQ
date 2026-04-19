// src/components/VoiceAndASL.jsx
// Member 4 — ElevenLabs Voice Integration + ASL Communication Bridge
// Drop into src/components/VoiceAndASL.jsx
// Uses speakText from src/services/api.js (already built)

import { useState, useRef } from 'react';
import { speakText } from '../services/api';

// ─── ASL Bridge ───────────────────────────────────────────────────────────────
// Uses Hand Talk widget (free tier) OR falls back to animated SVG hands
// To enable Hand Talk: add <script src="https://api.handtalk.me/plugin/latest/handtalk.min.js"></script> to index.html
// and set VITE_HANDTALK_TOKEN in .env

function ASLBridge({ text, enabled, onToggle }) {
  const [aslActive, setAslActive] = useState(false);
  const [translating, setTranslating] = useState(false);

  const triggerASL = async () => {
    if (!enabled || !text) return;
    setTranslating(true);
    setAslActive(true);

    // Hand Talk integration
    try {
      if (window.HT) {
        window.HT.translate(text);
      }
    } catch (e) {
      console.warn('Hand Talk not loaded, using visual fallback');
    }

    setTimeout(() => setTranslating(false), 1500);
  };

  if (!enabled) return null;

  return (
    <div className="border border-blue-500/20 rounded-xl overflow-hidden bg-blue-500/5">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* ASL hand icon */}
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 7a2 2 0 00-2-2 2 2 0 00-2 2v2.171A2 2 0 0015 11a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 00-2 2v6a6 6 0 006 6h2a6 6 0 006-6V7z"/>
            </svg>
          </div>
          <div>
            <p className="text-blue-300 text-sm font-medium">ASL Translation</p>
            <p className="text-blue-400/60 text-xs">Accessibility mode active</p>
          </div>
        </div>
        <button
          onClick={triggerASL}
          disabled={translating || !text}
          className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
        >
          {translating ? 'Translating...' : 'Show ASL'}
        </button>
      </div>

      {aslActive && (
        <div className="border-t border-blue-500/20 px-4 py-3">
          {/* Hand Talk renders into #ht-avatar div */}
          <div id="ht-avatar" className="min-h-[120px] flex items-center justify-center">
            {translating ? (
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-blue-400/60 text-xs">Translating to ASL...</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                {/* Animated hand SVGs as visual fallback */}
                <div className="flex gap-4 justify-center">
                  <ASLHandAnimation />
                </div>
                <p className="text-blue-300/60 text-xs max-w-xs">
                  "{text?.slice(0, 80)}{text?.length > 80 ? '...' : ''}"
                </p>
                <p className="text-blue-400/40 text-xs">ASL avatar rendering above</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple animated hand SVG for visual demo fallback
function ASLHandAnimation() {
  return (
    <svg width="60" height="80" viewBox="0 0 60 80" className="animate-pulse">
      <g fill="#60a5fa" opacity="0.8">
        {/* Palm */}
        <ellipse cx="30" cy="55" rx="18" ry="20" />
        {/* Fingers */}
        <rect x="12" y="20" width="8" height="30" rx="4" />
        <rect x="22" y="15" width="8" height="35" rx="4" />
        <rect x="32" y="17" width="8" height="33" rx="4" />
        <rect x="42" y="22" width="7" height="28" rx="3.5" />
        {/* Thumb */}
        <ellipse cx="10" cy="45" rx="5" ry="14" transform="rotate(-20 10 45)" />
      </g>
    </svg>
  );
}

// ─── Voice Panel ──────────────────────────────────────────────────────────────
export function VoicePanel({ text, label = 'Read Aloud', patientName = '' }) {
  const [playing, setPlaying] = useState(false);
  const [aslEnabled, setAslEnabled] = useState(false);

  const handleSpeak = async () => {
    if (!text || playing) return;
    setPlaying(true);
    await speakText(text);
    // Approximate duration
    const duration = Math.max(2000, text.split(' ').length * 400);
    setTimeout(() => setPlaying(false), duration);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {/* Play button */}
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
              <span className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-0.5 bg-[#c69e83] rounded-full animate-pulse" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 150}ms` }} />
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
          onClick={() => setAslEnabled(!aslEnabled)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all ${
            aslEnabled
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:text-white'
          }`}
          title="Toggle ASL translation for deaf/HoH patients"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 7a2 2 0 00-2-2 2 2 0 00-2 2v2.171A2 2 0 0015 11a2 2 0 00-2-2 2 2 0 00-2 2 2 2 0 00-2-2 2 2 0 00-2 2v6a6 6 0 006 6h2a6 6 0 006-6V7z"/>
          </svg>
          ASL
        </button>
      </div>

      <ASLBridge text={text} enabled={aslEnabled} onToggle={setAslEnabled} />
    </div>
  );
}

export default VoicePanel;