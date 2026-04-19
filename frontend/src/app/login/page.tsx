"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Asterisk, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #e8e4de 0%, #f5f0ea 100%)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-white shadow-2xl"
        style={{ backgroundColor: "#1a2d35" }}
      >
        <div className="flex justify-center mb-4">
          <div className="flex items-center text-white font-bold text-2xl tracking-[0.12em]">
            HYDRAWAV
            <span className="text-amber-400 border border-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-[11px] ml-0.5">3</span>
            <span className="text-sm align-super ml-0.5">™</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-7">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/60 mb-1.5 block">User Name</label>
            <input
              type="text"
              required
              className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/30"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              placeholder="user name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-white/60 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-white/30"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-white/60 text-xs">Remember me</span>
            </label>
            <a href="#" className="text-xs font-medium text-amber-400 hover:text-amber-300">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 mt-2"
            style={{ backgroundColor: "#c9a87c", color: "#1a2d35" }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-xs text-white/40 mt-4">
            Don't have an account?{" "}
            <a href="#" className="font-semibold text-amber-400 hover:text-amber-300">Create New Account</a>
          </p>
        </form>
      </div>
    </div>
  );
}
