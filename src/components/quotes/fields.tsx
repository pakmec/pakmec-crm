"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { QuoteInfoRow } from "@/types";
import { moveById, removeById, uid, updateById } from "@/lib/quoteDocument";

export const inputClass =
  "w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 dark:hover:border-zinc-500 focus:border-[#fe7518] focus-visible:ring-2 focus-visible:ring-[#fe7518]/30 outline-none text-base sm:text-sm font-semibold shadow-xs placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-zinc-500";

const labelClass = "block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1";

interface LabelBits {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

const FieldShell: React.FC<LabelBits & { id: string; children: React.ReactNode }> = ({
  id,
  label,
  hideLabel,
  hint,
  error,
  className,
  children,
}) => (
  <div className={`min-w-0 ${className || ""}`}>
    <label htmlFor={id} className={hideLabel ? "sr-only" : labelClass}>
      {label}
    </label>
    {children}
    {error ? (
      <p id={`${id}-err`} className="mt-1 text-xs font-bold text-rose-700 dark:text-rose-400" aria-live="polite">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="mt-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
        {hint}
      </p>
    ) : null}
  </div>
);

type TextFieldProps = LabelBits &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "value" | "onChange"> & {
    value: string;
    onValue: (value: string) => void;
    inputClassName?: string;
  };

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, hint, error, className, value, onValue, inputClassName, ...rest },
  ref
) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      <input
        ref={ref}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} ${error ? "border-rose-500 dark:border-rose-500" : ""} ${inputClassName || ""}`}
        {...rest}
      />
    </FieldShell>
  );
});

type TextAreaFieldProps = LabelBits &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "value" | "onChange"> & {
    value: string;
    onValue: (value: string) => void;
  };

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, hideLabel, hint, error, className, value, onValue, rows = 3, ...rest }) => {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onValue(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${inputClass} font-medium leading-relaxed resize-y`}
        {...rest}
      />
    </FieldShell>
  );
};

/**
 * Numeric input that accepts free typing ("", "1.", "75,000") and only reports
 * parsed numbers upward, so clearing the box never snaps to 0 mid-edit.
 */
export const NumberField: React.FC<
  LabelBits & {
    value: number;
    onValue: (value: number) => void;
    prefix?: string;
    suffix?: string;
    placeholder?: string;
  }
> = ({ label, hideLabel, hint, error, className, value, onValue, prefix, suffix, placeholder }) => {
  const id = useId();
  const [text, setText] = useState(value ? String(value) : "");
  const editing = useRef(false);

  useEffect(() => {
    if (!editing.current) setText(value ? String(value) : "");
  }, [value]);

  return (
    <FieldShell id={id} label={label} hideLabel={hideLabel} hint={hint} error={error} className={className}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-bold text-slate-500 dark:text-zinc-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          placeholder={placeholder ?? "0"}
          onFocus={() => (editing.current = true)}
          onBlur={() => {
            editing.current = false;
            setText(value ? String(value) : "");
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setText(raw);
            const parsed = parseFloat(raw.replace(/,/g, ""));
            onValue(Number.isFinite(parsed) ? parsed : 0);
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={`${inputClass} tabular-nums ${prefix ? "pl-11" : ""} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-bold text-slate-500 dark:text-zinc-400">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
};

/** Clickable suggestions that fill a free-text field — replaces fixed dropdowns. */
export const SuggestionChips: React.FC<{
  label: string;
  options: string[];
  value?: string;
  onPick: (value: string) => void;
  className?: string;
}> = ({ label, options, value, onPick, className }) => {
  if (!options.length) return null;
  const current = (value || "").trim().toLowerCase();
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-1.5 ${className || ""}`}>
      {options.map((opt) => {
        const active = opt.trim().toLowerCase() === current;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(opt)}
            className={`min-h-[44px] sm:min-h-[28px] px-2.5 py-1 rounded-lg text-xs font-bold transition-colors touch-manipulation ${
              active
                ? "bg-[#fe7518] text-slate-950"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

export const IconButton: React.FC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & { label: string; tone?: "default" | "danger" }
> = ({ label, tone = "default", className, children, ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] sm:min-w-[30px] sm:min-h-[30px] rounded-lg transition-colors touch-manipulation disabled:opacity-30 disabled:pointer-events-none ${
      tone === "danger"
        ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-800"
        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-950 dark:hover:text-white"
    } ${className || ""}`}
    {...rest}
  >
    {children}
  </button>
);

/** Up / down / delete controls shared by every repeatable row. */
export const RowControls: React.FC<{
  name: string;
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}> = ({ name, index, count, onMove, onRemove }) => (
  <div className="flex items-center shrink-0">
    <IconButton label={`Move ${name} up`} disabled={index === 0} onClick={() => onMove(-1)}>
      <ArrowUp className="w-4 h-4" />
    </IconButton>
    <IconButton label={`Move ${name} down`} disabled={index === count - 1} onClick={() => onMove(1)}>
      <ArrowDown className="w-4 h-4" />
    </IconButton>
    <IconButton label={`Remove ${name}`} tone="danger" onClick={onRemove}>
      <Trash2 className="w-4 h-4" />
    </IconButton>
  </div>
);

export const AddButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function AddButton(
  { className, children, ...rest },
  ref
) {
  return (
  <button
    ref={ref}
    type="button"
    className={`inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[32px] px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-[#fe7518] hover:text-slate-950 dark:hover:text-white transition-colors touch-manipulation ${
      className || ""
    }`}
    {...rest}
  >
    <Plus className="w-3.5 h-3.5 text-[#fe7518]" aria-hidden="true" />
    {children}
  </button>
  );
});

/** <details> that starts open or closed but is then left to the user. */
export const Disclosure: React.FC<{ defaultOpen: boolean; summary: React.ReactNode; children: React.ReactNode }> = ({
  defaultOpen,
  summary,
  children,
}) => {
  const [initiallyOpen] = useState(defaultOpen);
  return (
    <details open={initiallyOpen} className="group">
      {summary}
      {children}
    </details>
  );
};

/**
 * Editable list of label/value pairs. Used for item specs, totals info rows,
 * payment details, spec tiles and spec tables.
 */
export const KeyValueEditor: React.FC<{
  name: string;
  rows: QuoteInfoRow[];
  onChange: (rows: QuoteInfoRow[]) => void;
  labelPlaceholder: string;
  valuePlaceholder: string;
  addLabel: string;
  allowEmphasis?: boolean;
}> = ({ name, rows, onChange, labelPlaceholder, valuePlaceholder, addLabel, allowEmphasis }) => (
  <div className="space-y-2">
    {rows.map((row, idx) => (
      <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-1.5 sm:gap-2 flex-1 min-w-0">
          <TextField
            label={`${name} ${idx + 1} label`}
            hideLabel
            value={row.label}
            onValue={(label) => onChange(updateById(rows, row.id, { label }))}
            placeholder={labelPlaceholder}
          />
          <TextField
            label={`${name} ${idx + 1} value`}
            hideLabel
            value={row.value}
            onValue={(value) => onChange(updateById(rows, row.id, { value }))}
            placeholder={valuePlaceholder}
          />
        </div>
        <div className="flex items-center justify-end gap-1">
          {allowEmphasis && (
            <label className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[30px] px-2 rounded-lg text-[11px] font-bold text-slate-700 dark:text-zinc-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={Boolean(row.emphasis)}
                onChange={(e) => onChange(updateById(rows, row.id, { emphasis: e.target.checked }))}
                className="w-4 h-4 accent-[#fe7518]"
              />
              Highlight
            </label>
          )}
          <RowControls
            name={name.toLowerCase()}
            index={idx}
            count={rows.length}
            onMove={(dir) => onChange(moveById(rows, row.id, dir))}
            onRemove={() => onChange(removeById(rows, row.id))}
          />
        </div>
      </div>
    ))}
    <AddButton onClick={() => onChange([...rows, { id: uid("kv"), label: "", value: "" }])}>{addLabel}</AddButton>
  </div>
);

export const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) => (
  <div role="group" aria-label={label} className="inline-flex flex-wrap p-1 gap-1 rounded-xl bg-slate-100 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        aria-pressed={value === opt.value}
        onClick={() => onChange(opt.value)}
        className={`min-h-[44px] sm:min-h-[32px] px-3 rounded-lg text-xs font-bold transition-colors touch-manipulation ${
          value === opt.value
            ? "bg-[#fe7518] text-slate-950 shadow-xs"
            : "text-slate-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-slate-950 dark:hover:text-white"
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const SectionCard: React.FC<{
  id?: string;
  step?: number;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, step, title, description, aside, children }) => (
  <section
    id={id}
    aria-labelledby={id ? `${id}-title` : undefined}
    className="scroll-mt-24 bg-white dark:bg-[#12141c] p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
  >
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
      <div className="flex items-start gap-3 min-w-0">
        {step !== undefined && (
          <span
            aria-hidden="true"
            className="w-7 h-7 rounded-lg bg-[#fe7518] text-slate-950 flex items-center justify-center text-xs font-black shrink-0"
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <h2 id={id ? `${id}-title` : undefined} className="text-sm font-black text-slate-950 dark:text-white">
            {title}
          </h2>
          {description && <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {aside}
    </div>
    {children}
  </section>
);
