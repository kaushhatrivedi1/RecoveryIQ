"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { BookOpen, Zap, Users } from "lucide-react";
import { useState } from "react";

type ClientMode = "client" | "guest" | "new";

export default function SessionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ClientMode>("guest");

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Session Manager</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Intelligent Mapping and Customize Sessions</p>
        </div>

        {/* Session Client Card */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            {/* Left */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} strokeWidth={1.75} />
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
                  Session Client
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Proceeding as{" "}
                <span className="font-semibold" style={{ color: "var(--accent-tan)" }}>
                  {mode === "guest" ? "Guest" : mode === "client" ? "Client" : "New Client"}
                </span>
                .{" "}
                {mode === "guest" ? "No client history will be saved." : "Client history will be recorded."}
              </p>
            </div>

            {/* Segmented control */}
            <div className="flex items-center gap-2">
              <div
                className="flex rounded-xl overflow-hidden border p-0.5 gap-0.5"
                style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-main)" }}
              >
                <button
                  onClick={() => setMode("client")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={
                    mode === "client"
                      ? { backgroundColor: "#1a2d35", color: "#fff" }
                      : { color: "var(--text-secondary)", backgroundColor: "transparent" }
                  }
                >
                  <Users className="w-3 h-3" strokeWidth={2} />
                  CLIENT
                </button>
                <button
                  onClick={() => setMode("guest")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-150"
                  style={
                    mode === "guest"
                      ? { backgroundColor: "#1a2d35", color: "#fff" }
                      : { color: "var(--text-secondary)", backgroundColor: "transparent" }
                  }
                >
                  <Users className="w-3 h-3" strokeWidth={2} />
                  GUEST
                </button>
              </div>
              <button
                onClick={() => setMode("new")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150"
                style={{
                  backgroundColor: mode === "new" ? "#1a2d35" : "var(--accent-tan-light)",
                  color: mode === "new" ? "#fff" : "var(--accent-copper)",
                  border: `1px solid ${mode === "new" ? "transparent" : "var(--accent-tan)"}`,
                }}
              >
                + NEW CLIENT
              </button>
            </div>
          </div>
        </div>

        {/* Choose Session Type */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>Choose Session Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Guided Assessment */}
            <button
              onClick={() => router.push("/session/guided-assessment")}
              className="rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] group"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1.5px solid var(--accent-tan)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "var(--accent-tan-light)" }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-1.5" style={{ color: "var(--text-primary)" }}>Guided Assessment</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Analyze movement and generate a recommended session configuration.
                  </p>
                </div>
              </div>
            </button>

            {/* Quick Start Session */}
            <button
              className="rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01] group"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1.5px solid var(--accent-tan)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "var(--accent-tan-light)" }}
                >
                  <Zap className="w-5 h-5" style={{ color: "var(--accent-copper)" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-1.5" style={{ color: "var(--text-primary)" }}>Quick Start Session</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Manually configure and start your session immediately.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
