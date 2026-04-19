"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  Radio,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Session", href: "/session", icon: Activity },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Devices", href: "/devices", icon: Radio },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/session") return pathname.startsWith("/session");
    return pathname === href;
  };

  return (
    <aside
      style={{ backgroundColor: "var(--sidebar-bg)" }}
      className="w-[214px] min-h-screen flex flex-col shrink-0 fixed left-0 top-0 bottom-0 z-30"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-white font-bold text-xl tracking-[0.12em]">HYDRAWAV</span>
          <span className="text-amber-400 font-bold text-xl border border-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-[11px] leading-none">3</span>
          <span className="text-white text-[10px] align-super leading-none">™</span>
        </div>
        <p className="text-white/40 text-[10px] tracking-widest uppercase mt-1 font-medium">Practitioner</p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "text-[#c9a87c]"
                  : "text-white/65 hover:text-white hover:bg-white/8"
              )}
              style={active ? { backgroundColor: "rgba(188, 155, 115, 0.2)" } : {}}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-[#c9a87c]" : "text-white/55 group-hover:text-white/80"
                )}
                strokeWidth={1.75}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 pt-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all w-full">
          <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Settings
        </button>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Logout
        </button>
        <p className="text-white/25 text-[10px] px-3 mt-3">V1.0.0 © 2026 HYDRAWAV3</p>
      </div>
    </aside>
  );
}
