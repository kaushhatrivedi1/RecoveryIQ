"use client";

import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopHeader } from "@/components/layout/TopHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg-main)" }}>
      <SidebarNav />
      <div className="flex flex-col flex-1 ml-[214px] min-h-screen">
        <TopHeader />
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
