"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  KanbanSquare, 
  Receipt, 
  Settings, 
  Flame, 
  ExternalLink,
  Plus,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  LogOut,
  UserCheck,
  Shield,
  Wrench
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { UserRole } from "@/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewQuote: () => void;
  onOpenNewContact: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenNewQuote, 
  onOpenNewContact 
}) => {
  const { 
    jobs, 
    quotes, 
    theme, 
    toggleTheme, 
    currentUser, 
    currentRole, 
    logout, 
    switchRole 
  } = useCrm();

  const activeJobsCount = jobs.filter(j => !j.isArchived && j.stage !== "delivered").length;
  const pendingQuotesCount = quotes.filter(q => !q.isArchived && (q.status === "sent" || q.status === "approved")).length;

  const allNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, roles: ["admin", "machinist", "sales"] as UserRole[] },
    { id: "contacts", label: "Contacts & WhatsApp", icon: Users, badge: null, roles: ["admin", "sales"] as UserRole[] },
    { id: "quotes", label: "Auto-Quoter", icon: Calculator, badge: pendingQuotesCount > 0 ? pendingQuotesCount : null, roles: ["admin", "sales"] as UserRole[] },
    { id: "jobs", label: "Production & Pins", icon: KanbanSquare, badge: activeJobsCount > 0 ? activeJobsCount : null, roles: ["admin", "machinist"] as UserRole[] },
    { id: "invoices", label: "Invoices & Payments", icon: Receipt, badge: null, roles: ["admin"] as UserRole[] },
    { id: "settings", label: "Rates & Branding", icon: Settings, badge: null, roles: ["admin"] as UserRole[] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-white dark:bg-[#0d0e12] border-r border-slate-200 dark:border-[#20242e] flex flex-col h-screen select-none shrink-0 z-20 transition-colors no-print">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#20242e] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-36 h-10 flex items-center">
              <img 
                src="/pakmec-logo.png" 
                alt="PAKMEC Engineering" 
                className="w-full h-auto object-contain brightness-110 drop-shadow-[0_2px_8px_rgba(254,117,24,0.3)]" 
              />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-widest px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-[#161922] dark:text-zinc-100 border border-slate-800 dark:border-[#2a3040] shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518]" />
            MULTAN
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#7d8594] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Industrial Telemetry
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
            <Database className="w-3 h-3" />
            <span>SQLite Active</span>
          </span>
        </div>
      </div>

      {/* Quick Action Bar */}
      {currentRole === "machinist" ? (
        <div className="p-3 border-b border-slate-200 dark:border-[#1c202a]">
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-[#101726] border border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-mono flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              <span>Machinist Mode</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-semibold font-sans">
              Floor WIP
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-b border-slate-200 dark:border-[#1c202a] grid grid-cols-2 gap-2">
          <button
            onClick={onOpenNewQuote}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold shadow-sm border border-[#e56208] btn-haptic"
            aria-label="Create New Auto Quote"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
          <button
            onClick={onOpenNewContact}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-slate-100 dark:bg-[#181b22] hover:bg-slate-200 dark:hover:bg-[#222631] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#2a303d] text-xs font-semibold btn-haptic"
            aria-label="Add New Client Contact"
          >
            <Users className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500">
          Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium btn-haptic group transition-colors ${
                isActive 
                  ? "bg-white dark:bg-[#181c26] text-slate-900 dark:text-white border-l-4 border-l-[#fe7518] border-y border-r border-slate-300 dark:border-[#2a3040] shadow-sm font-semibold" 
                  : "text-slate-700 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-[#15171f]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#fe7518]" : "text-slate-500 dark:text-zinc-500 group-hover:text-slate-800 dark:group-hover:text-zinc-200"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-[#fe7518] text-slate-950 font-black" 
                    : "bg-slate-200 dark:bg-[#212631] text-slate-700 dark:text-zinc-300 group-hover:bg-slate-300 dark:group-hover:bg-[#2c3240]"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Currency & Active Trades Telemetry */}
        <div className="pt-6 px-2">
          <div className="pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-500 flex items-center justify-between">
            <span>Active Trades (PKR)</span>
            <Flame className="w-3 h-3 text-[#fe7518]" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "CNC Mill/Turn", pip: "bg-emerald-500" },
              { label: "3D Print (SLA/FDM)", pip: "bg-cyan-500" },
              { label: "Laser Cutting", pip: "bg-amber-500" },
              { label: "CAD SolidWorks", pip: "bg-blue-500" },
              { label: "Fabrication", pip: "bg-[#fe7518]" },
            ].map(t => (
              <span 
                key={t.label} 
                className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/90 dark:bg-[#161923] text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-[#272b38] font-medium"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${t.pip}`} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* User Account & Role Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-[#20242e] bg-slate-50 dark:bg-[#0b0c0f] space-y-2.5">
        {/* User Badge & Sign Out */}
        <div className="p-2 rounded-lg bg-white dark:bg-[#12141a] border border-slate-200 dark:border-[#1e232e] flex items-center justify-between">
          <div className="min-w-0 flex items-center gap-2">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
              currentRole === "admin" 
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30" 
                : currentRole === "machinist"
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            }`}>
              {currentRole === "admin" ? "YA" : currentRole === "machinist" ? "RA" : "ZK"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                {currentUser?.name || (currentRole === "admin" ? "Yasir Aslam" : "Staff Member")}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                  currentRole === "admin"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                    : currentRole === "machinist"
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                }`}>
                  {currentRole === "admin" ? "👑 Admin" : currentRole === "machinist" ? "🛠️ Machinist" : "📋 Sales"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            aria-label="Sign out of console"
            title="Sign out of PAKMEC console"
            className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => switchRole("admin")}
            className={`py-1 px-1 rounded text-center transition-all ${
              currentRole === "admin"
                ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Switch to Admin role"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => switchRole("machinist")}
            className={`py-1 px-1 rounded text-center transition-all ${
              currentRole === "machinist"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Switch to Machinist role"
          >
            Machinist
          </button>
          <button
            type="button"
            onClick={() => switchRole("sales")}
            className={`py-1 px-1 rounded text-center transition-all ${
              currentRole === "sales"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
            title="Switch to Sales role"
          >
            Sales
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#14161d] hover:bg-slate-100 dark:hover:bg-[#1b1f29] border border-slate-300/80 dark:border-[#242934] btn-haptic text-left text-xs text-slate-800 dark:text-zinc-200"
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-3.5 h-3.5 text-[#fe7518]" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="font-mono font-medium">{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1e2330]">
            Switch
          </span>
        </button>

        {/* Database Security Status */}
        <div className="p-2 rounded-lg bg-white dark:bg-[#12141a] border border-slate-200 dark:border-[#1e232e] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-bold">SQLite Secured</span>
          </div>
          <span className="text-slate-600 dark:text-zinc-400">PAKMEC Multan</span>
        </div>

        {/* External Website Link */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400">
          <a 
            href="https://pakmec.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Visit PAKMEC official website (opens in new tab)"
            className="hover:text-[#fe7518] flex items-center gap-1 transition-colors min-h-[24px] py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#fe7518]"
          >
            <span>pakmec.com</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
          <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">Multan, PK</span>
        </div>
      </div>
    </aside>
  );
};
