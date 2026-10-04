"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookmarkPlus,
  Calculator,
  ChevronDown,
  ChevronLeft,
  Copy,
  Eye,
  FileText,
  PenLine,
  Search,
  X,
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Contact, Quote, QuoteLineItem } from "@/types";
import {
  BLANK_SEED,
  INFO_ROW_PRESETS,
  MACHINE_BUILD_SEED,
  QUOTE_TOKENS,
  QuoteDraft,
  QuoteSeed,
  addDaysISO,
  cleanDraft,
  computeTotals,
  defaultPaymentDetails,
  draftFromQuote,
  draftFromSeed,
  emptyLineItem,
  insertAfter,
  lineAmount,
  moveById,
  nextSequentialId,
  removeById,
  standardPaymentTerms,
  templateFromDraft,
  uid,
  withFreshIds,
} from "@/lib/quoteDocument";
import { useKnownTrades } from "@/components/ui/TradeInput";
import { QuoteDocument } from "./QuoteDocument";
import { RateCalculator } from "./RateCalculator";
import { PagesEditor } from "./PagesEditor";
import { FitToWidth } from "./FitToWidth";
import {
  AddButton,
  Disclosure,
  IconButton,
  KeyValueEditor,
  NumberField,
  RowControls,
  SectionCard,
  Segmented,
  SuggestionChips,
  TextAreaField,
  TextField,
  inputClass,
} from "./fields";

export type BuilderSource =
  | { kind: "new"; contactId?: string }
  | { kind: "edit"; quote: Quote }
  | { kind: "duplicate"; quote: Quote };

interface QuoteBuilderProps {
  source: BuilderSource;
  /** Called with the saved quote, or null when the user backs out. */
  onDone: (quote: Quote | null) => void;
}

const ADVANCE_PRESETS = [0, 20, 30, 50, 70, 100];
const BALANCE_LABELS = ["Balance Due on Completion", "Balance Due on Delivery", "Balance Payable Before Dispatch"];

const SECTIONS = [
  { id: "qb-client", label: "Client" },
  { id: "qb-details", label: "Details" },
  { id: "qb-items", label: "Items" },
  { id: "qb-payment", label: "Pricing & payment" },
  { id: "qb-pages", label: "Extra pages" },
];

const TokenHint: React.FC = () => (
  <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">
    Placeholders fill in automatically:{" "}
    {QUOTE_TOKENS.map((tk, i) => (
      <React.Fragment key={tk.token}>
        {i > 0 && " · "}
        <code className="font-mono font-bold text-slate-700 dark:text-zinc-300" title={tk.meaning} translate="no">
          {tk.token}
        </code>
      </React.Fragment>
    ))}
  </p>
);

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ source, onDone }) => {
  const { contacts, quotes, settings, createQuote, createQuoteWithNewContact, updateQuote, updateSettings, formatCurrency } = useCrm();
  const company = settings.company;
  const editing = source.kind === "edit" ? source.quote : null;
  const canUseTemplates = source.kind !== "edit";
  const activeContacts = contacts.filter((c) => !c.isArchived);

  // ---------------------------------------------------------------- client
  const initialContactId = source.kind === "new" ? source.contactId || "" : source.quote.contactId;
  const [clientMode, setClientMode] = useState<"existing" | "new">(
    initialContactId || activeContacts.length > 0 ? "existing" : "new"
  );
  const [contactId, setContactId] = useState(initialContactId);
  const [pickingClient, setPickingClient] = useState(!initialContactId);
  const [clientQuery, setClientQuery] = useState("");
  const [newClient, setNewClient] = useState({ name: "", phone: "", company: "", city: company.city || "Multan" });
  const selectedContact: Contact | undefined = contacts.find((c) => c.id === contactId);

  // ---------------------------------------------------------------- draft
  const [draft, setDraft] = useState<QuoteDraft>(() => {
    if (source.kind !== "new") return draftFromQuote(source.quote, company, source.kind === "duplicate");
    const fresh = draftFromSeed(BLANK_SEED(company.defaultAdvancePercent || 50), company);
    const preselected = contacts.find((c) => c.id === source.contactId);
    return preselected ? { ...fresh, clientAddress: preselected.address || preselected.city || "" } : fresh;
  });
  const [dirty, setDirty] = useState(source.kind === "duplicate");
  const change = (patch: Partial<QuoteDraft> | ((d: QuoteDraft) => Partial<QuoteDraft>)) => {
    setDraft((d) => ({ ...d, ...(typeof patch === "function" ? patch(d) : patch) }));
    setDirty(true);
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [showCalculator, setShowCalculator] = useState(false);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState("");

  const clientSearchRef = useRef<HTMLInputElement>(null);
  const clientNameRef = useRef<HTMLInputElement>(null);
  const clientPhoneRef = useRef<HTMLInputElement>(null);
  const addItemRef = useRef<HTMLButtonElement>(null);
  const templateNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const knownTrades = useKnownTrades();

  const clientMatches = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    const list = q
      ? activeContacts.filter((c) =>
          [c.name, c.company, c.phone, c.city].some((v) => (v || "").toLowerCase().includes(q))
        )
      : activeContacts;
    return list.slice(0, 8);
  }, [clientQuery, activeContacts]);

  const totals = computeTotals(draft.lineItems, draft.discount, {
    mode: draft.advanceMode,
    percent: draft.advancePercent,
    amount: draft.advanceAmount,
  });
  const quoteId = editing ? editing.id : nextSequentialId("QT", quotes.map((q) => q.id));

  const client =
    clientMode === "new"
      ? { id: "", name: newClient.name.trim(), phone: newClient.phone.trim(), company: newClient.company.trim() }
      : selectedContact
        ? { id: selectedContact.id, name: selectedContact.name, phone: selectedContact.phone, company: selectedContact.company }
        : editing
          ? { id: editing.contactId, name: editing.contactName, phone: editing.contactPhone, company: editing.contactCompany || "" }
          : { id: "", name: "", phone: "", company: "" };

  const buildQuote = (d: QuoteDraft): Quote => {
    const t = computeTotals(d.lineItems, d.discount, { mode: d.advanceMode, percent: d.advancePercent, amount: d.advanceAmount });
    return {
      ...(editing || {}),
      id: quoteId,
      contactId: client.id,
      contactName: client.name,
      contactPhone: client.phone,
      contactCompany: client.company,
      title: d.title.trim() || `${d.trade.trim() || "Custom"} order for ${client.name || "client"}`,
      trade: d.trade.trim(),
      status: editing?.status || "sent",
      currency: "PKR",
      date: d.date,
      validUntil: addDaysISO(d.date, d.validDays),
      specs: { ...(editing?.specs || {}), trade: d.trade.trim() },
      lineItems: d.lineItems,
      subtotal: t.subtotal,
      discount: t.discount,
      total: t.total,
      advancePercent: t.advancePercent,
      advanceRequired: t.advance,
      notes: d.notes,
      terms: d.terms,
      clientAddress: d.clientAddress,
      advanceStatus: d.advanceStatus,
      balanceLabel: d.balanceLabel,
      infoRows: d.infoRows,
      paymentDetails: d.paymentDetails,
      pages: d.pages,
    };
  };

  const previewQuote = buildQuote(draft);

  // ---------------------------------------------------------------- actions
  const confirmDiscard = (message: string) => !dirty || window.confirm(message);

  const handleCancel = () => {
    if (confirmDiscard("Discard unsaved changes to this quotation?")) onDone(null);
  };

  const applySeed = (seed: QuoteSeed) => {
    if (!confirmDiscard("Replace the current quotation content with this starting point?")) return;
    const next = draftFromSeed(seed, company);
    setDraft((d) => ({ ...next, clientAddress: d.clientAddress, date: d.date }));
    setDirty(true);
    setShowCalculator(false);
  };

  const pickContact = (c: Contact) => {
    setContactId(c.id);
    setPickingClient(false);
    setClientQuery("");
    setErrors(({ client: _ignored, ...rest }) => rest);
    change({ clientAddress: c.address || c.city || "" });
  };

  const setTrade = (next: string) =>
    change((d) => ({
      trade: next,
      // Items still following the quote's trade move with it; custom categories stay
      lineItems: d.lineItems.map((item) => (!item.trade.trim() || item.trade === d.trade ? { ...item, trade: next } : item)),
    }));

  const updateItem = (id: string, patch: Partial<QuoteLineItem>) =>
    change((d) => ({
      lineItems: d.lineItems.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        if ("quantity" in patch || "unitPrice" in patch) next.amount = lineAmount(next.quantity, next.unitPrice);
        return next;
      }),
    }));

  const addItem = () => change((d) => ({ lineItems: [...d.lineItems, emptyLineItem(d.trade)] }));

  const handleSaveTemplate = () => {
    const name = (templateName || "").trim();
    if (!name) {
      setTemplateError("Give the template a name.");
      templateNameRef.current?.focus();
      return;
    }
    const template = templateFromDraft(name, draft);
    updateSettings({ ...settings, quoteTemplates: [...(settings.quoteTemplates || []), template] });
    setTemplateName(null);
    setTemplateError("");
    setNotice(`Saved template “${name}”. It’s now under “Start from”.`);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (!window.confirm(`Delete the saved template “${name}”? Quotes already made from it are not affected.`)) return;
    updateSettings({ ...settings, quoteTemplates: (settings.quoteTemplates || []).filter((t) => t.id !== id) });
    setNotice(`Deleted template “${name}”.`);
  };

  const handleSave = () => {
    const clean = cleanDraft(draft);
    const errs: Record<string, string> = {};
    if (clientMode === "existing" && !client.id) errs.client = "Pick a registered client, or switch to New client.";
    if (clientMode === "new") {
      if (!newClient.name.trim()) errs.clientName = "Enter the client’s name.";
      if (!newClient.phone.trim()) errs.clientPhone = "Enter a WhatsApp / phone number.";
    }
    if (!clean.lineItems.length) errs.items = "Add at least one line item with a title or amount.";
    setErrors(errs);

    if (Object.keys(errs).length) {
      setMobileView("edit");
      // Focus the first problem so keyboard and screen-reader users land on it
      requestAnimationFrame(() => {
        if (errs.client) clientSearchRef.current?.focus();
        else if (errs.clientName) clientNameRef.current?.focus();
        else if (errs.clientPhone) clientPhoneRef.current?.focus();
        else if (errs.items) addItemRef.current?.focus();
      });
      return;
    }

    const quote = buildQuote(clean);
    setDirty(false);

    if (editing) {
      updateQuote(quote);
      onDone(quote);
      return;
    }

    const { id: _id, ...withoutId } = quote;
    if (clientMode === "new") {
      const { contactId: _cid, contactName: _n, contactPhone: _p, contactCompany: _c, ...quoteData } = withoutId;
      const { quote: created } = createQuoteWithNewContact(quoteData, {
        name: newClient.name.trim(),
        phone: newClient.phone.trim(),
        company: newClient.company.trim(),
        city: newClient.city.trim(),
        address: clean.clientAddress,
      });
      onDone(created);
    } else {
      onDone(createQuote(withoutId));
    }
  };

  const starters: { id: string; name: string; seed: () => QuoteSeed; removable?: boolean }[] = [
    { id: "blank", name: "Blank quotation", seed: () => BLANK_SEED(company.defaultAdvancePercent || 50) },
    { id: "machine", name: "Machine build · 3 pages", seed: MACHINE_BUILD_SEED },
    ...(settings.quoteTemplates || []).map((t) => ({ id: t.id, name: t.name, seed: () => t, removable: true })),
  ];

  const missingPaymentRows = [
    { label: "JazzCash", value: company.jazzCashNumber },
    { label: "EasyPaisa", value: company.easyPaisaNumber },
  ].filter((r) => r.value?.trim() && !draft.paymentDetails.some((p) => p.label.trim().toLowerCase() === r.label.toLowerCase()));

  const saveLabel = editing ? "Save changes" : "Save & issue quotation";

  // ---------------------------------------------------------------- render
  return (
    <div
      className="space-y-4"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          handleSave();
        }
      }}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 no-print">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap min-h-[44px] sm:min-h-[36px] px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700 touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4 text-[#fe7518]" aria-hidden="true" />
            Saved quotes
          </button>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-950 dark:text-white truncate">
              {editing ? "Editing" : "New quotation"}{" "}
              <span className="font-mono text-[#fe7518]" translate="no">
                {quoteId}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
              {source.kind === "duplicate" && <>Copied from {source.quote.id} · </>}
              {dirty ? "Unsaved changes" : "No changes yet"} · Ctrl&nbsp;+&nbsp;Enter saves
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="xl:hidden">
            <Segmented
              label="Builder view"
              value={mobileView}
              options={[
                { value: "edit", label: "Edit" },
                { value: "preview", label: "Preview" },
              ]}
              onChange={setMobileView}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-[36px] px-4 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs border border-[#e56208] touch-manipulation"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            {saveLabel}
          </button>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {notice}
      </div>
      {notice && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 no-print">
          <span>{notice}</span>
          <IconButton label="Dismiss message" onClick={() => setNotice("")}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>
      )}

      {/* Starting point + template tools */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 space-y-3 no-print">
        {canUseTemplates && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Start from</div>
            <div className="flex flex-wrap gap-1.5">
              {starters.map((s) => (
                <span key={s.id} className="inline-flex items-stretch rounded-lg border border-slate-300 dark:border-zinc-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => applySeed(s.seed())}
                    className="min-h-[44px] sm:min-h-[30px] px-2.5 text-xs font-bold bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-slate-950 dark:hover:text-white touch-manipulation"
                  >
                    {s.name}
                  </button>
                  {s.removable && (
                    <button
                      type="button"
                      aria-label={`Delete template ${s.name}`}
                      title="Delete template"
                      onClick={() => handleDeleteTemplate(s.id, s.name)}
                      className="min-w-[36px] sm:min-w-[26px] flex items-center justify-center border-l border-slate-300 dark:border-zinc-700 text-slate-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {templateName === null ? (
          <button
            type="button"
            onClick={() => {
              setTemplateName(draft.title || draft.trade || "");
              requestAnimationFrame(() => templateNameRef.current?.focus());
            }}
            className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[30px] text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-[#fe7518]"
          >
            <BookmarkPlus className="w-4 h-4 text-[#fe7518]" aria-hidden="true" />
            Save this layout as a reusable template…
          </button>
        ) : (
          <form
            className="flex flex-wrap items-start gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveTemplate();
            }}
          >
            <TextField
              ref={templateNameRef}
              className="flex-1 min-w-[12rem]"
              label="Template name"
              name="templateName"
              autoComplete="off"
              value={templateName}
              onValue={(v) => {
                setTemplateName(v);
                setTemplateError("");
              }}
              error={templateError}
              hint="Saves items, specs, summary rows, terms and pages — not the client."
              placeholder="e.g. CNC machine build…"
            />
            <div className="flex gap-2 sm:mt-5">
              <button type="submit" className="min-h-[44px] sm:min-h-[38px] px-4 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black">
                Save template
              </button>
              <button
                type="button"
                onClick={() => {
                  setTemplateName(null);
                  setTemplateError("");
                }}
                className="min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* ============================== Editor ============================== */}
        <div className={`space-y-5 min-w-0 no-print ${mobileView === "preview" ? "hidden xl:block" : ""}`}>
          <nav aria-label="Builder sections" className="flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-2.5 py-1 min-h-[44px] sm:min-h-[28px] inline-flex items-center rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:text-slate-950 dark:hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </nav>

          {/* 1. Client */}
          <SectionCard
            id="qb-client"
            step={1}
            title="Client"
            description="Who the quotation is addressed to."
            aside={
              !editing && (
                <Segmented
                  label="Client type"
                  value={clientMode}
                  options={[
                    { value: "existing", label: "Registered client" },
                    { value: "new", label: "New client" },
                  ]}
                  onChange={(mode) => {
                    setClientMode(mode);
                    setErrors({});
                  }}
                />
              )
            }
          >
            {clientMode === "existing" ? (
              <div className="space-y-3">
                {client.id && !pickingClient ? (
                  <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-950 dark:text-white break-words">{client.name}</div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 break-words">
                        {[client.company, client.phone, selectedContact?.city].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPickingClient(true);
                        requestAnimationFrame(() => clientSearchRef.current?.focus());
                      }}
                      className="shrink-0 min-h-[44px] sm:min-h-[30px] px-3 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:border-[#fe7518]"
                    >
                      Change…
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                      <label htmlFor="qb-client-search" className="sr-only">
                        Search registered clients
                      </label>
                      <input
                        ref={clientSearchRef}
                        id="qb-client-search"
                        type="search"
                        autoComplete="off"
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        placeholder="Search by name, company, phone or city…"
                        aria-invalid={errors.client ? true : undefined}
                        aria-describedby={errors.client ? "qb-client-err" : undefined}
                        className={`${inputClass} pl-9 ${errors.client ? "border-rose-500 dark:border-rose-500" : ""}`}
                      />
                    </div>
                    {errors.client && (
                      <p id="qb-client-err" className="text-xs font-bold text-rose-700 dark:text-rose-400" aria-live="polite">
                        {errors.client}
                      </p>
                    )}
                    {clientMatches.length > 0 ? (
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {clientMatches.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => pickContact(c)}
                              aria-pressed={c.id === contactId}
                              className={`w-full text-left p-2.5 rounded-xl border-2 transition-colors touch-manipulation ${
                                c.id === contactId
                                  ? "border-[#fe7518] bg-orange-50 dark:bg-orange-950/30"
                                  : "border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 bg-white dark:bg-[#161822]"
                              }`}
                            >
                              <div className="text-sm font-bold text-slate-950 dark:text-white truncate">{c.name}</div>
                              <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 truncate">
                                {[c.company, c.phone, c.city].filter(Boolean).join(" · ")}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                        {activeContacts.length ? "No client matches that search." : "No registered clients yet."}{" "}
                        {!editing && (
                          <button type="button" className="font-bold text-[#fe7518] underline underline-offset-2" onClick={() => setClientMode("new")}>
                            Add a new client instead
                          </button>
                        )}
                      </p>
                    )}
                    {client.id && (
                      <button
                        type="button"
                        onClick={() => setPickingClient(false)}
                        className="text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white min-h-[44px] sm:min-h-0"
                      >
                        Keep {client.name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField
                  ref={clientNameRef}
                  label="Client name *"
                  name="name"
                  autoComplete="name"
                  value={newClient.name}
                  onValue={(name) => {
                    setNewClient((c) => ({ ...c, name }));
                    setDirty(true);
                  }}
                  error={errors.clientName}
                  placeholder="e.g. Awais Amin…"
                />
                <TextField
                  ref={clientPhoneRef}
                  label="WhatsApp / phone *"
                  type="tel"
                  inputMode="tel"
                  name="tel"
                  autoComplete="tel"
                  value={newClient.phone}
                  onValue={(phone) => {
                    setNewClient((c) => ({ ...c, phone }));
                    setDirty(true);
                  }}
                  error={errors.clientPhone}
                  placeholder="e.g. 0315 7124807…"
                />
                <TextField
                  label="Company (optional)"
                  name="organization"
                  autoComplete="organization"
                  value={newClient.company}
                  onValue={(company) => setNewClient((c) => ({ ...c, company }))}
                  placeholder="e.g. Nishat Mills…"
                />
                <TextField
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  value={newClient.city}
                  onValue={(city) => setNewClient((c) => ({ ...c, city }))}
                  placeholder="e.g. Lahore…"
                />
              </div>
            )}

            <TextAreaField
              label="Address printed on the quotation"
              hint="One line per row. Saved with this quote only."
              name="street-address"
              autoComplete="street-address"
              value={draft.clientAddress}
              onValue={(clientAddress) => change({ clientAddress })}
              rows={3}
              placeholder={"House No. 6, Akther Estate\nSaroba Garden, Ferozepur Road\nLahore, Pakistan"}
            />
          </SectionCard>

          {/* 2. Details */}
          <SectionCard id="qb-details" step={2} title="Quotation details" description="Service, subject and validity.">
            <div className="space-y-2">
              <TextField
                label="Trade / service"
                hint="Type anything — new services are remembered for next time."
                value={draft.trade}
                onValue={setTrade}
                placeholder="e.g. CNC Machining, Electronics & PCB Assembly…"
              />
              <SuggestionChips label="Trade suggestions" options={knownTrades} value={draft.trade} onPick={setTrade} />
            </div>
            <TextField
              label="Subject / title"
              hint="Shown under the trade on the quotation."
              value={draft.title}
              onValue={(title) => change({ title })}
              placeholder="e.g. CNC 3018 Desktop Router Machine…"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="qb-date" className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                  Quotation date
                </label>
                <input
                  id="qb-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => e.target.value && change({ date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <NumberField label="Valid for" suffix="days" value={draft.validDays} onValue={(v) => change({ validDays: Math.max(1, Math.round(v) || 1) })} />
              <div className="flex flex-col justify-end">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Valid until</div>
                <div className="min-h-[42px] flex items-center px-3 rounded-xl bg-slate-100 dark:bg-[#161822] text-sm font-black tabular-nums text-slate-950 dark:text-white">
                  {addDaysISO(draft.date, draft.validDays)}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 3. Items */}
          <SectionCard
            id="qb-items"
            step={3}
            title="Line items"
            description="Each item can carry key specs and a full scope paragraph, like a machine build."
            aside={<span className="text-xs font-black tabular-nums text-slate-950 dark:text-white">{formatCurrency(totals.subtotal)}</span>}
          >
            {errors.items && (
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400" aria-live="polite">
                {errors.items}
              </p>
            )}

            <div className="space-y-3">
              {draft.lineItems.map((item, idx) => {
                const hasExtras = Boolean(item.details?.trim() || item.highlights?.length);
                return (
                  <div key={item.id} className="rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#151822] p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wide text-slate-500 dark:text-zinc-400">Item {idx + 1}</span>
                      <div className="flex items-center">
                        <IconButton
                          label={`Duplicate item ${idx + 1}`}
                          onClick={() => change((d) => ({ lineItems: insertAfter(d.lineItems, item.id, withFreshIds({ ...item })) }))}
                        >
                          <Copy className="w-4 h-4" />
                        </IconButton>
                        <RowControls
                          name={`item ${idx + 1}`}
                          index={idx}
                          count={draft.lineItems.length}
                          onMove={(dir) => change((d) => ({ lineItems: moveById(d.lineItems, item.id, dir) }))}
                          onRemove={() => change((d) => ({ lineItems: removeById(d.lineItems, item.id) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3">
                      <TextField
                        label="Item title"
                        value={item.description}
                        onValue={(description) => updateItem(item.id, { description })}
                        placeholder="e.g. CNC 3018 Desktop Router Machine…"
                      />
                      <TextField
                        label="Category line"
                        value={item.trade}
                        onValue={(trade) => updateItem(item.id, { trade })}
                        placeholder="e.g. CNC Machining…"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <NumberField label="Qty" value={item.quantity} onValue={(quantity) => updateItem(item.id, { quantity })} />
                      <TextField label="Unit" value={item.unit} onValue={(unit) => updateItem(item.id, { unit })} placeholder="pcs" />
                      <NumberField label="Unit rate" prefix="PKR" value={item.unitPrice} onValue={(unitPrice) => updateItem(item.id, { unitPrice })} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Amount</div>
                        <div className="min-h-[42px] flex items-center justify-end px-3 rounded-xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 text-sm font-black tabular-nums text-slate-950 dark:text-white">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>

                    <Disclosure
                      defaultOpen={hasExtras}
                      summary={
                      <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[28px] text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white">
                        <ChevronDown className="w-4 h-4 text-[#fe7518] transition-transform group-open:rotate-180" aria-hidden="true" />
                        Key specs &amp; scope description
                        {hasExtras && <span className="text-[10px] font-black text-[#fe7518]">· filled</span>}
                      </summary>
                      }
                    >
                      <div className="pt-3 space-y-3">
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Key specs (printed in orange under the title)</div>
                          <KeyValueEditor
                            name="Spec"
                            rows={item.highlights || []}
                            onChange={(highlights) => updateItem(item.id, { highlights })}
                            labelPlaceholder="e.g. Spindle…"
                            valuePlaceholder="e.g. 300 W, 10,000 RPM…"
                            addLabel="Add spec"
                          />
                        </div>
                        <TextAreaField
                          label="Scope description"
                          value={item.details || ""}
                          onValue={(details) => updateItem(item.id, { details })}
                          rows={4}
                          placeholder="Supply and assembly of… Includes wiring, calibration and test run."
                        />
                      </div>
                    </Disclosure>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <AddButton ref={addItemRef} onClick={addItem}>
                Add line item
              </AddButton>
              <button
                type="button"
                aria-expanded={showCalculator}
                onClick={() => setShowCalculator((v) => !v)}
                className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[32px] px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-[#fe7518] hover:text-slate-950 dark:hover:text-white touch-manipulation"
              >
                <Calculator className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
                {showCalculator ? "Hide rate calculator" : "Price from workshop rates…"}
              </button>
            </div>

            {showCalculator && (
              <RateCalculator
                settings={settings}
                formatCurrency={formatCurrency}
                onAdd={(items) => {
                  change((d) => ({
                    // Replace the untouched starter row instead of leaving an empty item behind
                    lineItems: [...d.lineItems.filter((i) => i.description.trim() || i.amount), ...items],
                    trade: d.trade || items[0]?.trade || "",
                  }));
                  setNotice(`Added ${items.length} calculated line item${items.length === 1 ? "" : "s"}.`);
                }}
              />
            )}
          </SectionCard>

          {/* 4. Pricing & payment */}
          <SectionCard id="qb-payment" step={4} title="Pricing & payment" description="Discount, advance, totals column and bank details.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumberField label="Discount" prefix="PKR" value={draft.discount} onValue={(discount) => change({ discount: Math.max(0, discount) })} />
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">Advance status</div>
                <Segmented
                  label="Advance status"
                  value={draft.advanceStatus}
                  options={[
                    { value: "required", label: "Required" },
                    { value: "received", label: "Already received" },
                  ]}
                  onChange={(advanceStatus) =>
                    change((d) => ({
                      advanceStatus,
                      // Swap the standard wording too, but never overwrite custom terms
                      terms:
                        d.terms.trim() === standardPaymentTerms(d.advanceStatus) ? standardPaymentTerms(advanceStatus) : d.terms,
                    }))
                  }
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <NumberField
                  label={draft.advanceStatus === "received" ? "Advance received" : "Advance required"}
                  prefix="PKR"
                  value={totals.advance}
                  onValue={(advanceAmount) => change({ advanceMode: "amount", advanceAmount })}
                  hint={`${totals.advancePercent}% of ${formatCurrency(totals.total)}`}
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Quick percent</div>
                  <SuggestionChips
                    label="Advance percentage"
                    options={ADVANCE_PRESETS.map((p) => `${p}%`)}
                    value={draft.advanceMode === "percent" ? `${draft.advancePercent}%` : ""}
                    onPick={(v) => change({ advanceMode: "percent", advancePercent: parseInt(v, 10) })}
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300">
                <span>
                  Total <span className="tabular-nums text-slate-950 dark:text-white">{formatCurrency(totals.total)}</span>
                </span>
                <span>
                  Balance <span className="tabular-nums text-slate-950 dark:text-white">{formatCurrency(totals.balance)}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <TextField
                label="Balance row label"
                value={draft.balanceLabel}
                onValue={(balanceLabel) => change({ balanceLabel })}
                placeholder="Balance Due on Completion"
              />
              <SuggestionChips label="Balance label suggestions" options={BALANCE_LABELS} value={draft.balanceLabel} onPick={(balanceLabel) => change({ balanceLabel })} />
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Extra rows under the totals</div>
              <KeyValueEditor
                name="Summary row"
                rows={draft.infoRows}
                onChange={(infoRows) => change({ infoRows })}
                labelPlaceholder="e.g. Estimated Completion…"
                valuePlaceholder="e.g. 7–10 Working Days…"
                addLabel="Add row"
                allowEmphasis
              />
              <SuggestionChips
                label="Common summary rows"
                options={INFO_ROW_PRESETS.filter((p) => !draft.infoRows.some((r) => r.label.trim().toLowerCase() === p.label.toLowerCase())).map((p) => p.label)}
                onPick={(label) => {
                  const preset = INFO_ROW_PRESETS.find((p) => p.label === label);
                  if (preset) change((d) => ({ infoRows: [...d.infoRows.filter((r) => r.label.trim() || r.value.trim()), { ...preset, id: uid("info") }] }));
                }}
              />
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="qb-terms" className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Payment terms paragraph
                </label>
                <button
                  type="button"
                  onClick={() => change((d) => ({ terms: standardPaymentTerms(d.advanceStatus) }))}
                  className="text-xs font-bold text-[#fe7518] hover:underline min-h-[44px] sm:min-h-0"
                >
                  Use standard wording
                </button>
              </div>
              <textarea
                id="qb-terms"
                rows={3}
                value={draft.terms}
                onChange={(e) => change({ terms: e.target.value })}
                className={`${inputClass} font-medium leading-relaxed resize-y`}
                placeholder="An advance payment of {advance} has been received…"
              />
              <TokenHint />
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">Bank / payment details box</div>
                <button
                  type="button"
                  onClick={() => change({ paymentDetails: defaultPaymentDetails(company) })}
                  className="text-xs font-bold text-[#fe7518] hover:underline min-h-[44px] sm:min-h-0"
                >
                  Reload from Settings
                </button>
              </div>
              <KeyValueEditor
                name="Payment detail"
                rows={draft.paymentDetails}
                onChange={(paymentDetails) => change({ paymentDetails })}
                labelPlaceholder="e.g. Bank…"
                valuePlaceholder="e.g. Meezan Bank Limited…"
                addLabel="Add detail"
              />
              <SuggestionChips
                label="Add wallet details from Settings"
                options={missingPaymentRows.map((r) => `+ ${r.label}`)}
                onPick={(v) => {
                  const row = missingPaymentRows.find((r) => `+ ${r.label}` === v);
                  if (row) change((d) => ({ paymentDetails: [...d.paymentDetails, { id: uid("pay"), label: row.label, value: row.value }] }));
                }}
              />
            </div>
          </SectionCard>

          {/* 5. Extra pages */}
          <SectionCard
            id="qb-pages"
            step={5}
            title="Extra pages"
            description="Specifications, component tables, deliverables and terms — each page prints on its own sheet."
            aside={<span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{1 + draft.pages.length} page{draft.pages.length ? "s" : ""} total</span>}
          >
            <PagesEditor pages={draft.pages} onChange={(pages) => change({ pages })} />
            <TokenHint />
          </SectionCard>

          <SectionCard title="Internal notes" description="Kept in the CRM and copied to the production job. Not printed.">
            <TextAreaField label="Internal notes" hideLabel value={draft.notes} onValue={(notes) => change({ notes })} rows={2} placeholder="e.g. Client prefers pickup from Multan workshop…" />
          </SectionCard>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800">
            <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">
              Total <span className="text-base font-black tabular-nums text-[#fe7518]">{formatCurrency(totals.total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="min-h-[44px] sm:min-h-[38px] px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 min-h-[44px] sm:min-h-[38px] px-4 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                {saveLabel}
              </button>
            </div>
          </div>
        </div>

        {/* ============================== Live preview ============================== */}
        <div className={`min-w-0 xl:sticky xl:top-4 space-y-3 ${mobileView === "edit" ? "hidden xl:block" : ""}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 no-print">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
              <Eye className="w-4 h-4 text-[#fe7518]" aria-hidden="true" />
              Live preview · {1 + draft.pages.length} A4 page{draft.pages.length ? "s" : ""}
            </div>
            <button
              type="button"
              onClick={() => setMobileView("edit")}
              className="xl:hidden inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
            >
              <PenLine className="w-4 h-4 text-[#fe7518]" aria-hidden="true" />
              Back to editing
            </button>
          </div>
          <div className="xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto overscroll-contain rounded-2xl bg-slate-200/70 dark:bg-zinc-900 p-3 sm:p-4">
            <FitToWidth>
              <QuoteDocument quote={previewQuote} company={company} formatCurrency={formatCurrency} />
            </FitToWidth>
          </div>
        </div>
      </div>
    </div>
  );
};
