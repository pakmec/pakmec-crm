"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Database, 
  Flame, 
  Cpu, 
  Wrench, 
  FileSpreadsheet, 
  Users,
  AlertCircle
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { UserRole } from "@/types";

export const LoginView: React.FC = () => {
  const { login, switchRole } = useCrm();
  const [email, setEmail] = useState("admin@pakmec.com");
  const [password, setPassword] = useState("pakmec2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Invalid credentials.");
    }
  };

  const handleQuickRole = (role: UserRole) => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-zinc-100 flex flex-col justify-between font-sans selection:bg-[#fe7518] selection:text-black">
      {/* Precision Top Bar */}
      <header className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/pakmec-logo.png" 
            alt="PAKMEC Engineering" 
            className="h-9 w-auto object-contain brightness-110 drop-shadow-[0_2px_8px_rgba(254,117,24,0.3)]" 
          />
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-zinc-400 pl-3 border-l border-zinc-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multan Industrial Facility Node</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>Edge Cloud Synced</span>
          </span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fe7518]/10 border border-[#fe7518]/30 text-[#fe7518] text-xs font-mono font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC Security Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              PAKMEC Workshop Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Sign in with your engineering or administrative credentials.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#10131b] border border-zinc-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            {errorMessage && (
              <div 
                role="alert" 
                className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 font-medium">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pakmec.com"
                    autoComplete="email"
                    className="w-full bg-[#161a24] text-white text-sm pl-10 pr-3 py-2.5 rounded-lg border border-zinc-800 focus:border-[#fe7518] focus:bg-[#1a202c] focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 font-medium">
                    Password
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Default: <code className="text-[#fe7518]">pakmec2026!</code>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#161a24] text-white text-sm pl-10 pr-10 py-2.5 rounded-lg border border-zinc-800 focus:border-[#fe7518] focus:bg-[#1a202c] focus:outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-bold text-sm shadow-md border border-[#e56208] flex items-center justify-center gap-2 transition-all btn-haptic disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Role Switcher for Testing Authority Levels */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="uppercase tracking-wider">Quick Role Testing:</span>
                <span className="text-[10px] text-zinc-500">1-click demo bypass</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRole("admin")}
                  className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-[#fe7518]/60 text-left transition-all btn-haptic group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#fe7518]">
                    <span>👑 Admin</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate font-mono">
                    Full Authority
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRole("machinist")}
                  className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/60 text-left transition-all btn-haptic group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-blue-400">
                    <span>🛠️ Machinist</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate font-mono">
                    Floor WIP Only
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRole("sales")}
                  className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/60 text-left transition-all btn-haptic group"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-emerald-400">
                    <span>📋 Sales</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block truncate font-mono">
                    Quoter & CRM
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Multi-Trade Footer */}
          <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#fe7518]" />
              <span>CNC • Laser • 3D • CAD</span>
            </span>
            <span>Plot 18-A, Phase 2, Multan</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-zinc-800/80 text-center text-xs font-mono text-zinc-500">
        PAKMEC Precision Engineering CRM • Enterprise RBAC Protected
      </footer>
    </div>
  );
};
