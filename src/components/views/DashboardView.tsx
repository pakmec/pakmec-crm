"use client";

import React from "react";
import { 
  TrendingUp, 
  Clock, 
  KanbanSquare, 
  Users, 
  Calculator, 
  ChevronRight, 
  MessageSquare, 
  ArrowUpRight, 
  Boxes,
  CheckCircle2,
  ExternalLink,
  Flame,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Wrench,
  Database
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { JobStage, TradeType } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewQuote: () => void;
  onOpenJobDetail: (jobId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  onNavigateTab, 
  onOpenNewQuote,
  onOpenJobDetail 
}) => {
  const { 
    jobs, 
    quotes, 
    contacts, 
    invoices, 
    formatCurrency, 
    currentRole, 
    permissions 
  } = useCrm();

  // Financial & Pipeline Telemetry
  const nonArchivedJobs = jobs.filter(j => !j.isArchived);
  const nonArchivedInvoices = invoices.filter(i => !i.isArchived);
  const nonArchivedContacts = contacts.filter(c => !c.isArchived);

  // Total Cash Inflow = Production Advances Collected + Final Settlements Received
  const totalAdvancesCollected = nonArchivedJobs.reduce((sum, j) => sum + (j.advanceStatus === "collected" ? j.advancePaid : 0), 0);
  const totalSettlementsCollected = nonArchivedInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalRevenuePKR = totalAdvancesCollected + totalSettlementsCollected;

  const activeJobs = nonArchivedJobs.filter(j => j.stage !== "delivered");
  const pendingAdvanceJobs = nonArchivedJobs.filter(j => j.advanceStatus === "pending");
  const urgentJobs = nonArchivedJobs.filter(j => (j.priority === "urgent" || j.priority === "high") && j.stage !== "delivered");

  // Outstanding Receivables across all active jobs
  const totalPendingBalance = nonArchivedJobs.reduce((sum, j) => sum + j.balanceDue, 0);

  // Trade volume breakdown
  const trades: { name: TradeType; count: number; color: string }[] = [
    { name: "CNC Machining", count: nonArchivedJobs.filter(j => j.trade === "CNC Machining").length, color: "#10b981" },
    { name: "3D Printing", count: nonArchivedJobs.filter(j => j.trade === "3D Printing").length, color: "#0284c7" },
    { name: "Laser Cutting", count: nonArchivedJobs.filter(j => j.trade === "Laser Cutting").length, color: "#f59e0b" },
    { name: "CAD Design", count: nonArchivedJobs.filter(j => j.trade === "CAD Design").length, color: "#64748b" },
    { name: "Industrial Fabrication", count: nonArchivedJobs.filter(j => j.trade === "Industrial Fabrication").length, color: "#fe7518" },
  ];

  // Weekly throughput visualization
  const weeklyOutput = [
    { day: "Mon", count: 4, height: "45%" },
    { day: "Tue", count: 7, height: "70%" },
    { day: "Wed", count: 5, height: "55%" },
    { day: "Thu", count: 9, height: "92%", active: true },
    { day: "Fri", count: 6, height: "65%" },
    { day: "Sat", count: 8, height: "80%" },
    { day: "Sun", count: 2, height: "25%" },
  ];

  // Collect latest WhatsApp logs across contacts
  const recentLogs = nonArchivedContacts
    .flatMap(c => (c.whatsappLogs || []).map(l => ({ ...l, contactName: c.name, contactPhone: c.phone, contactId: c.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-7xl mx-auto">
      {/* Workshop Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
              PAKMEC Workshop Console
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono px-2 py-0.5 sm:py-1 rounded-md bg-slate-100 dark:bg-[#151922] text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-[#2a3040] shadow-sm font-semibold">
              <Database className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Multan Industrial Hub</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Precision engineering operations across CNC, 3D printing, laser cutting & industrial CAD in Multan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {permissions.canCreateQuotes && (
            <button
              onClick={onOpenNewQuote}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2.5 px-4 min-h-[44px] rounded-lg shadow-sm border border-[#e56208] btn-haptic touch-manipulation"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Generate Auto-Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Asymmetrical Industrial Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Role-Aware Telemetry */}
        {!permissions.canViewFinancials ? (
          <div className="md:col-span-2 bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                    Machinist Operations Console
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-[#0e1626] text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 font-bold">
                    Floor Authorized
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-[#141b2b] border border-blue-200 dark:border-[#222e47] flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-2 border-t border-slate-100 dark:border-zinc-800/70">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Active Machine Floor WIP</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">{activeJobs.length}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Running Jobs</span>
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-mono flex items-center gap-1">
                    <span>{urgentJobs.length} High Priority runs scheduled</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Tooling & Spindle Readiness</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">100%</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Calibrated</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                    5-Axis CNC, 150W Laser & SLA active
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              <span>Multan Precision Shop Floor</span>
              <button 
                onClick={() => onNavigateTab("jobs")} 
                className="text-[#fe7518] hover:underline flex items-center gap-1"
              >
                <span>Open Kanban Floor</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-medium">
                    Financial Settlement Telemetry
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-[#0c1c14] text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold">
                    SQLite Verified
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#242938] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-2 border-t border-slate-100 dark:border-zinc-800/70">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Total Cash Collected</span>
                  <div className="mt-1">
                    <CurrencyDisplay amount={totalRevenuePKR} size="xl" numberColor="text-slate-900 dark:text-zinc-100" />
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Adv: {formatCurrency(totalAdvancesCollected)} • Settle: {formatCurrency(totalSettlementsCollected)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Outstanding Receivables</span>
                  <div className="mt-1">
                    <CurrencyDisplay amount={totalPendingBalance} size="xl" numberColor="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                    {totalPendingBalance === 0 ? "All accounts fully settled" : `${nonArchivedJobs.filter(j => j.balanceDue > 0).length} jobs with pending balance`}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              <span>Meezan Bank IBAN & JazzCash active</span>
              <button 
                onClick={() => onNavigateTab("invoices")} 
                className="text-[#fe7518] hover:underline flex items-center gap-1"
              >
                <span>Ledger Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Bento Tile 2: Active Workshop Jobs */}
        <div 
          onClick={() => onNavigateTab("jobs")}
          className="bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm cursor-pointer hover:border-[#fe7518]/60 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-medium">
              Workshop Floor WIP
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#242938] flex items-center justify-center text-[#fe7518]">
              <KanbanSquare className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">{activeJobs.length}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Active Machining Runs</span>
            </div>
            <div className="text-xs font-mono text-[#fe7518] mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518] animate-ping" />
              <span>{urgentJobs.length} prioritized machine run(s)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/70 text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center justify-between">
            <span>Open Kanban Floor</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#fe7518]" />
          </div>
        </div>

        {/* Bento Tile 3: Client Accounts */}
        <div 
          onClick={() => onNavigateTab("contacts")}
          className="bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm cursor-pointer hover:border-blue-500/50 transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-medium">
              Client Accounts
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#171b26] border border-slate-200 dark:border-[#242938] flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-zinc-100">{nonArchivedContacts.length}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Active Industrial Clients</span>
            </div>
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp CRM Synced</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/70 text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center justify-between">
            <span>Multan Database</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-blue-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Machine Operations & Live WhatsApp Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Production Schedule & Live Jobs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Jobs in Shop */}
          <div className="bg-white dark:bg-[#11131a] rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#fe7518]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-mono">
                  Shop-Floor Machine Runs
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-200/70 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  {activeJobs.length} active
                </span>
              </div>
              <button
                onClick={() => onNavigateTab("jobs")}
                className="text-xs text-[#fe7518] hover:underline flex items-center gap-1 font-mono font-medium"
              >
                <span>Full Kanban</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800/70">
              {activeJobs.map((job) => {
                const stageColors: Record<JobStage, string> = {
                  queued: "bg-slate-900 text-blue-300 dark:bg-[#0f1b2b] dark:text-blue-300 border border-blue-500/40 font-bold",
                  in_progress: "bg-slate-900 text-[#fe7518] dark:bg-[#231509] dark:text-orange-400 border border-[#fe7518]/50 font-bold",
                  qc: "bg-slate-900 text-amber-300 dark:bg-[#221a0a] dark:text-amber-300 border border-amber-500/40 font-bold",
                  ready: "bg-slate-900 text-emerald-300 dark:bg-[#0d1f16] dark:text-emerald-300 border border-emerald-500/40 font-bold",
                  delivered: "bg-slate-800 text-zinc-200 dark:bg-[#181b24] dark:text-zinc-300 border border-zinc-600 font-bold",
                };

                return (
                  <div 
                    key={job.id}
                    onClick={() => onOpenJobDetail(job.id)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-zinc-400">{job.id}</span>
                        <span className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate hover:text-[#fe7518] transition-colors">
                          {job.title}
                        </span>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${stageColors[job.stage]}`}>
                          {job.stage.replace("_", " ")}
                        </span>
                        {job.priority === "urgent" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-[#2b0f14] text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-bold">
                            URGENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                        <span>Client: <strong className="text-slate-700 dark:text-zinc-200">{job.contactName}</strong></span>
                        <span>•</span>
                        <span>Trade: <strong className="text-slate-700 dark:text-zinc-200">{job.trade}</strong></span>
                        <span>•</span>
                        <span>Shop: <strong className="text-[#fe7518]">Multan</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 font-mono">
                      {permissions.canViewFinancials ? (
                        <>
                          <div>
                            <CurrencyDisplay amount={job.totalAmount} size="md" />
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span>Advance:</span>
                            <CurrencyDisplay amount={job.advancePaid} size="xs" numberColor="text-emerald-600 dark:text-emerald-400" />
                            {job.advanceStatus === "collected" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          </div>
                        </>
                      ) : (
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">{job.trade}</span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">Shop Floor Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Throughput Telemetry Chart */}
          <div className="bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-mono">
                  Weekly Calibrated Machine Runs
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Completed cycles across 5 CNC axes, 150W laser & FDM/SLA</p>
              </div>
              <span className="text-xs font-mono text-slate-900 dark:text-zinc-100 bg-slate-100 dark:bg-[#161a24] px-2.5 py-1 rounded-md border border-slate-300 dark:border-[#2b3040] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518]" />
                41 Runs Completed
              </span>
            </div>

            {/* Bar visualization */}
            <div className="h-36 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-200/70 dark:border-zinc-800">
              {weeklyOutput.map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 group-hover:text-[#fe7518] transition-colors">
                    {bar.count}
                  </span>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800/60 rounded-t-md h-28 flex items-end p-1">
                    <div 
                      style={{ height: bar.height }}
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        bar.active 
                          ? "bg-[#fe7518] shadow-[0_0_10px_rgba(254,117,24,0.35)]" 
                          : "bg-slate-300 dark:bg-zinc-700 group-hover:bg-slate-400 dark:group-hover:bg-zinc-600"
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-1">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Trade Distribution & WhatsApp Activity */}
        <div className="space-y-6">
          {/* Trade Share Breakdown */}
          <div className="bg-white dark:bg-[#11131a] p-5 rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-mono flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#fe7518]" />
              <span>Jobs by Trade Domain</span>
            </h3>

            <div className="space-y-3">
              {trades.map((t) => {
                const total = nonArchivedJobs.length || 1;
                const percent = Math.round((t.count / total) * 100);
                return (
                  <div key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600 dark:text-zinc-400 font-medium">{t.name}</span>
                      <span className="text-slate-900 dark:text-zinc-100 font-semibold">{t.count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${percent}%`, backgroundColor: t.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Communications Feed */}
          <div className="bg-white dark:bg-[#11131a] rounded-xl border border-slate-200/90 dark:border-zinc-800/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-100 font-mono">
                  WhatsApp CRM Feed
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("contacts")}
                className="text-xs text-[#fe7518] hover:underline font-mono font-medium"
              >
                All Logs
              </button>
            </div>

            <div className="p-4 space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{log.contactName}</span>
                    <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10px]">{log.date.split(" ")[0]}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {log.text}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/50">
                    <span className="font-mono">By {log.author}</span>
                    <a
                      href={`https://wa.me/${log.contactPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      <span>Open WhatsApp</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Industrial Console Status Bar (Bottom Architecture) */}
      <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PAKMEC Multan Facility Active</span>
          </span>
          <span>•</span>
          <span>Plot 18-A, Phase 2, Industrial Estate, Multan</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SQLite Secured</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <button 
            onClick={() => onNavigateTab("quotes")}
            className="hover:text-[#fe7518] transition-colors"
          >
            Auto-Quoter Engine
          </button>
          <span>•</span>
          <button 
            onClick={() => onNavigateTab("jobs")}
            className="hover:text-[#fe7518] transition-colors"
          >
            Production Kanban
          </button>
          <span>•</span>
          <button 
            onClick={() => onNavigateTab("invoices")}
            className="hover:text-[#fe7518] transition-colors"
          >
            Meezan Settlements
          </button>
        </div>
      </div>
    </div>
  );
};
