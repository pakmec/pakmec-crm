"use client";

import React, { useState } from "react";
import { 
  Receipt, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  Search, 
  Clock, 
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import confetti from "canvas-confetti";
import { useCrm } from "@/context/CrmContext";
import { Invoice, PaymentRecord, InvoiceStatus } from "@/types";
import { printIsolatedElement } from "@/lib/printHelper";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface InvoicesViewProps {
  initialSelectedJobId?: string | null;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ initialSelectedJobId }) => {
  const { invoices, settings, recordInvoicePayment, formatCurrency } = useCrm();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    invoices.find(i => i.jobId === initialSelectedJobId)?.id || invoices[0]?.id || null
  );
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [mobileTab, setMobileTab] = useState<"list" | "preview">("list");

  // Payment Recording Modal
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord["method"]>("Bank Transfer");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  const activeInvoices = invoices.filter((i) => !i.isArchived);

  const filteredInvoices = activeInvoices.filter((i) => {
    const matchesStatus = filterStatus === "all" || i.status === filterStatus;
    const matchesSearch = 
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (i.jobId && i.jobId.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const selectedInvoice = activeInvoices.find(i => i.id === selectedInvoiceId) || filteredInvoices[0] || null;

  const handleOpenPaymentModal = (inv: Invoice) => {
    setPaymentModalInvoice(inv);
    const balanceRemaining = inv.balancePayable - inv.amountPaid;
    setPaymentAmount(Math.max(0, balanceRemaining));
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice || paymentAmount <= 0) return;

    recordInvoicePayment(paymentModalInvoice.id, {
      amount: paymentAmount,
      method: paymentMethod,
      referenceNumber: paymentRef.trim() || `TRX-${Date.now().toString().slice(-6)}`,
      notes: paymentNotes.trim(),
    });

    if (paymentModalInvoice.amountPaid + paymentAmount >= paymentModalInvoice.balancePayable) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }
    }

    setPaymentModalInvoice(null);
    setPaymentRef("");
    setPaymentNotes("");
  };

  // ISOLATED CLEAN PRINT: Prints ONLY the invoice sheet, never CRM sidebars or headers
  const handlePrint = () => {
    printIsolatedElement("invoice-print-area", `Invoice ${selectedInvoice?.id || "PAKMEC"}`);
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5 sm:pb-6 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#fe7518]" />
            <span>PAKMEC Invoicing & Settlements (PKR)</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Deducts initial advance deposits, tracks settlements across Bank Transfer, JazzCash & Cash in Multan, and generates clean printable tax invoices.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          {["all", "unpaid", "partial", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-mono uppercase transition-colors btn-haptic touch-manipulation ${
                filterStatus === status 
                  ? "bg-[#fe7518] text-slate-950 font-black" 
                  : "bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)] border border-[var(--border)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile View Switcher Tab */}
      <div className="lg:hidden flex items-center gap-2 p-1 rounded-lg bg-[var(--surface-100)] border border-[var(--border)] font-mono text-xs no-print">
        <button
          type="button"
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 px-3 rounded-md transition-all font-bold min-h-[38px] flex items-center justify-center gap-1.5 touch-manipulation ${
            mobileTab === "list"
              ? "bg-[#fe7518] text-slate-950 shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices List ({filteredInvoices.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("preview")}
          disabled={!selectedInvoice}
          className={`flex-1 py-2 px-3 rounded-md transition-all font-bold min-h-[38px] flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-40 ${
            mobileTab === "preview"
              ? "bg-[#fe7518] text-slate-950 shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Invoice & Pay</span>
        </button>
      </div>

      {/* Main Grid: Invoices List & Branded Invoice Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Invoices List */}
        <div className={`lg:col-span-4 space-y-3 no-print ${mobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              aria-label="Search invoices by ID or client name"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices by ID, client…"
              className="w-full bg-[var(--surface-100)] text-[16px] sm:text-xs text-[var(--foreground)] placeholder-slate-500 dark:placeholder-zinc-400 pl-8 pr-3 py-2 min-h-[40px] rounded-lg border border-[var(--border)] focus:border-[#fe7518] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fe7518]/50 font-sans touch-manipulation"
            />
          </div>

          <div 
            tabIndex={0}
            aria-label="Invoices list"
            className="space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-[#fe7518]"
          >
            {filteredInvoices.length === 0 ? (
              <div className="p-6 text-left bg-white dark:bg-[var(--surface-50)] rounded-xl border border-[var(--border)] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">No Invoices Found</h4>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Invoices are automatically created with advance deductions when quotations are approved for production.
                  </p>
                </div>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 text-xs font-semibold btn-haptic"
                  >
                    <span>Clear Search Filter</span>
                  </button>
                )}
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                const statusColors: Record<InvoiceStatus, string> = {
                  paid: "bg-emerald-100 dark:bg-[#0d1f16] text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-bold",
                  partial: "bg-amber-100 dark:bg-[#241a0a] text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-bold",
                  unpaid: "bg-blue-100 dark:bg-[#0d1929] text-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 font-bold",
                  overdue: "bg-rose-100 dark:bg-[#2b0e13] text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-700 font-bold",
                };

                const balanceRemaining = inv.balancePayable - inv.amountPaid;

                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setMobileTab("preview");
                    }}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 min-h-[50px] touch-manipulation ${
                      isSelected 
                        ? "bg-white dark:bg-[#1a1e2c] border-2 border-[#fe7518] shadow-md ring-1 ring-[#fe7518]/50" 
                        : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--surface-100)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#fe7518]">{inv.id}</span>
                      <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-md border ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                      {inv.contactName}
                    </div>

                    <div className="text-xs text-[var(--muted)] flex items-center justify-between font-mono">
                      <span>Ref: {inv.jobId || "Custom"}</span>
                      <CurrencyDisplay amount={inv.totalAmount} size="sm" color="orange" />
                    </div>

                    {/* Advance Deducted Tag */}
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono">
                      <span className="text-[var(--muted)] flex items-center gap-1">
                        Adv: <CurrencyDisplay amount={inv.advanceDeducted} size="xs" />
                      </span>
                      <span className={balanceRemaining > 0 ? "text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1" : "text-emerald-700 dark:text-emerald-400 font-bold"}>
                        {balanceRemaining > 0 ? (
                          <>
                            Due: <CurrencyDisplay amount={balanceRemaining} size="xs" color="amber" />
                          </>
                        ) : "Settled"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (8 Cols): Branded Invoice Preview & Isolated Print Canvas */}
        <div className={`lg:col-span-8 ${mobileTab === "list" ? "hidden lg:block" : "block"}`}>
          {selectedInvoice ? (
            <div className="space-y-4">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-[var(--card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setMobileTab("list")}
                    className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-semibold btn-haptic mr-1"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                    <span>Invoices</span>
                  </button>
                  <span className="font-mono text-xs text-[var(--muted)]">Invoice:</span>
                  <strong className="text-[var(--foreground)] font-mono text-sm sm:text-base">{selectedInvoice.id}</strong>
                  <span className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-md border ml-1 ${
                    selectedInvoice.status === "paid" 
                      ? "bg-emerald-100 dark:bg-[#0d1f16] text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold" 
                      : "bg-amber-100 dark:bg-[#241a0a] text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold"
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2.5 px-4 min-h-[40px] rounded-lg shadow-sm border border-[#e56208] btn-haptic"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Invoice</span>
                  </button>

                  {selectedInvoice.status !== "paid" && (
                    <button
                      onClick={() => handleOpenPaymentModal(selectedInvoice)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 px-3.5 min-h-[40px] rounded-lg shadow-sm border border-emerald-800 btn-haptic"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Record Settlement</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Invoice Document (with #invoice-print-area) */}
              <div 
                id="invoice-print-area"
                className="printable-document bg-white text-black p-8 sm:p-10 rounded-xl shadow-2xl border border-gray-200 print-surface font-sans space-y-8 min-h-[750px]"
              >
                {/* Header */}
                <div className="print-header flex items-start justify-between border-b-2 border-black pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="w-48 h-auto">
                      <img 
                        src="/pakmec-logo.png" 
                        alt="PAKMEC Engineering" 
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <p className="text-xs text-gray-700 font-mono tracking-wide pt-1">
                      {settings.company.tagline}
                    </p>
                    <p className="text-[11px] text-gray-600 font-mono">
                      {settings.company.address.replace(/\s+,/g, ",")} • {settings.company.phone}
                    </p>
                  </div>

                  <div className="print-title-col text-right font-mono shrink-0 whitespace-nowrap">
                    <div className="text-2xl font-black text-black">INVOICE</div>
                    <div className="text-sm font-bold text-[#c2410c]">{selectedInvoice.id}</div>
                    <div className="text-xs text-gray-700 mt-1 whitespace-nowrap">
                      Invoice Date:&nbsp;<span className="font-semibold text-gray-900">{selectedInvoice.date}</span>
                    </div>
                    <div className="text-xs text-gray-700 whitespace-nowrap">
                      Due Date:&nbsp;<span className="font-semibold text-gray-900">{selectedInvoice.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bill To & Reference */}
                <div className="print-meta-grid grid grid-cols-2 gap-6 text-xs">
                  <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                    <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Billed To</span>
                    <div className="font-bold text-sm text-black">{selectedInvoice.contactName}</div>
                    {selectedInvoice.contactCompany && (
                      <div className="text-gray-700">{selectedInvoice.contactCompany}</div>
                    )}
                    <div className="text-gray-600 font-mono">{selectedInvoice.contactPhone}</div>
                  </div>

                  <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                    <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Job & Settlement Info</span>
                    <div className="font-bold text-sm text-[#c2410c]">Job Ref: {selectedInvoice.jobId || "N/A"}</div>
                    <div className="text-gray-700 font-mono">Currency: PKR</div>
                    <div className="text-gray-600 font-mono text-[11px]">Payment Status: {selectedInvoice.status.toUpperCase()}</div>
                  </div>
                </div>

                {/* Line Items with Advance Credit Breakdown */}
                <div>
                  <table className="print-table w-full text-left text-xs border-collapse">
                    <colgroup>
                      <col style={{ width: "5%" }} />
                      <col style={{ width: "50%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "17%" }} />
                      <col style={{ width: "18%" }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b-2 border-black font-mono text-[11px] text-gray-700">
                        <th className="py-2.5 px-2 text-center">#</th>
                        <th className="py-2.5 px-2 text-left">Description</th>
                        <th className="py-2.5 px-2 text-right whitespace-nowrap">Qty</th>
                        <th className="py-2.5 px-2 text-right whitespace-nowrap">Unit Price (PKR)</th>
                        <th className="py-2.5 px-2 text-right whitespace-nowrap">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono">
                      {selectedInvoice.lineItems.map((item, idx) => (
                        <tr key={idx} className={item.amount < 0 ? "bg-emerald-50 font-semibold text-emerald-900 border-l-2 border-emerald-600" : ""}>
                          <td className="py-3 px-2 text-gray-500 text-center">{idx + 1}</td>
                          <td className="py-3 px-2 font-sans font-medium text-black">
                            {item.description}
                          </td>
                          <td className="py-3 px-2 text-right text-gray-800 whitespace-nowrap">{item.quantity}</td>
                          <td className="py-3 px-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-black tabular-nums whitespace-nowrap">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Payments Audit Log */}
                <div className="print-bottom border-t-2 border-black pt-4 flex flex-col sm:flex-row justify-between gap-6">
                  {/* Payment History Log */}
                  <div className="print-audit-col max-w-md space-y-2 text-xs">
                    <span className="font-mono font-bold text-[10px] uppercase text-gray-600">
                      Settlement / Transaction Audit History
                    </span>
                    {(selectedInvoice.payments || []).length === 0 ? (
                      <div className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-500 font-mono text-[11px]">
                        No settlement payments logged yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5 font-mono text-[11px]">
                        {selectedInvoice.payments.map((p) => {
                          const isAdvance = p.type === "advance" || (p.notes && p.notes.toLowerCase().includes("advance"));
                          return (
                            <div key={p.id} className="p-2.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-950">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                    isAdvance 
                                      ? "bg-blue-100 text-blue-900 border border-blue-300" 
                                      : "bg-emerald-200 text-emerald-950 border border-emerald-400"
                                  }`}>
                                    {isAdvance ? "Advance Deposit" : "Final Settlement"}
                                  </span>
                                  <span className="font-bold text-xs text-emerald-950">{p.method}</span>
                                  <span className="font-normal text-gray-600">• Ref:&nbsp;{p.referenceNumber}</span>
                                </div>
                                <div className="text-[10px] text-gray-600 font-mono">
                                  {p.date} • {p.notes || "PAKMEC Multan Workshop"}
                                </div>
                              </div>
                              <span className="font-bold tabular-nums whitespace-nowrap text-right pl-3 text-emerald-950">
                                {formatCurrency(p.amount)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] font-mono text-gray-600 space-y-0.5 mt-2">
                      <div><strong>Bank:</strong> {settings.company.bankName}</div>
                      <div><strong>Account Title:</strong> {settings.company.bankAccountTitle}</div>
                      <div><strong>IBAN:</strong> {settings.company.bankIban}</div>
                      <div><strong>JazzCash:</strong> {settings.company.jazzCashNumber}</div>
                    </div>
                  </div>

                  {/* Right Side Balances */}
                  <div className="print-totals-col w-84 sm:w-[350px] min-w-[340px] space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-baseline gap-3 text-gray-700 whitespace-nowrap">
                      <span className="shrink-0">Total Agreed Job Price:</span>
                      <span className="tabular-nums font-bold text-right">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>

                    <div className="flex justify-between items-baseline gap-3 text-emerald-700 font-semibold whitespace-nowrap">
                      <span className="shrink-0">Less: Advance Deposit Deducted:</span>
                      <span className="tabular-nums text-right font-bold">{formatCurrency(-selectedInvoice.advanceDeducted)}</span>
                    </div>

                    <div className="flex justify-between items-baseline gap-3 text-gray-900 border-t border-gray-300 pt-2 font-bold whitespace-nowrap">
                      <span className="shrink-0">Net Balance Invoiced:</span>
                      <span className="tabular-nums text-right">{formatCurrency(selectedInvoice.balancePayable)}</span>
                    </div>

                    <div className="flex justify-between items-baseline gap-3 text-emerald-700 whitespace-nowrap">
                      <span className="shrink-0">Total Settlements Paid:</span>
                      <span className="tabular-nums font-bold text-right">{formatCurrency(-selectedInvoice.amountPaid)}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-100 border border-gray-300 mt-2">
                      <div className="flex justify-between items-baseline gap-3 font-black text-sm text-black whitespace-nowrap">
                        <span className="shrink-0">Balance Due:</span>
                        <span className={`tabular-nums text-right ${selectedInvoice.balancePayable - selectedInvoice.amountPaid > 0 ? "text-amber-800" : "text-emerald-700"}`}>
                          {formatCurrency(Math.max(0, selectedInvoice.balancePayable - selectedInvoice.amountPaid))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-[10px] text-gray-500 font-mono pt-4 border-t border-gray-200">
                  PAKMEC Precision Engineering • Multan, Pakistan • www.pakmec.com
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Record Invoice Payment</span>
              </h3>
              <button 
                onClick={() => setPaymentModalInvoice(null)} 
                aria-label="Close payment modal"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-100)] border border-[var(--border)] font-mono space-y-1">
                <div className="text-[var(--foreground)] font-bold">{paymentModalInvoice.id}</div>
                <div className="text-[#fe7518]">Client: {paymentModalInvoice.contactName}</div>
                <div className="text-[var(--muted)] flex items-center gap-2">
                  <span>Balance Remaining:</span>
                  <CurrencyDisplay amount={paymentModalInvoice.balancePayable - paymentModalInvoice.amountPaid} size="xs" color="amber" />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Settlement Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount}
                  aria-label="Settlement Amount in Pakistani Rupees"
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  aria-label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="JazzCash">JazzCash (0300-8472910)</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="Cash">Cash (Multan Workshop)</option>
                  <option value="Cheque">Cross Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={paymentRef}
                  aria-label="Transaction Reference or Cheque Number"
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TRX-4482910, Cash Voucher #12"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Settlement Notes</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  aria-label="Settlement Notes"
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Paid upon parcel delivery, TCS receipt…"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Save Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
