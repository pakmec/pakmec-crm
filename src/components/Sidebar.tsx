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
  Wrench,
  X
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { UserRole } from "@/types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewQuote: () => void;
  onOpenNewContact: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenNewQuote, 
  onOpenNewContact,
  mobileOpen = false,
  onCloseMobile
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
    { id: "dashboard", label: "Overview", icon: LayoutDashboard, badge: null, roles: ["admin", "machinist", "sales"] as UserRole[] },
    { id: "quotes", label: "Auto-Quoter", icon: Calculator, badge: pendingQuotesCount > 0 ? pendingQuotesCount : null, roles: ["admin", "sales"] as UserRole[] },
    { id: "jobs", label: "Production & Floor", icon: KanbanSquare, badge: activeJobsCount > 0 ? activeJobsCount : null, roles: ["admin", "machinist", "sales"] as UserRole[] },
    { id: "contacts", label: "Client Database", icon: Users, badge: null, roles: ["admin", "sales"] as UserRole[] },
    { id: "invoices", label: "Invoices & Ledger", icon: Receipt, badge: null, roles: ["admin", "sales"] as UserRole[] },
    { id: "settings", label: "Rates & Setup", icon: Settings, badge: null, roles: ["admin"] as UserRole[] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleQuoteClick = () => {
    onOpenNewQuote();
    if (onCloseMobile) onCloseMobile();
  };

  const handleContactClick = () => {
    onOpenNewContact();
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = (isMobile: boolean = false) => (
    <>
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col gap-2 shrink-0 bg-white dark:bg-[#0c0e14]">
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
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-[#161922] dark:text-zinc-100 border border-slate-800 dark:border-[#2a3040] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518]" />
              MULTAN
            </span>
            {isMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="p-1.5 rounded-lg text-slate-700 hover:text-slate-950 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Telemetry Synced
          </span>
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <Database className="w-3.5 h-3.5" />
            <span>Multan Hub</span>
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      {currentRole === "machinist" ? (
        <div className={`border-b border-slate-200 dark:border-zinc-800 shrink-0 ${isMobile ? "p-3" : "p-3"}`}>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#101726] border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Wrench className="w-4 h-4 text-blue-500" />
              <span>Machinist Floor Mode</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
              WIP Active
            </span>
          </div>
        </div>
      ) : (
        <div className={`border-b border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2 shrink-0 ${isMobile ? "p-3" : "p-3"}`}>
          <button
            onClick={handleQuoteClick}
            className={`flex items-center justify-center gap-1.5 px-3 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-sm border border-[#e56208] btn-haptic ${
              isMobile ? "py-2.5 min-h-[44px]" : "py-2 min-h-[38px]"
            }`}
            aria-label="Create New Auto Quote"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
          <button
            onClick={handleContactClick}
            className={`flex items-center justify-center gap-1.5 px-3 rounded-lg bg-slate-100 dark:bg-[#181b22] hover:bg-slate-200 dark:hover:bg-[#222631] text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-[#2a303d] text-xs font-bold btn-haptic ${
              isMobile ? "py-2.5 min-h-[44px]" : "py-2 min-h-[38px]"
            }`}
            aria-label="Add New Client Contact"
          >
            <Users className="w-3.5 h-3.5 text-[#fe7518]" />
            <span>New Client</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 overflow-y-auto px-3 ${isMobile ? "py-4 space-y-1.5" : "py-3 space-y-1"}`}>
        <div className="px-2 pb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 rounded-xl text-sm font-bold btn-haptic group transition-colors touch-manipulation ${
                isMobile ? "py-3 min-h-[44px]" : "py-2 min-h-[38px]"
              } ${
                isActive 
                  ? "bg-white dark:bg-[#181c26] text-slate-950 dark:text-white border-l-4 border-l-[#fe7518] border-y border-r border-slate-300 dark:border-[#2a3040] shadow-sm font-bold" 
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#15171f]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#fe7518]" : "text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive 
                    ? "bg-[#fe7518] text-slate-950 font-black" 
                    : "bg-slate-200 dark:bg-[#212631] text-slate-800 dark:text-zinc-200 group-hover:bg-slate-300 dark:group-hover:bg-[#2c3240]"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Currency & Active Trades Telemetry */}
        <div className={`px-2 ${isMobile ? "pt-4" : "pt-3"}`}>
          <div className="pb-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold flex items-center justify-between">
            <span>Manufacturing Rates</span>
            <Flame className="w-3.5 h-3.5 text-[#fe7518]" />
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { label: "CNC Mill/Turn", pip: "bg-emerald-500" },
              { label: "3D Print (SLA/FDM)", pip: "bg-cyan-500" },
              { label: "Laser Cutting", pip: "bg-amber-500" },
              { label: "CAD SolidWorks", pip: "bg-blue-500" },
              { label: "Fabrication", pip: "bg-[#fe7518]" },
            ].map(t => (
              <span 
                key={t.label} 
                className={`inline-flex items-center gap-1.5 text-xs font-mono rounded-md bg-slate-100 dark:bg-[#161923] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#272b38] font-bold ${
                  isMobile ? "px-2 py-1" : "px-2 py-0.5"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${t.pip}`} />
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </nav>

      {/* User Account & Role Profile Footer */}
      <div className={`border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-[#0b0c0f] shrink-0 ${
        isMobile ? "p-3 space-y-2.5" : "p-3 space-y-2"
      }`}>
        {/* User Badge & Sign Out */}
        <div className={`rounded-xl bg-white dark:bg-[#12141a] border border-slate-200 dark:border-[#1e232e] flex items-center justify-between shadow-xs ${
          isMobile ? "p-2.5" : "p-2"
        }`}>
          <div className="min-w-0 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
              currentRole === "admin" 
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40" 
                : currentRole === "machinist"
                ? "bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/40"
                : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
            }`}>
              {currentRole === "admin" ? "YA" : currentRole === "machinist" ? "RA" : "ZK"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                {currentUser?.name || (currentRole === "admin" ? "Yasir Aslam" : "Staff Member")}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                  currentRole === "admin"
                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                    : currentRole === "machinist"
                    ? "bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
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
            className={`flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic shrink-0 ${
              isMobile ? "p-2 min-h-[36px] min-w-[36px]" : "p-1.5 min-h-[32px] min-w-[32px]"
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="grid grid-cols-3 gap-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => switchRole("admin")}
            className={`rounded-lg text-center font-bold transition-all ${
              isMobile ? "py-1.5 px-1 min-h-[34px]" : "py-1 px-1 min-h-[30px]"
            } ${
              currentRole === "admin"
                ? "bg-[#fe7518] text-slate-950 font-black shadow-sm"
                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
            }`}
            title="Switch to Admin role"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => switchRole("machinist")}
            className={`rounded-lg text-center font-bold transition-all ${
              isMobile ? "py-1.5 px-1 min-h-[34px]" : "py-1 px-1 min-h-[30px]"
            } ${
              currentRole === "machinist"
                ? "bg-blue-600 text-white font-black shadow-sm"
                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
            }`}
            title="Switch to Machinist role"
          >
            Machinist
          </button>
          <button
            type="button"
            onClick={() => switchRole("sales")}
            className={`rounded-lg text-center font-bold transition-all ${
              isMobile ? "py-1.5 px-1 min-h-[34px]" : "py-1 px-1 min-h-[30px]"
            } ${
              currentRole === "sales"
                ? "bg-emerald-600 text-white font-black shadow-sm"
                : "bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800"
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
          className={`w-full flex items-center justify-between rounded-lg bg-white dark:bg-[#14161d] hover:bg-slate-100 dark:hover:bg-[#1b1f29] border border-slate-300 dark:border-[#242934] btn-haptic text-left text-xs font-bold text-slate-800 dark:text-zinc-200 ${
            isMobile ? "p-2 min-h-[38px]" : "p-1.5 min-h-[32px]"
          }`}
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-[#fe7518]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{theme === "dark" ? "Dark Theme" : "Light Theme"}</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e2330]">
            Switch
          </span>
        </button>

        {/* Database Security Status */}
        <div className={`rounded-lg bg-white dark:bg-[#12141a] border border-slate-200 dark:border-[#1e232e] flex items-center justify-between text-xs font-mono ${
          isMobile ? "p-2" : "p-1.5"
        }`}>
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Database Synced</span>
          </div>
          <span className="text-slate-600 dark:text-zinc-400 font-semibold">Multan, PK</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-[#0d0e12] border-r border-slate-200 dark:border-zinc-800 flex-col h-screen select-none shrink-0 z-20 transition-colors no-print">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Shown when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
          {/* Backdrop overlay */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in" 
            aria-hidden="true"
          />

          {/* Drawer content */}
          <aside className="relative z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0d0e12] border-r border-slate-200 dark:border-zinc-800 flex flex-col h-full shadow-2xl animate-slide-in">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
