"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Settings, LogOut, Users, UserPlus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function TopHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b bg-white shrink-0 sticky top-0 z-20"
      style={{ borderColor: "var(--border-color)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Annie's Demo Account
        </span>
        <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200 tracking-wide">
          BETA VERSION
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} strokeWidth={1.75} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-gray-50 rounded-xl px-2 py-1 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-semibold text-gray-600">
              AS
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Annie Sturm
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              style={{ borderColor: "var(--border-color)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={{ color: "var(--text-primary)" }}>
                <Settings className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                Settings
              </button>
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                <LogOut className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                Logout
              </button>
              <div className="mx-2 my-1 border-t" style={{ borderColor: "var(--border-color)" }} />
              <button className="flex items-center justify-between gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={{ color: "var(--text-primary)" }}>
                <span className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  Switch Business Accounts
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" style={{ color: "var(--text-primary)" }}>
                <UserPlus className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                Invite User
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
