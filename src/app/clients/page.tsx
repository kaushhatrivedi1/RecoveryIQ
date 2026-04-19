"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { mockData } from "@/lib/mockData";
import { Search, ChevronDown, Play, Trash2, TrendingDown } from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");

  const filteredClients = mockData.clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Clients</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage client records and history.</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
            style={{ backgroundColor: "#1a2d35" }}
          >
            + New Client Intake Form
          </button>
        </div>

        {/* Search / Filter bar */}
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3 mb-4"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} strokeWidth={1.75} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50 shrink-0"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border-color)" }}
          >
            Most Recently Seen
            <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}
        >
          {/* Table header */}
          <div
            className="grid px-6 py-3 text-[11px] font-bold tracking-widest uppercase"
            style={{
              gridTemplateColumns: "1fr 80px 120px 100px 110px 180px",
              color: "var(--text-muted)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <span>Client Name</span>
            <span className="text-center">DOB /<br />Age</span>
            <span>Last Session</span>
            <span className="text-center">Total<br />Visits</span>
            <span className="text-center">Avg.<br />Pain Relief</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {filteredClients.map((client, i) => (
            <div
              key={client.id}
              className="grid px-6 py-4 items-center hover:bg-gray-50/80 transition-colors group"
              style={{
                gridTemplateColumns: "1fr 80px 120px 100px 110px 180px",
                borderBottom: i < filteredClients.length - 1 ? "1px solid var(--border-light)" : "none",
              }}
            >
              {/* Name */}
              <div>
                <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                  {client.name}
                </p>
                <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  ID: {client.id}
                </p>
              </div>

              {/* Age */}
              <div className="text-center">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{client.age}</span>
              </div>

              {/* Last Session */}
              <div>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {client.lastSession ?? "No sessions yet"}
                </span>
              </div>

              {/* Total Visits */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                  style={{ backgroundColor: "var(--bg-main)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}
                >
                  {client.totalVisits}
                </span>
              </div>

              {/* Avg Pain Relief */}
              <div className="flex justify-center items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
                <span className="text-sm font-semibold text-green-600">{client.avgPainRelief}%</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-gray-100"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                >
                  <Play className="w-3 h-3" strokeWidth={2} />
                  Start Session
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 transition-all hover:bg-red-50"
                  style={{ border: "1px solid #fecaca" }}
                >
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
              <p className="text-sm">No clients match your search.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
