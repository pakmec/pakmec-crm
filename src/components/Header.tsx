"use client";

import React from "react";
import { 
  Search, 
  Calculator, 
  Clock, 
  Plus,
  Sun,
  Moon,
  Database
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface HeaderProps {
  onOpenNewQuote: () => void;
  onOpenNewJob: () => void;
  onOpenNewContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenNewQuote, 
  onOpenNewJob, 
  onOpenNewContact 
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    jobs, 
    theme, 
    toggleTheme, 
    currentRole, 
    permissions, 
    currentUser 
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
    .filter(j => j.stage !== "delivered")
    .reduce((sum, j) => sum + j.balanceDue, 0);

  return (
    <header className="h-16 border-b border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#0c0e14] px-6 flex items-center justify-between sticky top-0 z-10 select-none no-print transition-colors">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            aria-label="Search clients, quotes, jobs, and engineering specs"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients, quotes, jobs, specs…"
            className="w-full bg-slate-100 dark:bg-[#131620] text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-10 pr-14 py-2 rounded-lg border border-slate-300/80 dark:border-zinc-700/80 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#161926] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fe7518]/50 transition-all font-sans"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="text-xs text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Clear
              </button>
            ) : (
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-300 dark:border-zinc-700">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Stats & Quick CTA Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock Telemetry (Multan PKT) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#131620] border border-slate-300/80 dark:border-zinc-700/80 text-xs font-mono text-slate-700 dark:text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-[#fe7518]" />
          <span>Multan {time || "02:10 PM"}</span>
        </div>

        {/* Live Outstanding Advance & Balance (Hidden from Machinist) */}
        {permissions.canViewFinancials && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#131620] border border-slate-300/80 dark:border-zinc-700/80 text-xs">
            <span className="text-slate-600 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-mono">Balance:</span>
            <CurrencyDisplay amount={totalActiveBalance} size="sm" numberColor="text-[#fe7518]" />
          </div>
        )}

        {/* Active Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#131620] border border-slate-300/80 dark:border-zinc-700/80 text-xs font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${
            currentRole === "admin" ? "bg-amber-500" : currentRole === "machinist" ? "bg-blue-500" : "bg-emerald-500"
          }`} />
          <span className="capitalize font-semibold text-slate-800 dark:text-zinc-200">{currentRole}</span>
        </div>

        {/* Light / Dark Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#131620] hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700/80 text-slate-700 dark:text-zinc-300 btn-haptic"
          title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-[#fe7518]" />
          )}
        </button>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {permissions.canCreateQuotes && (
            <button
              onClick={onOpenNewQuote}
              className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Auto-Quote</span>
            </button>
          )}
          
          <button
            onClick={onOpenNewJob}
            className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 text-xs font-semibold py-2 px-3 rounded-lg btn-haptic"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
