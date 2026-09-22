"use client";

import React from "react";
import { 
  TrendingUp, 
  KanbanSquare, 
  Users, 
  Calculator, 
  ChevronRight, 
  Plus, 
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
  Database,
  Clock,
  ArrowRight
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { JobStage, TradeType } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { formatWhatsAppPhone } from "@/components/views/ContactsView";

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

  const nonArchivedJobs = jobs.filter(j => !j.isArchived);
  const nonArchivedInvoices = invoices.filter(i => !i.isArchived);
  const nonArchivedContacts = contacts.filter(c => !c.isArchived);

  const totalRevenuePKR = nonArchivedInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const totalAdvancesCollected = nonArchivedInvoices.reduce((sum, i) => sum + (i.advanceDeducted || 0), 0);
  const totalSettlementsCollected = Math.max(0, totalRevenuePKR - totalAdvancesCollected);

  const activeJobs = nonArchivedJobs.filter(j => j.stage !== "delivered");
  const urgentJobs = nonArchivedJobs.filter(j => (j.priority === "urgent" || j.priority === "high") && j.stage !== "delivered");
  const totalPendingBalance = nonArchivedJobs.reduce((sum, j) => sum + (j.balanceDue || 0), 0);

  const trades: { name: TradeType; count: number; color: string }[] = [
    { name: "CNC Machining", count: nonArchivedJobs.filter(j => j.trade === "CNC Machining").length, color: "#10b981" },
    { name: "3D Printing", count: nonArchivedJobs.filter(j => j.trade === "3D Printing").length, color: "#0284c7" },
    { name: "Laser Cutting", count: nonArchivedJobs.filter(j => j.trade === "Laser Cutting").length, color: "#f59e0b" },
    { name: "CAD Design", count: nonArchivedJobs.filter(j => j.trade === "CAD Design").length, color: "#64748b" },
    { name: "Industrial Fabrication", count: nonArchivedJobs.filter(j => j.trade === "Industrial Fabrication").length, color: "#fe7518" },
    { name: "Custom Domain", count: nonArchivedJobs.filter(j => j.trade === "Custom Domain").length, color: "#8b5cf6" },
  ];

  const recentLogs = nonArchivedContacts
    .flatMap(c => (c.whatsappLogs || []).map(l => ({ ...l, contactName: c.name, contactPhone: c.phone, contactId: c.id })))
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto font-sans">
      {/* Workshop Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              Workshop Operations Console
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multan Facility Active</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Precision engineering workflow across CNC milling, 3D printing, laser cutting, and industrial CAD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {permissions.canCreateQuotes && (
            <button
              onClick={onOpenNewQuote}
              className="flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2.5 px-5 min-h-[42px] rounded-xl shadow-sm border border-[#e56208] btn-haptic touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Cash Collected */}
        {permissions.canViewFinancials ? (
          <div 
            onClick={() => onNavigateTab("invoices")}
            className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-[#fe7518]/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Total Cash Inflow</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <CurrencyDisplay amount={totalRevenuePKR} size="xl" numberColor="text-slate-950 dark:text-zinc-100" />
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-2 flex items-center justify-between">
                <span>Adv: {formatCurrency(totalAdvancesCollected)}</span>
                <span>Settle: {formatCurrency(totalSettlementsCollected)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Shop Floor Status</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950 dark:text-zinc-100">100% Calibrated</div>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-1">5-Axis CNC, 150W Laser & SLA active</p>
            </div>
          </div>
        )}

        {/* Card 2: Outstanding Receivables */}
        {permissions.canViewFinancials ? (
          <div 
            onClick={() => onNavigateTab("invoices")}
            className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-[#fe7518]/60 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Outstanding Receivables</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <CurrencyDisplay amount={totalPendingBalance} size="xl" numberColor="text-amber-700 dark:text-amber-400" />
              <div className="text-xs font-bold text-slate-700 dark:text-zinc-300 mt-2">
                {totalPendingBalance === 0 ? "All accounts fully settled" : `${nonArchivedJobs.filter(j => j.balanceDue > 0).length} jobs with pending balance`}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Active Machining</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#fe7518] flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-950 dark:text-zinc-100">{activeJobs.length} Running</div>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-1">{urgentJobs.length} high priority runs</p>
            </div>
          </div>
        )}

        {/* Card 3: Active Workshop Jobs */}
        <div 
          onClick={() => onNavigateTab("jobs")}
          className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-[#fe7518]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Active Workshop Jobs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <KanbanSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-zinc-100">{activeJobs.length}</span>
              <span className="text-xs text-slate-700 dark:text-zinc-300 font-bold">In Production</span>
            </div>
            <div className="text-xs text-[#fe7518] mt-2 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fe7518]" />
              <span>{urgentJobs.length} prioritized run(s)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Client Accounts */}
        <div 
          onClick={() => onNavigateTab("contacts")}
          className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-[#fe7518]/60 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Client Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-zinc-100">{nonArchivedContacts.length}</span>
              <span className="text-xs text-slate-700 dark:text-zinc-300 font-bold">Registered Clients</span>
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Active Machine Floor Jobs & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Jobs in Shop */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#fe7518]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Shop Floor Machine Runs
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                  {activeJobs.length} active
                </span>
              </div>
              <button
                onClick={() => onNavigateTab("jobs")}
                className="text-xs font-semibold text-[#fe7518] hover:underline flex items-center gap-1"
              >
                <span>View Full Kanban</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                No active jobs currently in production. Start by creating a Quotation.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {activeJobs.map((job) => {
                  const stagePills: Record<JobStage, { label: string; style: string }> = {
                    queued: { label: "Queued", style: "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
                    in_progress: { label: "In Production", style: "bg-orange-50 dark:bg-orange-950/40 text-[#fe7518] border-orange-200 dark:border-orange-800" },
                    qc: { label: "Quality Check", style: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
                    ready: { label: "Ready for Pickup", style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
                    delivered: { label: "Delivered", style: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700" },
                  };

                  const stageInfo = stagePills[job.stage] || stagePills.queued;

                  return (
                    <div 
                      key={job.id}
                      onClick={() => onOpenJobDetail(job.id)}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#fe7518] font-mono">
                            {job.id}
                          </span>
                          <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-100 hover:text-[#fe7518] transition-colors leading-tight">
                            {job.title}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${stageInfo.style}`}>
                            {stageInfo.label}
                          </span>
                          {job.priority === "urgent" && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-zinc-400">
                          <span>Client: <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{job.contactName}</strong></span>
                          <span>•</span>
                          <span>Trade: <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{job.trade}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 pt-2 sm:pt-0 border-t border-slate-100 dark:border-zinc-800 sm:border-0">
                        {permissions.canViewFinancials ? (
                          <>
                            <CurrencyDisplay amount={job.totalAmount} size="md" color="orange" />
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                              <span>Advance:</span>
                              <CurrencyDisplay amount={job.advancePaid} size="xs" numberColor="text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </>
                        ) : (
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{job.trade}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 block font-medium">Floor Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Trade Distribution & WhatsApp Activity */}
        <div className="space-y-6">
          {/* Trade Domain Breakdown */}
          <div className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#fe7518]" />
              <span>Jobs by Trade Domain</span>
            </h3>

            <div className="space-y-3">
              {trades.map((t) => {
                const total = nonArchivedJobs.length || 1;
                const percent = Math.round((t.count / total) * 100);
                return (
                  <div key={t.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-zinc-300 font-medium">{t.name}</span>
                      <span className="text-slate-900 dark:text-zinc-100 font-bold">{t.count} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%`, backgroundColor: t.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Communications Feed */}
          <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Recent WhatsApp Notes
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab("contacts")}
                className="text-xs font-semibold text-[#fe7518] hover:underline"
              >
                All Logs
              </button>
            </div>

            <div className="p-4 space-y-3">
              {recentLogs.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500 dark:text-zinc-400">
                  No WhatsApp logs recorded yet.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-zinc-100">{log.contactName}</span>
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px]">{log.date.split(" ")[0]}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {log.text}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                      <span>By {log.author}</span>
                      <a
                        href={`https://wa.me/${formatWhatsAppPhone(log.contactPhone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
