import { useRef, useState, useCallback } from 'react';
import { CheckCircle, Mic, MicOff, RotateCcw, Volume2 } from 'lucide-react';
import { speakText } from '../services/api';

const BACKEND = 'http://localhost:8000';

const QUESTIONS = [
  {
    id: 'area',
    text: 'Choose the main area first. Say the exact body area keyword, for example: lower back, neck, right hip, left shoulder, upper back, right knee.',
    options: ['lower back', 'neck', 'right hip', 'left shoulder', 'upper back', 'right knee'],
    placeholder: 'Say or type an exact area keyword like "lower back" or "right hip"...',
  },
  {
    id: 'level',
    text: 'Use one number from 1 to 10 only. Example: 3, 5, or 8.',
    options: ['2', '4', '5', '7', '8'],
    placeholder: 'Say or type one number from 1 to 10...',
  },
  {
    id: 'pattern',
    text: 'Choose one exact phrase: Comes and Goes, Always Present, Only with Certain Activities, or Varies Day to Day.',
    options: ['Comes and Goes', 'Always Present', 'Only with Certain Activities', 'Varies Day to Day'],
    placeholder: 'Say one exact phrase like "Comes and Goes"...',
  },
  {
    id: 'duration',
    text: 'Choose one exact time bucket: Less than 6 weeks, 6 weeks to 3 months, 3 to 6 months, 6 months to 1 year, or More than 1 year.',
    options: ['Less than 6 weeks', '6 weeks to 3 months', '3 to 6 months', '6 months to 1 year', 'More than 1 year'],
    placeholder: 'Say one exact duration bucket...',
  },
  {
    id: 'notes',
    text: 'Add one short note about what makes it worse or better. Example: worse with sitting, better with stretching.',
    options: ['worse with sitting', 'worse with standing', 'better with stretching', 'better with walking'],
    placeholder: 'Say one short note like "worse with sitting"...',
  },
];

const BODY_ZONE_KEYWORDS = {
  neck: ['neck', 'cervical', 'throat', 'nape'],
  left_shoulder: ['left shoulder', 'left arm', 'left rotator'],
  right_shoulder: ['right shoulder', 'right arm', 'right rotator'],
  upper_back: ['upper back', 'between shoulders', 'thoracic', 'traps'],
  lower_back: ['lower back', 'lumbar', 'low back', 'spine', 'back'],
  left_hip: ['left hip', 'left glute', 'left pelvis'],
  right_hip: ['right hip', 'right glute', 'it band', 'hip flexor'],
  left_knee: ['left knee', 'left patella'],
  right_knee: ['right knee', 'right patella'],
  left_calf: ['left calf', 'left shin', 'left leg'],
  right_calf: ['right calf', 'right shin', 'right leg'],
  chest: ['chest', 'pec', 'sternum'],
  left_arm: ['left elbow', 'left forearm', 'left bicep'],
  right_arm: ['right elbow', 'right forearm', 'right bicep'],
  left_foot: ['left foot', 'left ankle', 'left heel'],
  right_foot: ['right foot', 'right ankle', 'right heel'],
};

const DURATION_KEYWORDS = {
  'Less than 6 weeks': ['few days', 'week', 'recently', 'just started', 'new', 'acute'],
  '6 weeks to 3 months': ['month', 'couple months', 'few months'],
  '3 to 6 months': ['three months', 'four months', 'five months', 'several months'],
  '6 months to 1 year': ['six months', 'half year', 'most of the year'],
  'More than 1 year': ['year', 'years', 'long time', 'chronic', 'forever', 'always'],
};

const BEHAVIOR_KEYWORDS = {
  'Always Present': ['always', 'constant', 'never goes away', 'all the time', 'every day'],
  'Comes and Goes': ['comes and goes', 'sometimes', 'on and off', 'flares up', 'intermittent'],
  'Only with Certain Activities': ['when i', 'during', 'only when', 'after exercise', 'only with'],
  'Varies Day to Day': ['some days', 'varies', 'depends', 'better some days', 'worse some days'],
};

function localAnalyzeTranscript(transcript, patientName) {
  const text = transcript.toLowerCase();

  const zones = Object.entries(BODY_ZONE_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([zone]) => zone);

  let duration = '3 to 6 months';
  for (const [label, keywords] of Object.entries(DURATION_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      duration = label;
      break;
    }
  }

  let behavior = 'Comes and Goes';
  for (const [label, keywords] of Object.entries(BEHAVIOR_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      behavior = label;
      break;
    }
  }

  const discomfortMatch = text.match(/\b([1-9]|10)\b/);
  const discomfort = discomfortMatch ? Number(discomfortMatch[1]) : 5;

  return {
    success: true,
    source: 'local_fallback',
    zones: zones.length > 0 ? zones : ['lower_back'],
    discomfort,
    behavior,
    duration,
    notes: transcript.slice(0, 300),
    patient_name: patientName || '',
    summary: `${patientName || 'Patient'} completed the intake conversation.`,
  };
}

function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const startListening = useCallback(() => {
    if (!supported || listening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join(' ');
      setTranscript(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, supported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { transcript, setTranscript, listening, startListening, stopListening, supported };
}

export default function VoiceIntake({ patientName, onIntakeComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);
  const [playingPrompt, setPlayingPrompt] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const {
    transcript: currentTranscript,
    setTranscript: setCurrentTranscript,
    listening,
    startListening,
    stopListening,
    supported,
  } = useSpeechRecognition();

  const currentQuestion = QUESTIONS[step];

  async function playPrompt(text) {
    setPlayingPrompt(true);
    try {
      await Promise.race([
        speakText(text),
        new Promise((resolve) => window.setTimeout(resolve, 6000)),
      ]);
    } finally {
      setPlayingPrompt(false);
    }
  }

  async function handleSubmitAnswer() {
    const answer = currentTranscript.trim();
    if (!answer) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(nextAnswers);

    if (step === QUESTIONS.length - 1) {
      setProcessing(true);
      const combinedTranscript = Object.values(nextAnswers).join('. ');
      try {
        const response = await fetch(`${BACKEND}/api/analyze-speech`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: combinedTranscript, patient_name: patientName }),
        });
        const data = await response.json();
        onIntakeComplete(data?.zones?.length ? data : localAnalyzeTranscript(combinedTranscript, patientName));
      } catch {
        onIntakeComplete(localAnalyzeTranscript(combinedTranscript, patientName));
      } finally {
        setProcessing(false);
        setDone(true);
      }
      return;
    }

    setCurrentTranscript('');
    setStep((current) => current + 1);
  }

  return (
    <div className="riq-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-sky-100 via-cyan-50 to-transparent px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${listening ? 'bg-emerald-400 animate-pulse' : playingPrompt ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-sm font-semibold text-slate-900">Voice Intake</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{Math.min(step + 1, QUESTIONS.length)} / {QUESTIONS.length}</span>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900">
            Close
          </button>
        </div>
      </div>

      <div className="p-6">
        {!supported && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            Browser speech recognition is not supported here. You can still type answers manually.
          </div>
        )}

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="mb-2 text-xl font-bold text-slate-950">Voice intake complete</h3>
            <p className="text-sm text-slate-500">Your answers have been applied to the intake form.</p>
          </div>
        ) : !started ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
              <Mic size={28} className="text-sky-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Guided voice intake</h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-slate-500">
              Answer five short prompts using your microphone or by typing. Audio playback will never block recording.
            </p>
            <button type="button" onClick={() => setStarted(true)} className="riq-button mx-auto">
              Start intake
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-sky-500">
                    <span className="text-xs font-bold text-sky-600">{step + 1}</span>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-slate-400">Question</span>
                </div>
                <button
                  type="button"
                  onClick={() => playPrompt(step === 0 ? `Hello ${patientName || 'there'}. ${currentQuestion.text}` : currentQuestion.text)}
                  className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 transition-colors hover:border-sky-300 hover:text-sky-600"
                >
                  <Volume2 size={12} />
                  {playingPrompt ? 'Playing...' : 'Play prompt'}
                </button>
              </div>
              <p className="text-base leading-relaxed text-slate-900">{currentQuestion.text}</p>
              {currentQuestion.options?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCurrentTranscript(option)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 transition-colors hover:border-sky-300 hover:text-sky-700"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative mb-5 min-h-[80px] rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              {currentTranscript ? (
                <p className="text-sm leading-relaxed text-slate-700">{currentTranscript}</p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  {listening ? 'Listening...' : 'Use the mic or type your answer below'}
                </p>
              )}
            </div>

            <textarea
              value={currentTranscript}
              onChange={(event) => setCurrentTranscript(event.target.value)}
              rows={3}
              placeholder={currentQuestion.placeholder || 'Type your answer here if you prefer...'}
              className="riq-textarea mb-4 min-h-[110px] resize-none"
            />

            <div className="flex gap-3">
              <button
                type="button"
                onMouseDown={startListening}
                onMouseUp={stopListening}
                onTouchStart={startListening}
                onTouchEnd={stopListening}
                disabled={processing}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  listening ? 'scale-95 bg-rose-500 text-white' : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:opacity-95'
                } disabled:opacity-40`}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
                {listening ? 'Release to stop' : 'Hold to speak'}
              </button>

              {currentTranscript ? (
                <button
                  type="button"
                  onClick={() => setCurrentTranscript('')}
                  className="rounded-full border border-slate-200 p-3 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-700"
                >
                  <RotateCcw size={16} />
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={!currentTranscript.trim() || processing}
                className="flex-1 rounded-full bg-slate-950 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
              >
                {processing ? 'Analyzing...' : step === QUESTIONS.length - 1 ? 'Complete intake' : 'Next question'}
              </button>
            </div>

            {Object.keys(answers).length > 0 ? (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <p className="mb-2 text-xs text-slate-400">Captured so far:</p>
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="mb-1 flex gap-2">
                    <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="truncate text-xs text-slate-500">{value}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
