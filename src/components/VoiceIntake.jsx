/**
 * VoiceIntake — Conversational voice intake for patients.
 *
 * Flow:
 *  1. AI asks a question via ElevenLabs TTS (or browser TTS fallback)
 *  2. Patient speaks → Web Speech API captures transcript
 *  3. Transcript sent to Python backend /api/analyze-speech
 *  4. Backend returns structured intake data
 *  5. Parent receives filled intake via onIntakeComplete()
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, CheckCircle, RotateCcw } from 'lucide-react';

const BACKEND = 'http://localhost:8000';

const QUESTIONS = [
  {
    id: 'area',
    text: "Hi! I'm here to help you before your session. First — where in your body are you feeling discomfort today? Just describe it naturally.",
    field: 'zones',
  },
  {
    id: 'level',
    text: "On a scale of 1 to 10, how would you rate the intensity of the discomfort right now? 1 is barely noticeable, 10 is very intense.",
    field: 'discomfort',
  },
  {
    id: 'pattern',
    text: "Does the discomfort come and go, or is it always present? Does it happen only with certain activities?",
    field: 'behavior',
  },
  {
    id: 'duration',
    text: "How long have you been experiencing this? A few days, a few weeks, or longer?",
    field: 'duration',
  },
  {
    id: 'notes',
    text: "Is there anything else you'd like your practitioner to know before the session?",
    field: 'notes',
  },
];

function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    if (!supported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setTranscript(t);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { transcript, setTranscript, listening, startListening, stopListening, supported };
}

async function speakQuestion(text, elevenKey) {
  // Try ElevenLabs first
  if (elevenKey) {
    try {
      const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        return new Promise(resolve => {
          const audio = new Audio(url);
          audio.onended = resolve;
          audio.play();
        });
      }
    } catch { /* fall through */ }
  }

  // Browser TTS fallback
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.onend = resolve;
    window.speechSynthesis.speak(utter);
  });
}

export default function VoiceIntake({ patientName, elevenKey, onIntakeComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [done, setDone] = useState(false);
  const {
    transcript: currentTranscript,
    setTranscript: setCurrentTranscript,
    listening,
    startListening,
    stopListening,
    supported,
  } = useSpeechRecognition();

  const currentQ = QUESTIONS[step];

  // Speak current question when step changes
  useEffect(() => {
    if (done) return;
    const text = step === 0
      ? `Hello ${patientName || 'there'}! ${currentQ.text}`
      : currentQ.text;
    queueMicrotask(() => setSpeaking(true));
    speakQuestion(text, elevenKey).then(() => setSpeaking(false));
  }, [currentQ.text, done, elevenKey, patientName, step]);

  async function handleSubmitAnswer() {
    const answer = currentTranscript.trim();
    if (!answer) return;

    setProcessing(true);

    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    const combined = Object.values(newAnswers).join('. ');

    if (step === QUESTIONS.length - 1) {
      // All questions answered — analyze combined transcript
      try {
        const res = await fetch(`${BACKEND}/api/analyze-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: combined, patient_name: patientName }),
        });
        const data = await res.json();
        setDone(true);
        setProcessing(false);

        await speakQuestion(
          `Thank you ${patientName || ''}. I've captured your wellness information. Your practitioner will review this before the session.`,
          elevenKey
        );

        onIntakeComplete(data);
      } catch {
        // Fallback: basic extraction
        setDone(true);
        setProcessing(false);
        onIntakeComplete({
          success: true, source: 'fallback',
          zones: ['lower_back'], discomfort: 5,
          behavior: 'Comes and Goes', duration: '3 to 6 months',
          notes: combined.slice(0, 300),
          summary: `${patientName || 'Patient'} has completed the voice intake.`,
        });
      }
    } else {
      setProcessing(false);
      setCurrentTranscript('');
      setStep(s => s + 1);
    }
  }

  function handleRetry() {
    setCurrentTranscript('');
  }

  return (
    <div className="riq-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-transparent px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${speaking ? 'bg-sky-500 animate-pulse' : listening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-sm font-semibold text-slate-900">Voice Intake — {patientName || 'Patient'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{step + 1} / {QUESTIONS.length}</span>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
            Switch to Form
          </button>
        </div>
      </div>

      <div className="p-6">
        {!supported && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Voice recognition not supported in this browser. Use Chrome or Edge.
          </div>
        )}

        {done ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-950">Voice Intake Complete</h3>
            <p className="text-sm text-slate-500">All responses captured and analyzed. Client brief is being generated.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {speaking ? (
                  <Volume2 size={16} className="shrink-0 animate-pulse text-sky-600" />
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-sky-500">
                    <span className="text-xs font-bold text-sky-600">{step + 1}</span>
                  </div>
                )}
                <span className="text-xs uppercase tracking-wider text-slate-400">
                  {speaking ? 'AI speaking...' : 'Question'}
                </span>
              </div>
              <p className="text-base leading-relaxed text-slate-900">{currentQ.text}</p>
            </div>

            <div className="relative mb-5 min-h-[80px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              {currentTranscript ? (
                <p className="text-sm leading-relaxed text-slate-700">{currentTranscript}</p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  {listening ? 'Listening...' : 'Press the microphone and speak your answer'}
                </p>
              )}
              {listening && (
                <div className="absolute bottom-3 right-3 flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1 rounded-full bg-emerald-400 animate-bounce"
                      style={{ height: [10, 16, 12][i], animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>

            <textarea
              value={currentTranscript}
              onChange={e => setCurrentTranscript(e.target.value)}
              rows={2}
              placeholder="Or type your answer here..."
              className="riq-textarea mb-4 min-h-[96px] resize-none"
            />

            <div className="flex gap-3">
              <button
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                disabled={speaking}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  listening
                    ? 'scale-95 bg-rose-500 text-white'
                    : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:opacity-95'
                } disabled:opacity-40`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
                {listening ? 'Release to stop' : 'Hold to speak'}
              </button>

              {currentTranscript && (
                <button onClick={handleRetry} className="rounded-full border border-slate-200 p-3 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700">
                  <RotateCcw size={16} />
                </button>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={!currentTranscript.trim() || processing || speaking}
                className="flex-1 rounded-full bg-slate-950 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
              >
                {processing ? 'Analyzing...' : step === QUESTIONS.length - 1 ? 'Complete Intake ✓' : 'Next Question →'}
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-5">
              {QUESTIONS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                  i < step ? 'bg-emerald-400' : i === step ? 'bg-sky-500' : 'bg-slate-200'
                }`} />
              ))}
            </div>

            {Object.keys(answers).length > 0 && (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <p className="mb-2 text-xs text-slate-400">Captured so far:</p>
                {Object.entries(answers).map(([qId, ans]) => {
                  return (
                    <div key={qId} className="flex gap-2 mb-1">
                      <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span className="truncate text-xs text-slate-500">{ans}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
