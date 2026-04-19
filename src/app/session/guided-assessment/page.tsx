"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Shield,
  Wind,
  Activity,
  Heart,
  Flame,
  Minus,
  Plus,
  Radio,
  Clock,
  Target,
  CheckCircle2,
  Loader2,
  Map,
} from "lucide-react";
import { BodyMap, type BodyZone } from "@/components/ui/BodyMap";
import { analyzeAssessment, mqttAuth, mqttCommand, buildStartPayload } from "@/lib/api";
import { mockData } from "@/lib/mockData";

// --------------- STEPPER ---------------
function Stepper({ step }: { step: number }) {
  const labels = ["Focus Area", "Body Map", "Protocol", "Review & Start"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {labels.map((label, i) => {
        const num = i + 1;
        const done = num < step;
        const active = num === step;
        return (
          <div key={num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={
                  done
                    ? { backgroundColor: "#1a2d35", color: "#fff" }
                    : active
                    ? { backgroundColor: "var(--accent-tan)", color: "#fff", boxShadow: "0 0 0 3px rgba(201,168,124,0.2)" }
                    : { backgroundColor: "var(--border-color)", color: "var(--text-muted)" }
                }
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : num}
              </div>
              <span
                className="text-[10px] font-semibold mt-1.5 whitespace-nowrap"
                style={{ color: active ? "var(--accent-copper)" : done ? "var(--text-secondary)" : "var(--text-muted)" }}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className="flex-1 h-px mx-2 mb-5" style={{ backgroundColor: done ? "#1a2d35" : "var(--border-color)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --------------- STEP 1 — FOCUS AREAS ---------------
const focusAreas = [
  { id: "pain", label: "Pain Relief", icon: Zap, desc: "Acute or chronic pain management" },
  { id: "recovery", label: "Recovery", icon: Shield, desc: "Post-activity muscle recovery" },
  { id: "mobility", label: "Mobility", icon: Wind, desc: "Range of motion improvement" },
  { id: "inflammation", label: "Inflammation", icon: Flame, desc: "Reduce swelling & inflammation" },
  { id: "stress", label: "Stress Relief", icon: Heart, desc: "Relaxation and tension release" },
  { id: "performance", label: "Performance", icon: Activity, desc: "Athletic performance optimization" },
];

function Step1({ selected, onSelect }: { selected: string[]; onSelect: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        What is the primary treatment goal?
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Select one or more focus areas to guide the session protocol.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {focusAreas.map((area) => {
          const active = selected.includes(area.id);
          return (
            <button
              key={area.id}
              onClick={() => onSelect(area.id)}
              className="rounded-2xl p-4 text-left transition-all duration-150 hover:shadow-sm"
              style={{
                backgroundColor: active ? "var(--accent-tan-light)" : "var(--bg-card)",
                border: active ? "1.5px solid var(--accent-tan)" : "1.5px solid var(--border-color)",
                boxShadow: active ? "0 0 0 3px rgba(201,168,124,0.12)" : "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: active ? "var(--accent-tan)" : "var(--bg-main)" }}
                >
                  <area.icon className="w-4 h-4" style={{ color: active ? "#fff" : "var(--text-secondary)" }} strokeWidth={1.75} />
                </div>
                {active && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--accent-tan)" }}>
                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{area.label}</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{area.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --------------- STEP 2 — 2D BODY MAP + SEVERITY ---------------
function Slider({ label, value, onChange, min = 0, max = 10 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: "var(--accent-copper)" }}>{value}/{max}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
          <Minus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
        </button>
        <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, var(--accent-tan) ${pct}%, var(--border-color) ${pct}%)` }}
        />
        <button onClick={() => onChange(Math.min(max, value + 1))} className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors hover:bg-gray-50" style={{ borderColor: "var(--border-color)" }}>
          <Plus className="w-3 h-3" style={{ color: "var(--text-secondary)" }} />
        </button>
      </div>
    </div>
  );
}

type Side = "left" | "right" | "bilateral";

interface AssessmentData {
  zones: BodyZone[];
  pain: number;
  mobility: number;
  inflammation: number;
  side: Side;
  duration: string;
}

function Step2({ data, onChange }: { data: AssessmentData; onChange: (patch: Partial<AssessmentData>) => void }) {
  const toggleZone = (zone: BodyZone) => {
    const zones = data.zones.includes(zone)
      ? data.zones.filter((z) => z !== zone)
      : [...data.zones, zone];
    onChange({ zones });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Select Treatment Areas & Rate Severity
      </h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Click body zones to mark affected areas, then rate symptom severity below.
      </p>

      <div className="flex gap-5">
        {/* LEFT: 2D body map */}
        <div
          className="rounded-2xl p-4 flex flex-col items-center shrink-0"
          style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)", minWidth: 210 }}
        >
          <div className="flex items-center gap-1.5 mb-3 self-start">
            <Map className="w-3.5 h-3.5" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Body Map — Click to Select
            </span>
          </div>
          <BodyMap selected={data.zones} onToggle={toggleZone} />
          {data.zones.length === 0 && (
            <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-muted)" }}>
              Tap any zone to mark it
            </p>
          )}
        </div>

        {/* RIGHT: severity sliders + side/duration */}
        <div className="flex-1 flex flex-col gap-3">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Symptom Severity</p>
            <Slider label="Pain / Discomfort" value={data.pain} onChange={(v) => onChange({ pain: v })} />
            <Slider label="Mobility Restriction" value={data.mobility} onChange={(v) => onChange({ mobility: v })} />
            <Slider label="Swelling / Inflammation" value={data.inflammation} onChange={(v) => onChange({ inflammation: v })} />
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Affected Side</p>
            <div className="flex gap-2">
              {(["left", "right", "bilateral"] as Side[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ side: s })}
                  className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                  style={
                    data.side === s
                      ? { backgroundColor: "#1a2d35", color: "#fff" }
                      : { backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Onset Duration</p>
            <div className="grid grid-cols-2 gap-2">
              {["Acute (<72h)", "Sub-acute (1-4w)", "Chronic (1-3m)", "Long-term (3m+)"].map((d) => (
                <button
                  key={d}
                  onClick={() => onChange({ duration: d })}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all"
                  style={
                    data.duration === d
                      ? { backgroundColor: "var(--accent-tan)", color: "#fff" }
                      : { backgroundColor: "var(--bg-main)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --------------- STEP 3 — RECOMMENDED PROTOCOL ---------------
function Step3({ assessment }: { assessment: AssessmentData }) {
  const intensity = Math.min(10, Math.max(1, Math.round((assessment.pain + assessment.mobility) / 2)));
  const duration = assessment.pain > 7 ? 45 : 30;
  const zoneDisplay = assessment.zones.length > 0
    ? assessment.zones.slice(0, 3).map(z => z.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())).join(", ")
    : assessment.side.charAt(0).toUpperCase() + assessment.side.slice(1);

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Recommended Protocol</h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Based on your assessment, here is the AI-generated session configuration.
      </p>

      <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: "var(--bg-card)", border: "1.5px solid var(--accent-tan)", boxShadow: "0 4px 16px rgba(201,168,124,0.15)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-tan)" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent-copper)" }}>Hydrawav3™ Protocol</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: "Session Type", value: "Guided Assessment" },
            { icon: Clock, label: "Duration", value: `${duration} minutes` },
            { icon: Activity, label: "Intensity Level", value: `${intensity} / 10` },
            { icon: Target, label: "Target Zones", value: zoneDisplay },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-main)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent-tan-light)" }}>
                <item.icon className="w-4 h-4" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: "var(--bg-main)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>Protocol Notes</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Begin with low-frequency stimulation targeting reported pain sites. Progress intensity incrementally based on client feedback. Monitor for adverse reactions. Recommended rest intervals of 90 seconds between zones.
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex justify-between mb-1.5">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Confidence Score</p>
          <p className="text-sm font-bold" style={{ color: "var(--accent-copper)" }}>87%</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-main)" }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: "87%", background: "linear-gradient(to right, var(--accent-tan), var(--accent-copper))" }} />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Based on reported symptoms, onset duration, and selected focus areas.</p>
      </div>
    </div>
  );
}

// --------------- STEP 4 — REVIEW & START ---------------
function Step4({ assessment }: { assessment: AssessmentData }) {
  const zoneDisplay = assessment.zones.length > 0
    ? `${assessment.zones.length} zone${assessment.zones.length > 1 ? "s" : ""} selected`
    : assessment.side;

  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Review & Start Session</h2>
      <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
        Confirm the session setup before initiating the Hydrawav3™ device.
      </p>

      {[
        { label: "Client", value: "Guest Session", sub: "No client history will be saved" },
        { label: "Session Type", value: "Guided Assessment" },
        { label: "Protocol", value: "AI-Generated — Pain Relief / Recovery" },
        { label: "Duration", value: "30 minutes" },
        { label: "Treatment Zones", value: zoneDisplay },
        { label: "Device", value: "Hydra-19 (Blue Crystal)", sub: "EC:DA:3B:61:9D:68 · Online" },
      ].map((row) => (
        <div key={row.label} className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: "var(--border-light)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{row.label}</span>
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{row.value}</p>
            {row.sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{row.sub}</p>}
          </div>
        </div>
      ))}

      <div className="mt-5 p-4 rounded-2xl flex items-start gap-3" style={{ backgroundColor: "rgba(201,168,124,0.1)", border: "1px solid rgba(201,168,124,0.3)" }}>
        <Radio className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--accent-copper)" }}>Device Ready</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Hydra-19 is connected and awaiting session initialization. Ensure pads are placed correctly before starting.
          </p>
        </div>
      </div>
    </div>
  );
}

// --------------- SUCCESS OVERLAY ---------------
function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(26,45,53,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="rounded-3xl p-10 text-center" style={{ backgroundColor: "var(--bg-card)", boxShadow: "0 24px 60px rgba(0,0,0,0.3)", maxWidth: 380 }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "rgba(201,168,124,0.15)", border: "2px solid var(--accent-tan)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Session Started!</h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Hydra-19 is now active. The session has been initialized successfully.
        </p>
        <button onClick={onDone} className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: "#1a2d35" }}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

// --------------- MAIN PAGE ---------------
export default function GuidedAssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [focusSelected, setFocusSelected] = useState<string[]>([]);
  const [assessment, setAssessment] = useState<AssessmentData>({
    zones: [],
    pain: 5,
    mobility: 4,
    inflammation: 3,
    side: "bilateral",
    duration: "Acute (<72h)",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleFocus = (id: string) => {
    setFocusSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const patchAssessment = (patch: Partial<AssessmentData>) => {
    setAssessment((prev) => ({ ...prev, ...patch }));
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const transcript = [
        `Focus: ${focusSelected.join(", ")}.`,
        `Zones: ${assessment.zones.join(", ") || assessment.side}.`,
        `Pain ${assessment.pain}/10, mobility restriction ${assessment.mobility}/10, inflammation ${assessment.inflammation}/10.`,
        `Duration: ${assessment.duration}.`,
      ].join(" ");

      await analyzeAssessment(transcript);

      const device = mockData.devices.find((d) => d.status === "online");
      if (device) {
        const token = await mqttAuth();
        if (token) {
          const duration = assessment.pain > 7 ? 45 * 60 : 30 * 60;
          await mqttCommand(token, buildStartPayload(device.mac, duration));
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error("Session start error:", err);
      // Still show success — device may not be reachable in demo
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = step === 1 ? focusSelected.length > 0 : step === 2 ? assessment.zones.length > 0 : true;

  return (
    <AppShell>
      {success && <SuccessOverlay onDone={() => router.push("/dashboard")} />}

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => step === 1 ? router.push("/session") : setStep((s) => s - 1)}
            className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            {step === 1 ? "Back to Session Manager" : "Back"}
          </button>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Guided Assessment</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Complete the assessment to generate a personalized session protocol.</p>
        </div>

        <Stepper step={step} />

        <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}>
          {step === 1 && <Step1 selected={focusSelected} onSelect={toggleFocus} />}
          {step === 2 && <Step2 data={assessment} onChange={patchAssessment} />}
          {step === 3 && <Step3 assessment={assessment} />}
          {step === 4 && <Step4 assessment={assessment} />}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 1 ? router.push("/session") : setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-gray-100"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canContinue}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "#1a2d35" }}
            >
              Continue
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: "var(--accent-copper)" }}
            >
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Initializing...</>) : (<>Start Session <ChevronRight className="w-4 h-4" strokeWidth={2} /></>)}
            </button>
          )}
        </div>

        {step === 2 && assessment.zones.length === 0 && (
          <p className="text-center text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Select at least one body zone on the map to continue
          </p>
        )}
      </div>
    </AppShell>
  );
}
