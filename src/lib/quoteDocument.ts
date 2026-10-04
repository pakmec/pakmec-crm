import {
  Quote,
  QuoteBlock,
  QuoteBlockKind,
  QuoteClause,
  QuoteInfoRow,
  QuoteKeyValue,
  QuoteLineItem,
  QuotePage,
  QuoteTemplate,
  TradeRatesSettings,
} from "@/types";

type Company = TradeRatesSettings["company"];

export const DEFAULT_BALANCE_LABEL = "Balance Due on Completion";

export const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// ---------------------------------------------------------------------------
// List helpers shared by every repeatable editor (items, rows, pages, blocks…)
// ---------------------------------------------------------------------------

export function updateById<T extends { id: string }>(list: T[], id: string, patch: Partial<T>): T[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}

export function moveById<T extends { id: string }>(list: T[], id: string, dir: -1 | 1): T[] {
  const from = list.findIndex((item) => item.id === id);
  const to = from + dir;
  if (from < 0 || to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function insertAfter<T extends { id: string }>(list: T[], id: string, item: T): T[] {
  const idx = list.findIndex((entry) => entry.id === id);
  if (idx < 0) return [...list, item];
  return [...list.slice(0, idx + 1), item, ...list.slice(idx + 1)];
}

/** Deep-copies a structure and gives every `id` a new value, so copies never share keys. */
export function withFreshIds<T>(value: T): T {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      if (typeof out.id === "string") out.id = uid("x");
      return out;
    }
    return v;
  };
  return walk(value) as T;
}

// ---------------------------------------------------------------------------
// Dates — local calendar dates, so a quote made at 2am in Multan isn't dated yesterday
// ---------------------------------------------------------------------------

export function toISODate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const todayISO = () => toISODate(new Date());

function parseISODate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISODate(iso) || new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysBetweenISO(from: string, to: string): number {
  const a = parseISODate(from);
  const b = parseISODate(to);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Next `PREFIX-YEAR-NNN` id. Uses the highest existing number, so deletes never cause collisions. */
export function nextSequentialId(prefix: string, existingIds: string[], year = new Date().getFullYear()): string {
  const stem = `${prefix}-${year}-`;
  const max = existingIds.reduce((highest, id) => {
    if (!id.startsWith(stem)) return highest;
    const n = parseInt(id.slice(stem.length), 10);
    return Number.isFinite(n) && n > highest ? n : highest;
  }, 0);
  return `${stem}${String(max + 1).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Money
// ---------------------------------------------------------------------------

export const lineAmount = (quantity: number, unitPrice: number) =>
  Math.round((Number(quantity) || 0) * (Number(unitPrice) || 0));

export interface QuoteTotals {
  subtotal: number;
  discount: number;
  total: number;
  advance: number;
  balance: number;
  advancePercent: number;
}

export function computeTotals(
  lineItems: QuoteLineItem[],
  discount: number,
  advance: { mode: "percent" | "amount"; percent: number; amount: number }
): QuoteTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const safeDiscount = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - safeDiscount);
  const raw = advance.mode === "percent" ? Math.round((total * (Number(advance.percent) || 0)) / 100) : advance.amount;
  const advanceAmount = Math.min(total, Math.max(0, Math.round(Number(raw) || 0)));
  return {
    subtotal,
    discount: safeDiscount,
    total,
    advance: advanceAmount,
    balance: total - advanceAmount,
    advancePercent: total > 0 ? Math.round((advanceAmount / total) * 100) : Number(advance.percent) || 0,
  };
}

// ---------------------------------------------------------------------------
// Text tokens — let templates say "{advance}" and stay correct when prices change
// ---------------------------------------------------------------------------

export const QUOTE_TOKENS: { token: string; meaning: string }[] = [
  { token: "{total}", meaning: "Quoted total" },
  { token: "{advance}", meaning: "Advance amount" },
  { token: "{balance}", meaning: "Balance after advance" },
  { token: "{subtotal}", meaning: "Subtotal before discount" },
  { token: "{validDays}", meaning: "Validity in days" },
  { token: "{validUntil}", meaning: "Expiry date" },
  { token: "{client}", meaning: "Client name" },
];

export function quoteTokenValues(
  quote: Pick<Quote, "total" | "subtotal" | "discount" | "advanceRequired" | "date" | "validUntil" | "contactName" | "trade" | "title">,
  formatCurrency: (n: number) => string
): Record<string, string> {
  return {
    total: formatCurrency(quote.total),
    subtotal: formatCurrency(quote.subtotal),
    discount: formatCurrency(quote.discount || 0),
    advance: formatCurrency(quote.advanceRequired),
    balance: formatCurrency(Math.max(0, quote.total - quote.advanceRequired)),
    validDays: String(Math.max(0, daysBetweenISO(quote.date, quote.validUntil))),
    validUntil: quote.validUntil,
    date: quote.date,
    client: quote.contactName,
    trade: quote.trade,
    title: quote.title,
  };
}

export function fillTokens(text: string | undefined, values: Record<string, string>): string {
  return (text || "").replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? values[key] : match));
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export function standardPaymentTerms(status: "required" | "received"): string {
  return status === "received"
    ? "An advance payment of {advance} has been received to confirm the order and begin procurement and production.\nRemaining balance of {balance} is payable upon completion, before delivery."
    : "An advance payment of {advance} is required to confirm the order and begin procurement and production.\nRemaining balance of {balance} is payable upon completion, before delivery.";
}

export function defaultPaymentDetails(company: Company): QuoteKeyValue[] {
  const rows: [string, string | undefined][] = [
    ["Bank", company.bankName],
    ["Branch", company.bankBranch],
    ["Title", company.bankAccountTitle],
    ["Account", company.bankAccountNumber],
    ["IBAN", company.bankIban],
  ];
  return rows
    .filter(([, value]) => (value || "").trim())
    .map(([label, value]) => ({ id: uid("pay"), label, value: (value || "").trim() }));
}

export const INFO_ROW_PRESETS: Omit<QuoteInfoRow, "id">[] = [
  { label: "Estimated Completion", value: "7–10 Working Days" },
  { label: "Delivery Charges", value: "Excluded – Payable by Client", emphasis: true },
  { label: "Installation", value: "Included at Client Site" },
  { label: "Warranty", value: "6 Months (Workmanship)" },
  { label: "Taxes", value: "Excluded" },
];

export const UNIT_SUGGESTIONS = ["pcs", "set", "lot", "job", "hrs", "days", "kg", "m", "sq.ft", "package"];

export function emptyLineItem(trade: string): QuoteLineItem {
  return { id: uid("li"), description: "", trade, quantity: 1, unit: "pcs", unitPrice: 0, amount: 0, details: "", highlights: [] };
}

export const BLOCK_KIND_META: Record<QuoteBlockKind, { label: string; hint: string }> = {
  highlights: { label: "Spec tiles", hint: "Big label / value tiles, e.g. Bed Area 300 × 180 mm" },
  table: { label: "Spec table", hint: "Two-column table, e.g. Component → Proposed specification" },
  lists: { label: "Deliverable lists", hint: "Side-by-side bullet lists with titles" },
  clauses: { label: "Numbered terms", hint: "01, 02, 03… clauses in two columns" },
  text: { label: "Paragraph", hint: "Free text section" },
};

const kv = (label: string, value: string): QuoteKeyValue => ({ id: uid("kv"), label, value });
const clause = (title: string, body: string): QuoteClause => ({ id: uid("cl"), title, body });

export function createBlock(kind: QuoteBlockKind): QuoteBlock {
  const id = uid("blk");
  switch (kind) {
    case "highlights":
      return { id, kind, heading: "Key Specifications", rows: [kv("", ""), kv("", ""), kv("", "")], note: "" };
    case "table":
      return { id, kind, heading: "Components Specification", columns: ["Component", "Proposed Specification"], rows: [kv("", ""), kv("", "")], note: "" };
    case "lists":
      return {
        id,
        kind,
        heading: "Project Deliverables",
        groups: [
          { id: uid("grp"), title: "Build Deliverables", items: [] },
          { id: uid("grp"), title: "Physical Deliverables", items: [], accent: true },
          { id: uid("grp"), title: "Handover Deliverables", items: [] },
        ],
        note: "",
      };
    case "clauses":
      return { id, kind, heading: "", clauses: standardTermsClauses() };
    case "text":
      return { id, kind, heading: "Scope Notes", body: "" };
  }
}

export function standardTermsClauses(): QuoteClause[] {
  return [
    clause("Advance Payment", "An advance payment of {advance} confirms the order and initiates material procurement and production."),
    clause("Final Payment", "The remaining balance of {balance} is payable upon completion and before dispatch or collection."),
    clause("Delivery Charges", "Delivery, transportation and unloading charges are not included in the quoted price of {total} unless stated otherwise, and will be agreed upon before dispatch."),
    clause("Project Timeline", "Completion time is counted from the date of advance receipt. Delays caused by specification changes, late approvals, material availability or circumstances beyond our reasonable control will be communicated to the client."),
    clause("Specification Approval", "Work is carried out to the specification listed in this quotation. Changes requested after production begins may incur additional charges and affect the timeline."),
    clause("Inspection", "Photographs or a video of the completed work will be shared with the client for inspection and confirmation before dispatch."),
    clause("Order Cancellation", "If the order is cancelled after procurement or production has started, the advance will be adjusted against completed work and non-recoverable material costs. Any remaining balance will be refunded following reconciliation."),
    clause("Quotation Validity", "This quotation is valid for {validDays} days from the quotation date. Any changes to the agreed scope must be approved by both parties."),
    clause("Digital Confirmation", "The client's written confirmation of this quotation through email or an agreed digital communication channel, together with the advance payment, will constitute acceptance of the project scope, payment schedule, and terms and conditions."),
  ];
}

export function createTermsPage(): QuotePage {
  return { id: uid("pg"), title: "Terms & Conditions", blocks: [createBlock("clauses")] };
}

/** Legacy quotes stored the real service name in specs when trade was "Custom Domain". */
export function displayTrade(quote: Pick<Quote, "trade" | "specs">): string {
  if (quote.trade === "Custom Domain" && quote.specs?.customDomainName) return quote.specs.customDomainName;
  return quote.trade;
}

// ---------------------------------------------------------------------------
// Builder draft <-> Quote
// ---------------------------------------------------------------------------

export interface QuoteDraft {
  trade: string;
  title: string;
  date: string;
  validDays: number;
  clientAddress: string;
  lineItems: QuoteLineItem[];
  discount: number;
  advanceMode: "percent" | "amount";
  advancePercent: number;
  advanceAmount: number;
  advanceStatus: "required" | "received";
  balanceLabel: string;
  terms: string;
  paymentDetails: QuoteKeyValue[];
  infoRows: QuoteInfoRow[];
  pages: QuotePage[];
  notes: string;
}

export type QuoteSeed = Omit<QuoteTemplate, "id" | "name" | "createdAt">;

export function draftFromSeed(seed: QuoteSeed, company: Company): QuoteDraft {
  const fresh = withFreshIds(seed);
  return {
    trade: fresh.trade,
    title: fresh.title,
    date: todayISO(),
    validDays: fresh.validDays || 15,
    clientAddress: "",
    lineItems: fresh.lineItems.length ? fresh.lineItems : [emptyLineItem(fresh.trade)],
    discount: 0,
    advanceMode: "percent",
    advancePercent: fresh.advancePercent,
    advanceAmount: 0,
    advanceStatus: fresh.advanceStatus || "required",
    balanceLabel: fresh.balanceLabel || DEFAULT_BALANCE_LABEL,
    terms: fresh.terms,
    paymentDetails: defaultPaymentDetails(company),
    infoRows: fresh.infoRows,
    pages: fresh.pages,
    notes: "",
  };
}

/** Load a saved quote into the builder. `asCopy` resets ids and dates for "Duplicate". */
export function draftFromQuote(quote: Quote, company: Company, asCopy = false): QuoteDraft {
  const source = asCopy ? withFreshIds(quote) : quote;
  const validDays = Math.max(1, daysBetweenISO(quote.date, quote.validUntil) || 15);
  const percentAmount = Math.round((quote.total * (quote.advancePercent || 0)) / 100);
  return {
    trade: displayTrade(quote),
    title: quote.title,
    date: asCopy ? todayISO() : quote.date,
    validDays,
    clientAddress: quote.clientAddress || "",
    lineItems: (source.lineItems || []).map((item) => ({ ...item, highlights: item.highlights || [], details: item.details || "" })),
    discount: quote.discount || 0,
    // Keep the saved advance exact unless it was a clean percentage of the total
    advanceMode: percentAmount === quote.advanceRequired ? "percent" : "amount",
    advancePercent: quote.advancePercent || 0,
    advanceAmount: quote.advanceRequired || 0,
    // Copies keep the status so it matches the copied payment wording; flip it in the builder if needed
    advanceStatus: quote.advanceStatus || "required",
    balanceLabel: quote.balanceLabel || DEFAULT_BALANCE_LABEL,
    terms: quote.terms || "",
    paymentDetails: source.paymentDetails?.length ? source.paymentDetails : defaultPaymentDetails(company),
    infoRows: source.infoRows || [],
    pages: source.pages || [],
    notes: quote.notes || "",
  };
}

/** Strips empty rows so saved quotes and templates stay clean. */
export function cleanDraft(draft: QuoteDraft): QuoteDraft {
  const hasText = (row: QuoteKeyValue) => row.label.trim() || row.value.trim();
  const trim = (s: string | undefined) => (s || "").trim();
  return {
    ...draft,
    trade: trim(draft.trade),
    title: trim(draft.title),
    clientAddress: trim(draft.clientAddress),
    balanceLabel: trim(draft.balanceLabel) || DEFAULT_BALANCE_LABEL,
    terms: trim(draft.terms),
    lineItems: draft.lineItems
      .filter((item) => trim(item.description) || item.amount)
      .map((item) => ({
        ...item,
        description: trim(item.description),
        trade: trim(item.trade),
        unit: trim(item.unit),
        details: trim(item.details),
        highlights: (item.highlights || []).filter(hasText),
      })),
    paymentDetails: draft.paymentDetails.filter(hasText),
    infoRows: draft.infoRows.filter(hasText),
    pages: draft.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => ({
        ...block,
        rows: block.rows?.filter(hasText),
        groups: block.groups?.map((g) => ({ ...g, items: g.items.map((i) => i.trim()).filter(Boolean) })),
        clauses: block.clauses?.filter((c) => trim(c.title) || trim(c.body)),
      })),
    })),
  };
}

export function templateFromDraft(name: string, draft: QuoteDraft): QuoteTemplate {
  const clean = cleanDraft(draft);
  return {
    id: uid("tpl"),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    trade: clean.trade,
    title: clean.title,
    validDays: clean.validDays,
    advancePercent: clean.advancePercent,
    advanceStatus: clean.advanceStatus,
    balanceLabel: clean.balanceLabel,
    terms: clean.terms,
    lineItems: clean.lineItems,
    infoRows: clean.infoRows,
    pages: clean.pages,
  };
}

// ---------------------------------------------------------------------------
// Built-in starting points
// ---------------------------------------------------------------------------

export const BLANK_SEED = (advancePercent: number): QuoteSeed => ({
  trade: "",
  title: "",
  validDays: 15,
  advancePercent,
  advanceStatus: "required",
  balanceLabel: DEFAULT_BALANCE_LABEL,
  terms: standardPaymentTerms("required"),
  lineItems: [],
  infoRows: [{ id: uid("info"), label: "Estimated Completion", value: "" }],
  pages: [],
});

/** Mirrors PAKMEC quotation QT-2026-002 (CNC 3018 build): 3 pages with specs, deliverables and T&C. */
export const MACHINE_BUILD_SEED = (): QuoteSeed => ({
  trade: "CNC Machining",
  title: "CNC 3018 Desktop Router Machine",
  validDays: 15,
  advancePercent: 20,
  advanceStatus: "received",
  balanceLabel: DEFAULT_BALANCE_LABEL,
  terms:
    "An advance payment of {advance} has been received to confirm the order and begin procurement and assembly.\nRemaining balance of {balance} is payable upon completion, before delivery.",
  lineItems: [
    {
      id: uid("li"),
      description: "CNC 3018 Desktop Router Machine",
      trade: "CNC Machining",
      quantity: 1,
      unit: "pcs",
      unitPrice: 75000,
      amount: 75000,
      highlights: [kv("Working bed area", "300 × 180 mm"), kv("Spindle", "300 W, 10,000 RPM")],
      details:
        "Supply and assembly of a 3-axis CNC 3018 machine with a 300 × 180 mm working bed, NEMA 17 stepper motors, Arduino Uno controller board (GRBL), 300 W 10,000 RPM spindle and 12 mm stainless-steel (SS) rod linear motion system. Includes wiring, calibration and test run.",
    },
  ],
  infoRows: [
    { id: uid("info"), label: "Estimated Completion", value: "7–10 Working Days" },
    { id: uid("info"), label: "Delivery Charges", value: "Excluded – Payable by Client", emphasis: true },
  ],
  pages: [
    {
      id: uid("pg"),
      title: "Materials & Deliverables",
      blocks: [
        {
          id: uid("blk"),
          kind: "highlights",
          heading: "Machine Specifications",
          rows: [kv("Bed Area", "300 × 180 mm"), kv("Spindle", "300 W"), kv("Speed", "10,000 RPM")],
          note: "Working bed area refers to the usable X × Y travel. Z-axis travel, overall frame size and spindle mounting details will be confirmed at assembly and shown to the client at inspection.",
        },
        {
          id: uid("blk"),
          kind: "table",
          heading: "Components Specification",
          columns: ["Component", "Proposed Specification"],
          rows: [
            kv("Machine frame", "Aluminium profile frame, 3-axis gantry"),
            kv("Working bed", "300 × 180 mm T-slot work bed"),
            kv("Linear motion", "12 mm stainless-steel (SS) linear rods with linear bearings"),
            kv("Drive system", "Lead screws with couplers (X, Y, Z axes)"),
            kv("Stepper motors", "NEMA 17 stepper motors (X, Y, Z)"),
            kv("Controller board", "Arduino Uno with GRBL firmware, CNC shield and stepper drivers"),
            kv("Spindle", "300 W, 10,000 RPM spindle with mount and ER11 collet"),
            kv("Power supply", "DC power supply for motors and spindle, with speed control"),
            kv("Wiring & connectivity", "Wiring harness and USB cable for GRBL sender software"),
          ],
          note: "Equivalent components may be proposed where necessary for availability or reliability, subject to approval where they materially affect the agreed specification. Supporting items (drive system, drivers, power supply) are proposed to complete a working machine.",
        },
        {
          id: uid("blk"),
          kind: "lists",
          heading: "Project Deliverables",
          groups: [
            {
              id: uid("grp"),
              title: "Build Deliverables",
              items: [
                "Component list and specification confirmation",
                "Assembly and alignment of all three axes",
                "GRBL firmware loaded and configured",
                "Axis calibration (steps per mm)",
              ],
            },
            {
              id: uid("grp"),
              title: "Physical Deliverables",
              accent: true,
              items: [
                "One assembled CNC 3018 machine",
                "300 × 180 mm working bed",
                "12 mm SS rod linear motion system",
                "3 × NEMA 17 stepper motors",
                "Arduino Uno controller board",
                "300 W, 10,000 RPM spindle",
                "Power supply, wiring and USB cable",
              ],
            },
            {
              id: uid("grp"),
              title: "Handover Deliverables",
              items: [
                "Test run and inspection photographs",
                "Video demonstration of machine movement and spindle",
                "Basic operating and maintenance instructions",
                "Final payment receipt",
              ],
            },
          ],
          note: "Cutting tools (router bits), CAM software licences and CAD/CAM design files are not included unless separately agreed in writing.",
        },
      ],
    },
    {
      id: uid("pg"),
      title: "Terms & Conditions",
      blocks: [
        {
          id: uid("blk"),
          kind: "clauses",
          heading: "",
          clauses: [
            clause("Advance Payment", "An advance payment of {advance} has been received and confirms the order. It initiates component procurement and assembly."),
            clause("Final Payment", "The remaining balance of {balance} must be paid upon project completion and before dispatch or collection of the finished machine."),
            clause("Delivery Charges", "Delivery and transportation charges are not included in the quoted project price of {total}.\nAll delivery, transportation, shipping and unloading charges shall be borne separately by the client. These charges will be communicated and agreed upon before dispatch."),
            clause("Project Timeline", "The estimated completion period is 7–10 working days from the date of advance receipt. Any delays caused by specification changes, delayed client approvals, component availability, or circumstances beyond our reasonable control will be communicated to the client."),
            clause("Specification Approval", "The final specification, components and configuration are as listed in this quotation. Any modification requested after procurement begins may incur additional charges and affect the completion timeline."),
            clause("Custom-Assembled Product", "This is a custom-assembled machine. Minor variations in component brand, colour and finish may occur depending on availability.\nUsable cutting area and performance depend on the final assembled configuration."),
            clause("Order Cancellation", "If the client cancels the order after procurement or assembly has commenced, the advance payment will be adjusted against completed work and non-recoverable component costs. Any remaining balance will be refunded following reconciliation."),
            clause("Product Inspection", "Final photographs and a video demonstration of the completed machine will be shared with the client for inspection and confirmation before dispatch."),
            clause("Transportation & Handling", "The machine will be securely packaged for transportation. The client will be responsible for arranging or approving transportation and paying the associated charges. Responsibility for transit damage and any required insurance will be agreed upon before dispatch."),
            clause("Product Usage", "The machine is intended for light-duty machining of wood, plastics, acrylic, PCB and similar soft materials. Use eye and ear protection, keep hands clear of moving parts, and do not leave the machine running unattended."),
            clause("Quotation Validity", "This quotation is valid for {validDays} days from the quotation date. Any changes to the agreed project scope must be approved by both parties."),
            clause("Digital Confirmation", "The client's written confirmation of this quotation through email or an agreed digital communication channel, together with the advance payment, will constitute acceptance of the project scope, payment schedule, and terms and conditions."),
          ],
        },
      ],
    },
  ],
});
