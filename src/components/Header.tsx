"use client";

import React from "react";
import { 
  Search, 
  Clock, 
  Plus,
  Sun,
  Moon,
  Database,
  Menu
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface HeaderProps {
  onOpenNewQuote: () => void;
  onOpenNewJob: () => void;
  onOpenNewContact: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNewQuote, 
  onOpenNewJob, 
  onOpenNewContact,
  onToggleMobileMenu 
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    jobs, 
    theme, 
    toggleTheme, 
    currentRole, 
    permissions 
  } = useCrm();
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        second: "2-digit",
        hour12: true 
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalActiveBalance = jobs
    .filter(j => !j.isArchived && j.stage !== "delivered")
    .reduce((sum, j) => sum + j.balanceDue, 0);

  return (
    <header className="h-16 border-b-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0e14] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-10 select-none no-print transition-colors shadow-xs">
      {/* Mobile Hamburger Button + Logo */}
      <div className="flex items-center gap-2 md:hidden shrink-0 mr-2">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Open navigation menu"
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-800 hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic touch-manipulation"
        >
          <Menu className="w-5 h-5 text-[#fe7518]" />
        </button>
        <img 
          src="/pakmec-logo.png" 
          alt="PAKMEC" 
          className="h-6 w-auto object-contain brightness-110 hidden xs:block" 
        />
      </div>

      {/* High-Contrast Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-700 dark:text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            aria-label="Search clients, quotes, jobs, and engineering specs"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients, quotes, jobs…"
            className="w-full bg-white dark:bg-[#141722] text-slate-950 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-10 pr-14 py-2 min-h-[40px] rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#161a26] focus:outline-none focus:ring-2 focus:ring-[#fe7518]/30 transition-all font-sans text-xs sm:text-sm font-bold shadow-xs touch-manipulation"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="text-xs text-slate-800 hover:text-slate-950 dark:text-zinc-200 dark:hover:text-white font-extrabold px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Stats & Clean Action Area */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock Telemetry (Multan PKT) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131620] border-2 border-slate-200 dark:border-zinc-700 text-xs text-slate-950 dark:text-zinc-100 font-bold">
          <Clock className="w-3.5 h-3.5 text-[#fe7518]" />
          <span className="tabular-nums">Multan {time || "02:10 PM"}</span>
        </div>

        {/* Live Outstanding Advance & Balance (Hidden from Machinist) */}
        {permissions.canViewFinancials && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131620] border-2 border-slate-200 dark:border-zinc-700 text-xs font-bold">
            <span className="text-slate-700 dark:text-zinc-300 text-xs">Receivables:</span>
            <CurrencyDisplay amount={totalActiveBalance} size="sm" numberColor="text-[#fe7518]" />
          </div>
        )}

        {/* Active Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#131620] border-2 border-slate-200 dark:border-zinc-700 text-xs font-bold">
          <span className={`w-2 h-2 rounded-full ${
            currentRole === "admin" ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" : currentRole === "machinist" ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
          }`} />
          <span className="capitalize text-slate-950 dark:text-zinc-100 font-bold">{currentRole}</span>
        </div>

        {/* Light / Dark Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#131620] hover:bg-slate-200 dark:hover:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 btn-haptic"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
