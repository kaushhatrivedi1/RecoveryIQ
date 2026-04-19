"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockData } from "@/lib/mockData";
import { Search, Cpu, MapPin, Activity, Wifi, Edit3, Trash2 } from "lucide-react";

function DeviceCard({ device }: { device: typeof mockData.devices[0] }) {
  const actions = [
    { icon: MapPin, label: "LOCATE" },
    { icon: Activity, label: "REPORT" },
    { icon: Wifi, label: "EDIT\nWIFI" },
    { icon: Edit3, label: "EDIT\nNAME" },
    { icon: Trash2, label: "REMOVE" },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
    >
      {/* Card body */}
      <div className="p-6 flex-1">
        {/* Icon + name */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#fef9ee" }}
          >
            <Cpu className="w-7 h-7 text-amber-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{device.name}</h3>
        </div>

        {/* MAC label box */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: "var(--bg-main)", border: "1px solid var(--border-color)" }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Hardware MAC
          </span>
          <span className="text-sm font-mono font-semibold" style={{ color: "var(--text-secondary)" }}>
            {device.mac}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div
        className="grid border-t"
        style={{
          gridTemplateColumns: "repeat(5, 1fr)",
          borderColor: "var(--border-color)",
        }}
      >
        {actions.map((action, i) => (
          <button
            key={action.label}
            className="flex flex-col items-center justify-center py-3.5 gap-1.5 transition-colors hover:bg-gray-50 group"
            style={{
              borderRight: i < actions.length - 1 ? "1px solid var(--border-light)" : "none",
            }}
          >
            <action.icon
              className="w-4 h-4 group-hover:opacity-80 transition-opacity"
              style={{ color: action.label === "REMOVE" ? "#ef4444" : "var(--text-secondary)" }}
              strokeWidth={1.5}
            />
            <span
              className="text-[8.5px] font-bold tracking-wider text-center leading-tight"
              style={{ color: action.label === "REMOVE" ? "#ef4444" : "var(--text-muted)" }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockData.devices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.mac.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-3xl font-bold mb-1 tracking-tight" style={{ color: "var(--text-primary)" }}>
              DEVICES FLEET
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage clinical hardware connections and firmware protocols.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
            style={{ backgroundColor: "#1a2d35" }}
          >
            + Register Device
          </button>
        </div>

        {/* Search bar */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center gap-3 mb-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by hardware name, MAC ID or protocol type..."
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {/* Device cards grid */}
        <div className="grid grid-cols-2 gap-5">
          {filtered.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">No devices match your filter.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
