"use client";

import React, { useState, useRef } from "react";
import { 
  KanbanSquare, 
  Plus, 
  Image as ImageIcon, 
  FileCode2, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  Pin,
  Trash2,
  DollarSign,
  ZoomIn,
  Download,
  Receipt, 
  UploadCloud, 
  Loader2,
  Inbox,
  Cog,
  CheckCheck,
  PackageCheck,
  Truck,
  ShieldCheck,
  Clock
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Job, JobStage, JobPriority, ReferenceItem, PaymentRecord } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface JobsKanbanViewProps {
  selectedJobIdFromGlobal?: string | null;
  onNavigateToInvoice?: (jobId: string) => void;
}

export const JobsKanbanView: React.FC<JobsKanbanViewProps> = ({ 
  selectedJobIdFromGlobal,
  onNavigateToInvoice 
}) => {
  const { 
    jobs, 
    updateJobStage, 
    addReferenceItem, 
    deleteReferenceItem, 
    recordJobAdvance,
    recordJobSettlement,
    formatCurrency,
    currentRole,
    permissions 
  } = useCrm();

  const activeJobs = jobs.filter((j) => !j.isArchived);

  const [activeJobId, setActiveJobId] = useState<string | null>(
    selectedJobIdFromGlobal || activeJobs[0]?.id || null
  );

  React.useEffect(() => {
    if (selectedJobIdFromGlobal) {
      setActiveJobId(selectedJobIdFromGlobal);
    }
  }, [selectedJobIdFromGlobal]);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"kanban" | "details">("kanban");
  const [selectedMobileStage, setSelectedMobileStage] = useState<string>("all");

  // Pin Form State
  const [pinTitle, setPinTitle] = useState("");
  const [pinType, setPinType] = useState<ReferenceItem["type"]>("image");
  const [pinUrl, setPinUrl] = useState("");
  const [pinNotes, setPinNotes] = useState("");
  const [pinTag, setPinTag] = useState("Workshop Photo");
  const [pinFileSize, setPinFileSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Advance Payment Form State
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advanceMethod, setAdvanceMethod] = useState<PaymentRecord["method"]>("Bank Transfer");
  const [advanceRef, setAdvanceRef] = useState("");

  // Settlement Payment Form State
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [settlementMethod, setSettlementMethod] = useState<PaymentRecord["method"]>("Bank Transfer");
  const [settlementRef, setSettlementRef] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");

  const activeJob = activeJobs.find((j) => j.id === activeJobId) || activeJobs[0] || null;

  const columns: { stage: JobStage; label: string; icon: React.ComponentType<{ className?: string }>; border: string }[] = [
    { stage: "queued", label: "Queued / Pending", icon: Inbox, border: "border-b-2 border-b-blue-500" },
    { stage: "in_progress", label: "In Production", icon: Cog, border: "border-b-2 border-b-[#fe7518]" },
    { stage: "qc", label: "Quality Control (QC)", icon: CheckCheck, border: "border-b-2 border-b-amber-500" },
    { stage: "ready", label: "Ready for Pickup", icon: PackageCheck, border: "border-b-2 border-b-emerald-500" },
    { stage: "delivered", label: "Delivered / Done", icon: Truck, border: "border-b-2 border-b-slate-400" },
  ];

  const handleNextStage = (jobId: string, current: JobStage) => {
    const order: JobStage[] = ["queued", "in_progress", "qc", "ready", "delivered"];
    const idx = order.indexOf(current);
    if (idx < order.length - 1) {
      updateJobStage(jobId, order[idx + 1]);
    }
  };

  const handlePrevStage = (jobId: string, current: JobStage) => {
    const order: JobStage[] = ["queued", "in_progress", "qc", "ready", "delivered"];
    const idx = order.indexOf(current);
    if (idx > 0) {
      updateJobStage(jobId, order[idx - 1]);
    }
  };

  // Real File Upload Handler (reads file, posts to /api/upload, saves directly to public/uploads)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setPinUrl(data.url);
        setPinFileSize(data.fileSize);
        if (!pinTitle) setPinTitle(file.name);

        // Auto-detect type
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
          setPinType("image");
          setPinTag("Photo");
        } else if (["step", "stp", "stl", "dxf", "dwg", "iges", "igs", "sldprt"].includes(ext || "")) {
          setPinType("cad_file");
          setPinTag("CAD Model");
        } else {
          setPinType("file");
          setPinTag("Document");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback to local preview URL
      const fallbackUrl = URL.createObjectURL(file);
      setPinUrl(fallbackUrl);
      if (!pinTitle) setPinTitle(file.name);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || !pinTitle.trim()) return;

    addReferenceItem(activeJob.id, {
      title: pinTitle.trim(),
      type: pinType,
      url: pinUrl.trim() || "/samples/ref-1.jpg",
      notes: pinNotes.trim(),
      tag: pinTag.trim(),
      fileSize: pinFileSize || (pinType === "cad_file" ? "3.2 MB" : "110 KB"),
    });

    setIsPinModalOpen(false);
    setPinTitle("");
    setPinNotes("");
    setPinUrl("");
    setPinFileSize("");
  };

  const handleRecordAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || advanceAmount <= 0) return;

    recordJobAdvance(activeJob.id, advanceAmount, advanceMethod, advanceRef);
    setIsAdvanceModalOpen(false);
    setAdvanceAmount(0);
    setAdvanceRef("");
  };

  const handleRecordSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob || settlementAmount <= 0) return;

    recordJobSettlement(
      activeJob.id,
      settlementAmount,
      settlementMethod,
      settlementRef || `SETTLE-${activeJob.id}`,
      settlementNotes || "Final balance settlement recorded from Job board prior to dispatch"
    );
    setIsSettlementModalOpen(false);
    setSettlementAmount(0);
    setSettlementRef("");
    setSettlementNotes("");
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-full no-print">
      {/* Top Bar */}
      <div className="p-3 sm:p-4 border-b border-[var(--border)] bg-[var(--surface-50)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <KanbanSquare className="w-4 sm:w-5 h-4 sm:h-5 text-[#fe7518]" />
            <span>Production Floor & Reference Board</span>
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Multan workshop Kanban pipeline, advance status tracking, and project media board.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[var(--muted)]">
          <span>Active Workshop Jobs: <strong className="text-[var(--foreground)]">{activeJobs.filter(j => j.stage !== "delivered").length}</strong></span>
        </div>
      </div>

      {/* Mobile View Switcher (Kanban Board vs Drawings & Media) */}
      <div className="lg:hidden px-3 py-2 bg-[var(--surface-100)] border-b border-[var(--border)] flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab("kanban")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all min-h-[40px] flex items-center justify-center gap-1.5 touch-manipulation ${
            mobileTab === "kanban" 
              ? "bg-[#fe7518] text-slate-950 shadow-sm" 
              : "bg-[var(--surface-200)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <KanbanSquare className="w-4 h-4" />
          <span>Floor Pipeline ({activeJobs.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("details")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-mono transition-all min-h-[40px] flex items-center justify-center gap-1.5 touch-manipulation ${
            mobileTab === "details" 
              ? "bg-[#fe7518] text-slate-950 shadow-sm" 
              : "bg-[var(--surface-200)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Pin className="w-4 h-4" />
          <span>Job Media ({activeJob?.referenceItems?.length || 0})</span>
        </button>
      </div>

      {/* Main Split: Kanban Columns & Reference Pin Board */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        {/* Kanban Board Area */}
        <div className={`w-full lg:w-3/5 border-r border-[var(--border)] bg-[var(--background)] p-3 sm:p-4 overflow-y-auto ${
          mobileTab === "details" ? "hidden lg:block" : "block"
        }`}>
          {/* Mobile Stage Selector Pills */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-2 no-scrollbar w-full">
            <button
              type="button"
              onClick={() => setSelectedMobileStage("all")}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono whitespace-nowrap transition-all touch-manipulation ${
                selectedMobileStage === "all"
                  ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm"
                  : "bg-[var(--surface-100)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              All Stages ({activeJobs.length})
            </button>
            {columns.map((col) => {
              const count = activeJobs.filter(j => j.stage === col.stage).length;
              const isSelected = selectedMobileStage === col.stage;
              return (
                <button
                  key={col.stage}
                  type="button"
                  onClick={() => setSelectedMobileStage(col.stage)}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation ${
                    isSelected
                      ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm"
                      : "bg-[var(--surface-100)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  }`}
                >
                  <span>{col.label.split(" ")[0]}</span>
                  <span className="text-[10px] opacity-80 font-bold">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Kanban Columns (Full width on mobile, 5-col grid on desktop) */}
          <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:min-w-[850px] w-full">
            {columns
              .filter((col) => selectedMobileStage === "all" || col.stage === selectedMobileStage)
              .map((col) => {
                const colJobs = activeJobs.filter((j) => j.stage === col.stage);

                return (
                  <div key={col.stage} className="flex flex-col bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden w-full min-h-0 md:min-h-[500px]">
                    {/* Column Header */}
                    <div className={`p-3 border-b ${col.border} bg-[var(--surface-100)] flex items-center justify-between`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {React.createElement(col.icon, { className: "w-4 h-4 text-[#fe7518] shrink-0" })}
                        <span className="text-xs font-bold text-[var(--foreground)] truncate">{col.label}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-200)] text-[var(--muted)] shrink-0 ml-1">
                        {colJobs.length}
                      </span>
                    </div>

                  {/* Column Cards */}
                  <div className="p-3 space-y-3.5 flex-1 overflow-y-auto">
                    {colJobs.length === 0 ? (
                      <div className="py-8 px-4 text-center text-xs text-[var(--muted)] font-mono border-2 border-dashed border-[var(--border)] rounded-xl">
                        No jobs currently in this stage
                      </div>
                    ) : (
                      colJobs.map((job) => {
                        const isSelected = activeJob?.id === job.id;
                        const priorityColors: Record<JobPriority, string> = {
                          urgent: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
                          high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                          medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
                          low: "bg-slate-500/15 text-slate-600 dark:text-zinc-400 border border-slate-500/30",
                        };

                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              setActiveJobId(job.id);
                              setMobileTab("details");
                            }}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 touch-manipulation ${
                              isSelected
                                ? "bg-white dark:bg-[#191d29] border-2 border-[#fe7518] shadow-md ring-1 ring-[#fe7518]/40"
                                : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-[#222736] hover:border-[#fe7518]/50 shadow-xs"
                            }`}
                          >
                            {/* Card Header: Job ID & Priority Badge */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[#fe7518]">
                                  {job.id}
                                </span>
                                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 truncate">
                                  {job.trade}
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${priorityColors[job.priority]}`}>
                                {job.priority}
                              </span>
                            </div>

                            {/* Prominent Legible Title */}
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                              {job.title}
                            </h4>

                            {/* Client Contact & Media Pin Count */}
                            <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between">
                              <span className="truncate">
                                Client: <strong className="text-slate-800 dark:text-zinc-200">{job.contactName}</strong>
                              </span>
                              <div className="flex items-center gap-1 shrink-0 ml-2 font-mono text-[11px] text-[#fe7518]">
                                <Pin className="w-3.5 h-3.5" />
                                <span>{job.referenceItems?.length || 0}</span>
                              </div>
                            </div>

                            {/* Clean Financial & Advance Status Box */}
                            {permissions.canViewFinancials ? (
                              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161924] border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-zinc-400 block font-medium">
                                    Total Agreed
                                  </span>
                                  <CurrencyDisplay amount={job.totalAmount} size="sm" color="orange" />
                                </div>

                                <div className="text-right">
                                  {job.advanceStatus === "collected" ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Advance Paid</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Advance Pending</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-[#101728] border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-xs font-mono">
                                <span className="text-blue-700 dark:text-blue-300 font-bold">Multan CNC Floor Run</span>
                                <span className="text-slate-500 dark:text-zinc-400 capitalize">{job.stage.replace("_", " ")}</span>
                              </div>
                            )}

                            {/* Stage Stepper Buttons */}
                            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/70 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                disabled={job.stage === "queued"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevStage(job.id, job.stage);
                                }}
                                className="flex-1 min-h-[42px] py-2 px-3 rounded-lg bg-slate-100 dark:bg-[#1a1d28] hover:bg-slate-200 dark:hover:bg-[#232736] disabled:opacity-35 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 btn-haptic touch-manipulation"
                                title="Move to Previous Stage"
                                aria-label="Move to previous stage"
                              >
                                <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                                <span>Prev Stage</span>
                              </button>

                              <button
                                type="button"
                                disabled={job.stage === "delivered"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextStage(job.id, job.stage);
                                }}
                                className="flex-1 min-h-[42px] py-2 px-3 rounded-lg bg-[#fe7518] hover:bg-[#e56208] disabled:opacity-35 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm border border-[#e56208] btn-haptic touch-manipulation"
                                title="Advance to Next Stage"
                                aria-label="Advance to next stage"
                              >
                                <span>Next Stage</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Reference Board (Pinterest-Style Media & Pin Grid) */}
        {activeJob ? (
          <div className={`w-full lg:w-2/5 bg-[var(--background)] flex flex-col overflow-y-auto ${
            mobileTab === "kanban" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Job Header & Advance Telemetry */}
            <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface-50)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileTab("kanban")}
                    className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 min-h-[34px] rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-semibold btn-haptic"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                    <span>Board</span>
                  </button>
                  <span className="text-xs font-mono text-[#fe7518] font-bold">
                    PIN BOARD • {activeJob.id}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-200)] text-[var(--muted)] uppercase">
                  {activeJob.stage.replace("_", " ")}
                </span>
              </div>

              <h2 className="text-base font-bold text-[var(--foreground)] leading-tight">
                {activeJob.title}
              </h2>

              {permissions.canViewFinancials ? (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-[var(--surface-100)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] text-[10px] block mb-1">Advance Collected</span>
                      <CurrencyDisplay amount={activeJob.advancePaid} size="sm" color="green" />
                    </div>
                    <div className="p-2.5 rounded bg-[var(--surface-100)] border border-[var(--border)]">
                      <span className="text-[var(--muted)] text-[10px] block mb-1">Remaining Due</span>
                      <CurrencyDisplay amount={activeJob.balanceDue} size="sm" color="amber" />
                    </div>
                  </div>

                  {/* Delivery Clearance & Cash Flow Status Banner */}
                  {activeJob.balanceDue === 0 ? (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-[#0c1c14] border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold block">100% Settled — Cleared for Delivery</span>
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400">All dues collected. Cleared for TCS courier dispatch or client handover.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-[#1f1608] border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-300 text-xs font-mono flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold block">Balance Due: {formatCurrency(activeJob.balanceDue)}</span>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400">Courier parcels require settlement before dispatch; local accounts settle on delivery.</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-[var(--surface-100)] border border-[var(--border)]">
                    <span className="text-[var(--muted)] text-[10px] block mb-1">Trade & Trade Domain</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">{activeJob.trade}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--surface-100)] border border-[var(--border)]">
                    <span className="text-[var(--muted)] text-[10px] block mb-1">Shop Floor Stage</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{activeJob.stage.replace("_", " ")}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons for this Job */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {permissions.canViewFinancials && activeJob.advanceStatus !== "collected" && (
                  <button
                    onClick={() => {
                      setAdvanceAmount(activeJob.balanceDue);
                      setIsAdvanceModalOpen(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md btn-haptic"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Collect Advance</span>
                  </button>
                )}

                {permissions.canRecordSettlements && activeJob.balanceDue > 0 && (
                  <button
                    onClick={() => {
                      setSettlementAmount(activeJob.balanceDue);
                      setIsSettlementModalOpen(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md btn-haptic"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Record Settlement</span>
                  </button>
                )}

                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold transition-all shadow-md btn-haptic"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Media / CAD</span>
                </button>

                {onNavigateToInvoice && (
                  <button
                    onClick={() => onNavigateToInvoice(activeJob.id)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 btn-haptic"
                    title="View Invoice Sheet"
                    aria-label="View invoice sheet"
                  >
                    <Receipt className="w-4 h-4 text-[#fe7518]" />
                  </button>
                )}
              </div>
            </div>

            {/* Pinterest-Style Masonry Reference Cards */}
            <div className="p-5 flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-[var(--muted)] flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-[#fe7518]" />
                  <span>Project Reference Pins ({activeJob.referenceItems?.length || 0})</span>
                </h3>
                <span className="text-[10px] text-[var(--muted)] font-mono">CAD, client photos & notes</span>
              </div>

              {(activeJob.referenceItems || []).length === 0 ? (
                <div className="p-6 text-left bg-white dark:bg-[var(--surface-50)] rounded-xl border border-[var(--border)] space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1d26] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                    <Pin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">No Reference Pins Attached</h4>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Attach client WhatsApp images, engineering drawings (.step, .stl, .dxf), or shop progress photos to this job.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#fe7518] hover:bg-[#e56208] text-white text-xs font-semibold btn-haptic"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload CAD / Media File</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {activeJob.referenceItems.map((item) => {
                    const isImage = item.type === "image" || item.type === "progress_photo" || item.url?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

                    return (
                      <div
                        key={item.id}
                        className="group bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden hover:border-[#fe7518]/50 transition-all flex flex-col justify-between shadow-sm"
                      >
                        {/* Image Thumbnail */}
                        {isImage && item.url && (
                          <div 
                            className="relative w-full h-36 bg-[var(--surface-100)] overflow-hidden cursor-pointer"
                            onClick={() => setPreviewImage(item.url)}
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                            <span className="absolute top-2 left-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-sm">
                              {item.tag || "Image"}
                            </span>
                          </div>
                        )}

                        {/* CAD File Card */}
                        {(item.type === "cad_file" || (!isImage && item.type !== "note" && item.type !== "link")) && (
                          <div className="p-4 bg-[var(--surface-100)] border-b border-[var(--border)] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#1c202a] flex items-center justify-center text-[#fe7518] border border-slate-300 dark:border-[#2a3040]">
                              <FileCode2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-[#fe7518] block">{item.tag || "CAD Asset"}</span>
                              <span className="text-xs font-mono font-bold text-[var(--foreground)] block truncate">{item.title}</span>
                              <span className="text-[10px] text-[var(--muted)] font-mono">{item.fileSize || "File"}</span>
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                download
                                className="p-1.5 rounded bg-[var(--surface-200)] text-[var(--muted)] hover:text-white hover:bg-[#fe7518] transition-colors"
                                title="Download File"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Note Card */}
                        {item.type === "note" && (
                          <div className="p-3 bg-amber-100 dark:bg-[#20170a] border-b border-amber-300 dark:border-amber-700/60 flex items-center gap-2 text-amber-950 dark:text-amber-300 text-xs font-mono font-semibold">
                            <FileText className="w-4 h-4" />
                            <span>{item.tag || "Engineering Note"}</span>
                          </div>
                        )}

                        {/* Link Card */}
                        {item.type === "link" && (
                          <div className="p-3 bg-blue-100 dark:bg-[#0c1626] border-b border-blue-300 dark:border-blue-700/60 flex items-center gap-2 text-blue-950 dark:text-blue-300 text-xs font-mono font-semibold">
                            <ExternalLink className="w-4 h-4" />
                            <span>{item.tag || "External Resource"}</span>
                          </div>
                        )}

                        {/* Card Content & Details */}
                        <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-xs font-bold text-[var(--foreground)]">{item.title}</div>
                            {item.notes && (
                              <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-1">
                                {item.notes}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
                            <span>{item.uploadedAt?.split(",")[0] || "Multan Shop"}</span>
                            <button
                              type="button"
                              onClick={() => deleteReferenceItem(activeJob.id, item.id)}
                              className="text-[var(--muted)] hover:text-red-400 transition-colors p-1"
                              title="Delete Pin"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Upload Media / Pin Modal */}
      {isPinModalOpen && activeJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#fe7518]" />
                <span>Upload & Pin to {activeJob.id}</span>
              </h3>
              <button 
                onClick={() => setIsPinModalOpen(false)} 
                aria-label="Close upload modal"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPin} className="space-y-3.5 text-xs">
              {/* Genuine File Upload Picker */}
              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">
                  Upload Any File from PC / Mobile (Image, CAD .step/.stl/.dxf, PDF)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--border)] hover:border-[#fe7518] bg-[var(--surface-100)] p-4 rounded-xl text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-[var(--foreground)]">
                      <Loader2 className="w-6 h-6 text-[#fe7518] animate-spin" />
                      <span className="font-mono text-xs">Uploading file to server…</span>
                    </div>
                  ) : pinUrl ? (
                    <div className="flex flex-col items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-mono text-xs font-bold">File Attached & Ready</span>
                      <span className="text-[10px] text-[var(--muted)] truncate max-w-xs">{pinUrl}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-[var(--muted)]">
                      <UploadCloud className="w-6 h-6 text-[#fe7518]" />
                      <span className="text-xs font-medium text-[var(--foreground)]">Click or drag file here to upload</span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">Supports .png, .jpg, .stl, .step, .dxf, .dwg, .pdf</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Pin Title *</label>
                <input
                  type="text"
                  required
                  value={pinTitle}
                  aria-label="Pin Title"
                  onChange={(e) => setPinTitle(e.target.value)}
                  placeholder="e.g. Tariq WhatsApp Spec Drawing, Billet Pass 1"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Pin Category</label>
                  <select
                    value={pinType}
                    aria-label="Pin Category"
                    onChange={(e) => setPinType(e.target.value as any)}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  >
                    <option value="image">Client Image / Screenshot</option>
                    <option value="progress_photo">Workshop Progress Photo</option>
                    <option value="cad_file">3D CAD / DXF File</option>
                    <option value="note">Setup / Tooling Note</option>
                    <option value="file">Document / PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Tag Label</label>
                  <input
                    type="text"
                    value={pinTag}
                    aria-label="Tag Label"
                    onChange={(e) => setPinTag(e.target.value)}
                    placeholder="e.g. Client Spec, QC, Tolerance"
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Engineering Notes</label>
                <textarea
                  rows={2}
                  value={pinNotes}
                  aria-label="Engineering Notes"
                  onChange={(e) => setPinNotes(e.target.value)}
                  placeholder="Key machining notes, RPM settings, client audio message details…"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md"
                >
                  Pin to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Advance Modal */}
      {isAdvanceModalOpen && activeJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Collect Advance Deposit</span>
              </h3>
              <button 
                onClick={() => setIsAdvanceModalOpen(false)} 
                aria-label="Close advance deposit modal"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordAdvance} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-100)] border border-[var(--border)] font-mono space-y-1">
                <div className="text-[var(--foreground)] font-bold">{activeJob.title}</div>
                <div className="text-[#fe7518]">Client: {activeJob.contactName}</div>
                <div className="text-[var(--muted)] flex items-center gap-3">
                  <span>Total: <CurrencyDisplay amount={activeJob.totalAmount} size="xs" /></span>
                  <span>|</span>
                  <span>Due: <CurrencyDisplay amount={activeJob.balanceDue} size="xs" color="amber" /></span>
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Advance Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={advanceAmount}
                  aria-label="Advance Amount in Pakistani Rupees"
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Payment Method</label>
                <select
                  value={advanceMethod}
                  aria-label="Payment Method"
                  onChange={(e) => setAdvanceMethod(e.target.value as any)}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="JazzCash">JazzCash (0300-8472910)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Cash">Cash (Multan Workshop In-Person)</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Transaction Ref No.</label>
                <input
                  type="text"
                  value={advanceRef}
                  aria-label="Transaction Reference Number"
                  onChange={(e) => setAdvanceRef(e.target.value)}
                  placeholder="e.g. TRX-992019, Meezan Receipt"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-md btn-haptic"
                >
                  Confirm Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Settlement Modal (Direct from Kanban Board) */}
      {isSettlementModalOpen && activeJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Record Balance Settlement</span>
              </h3>
              <button 
                onClick={() => setIsSettlementModalOpen(false)} 
                aria-label="Close settlement modal"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordSettlement} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-100)] border border-[var(--border)] font-mono space-y-1">
                <div className="text-[var(--foreground)] font-bold">{activeJob.title}</div>
                <div className="text-[#fe7518]">Client: {activeJob.contactName}</div>
                <div className="text-[var(--muted)] flex items-center justify-between pt-1">
                  <span>Total: <CurrencyDisplay amount={activeJob.totalAmount} size="xs" /></span>
                  <span>Adv Paid: <CurrencyDisplay amount={activeJob.advancePaid} size="xs" color="green" /></span>
                  <span className="font-bold">Due: <CurrencyDisplay amount={activeJob.balanceDue} size="xs" color="amber" /></span>
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Settlement Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={activeJob.balanceDue}
                  value={settlementAmount}
                  aria-label="Settlement Amount in Pakistani Rupees"
                  onChange={(e) => setSettlementAmount(Number(e.target.value))}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Payment Method</label>
                <select
                  value={settlementMethod}
                  aria-label="Payment Method"
                  onChange={(e) => setSettlementMethod(e.target.value as any)}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="JazzCash">JazzCash (0300-8472910)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Cash">Cash (Multan Workshop Handover)</option>
                  <option value="Cheque">Cross Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={settlementRef}
                  aria-label="Transaction Reference Number"
                  onChange={(e) => setSettlementRef(e.target.value)}
                  placeholder="e.g. HBL-TRX-992019, Meezan Receipt, Cash Slip"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Settlement Notes</label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  aria-label="Settlement Notes"
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  placeholder="Paid before TCS dispatch, handed over at Multan workshop…"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)] btn-haptic"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold shadow-md btn-haptic"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <img 
              src={previewImage} 
              alt="Reference Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl border border-white/20 shadow-2xl" 
            />
            <span className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-mono">
              Click anywhere to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
