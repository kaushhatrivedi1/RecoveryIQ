"use client";

import { AppShell } from "@/components/layout/AppShell";
import { useRouter } from "next/navigation";
import { Play, Plus, ArrowRight, Activity, TrendingDown, Users } from "lucide-react";

function AnalyticsCard({
  icon,
  label,
  value,
  sub,
  subIcon,
  bg,
  accent,
  shape,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subIcon?: React.ReactNode;
  bg: string;
  accent: string;
  shape?: "green" | "purple";
}) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-color)" }}
    >
      {/* Background shape */}
      {shape === "green" && (
        <svg className="absolute bottom-0 right-0 w-28 h-20 opacity-80" viewBox="0 0 120 80" fill="none">
          <path d="M 120 80 Q 60 40 0 80" fill="#bbf7d0" />
        </svg>
      )}
      {shape === "purple" && (
        <svg className="absolute bottom-0 right-0 w-28 h-20 opacity-70" viewBox="0 0 120 80" fill="none">
          <path d="M 120 80 Q 70 30 0 80" fill="#e9d5ff" />
        </svg>
      )}

      <div className="flex items-center gap-2 mb-3">
        <span className={accent}>{icon}</span>
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      </div>
      <div className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {subIcon}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Welcome back, <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Annie Sturm</span>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-secondary)" }}>
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Start New Session – dark card */}
            <button
              onClick={() => router.push("/session")}
              className="relative rounded-2xl p-6 text-left group overflow-hidden transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
              style={{ backgroundColor: "#1a2d35", boxShadow: "0 4px 16px rgba(26,45,53,0.3)" }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
              <p className="text-white font-bold text-lg mb-1">Start New Session</p>
              <p className="text-white/55 text-sm">Configure devices and begin therapy</p>
            </button>

            {/* Add New Client – light card */}
            <button
              onClick={() => router.push("/clients")}
              className="relative rounded-2xl p-6 text-left group transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-tan-light)" }}
                >
                  <Plus className="w-5 h-5" style={{ color: "var(--accent-copper)" }} strokeWidth={2} />
                </div>
                <ArrowRight className="w-5 h-5 mt-2" style={{ color: "var(--text-secondary)" }} strokeWidth={2} />
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Add New Client</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Complete intake form and analysis</p>
            </button>
          </div>
        </div>

        {/* Practice Analytics */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-secondary)" }}>
            Practice Analytics
          </p>
          <div className="grid grid-cols-3 gap-4">
            <AnalyticsCard
              icon={<Activity className="w-4 h-4" strokeWidth={1.75} />}
              label="Total Sessions"
              value="3"
              sub="vs last month"
              subIcon={<span className="text-green-600 font-semibold">↑ 0%</span>}
              bg="#f0fdf4"
              accent="text-blue-500"
            />
            <AnalyticsCard
              icon={<TrendingDown className="w-4 h-4" strokeWidth={1.75} />}
              label="Avg. Pain Reduction"
              value="52%"
              sub="Based on pre/post session scores"
              bg="#f7fee7"
              accent="text-green-500"
              shape="green"
            />
            <AnalyticsCard
              icon={<Users className="w-4 h-4" strokeWidth={1.75} />}
              label="Total Clients"
              value="15"
              sub="Current users"
              bg="#faf5ff"
              accent="text-purple-500"
              shape="purple"
            />
          </div>
        </div>

        {/* Business Resources */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-secondary)" }}>
            Business Resources & Growth
          </p>
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
          >
            <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>
              Training materials and business growth tools coming soon.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
