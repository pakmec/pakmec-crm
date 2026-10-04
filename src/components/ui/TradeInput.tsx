"use client";

import React, { useId, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { collectTrades } from "@/lib/trades";
import { displayTrade } from "@/lib/quoteDocument";

/** Every trade the CRM knows about: defaults plus anything already used. */
export function useKnownTrades(extra: string[] = []): string[] {
  const { quotes, jobs, contacts } = useCrm();
  const extraKey = extra.join("|");
  return useMemo(
    () => collectTrades(extra, quotes.map(displayTrade), jobs.map((j) => j.trade), contacts.flatMap((c) => c.tradeTags || [])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quotes, jobs, contacts, extraKey]
  );
}

const chipClass = (active: boolean) =>
  `min-h-[44px] sm:min-h-[28px] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors touch-manipulation ${
    active
      ? "bg-[#fe7518] text-slate-950"
      : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 hover:text-slate-950 dark:hover:text-white"
  }`;

/** Free-text trade / service field with one-click suggestions (replaces fixed dropdowns). */
export const TradeInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  labelClassName?: string;
  inputClassName?: string;
  placeholder?: string;
}> = ({ label, value, onChange, labelClassName, inputClassName, placeholder = "e.g. CNC Machining…" }) => {
  const id = useId();
  const trades = useKnownTrades();
  const current = value.trim().toLowerCase();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <input id={id} type="text" autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClassName} />
      <div role="group" aria-label={`${label} suggestions`} className="flex flex-wrap gap-1.5">
        {trades.map((t) => (
          <button key={t} type="button" aria-pressed={t.toLowerCase() === current} onClick={() => onChange(t)} className={chipClass(t.toLowerCase() === current)}>
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

/** Multi-select trade tags with room for services that aren't in the list yet. */
export const TradeTagPicker: React.FC<{
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  labelClassName?: string;
}> = ({ label, value, onChange, labelClassName }) => {
  const id = useId();
  const [custom, setCustom] = useState("");
  const trades = useKnownTrades(value);
  const selected = new Set(value.map((t) => t.toLowerCase()));

  const toggle = (tag: string) =>
    onChange(selected.has(tag.toLowerCase()) ? value.filter((t) => t.toLowerCase() !== tag.toLowerCase()) : [...value, tag]);

  const addCustom = () => {
    const tag = custom.trim();
    if (tag && !selected.has(tag.toLowerCase())) onChange([...value, tag]);
    setCustom("");
  };

  return (
    <div className="space-y-2">
      <div className={labelClassName}>{label}</div>
      <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
        {trades.map((t) => (
          <button key={t} type="button" aria-pressed={selected.has(t.toLowerCase())} onClick={() => toggle(t)} className={chipClass(selected.has(t.toLowerCase()))}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <label htmlFor={id} className="sr-only">
          Add another service
        </label>
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add another service, e.g. Powder Coating…"
          className="flex-1 min-w-0 bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] focus-visible:ring-2 focus-visible:ring-[#fe7518]/30 outline-none text-base sm:text-sm font-semibold"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-[38px] px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
          Add
        </button>
      </div>
    </div>
  );
};
