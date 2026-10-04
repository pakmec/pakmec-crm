"use client";

import React from "react";
import { Quote, QuoteBlock, QuotePage, TradeRatesSettings } from "@/types";
import {
  DEFAULT_BALANCE_LABEL,
  defaultPaymentDetails,
  displayTrade,
  fillTokens,
  quoteTokenValues,
} from "@/lib/quoteDocument";

type Company = TradeRatesSettings["company"];

interface QuoteDocumentProps {
  quote: Quote;
  company: Company;
  formatCurrency: (amount: number) => string;
  /** DOM id used by the print helper. */
  id?: string;
}

const paragraphs = (text: string) => text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
const hasText = (row: { label: string; value: string }) => Boolean(row.label.trim() || row.value.trim());

/**
 * Printable A4 quotation. Page 1 is the commercial summary; every entry in
 * `quote.pages` becomes its own sheet (specs, deliverables, terms…).
 */
export const QuoteDocument: React.FC<QuoteDocumentProps> = ({ quote, company, formatCurrency, id }) => {
  const tokens = quoteTokenValues({ ...quote, trade: displayTrade(quote) }, formatCurrency);
  const t = (text?: string) => fillTokens(text, tokens);

  const extraPages = (quote.pages || []).filter((p) => p.title.trim() || p.blocks.length);
  const pageCount = 1 + extraPages.length;
  const advanceReceived = quote.advanceStatus === "received";
  const balance = Math.max(0, quote.total - quote.advanceRequired);
  const paymentRows = (quote.paymentDetails?.length ? quote.paymentDetails : defaultPaymentDetails(company)).filter(hasText);
  const infoRows = (quote.infoRows || []).filter(hasText);
  const addressLines = (quote.clientAddress || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const city = company.city || "Multan";

  // Plain divs, not <header>/<footer>: the app's global print CSS hides <header> as app chrome
  const header = (
    <div className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-4">
      <div className="min-w-0">
        <img src="/pakmec-logo.png" alt={company.name || "PAKMEC"} width={136} height={34} className="h-auto w-[136px]" />
        <p className="mt-3 text-[10px] text-slate-700">{company.tagline}</p>
        <p className="mt-0.5 text-[9.5px] text-slate-500">
          {[city, company.phone, company.email].filter(Boolean).join(" • ")}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[30px] font-extrabold leading-none tracking-tight text-slate-900">QUOTATION</div>
        <div className="mt-1.5 font-mono text-[10px] font-bold text-orange-600" translate="no">{quote.id}</div>
        <div className="mt-0.5 text-[9.5px] text-slate-600">
          Date: <span className="font-bold text-slate-900 tabular-nums">{quote.date}</span>
        </div>
        <div className="text-[9.5px] text-slate-600">
          Valid Until: <span className="font-bold text-slate-900 tabular-nums">{quote.validUntil}</span>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="mt-auto pt-10 text-center text-[10px] text-slate-500">
      {/* website is undefined on settings saved before the field existed; "" means the user removed it */}
      {[(company.name || "PAKMEC").toUpperCase(), `${city}, Pakistan`, company.website ?? "www.pakmec.com"].filter(Boolean).join(" • ")}
    </div>
  );

  return (
    <div id={id} className="quote-doc flex flex-col items-center gap-6 font-sans text-slate-900">
      {/* ---------------- Page 1: commercial summary ---------------- */}
      <section className="quote-sheet">
        {header}

        <div className="mt-7 grid grid-cols-2 gap-5">
          <div className="min-w-0 rounded-[14px] border border-slate-200 bg-slate-50 p-[18px]">
            <div className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Client</div>
            <div className="mt-2 break-words text-[15.5px] font-bold text-slate-900">{quote.contactName}</div>
            <div className="mt-1 space-y-0.5 break-words text-[10px] leading-[1.65] text-slate-500">
              {quote.contactCompany && <div>{quote.contactCompany}</div>}
              {addressLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
              {quote.contactPhone && <div className="tabular-nums">{quote.contactPhone}</div>}
            </div>
          </div>
          <div className="min-w-0 rounded-[14px] border border-slate-200 bg-slate-50 p-[18px]">
            <div className="text-[9.5px] font-medium uppercase tracking-wide text-slate-500">Trade Domain</div>
            <div className="mt-2 break-words text-[15.5px] font-bold text-orange-600">{displayTrade(quote) || "—"}</div>
            <div className="mt-1 space-y-0.5 break-words text-[10px] leading-[1.65] text-slate-500">
              {quote.title && <div>{quote.title}</div>}
              <div>
                Advance Term:{" "}
                {advanceReceived
                  ? `${formatCurrency(quote.advanceRequired)} Received`
                  : quote.advanceRequired > 0
                    ? `${quote.advancePercent}% (${formatCurrency(quote.advanceRequired)}) Required`
                    : "None"}
              </div>
            </div>
          </div>
        </div>

        <table className="mt-14 w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "54%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr className="whitespace-nowrap border-b-2 border-slate-900 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              <th className="pb-2 font-semibold">#</th>
              <th className="pb-2 font-semibold">Item &amp; Description</th>
              <th className="pb-2 text-right font-semibold">Qty</th>
              <th className="pb-2 text-right font-semibold">Unit Rate (PKR)</th>
              <th className="pb-2 text-right font-semibold">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {quote.lineItems.map((item, idx) => {
              const highlights = (item.highlights || []).filter(hasText);
              return (
                <tr key={item.id || idx} className="break-inside-avoid border-b border-slate-200 align-top">
                  <td className="py-3 text-[10px] text-slate-500 tabular-nums">{idx + 1}</td>
                  <td className="min-w-0 py-3 pr-4">
                    <div className="break-words text-[13px] font-semibold text-slate-900">{item.description}</div>
                    {item.trade && <div className="text-[9px] text-slate-500">{item.trade}</div>}
                    {highlights.length > 0 && (
                      <div className="mt-0.5 break-words font-mono text-[8.5px] text-slate-800">
                        {highlights.map((h, i) => (
                          <React.Fragment key={h.id}>
                            {i > 0 && <span className="text-slate-400">&nbsp;&nbsp;|&nbsp;&nbsp;</span>}
                            {h.label && <span>{h.label}: </span>}
                            <span className="font-bold text-orange-600">{h.value}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                    {item.details && (
                      <div className="mt-2 max-w-[88%] space-y-1 break-words text-[10.5px] leading-[1.55] text-slate-500">
                        {paragraphs(t(item.details)).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 text-right font-mono text-[10px] text-slate-700 tabular-nums">
                    {item.quantity}&nbsp;{item.unit}
                  </td>
                  <td className="whitespace-nowrap py-3 text-right font-mono text-[10px] text-slate-500 tabular-nums">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="whitespace-nowrap py-3 text-right font-mono text-[10px] font-bold text-slate-900 tabular-nums">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 grid break-inside-avoid grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] gap-10 border-t-2 border-slate-900 pt-4">
          <div className="min-w-0">
            <h3 className="text-[9px] font-bold uppercase tracking-wide text-slate-800">
              Terms &amp; Payment Details ({city})
            </h3>
            <div className="mt-2 space-y-1 break-words text-[10px] leading-[1.65] text-slate-500">
              {paragraphs(t(quote.terms)).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {paymentRows.length > 0 && (
              <div className="mt-4 rounded-[12px] border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-[8.5px] leading-[1.75] text-slate-700">
                {paymentRows.map((row) => (
                  <div key={row.id} className="break-words">
                    <span className="font-bold text-slate-900">{row.label}:</span> {row.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 text-[10.5px]">
            <SummaryRow label="Subtotal:" value={formatCurrency(quote.subtotal)} mono />
            {quote.discount > 0 && <SummaryRow label="Discount:" value={formatCurrency(-quote.discount)} mono />}
            <div className="mt-1 flex items-baseline justify-between gap-3 border-t-2 border-slate-900 py-3">
              <span className="text-[14.5px] font-bold">Total:</span>
              <span className="whitespace-nowrap font-mono text-[13.5px] font-bold text-orange-600 tabular-nums">
                {formatCurrency(quote.total)}
              </span>
            </div>
            {quote.advanceRequired > 0 && (
              <div className="my-1.5 flex items-baseline justify-between gap-3 rounded-[10px] border-2 border-slate-900 bg-slate-100 px-4 py-2.5">
                <span className="font-semibold">
                  {advanceReceived ? "Advance Received:" : `Advance Due (${quote.advancePercent}%):`}
                </span>
                <span className="whitespace-nowrap font-mono font-bold tabular-nums">{formatCurrency(quote.advanceRequired)}</span>
              </div>
            )}
            {quote.advanceRequired > 0 && (
              <SummaryRow label={quote.balanceLabel || DEFAULT_BALANCE_LABEL} value={formatCurrency(balance)} mono />
            )}
            {infoRows.map((row) => (
              <SummaryRow key={row.id} label={row.label} value={t(row.value)} emphasis={row.emphasis} />
            ))}
          </div>
        </div>

        {footer}
      </section>

      {/* ---------------- Additional pages ---------------- */}
      {extraPages.map((page, pageIdx) => (
        <section key={page.id} className="quote-sheet">
          {header}
          <div className="mt-6 flex items-end justify-between gap-4 border-b-2 border-slate-900 pb-2.5">
            <h2 className="min-w-0 break-words text-[18px] font-bold text-slate-900">{page.title}</h2>
            <span className="shrink-0 font-mono text-[8.5px] tracking-[0.18em] text-slate-500">
              PAGE {pageIdx + 2} / {pageCount}
            </span>
          </div>
          <PageBlocks page={page} t={t} />
          {footer}
        </section>
      ))}
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; mono?: boolean; emphasis?: boolean }> = ({
  label,
  value,
  mono,
  emphasis,
}) => (
  <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 py-2">
    <span className="min-w-0 break-words text-slate-600">{label}</span>
    <span
      className={`shrink-0 text-right font-bold tabular-nums ${mono ? "font-mono" : ""} ${
        emphasis ? "text-orange-600" : "text-slate-900"
      }`}
    >
      {value}
    </span>
  </div>
);

const PageBlocks: React.FC<{ page: QuotePage; t: (s?: string) => string }> = ({ page, t }) => {
  let letter = 0;
  return (
    <div className="mt-1">
      {page.blocks.map((block) => {
        const heading = block.heading.trim();
        const tag = heading ? String.fromCharCode(65 + letter++) : null;
        return (
          <div key={block.id} className="mt-4">
            {heading && (
              <h3 className="mb-2 flex gap-2 font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-800">
                <span className="text-orange-600">{tag}</span>
                <span className="min-w-0 break-words">{heading}</span>
              </h3>
            )}
            <BlockBody block={block} t={t} />
            {block.note?.trim() && (
              <p className="mt-2 break-words text-[8.5px] leading-relaxed text-slate-500">{t(block.note)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const gridCols = (count: number) => ({ gridTemplateColumns: `repeat(${Math.max(1, Math.min(count, 3))}, minmax(0, 1fr))` });

const BlockBody: React.FC<{ block: QuoteBlock; t: (s?: string) => string }> = ({ block, t }) => {
  switch (block.kind) {
    case "highlights": {
      const rows = (block.rows || []).filter(hasText);
      return (
        <div className="grid gap-4" style={gridCols(rows.length)}>
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex min-w-0 break-inside-avoid items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-2.5"
            >
              <span className="min-w-0 break-words text-[9.5px] uppercase text-slate-500">{row.label}</span>
              <span className="text-right font-mono text-[13px] font-bold text-slate-900">{t(row.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    case "table": {
      const rows = (block.rows || []).filter(hasText);
      const [colA, colB] = block.columns || ["Item", "Specification"];
      return (
        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: "35%" }} />
            <col style={{ width: "65%" }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-slate-900 font-mono text-[8.5px] uppercase tracking-[0.18em] text-slate-700">
              <th className="pb-2 font-bold">{colA}</th>
              <th className="pb-2 font-bold">{colB}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="break-inside-avoid border-b border-slate-200 align-top">
                <td className="break-words py-1.5 pr-4 text-[10px] text-slate-900">{row.label}</td>
                <td className="break-words py-1.5 text-[9.5px] text-slate-600">{t(row.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    case "lists": {
      const groups = (block.groups || []).filter((g) => g.title.trim() || g.items.some((i) => i.trim()));
      return (
        <div className="grid gap-4" style={gridCols(groups.length)}>
          {groups.map((group) => (
            <div key={group.id} className="min-w-0 break-inside-avoid rounded-[14px] border border-slate-200 bg-slate-50 p-4">
              <div className={`text-[8.5px] font-semibold uppercase ${group.accent ? "text-orange-600" : "text-slate-700"}`}>
                {group.title}
              </div>
              <ul className="mt-2.5 space-y-1">
                {group.items
                  .map((i) => i.trim())
                  .filter(Boolean)
                  .map((item, i) => (
                    <li key={i} className="flex gap-2 break-words text-[9.5px] leading-snug text-slate-700">
                      <span aria-hidden="true" className="mt-[4px] h-[5px] w-[5px] shrink-0 rounded-full bg-orange-600" />
                      <span className="min-w-0">{t(item)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    case "clauses": {
      const clauses = (block.clauses || []).filter((c) => c.title.trim() || c.body.trim());
      return (
        <div className="columns-2 gap-8">
          {clauses.map((c, i) => (
            <div key={c.id} className="mb-3.5 break-inside-avoid">
              <h4 className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-800">
                <span className="mr-1.5 text-orange-600">{String(i + 1).padStart(2, "0")}</span>
                {c.title}
              </h4>
              <div className="mt-1.5 space-y-1.5 break-words text-[10px] leading-[1.65] text-slate-500">
                {paragraphs(t(c.body)).map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    case "text":
      return (
        <div className="space-y-2 break-words text-[10px] leading-[1.65] text-slate-600">
          {paragraphs(t(block.body || "")).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      );
  }
};
