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
  AlertCircle,
  KeyRound,
  CheckCircle2
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";

export const LoginView: React.FC = () => {
  const { login } = useCrm();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both your registered staff email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const result = await login(email.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || "Authentication failed. Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-white flex flex-col justify-between font-sans selection:bg-[#fe7518] selection:text-black">
      {/* Precision Top Bar */}
      <header className="px-4 sm:px-8 py-4 border-b border-zinc-800/90 bg-[#0c0e15] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-36 h-9 flex items-center">
            <img 
              src="/pakmec-logo.png" 
              alt="PAKMEC Engineering" 
              className="w-full h-auto object-contain brightness-110 drop-shadow-[0_2px_10px_rgba(254,117,24,0.4)]" 
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-300 pl-3 border-l border-zinc-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-zinc-200">Multan Industrial Facility Node</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-emerald-400 font-bold shadow-xs">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Edge Node</span>
          </span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Brand Header with High Contrast */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fe7518]/15 border border-[#fe7518]/40 text-[#fe7518] text-xs font-mono font-bold tracking-wide shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#fe7518]" />
              <span>RBAC SECURED ACCESS GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              PAKMEC Workshop Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium px-2">
              Sign in with your authorized engineering or management credentials.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#0f121a] border border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            {errorMessage && (
              <div 
                role="alert" 
                aria-live="polite"
                className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-100 text-xs font-medium flex items-center gap-2.5 shadow-md animate-shake"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="staff-email"
                  className="block text-xs font-mono text-slate-200 mb-1.5 font-bold tracking-wide"
                >
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="staff-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@pakmec.com"
                    autoComplete="email"
                    spellCheck={false}
                    className="w-full bg-[#161a26] text-white text-[16px] sm:text-sm pl-10 pr-3 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-slate-700 focus:border-[#fe7518] focus:ring-2 focus:ring-[#fe7518]/30 focus:bg-[#1a2030] focus:outline-none transition-all font-mono touch-manipulation placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label 
                    htmlFor="staff-password"
                    className="text-xs font-mono text-slate-200 font-bold tracking-wide"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    autoComplete="current-password"
                    spellCheck={false}
                    className="w-full bg-[#161a26] text-white text-[16px] sm:text-sm pl-10 pr-12 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-slate-700 focus:border-[#fe7518] focus:ring-2 focus:ring-[#fe7518]/30 focus:bg-[#1a2030] focus:outline-none transition-all font-mono touch-manipulation placeholder:text-slate-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-slate-300" /> : <Eye className="w-4 h-4 text-slate-300" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 sm:py-3 px-4 min-h-[48px] rounded-xl bg-[#fe7518] hover:bg-[#ff842d] active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg border border-[#e56208] flex items-center justify-center gap-2 transition-all btn-haptic disabled:opacity-50 touch-manipulation cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Credentials…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Workshop Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Verification & Access Policy */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono font-medium">
                <KeyRound className="w-4 h-4 text-[#fe7518] shrink-0" />
                <span>Authorized Staff Credentials Required</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0a0c12] border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300 font-semibold">
                  <span>Registered Staff Accounts:</span>
                  <span className="text-[10px] text-emerald-400 font-bold">RBAC Enforced</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-zinc-200">Executive Admin:</span>
                    <span className="text-zinc-400">admin@pakmec.com</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-zinc-200">Floor Machinist:</span>
                    <span className="text-zinc-400">machinist@pakmec.com</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200">Estimator / Sales:</span>
                    <span className="text-zinc-400">sales@pakmec.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Multi-Trade Footer */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <Flame className="w-4 h-4 text-[#fe7518]" />
              <span>CNC • Laser • 3D • CAD</span>
            </span>
            <span className="text-zinc-400">Plot 18-A, Phase 2, Multan</span>
          </div>
        </div>
      </main>

      {/* Security Footer */}
      <footer className="px-6 py-3 border-t border-zinc-800/90 bg-[#0a0b10] text-center text-xs font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>PAKMEC Precision Engineering CRM</span>
        <span className="text-zinc-500 text-[11px]">256-Bit TLS Encrypted • Enterprise RBAC Protected</span>
      </footer>
    </div>
  );
};

