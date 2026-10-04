"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Edit,
  FileText,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Quote } from "@/types";
import { printIsolatedElement } from "@/lib/printHelper";
import { displayTrade } from "@/lib/quoteDocument";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { BuilderSource, QuoteBuilder } from "@/components/quotes/QuoteBuilder";
import { QuoteDocument } from "@/components/quotes/QuoteDocument";
import { FitToWidth } from "@/components/quotes/FitToWidth";

interface QuotesViewProps {
  preselectedContactId?: string;
  onPreselectConsumed?: () => void;
  onJobCreated?: (jobId: string) => void;
}

type StatusFilter = "all" | "sent" | "approved" | "converted";

export const QuotesView: React.FC<QuotesViewProps> = ({ preselectedContactId, onPreselectConsumed, onJobCreated }) => {
  const { quotes, settings, deleteQuote, convertQuoteToJob, formatCurrency } = useCrm();

  const [builder, setBuilder] = useState<BuilderSource | null>(
    preselectedContactId ? { kind: "new", contactId: preselectedContactId } : null
  );
  const [quotesMobileTab, setQuotesMobileTab] = useState<"list" | "preview">("list");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Conversion / deletion modals
  const [convertModalQuote, setConvertModalQuote] = useState<Quote | null>(null);
  const [convertAdvanceReceived, setConvertAdvanceReceived] = useState(true);
  const [convertDeadline, setConvertDeadline] = useState("");
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);

  // The contact hand-off from the Clients tab is one-shot: don't reopen the builder on every visit
  useEffect(() => {
    if (preselectedContactId) onPreselectConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeQuotes = quotes.filter((q) => !q.isArchived);
  const filteredQuotes = activeQuotes.filter((q) => {
    const matchesStatus =
      quoteStatusFilter === "all" ||
      (quoteStatusFilter === "converted" ? Boolean(q.convertedToJobId) : q.status === quoteStatusFilter);
    const term = quoteSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      [q.id, q.title, q.contactName, q.contactCompany, q.contactPhone, displayTrade(q)].some((v) =>
        (v || "").toLowerCase().includes(term)
      );
    return matchesStatus && matchesSearch;
  });
  const selectedQuote = activeQuotes.find((q) => q.id === selectedId) ?? filteredQuotes[0] ?? null;

  const openBuilder = (source: BuilderSource) => {
    setBuilder(source);
    document.querySelector("main")?.scrollTo({ top: 0 });
  };

  const handleBuilderDone = (saved: Quote | null) => {
    setBuilder(null);
    if (saved) {
      setSelectedId(saved.id);
      setQuotesMobileTab("preview");
    }
  };

  const handleConfirmDeleteQuote = () => {
    if (!quoteToDelete) return;
    deleteQuote(quoteToDelete.id);
    if (selectedId === quoteToDelete.id) setSelectedId(null);
    setQuoteToDelete(null);
  };

  const handleOpenConvertModal = (quote: Quote) => {
    setConvertModalQuote(quote);
    setConvertAdvanceReceived(true);
    setConvertDeadline(quote.validUntil);
  };

  const handleConfirmConvert = () => {
    if (!convertModalQuote) return;
    const job = convertQuoteToJob(convertModalQuote.id, convertDeadline, convertAdvanceReceived);
    setConvertModalQuote(null);
    onJobCreated?.(job.id);
  };

  const handlePrint = () => {
    if (!selectedQuote) return;
    printIsolatedElement("quotation-print-area", `PAKMEC Quotation ${selectedQuote.id} ${selectedQuote.contactName}`, {
      mode: "document",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-zinc-800 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#fe7518]" aria-hidden="true" />
              <span>{builder ? "Quotation Builder" : "Quotations & Estimates"}</span>
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 tabular-nums">
              {activeQuotes.length} saved
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
            {builder
              ? "Build any quotation from line items, specs, summary rows and extra pages — no fixed service lists."
              : "Search, review, print, duplicate and convert saved quotations."}
          </p>
        </div>

        {!builder && (
          <button
            type="button"
            onClick={() => openBuilder({ kind: "new" })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs sm:text-sm font-black min-h-[44px] py-2.5 px-5 rounded-xl shadow-sm border border-[#e56208] btn-haptic touch-manipulation"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>New quotation</span>
          </button>
        )}
      </div>

      {builder ? (
        <QuoteBuilder
          key={builder.kind === "new" ? `new-${builder.contactId || ""}` : `${builder.kind}-${builder.quote.id}`}
          source={builder}
          onDone={handleBuilderDone}
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile View Switcher */}
          <div className="lg:hidden flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 text-xs no-print">
            <button
              type="button"
              aria-pressed={quotesMobileTab === "list"}
              onClick={() => setQuotesMobileTab("list")}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors font-bold min-h-[44px] flex items-center justify-center gap-1.5 touch-manipulation ${
                quotesMobileTab === "list"
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              <span>Quotes ({filteredQuotes.length})</span>
            </button>
            <button
              type="button"
              aria-pressed={quotesMobileTab === "preview"}
              onClick={() => setQuotesMobileTab("preview")}
              disabled={!selectedQuote}
              className={`flex-1 py-2 px-3 rounded-lg transition-colors font-bold min-h-[44px] flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-40 ${
                quotesMobileTab === "preview"
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Quotation sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quotes List */}
            <div className={`lg:col-span-4 space-y-3 no-print ${quotesMobileTab === "preview" ? "hidden lg:block" : "block"}`}>
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-700 dark:text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <label htmlFor="quote-search" className="sr-only">
                    Search quotations
                  </label>
                  <input
                    id="quote-search"
                    type="search"
                    autoComplete="off"
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder="Search by ID, title, client, trade…"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] focus-visible:ring-2 focus-visible:ring-[#fe7518]/30 outline-none text-base sm:text-sm font-bold shadow-xs"
                  />
                </div>

                <div role="group" aria-label="Filter by status" className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {(
                    [
                      { id: "all", label: `All (${activeQuotes.length})` },
                      { id: "sent", label: "Sent" },
                      { id: "approved", label: "Approved" },
                      { id: "converted", label: "Converted" },
                    ] as { id: StatusFilter; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={quoteStatusFilter === tab.id}
                      onClick={() => setQuoteStatusFilter(tab.id)}
                      className={`px-3 min-h-[44px] sm:min-h-[32px] rounded-lg whitespace-nowrap shrink-0 font-bold transition-colors ${
                        quoteStatusFilter === tab.id
                          ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
                          : "text-slate-800 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white bg-slate-200 dark:bg-[#161822] border border-slate-300 dark:border-zinc-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <ul className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                {filteredQuotes.length === 0 ? (
                  <li className="p-6 text-center bg-white dark:bg-[#12141c] rounded-2xl border-2 border-slate-200 dark:border-zinc-800 space-y-2">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" aria-hidden="true" />
                    <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No quotations found</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {quoteSearch || quoteStatusFilter !== "all"
                        ? "No quotations match your search or filter."
                        : "Create your first quotation to see it here."}
                    </p>
                    {quoteSearch || quoteStatusFilter !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setQuoteSearch("");
                          setQuoteStatusFilter("all");
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700"
                      >
                        Clear search &amp; filter
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openBuilder({ kind: "new" })}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 min-h-[36px] rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        New quotation
                      </button>
                    )}
                  </li>
                ) : (
                  filteredQuotes.map((q) => {
                    const isSelected = selectedQuote?.id === q.id;
                    return (
                      <li
                        key={q.id}
                        className={`rounded-xl border-2 transition-colors ${
                          isSelected
                            ? "bg-white dark:bg-[#1c202d] border-[#fe7518] shadow-sm ring-2 ring-[#fe7518]/40"
                            : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600"
                        }`}
                      >
                        <button
                          type="button"
                          aria-current={isSelected ? "true" : undefined}
                          onClick={() => {
                            setSelectedId(q.id);
                            setQuotesMobileTab("preview");
                          }}
                          className="w-full text-left p-4 pb-2.5 space-y-2 rounded-t-xl"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#fe7518] font-mono tracking-wider" translate="no">
                              {q.id}
                            </span>
                            <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {q.status}
                            </span>
                          </div>
                          <div className="text-sm font-black text-slate-950 dark:text-zinc-100 truncate">{q.title}</div>
                          <div className="text-xs text-slate-600 dark:text-zinc-400 font-semibold truncate">
                            {displayTrade(q) || "No trade set"}
                          </div>
                          <div className="text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between gap-2 font-bold">
                            <span className="truncate min-w-0">{q.contactName}</span>
                            <CurrencyDisplay amount={q.total} size="sm" color="orange" />
                          </div>
                        </button>

                        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => openBuilder({ kind: "edit", quote: q })}
                            className="min-h-[44px] sm:min-h-[30px] px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold flex items-center gap-1 border border-slate-300 dark:border-zinc-700"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openBuilder({ kind: "duplicate", quote: q })}
                            className="min-h-[44px] sm:min-h-[30px] px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold flex items-center gap-1 border border-slate-300 dark:border-zinc-700"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuoteToDelete(q)}
                            aria-label={`Delete quotation ${q.id}`}
                            className="min-h-[44px] sm:min-h-[30px] px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1 border border-rose-300 dark:border-rose-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          {q.convertedToJobId ? (
                            <span className="ml-auto text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              {q.convertedToJobId}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenConvertModal(q)}
                              className="ml-auto min-h-[44px] sm:min-h-[30px] px-2.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs"
                            >
                              Start job
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Quotation preview */}
            <div className={`lg:col-span-8 min-w-0 ${quotesMobileTab === "list" ? "hidden lg:block" : "block"}`}>
              {selectedQuote ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white dark:bg-[#12141c] p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuotesMobileTab("list")}
                        className="lg:hidden inline-flex items-center gap-1.5 px-3 min-h-[44px] rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#fe7518]" aria-hidden="true" />
                        Quotes
                      </button>
                      <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Previewing</span>
                      <strong className="text-slate-950 dark:text-white font-mono text-sm" translate="no">
                        {selectedQuote.id}
                      </strong>
                      <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                        · {1 + (selectedQuote.pages?.length || 0)} page{selectedQuote.pages?.length ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openBuilder({ kind: "edit", quote: selectedQuote })}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 btn-haptic"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openBuilder({ kind: "duplicate", quote: selectedQuote })}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 btn-haptic"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteToDelete(selectedQuote)}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold min-h-[44px] sm:min-h-[36px] px-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 btn-haptic"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black min-h-[44px] sm:min-h-[36px] px-4 rounded-xl shadow-xs border border-[#e56208] btn-haptic"
                      >
                        <Printer className="w-4 h-4" aria-hidden="true" />
                        Print / PDF
                      </button>
                      {!selectedQuote.convertedToJobId && (
                        <button
                          type="button"
                          onClick={() => handleOpenConvertModal(selectedQuote)}
                          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black min-h-[44px] sm:min-h-[36px] px-4 rounded-xl btn-haptic shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                          Start production
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-200/70 dark:bg-zinc-900 p-3 sm:p-5">
                    <FitToWidth>
                      <QuoteDocument
                        id="quotation-print-area"
                        quote={selectedQuote}
                        company={settings.company}
                        formatCurrency={formatCurrency}
                      />
                    </FitToWidth>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center bg-white dark:bg-[#12141c] rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 space-y-2 no-print">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Select a quotation to preview it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Job Modal */}
      {convertModalQuote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overscroll-contain">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="convert-title"
            className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="border-b-2 border-slate-200 dark:border-zinc-800 pb-3">
              <h2 id="convert-title" className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#fe7518]" aria-hidden="true" />
                Approve quote &amp; start production
              </h2>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">
                Converts {convertModalQuote.id} into an active job on the production board.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-[#181a24] rounded-xl border-2 border-slate-200 dark:border-zinc-800 space-y-1.5">
                <div className="text-slate-950 dark:text-white font-black text-sm">{convertModalQuote.title}</div>
                <div className="text-[#c2410c] dark:text-[#fe7518] font-bold text-xs">Client: {convertModalQuote.contactName}</div>
                <div className="text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-700 tabular-nums">
                  <span>Total: {formatCurrency(convertModalQuote.total)}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">Advance: {formatCurrency(convertModalQuote.advanceRequired)}</span>
                </div>
              </div>

              <div>
                <label htmlFor="convert-deadline" className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Target completion deadline
                </label>
                <input
                  id="convert-deadline"
                  type="date"
                  value={convertDeadline}
                  onChange={(e) => setConvertDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-white p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-bold text-base sm:text-sm shadow-xs"
                />
              </div>

              <label
                htmlFor="advanceRec"
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181b24] border-2 border-slate-300 dark:border-zinc-800 flex items-start gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="advanceRec"
                  checked={convertAdvanceReceived}
                  onChange={(e) => setConvertAdvanceReceived(e.target.checked)}
                  className="w-5 h-5 accent-[#fe7518] rounded mt-0.5 shrink-0"
                />
                <span>
                  <span className="text-slate-950 dark:text-white font-extrabold text-sm block">
                    Advance of {formatCurrency(convertModalQuote.advanceRequired)} received
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mt-0.5">
                    Marks the deposit as collected and deducts it from the invoice balance.
                  </span>
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConvertModalQuote(null)}
                className="px-4 min-h-[44px] sm:min-h-[38px] rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-5 min-h-[44px] sm:min-h-[38px] rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs shadow-xs btn-haptic"
              >
                Start production job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quote Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overscroll-contain">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-quote-title"
            className="bg-white dark:bg-[#12141c] border-2 border-rose-300 dark:border-rose-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="delete-quote-title" className="text-base font-black text-slate-950 dark:text-white">
                  Delete quotation {quoteToDelete.id}?
                </h2>
                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  {quoteToDelete.contactName} • {formatCurrency(quoteToDelete.total)}
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-[#181a24] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              This permanently removes <strong className="font-mono text-slate-950 dark:text-white">{quoteToDelete.id}</strong> (
              {quoteToDelete.title}). This can’t be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                autoFocus
                onClick={() => setQuoteToDelete(null)}
                className="px-4 min-h-[44px] sm:min-h-[38px] rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuote}
                className="px-5 min-h-[44px] sm:min-h-[38px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm btn-haptic"
              >
                Delete quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
