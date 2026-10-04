"use client";

import React, { useState } from "react";
import { Calculator, Plus } from "lucide-react";
import { QuoteLineItem, TradeRatesSettings } from "@/types";
import { lineAmount, uid } from "@/lib/quoteDocument";
import { NumberField, Segmented, SuggestionChips, TextField } from "./fields";

type Values = Record<string, string | number>;
type DraftItem = Omit<QuoteLineItem, "id" | "trade" | "amount">;

interface CalcField {
  key: string;
  label: string;
  kind: "text" | "number";
  suffix?: string;
}

interface CalcPresetGroup {
  label: string;
  options: { label: string; values: Values }[];
}

interface CalcDef {
  id: string;
  name: string;
  trade: string;
  fields: CalcField[];
  presets: (s: TradeRatesSettings) => CalcPresetGroup[];
  defaults: (s: TradeRatesSettings) => Values;
  build: (v: (key: string) => number, text: (key: string) => string) => DraftItem[];
}

const item = (description: string, quantity: number, unit: string, unitPrice: number): DraftItem => ({
  description,
  quantity,
  unit,
  unitPrice,
});

/**
 * Workshop pricing formulas. Adding a new calculator is just another entry here —
 * materials are free text with one-click presets pulled from Settings → Rates.
 */
const CALCULATORS: CalcDef[] = [
  {
    id: "printing",
    name: "3D Printing",
    trade: "3D Printing",
    fields: [
      { key: "material", label: "Material", kind: "text" },
      { key: "ratePerGram", label: "Material rate", kind: "number", suffix: "PKR/g" },
      { key: "grams", label: "Part weight", kind: "number", suffix: "g" },
      { key: "hours", label: "Print time", kind: "number", suffix: "hrs" },
      { key: "machineRate", label: "Machine rate", kind: "number", suffix: "PKR/hr" },
      { key: "setupFee", label: "Setup & slicing fee", kind: "number", suffix: "PKR" },
      { key: "finish", label: "Finishing", kind: "text" },
      { key: "finishCost", label: "Finishing cost", kind: "number", suffix: "PKR" },
    ],
    presets: (s) => [
      {
        label: "Material",
        options: [
          { label: "PLA", values: { material: "PLA", ratePerGram: s.printing.plaPerGram } },
          { label: "PETG", values: { material: "PETG", ratePerGram: s.printing.petgPerGram } },
          { label: "ABS", values: { material: "ABS", ratePerGram: s.printing.absPerGram } },
          { label: "SLA Resin", values: { material: "SLA Resin", ratePerGram: s.printing.resinPerGram } },
          { label: "TPU", values: { material: "TPU", ratePerGram: s.printing.tpuPerGram } },
        ],
      },
      {
        label: "Finishing",
        options: [
          { label: "None", values: { finish: "", finishCost: 0 } },
          { label: "Sanding & deburr", values: { finish: "Sanding & deburr", finishCost: 400 } },
          { label: "Vapor smoothing", values: { finish: "Vapor smoothing", finishCost: 900 } },
          { label: "Primer & paint", values: { finish: "Primer & matte paint", finishCost: 1500 } },
        ],
      },
    ],
    defaults: (s) => ({
      material: "PLA",
      ratePerGram: s.printing.plaPerGram,
      grams: 120,
      hours: 5,
      machineRate: s.printing.machineRatePerHour,
      setupFee: s.printing.setupFee,
      finish: "",
      finishCost: 0,
    }),
    build: (n, t) => [
      item(`Material: ${t("material") || "Filament"} (${n("grams")} g)`, n("grams"), "g", n("ratePerGram")),
      item(`Machine run time (${n("hours")} hrs)`, n("hours"), "hrs", n("machineRate")),
      ...(n("setupFee") > 0 ? [item("Build setup, slicing & calibration", 1, "setup", n("setupFee"))] : []),
      ...(n("finishCost") > 0 ? [item(`Post-processing: ${t("finish") || "Finishing"}`, 1, "job", n("finishCost"))] : []),
    ],
  },
  {
    id: "laser",
    name: "Laser Cutting",
    trade: "Laser Cutting",
    fields: [
      { key: "material", label: "Sheet material", kind: "text" },
      { key: "ratePerSqCm", label: "Material rate", kind: "number", suffix: "PKR/cm²" },
      { key: "area", label: "Material area", kind: "number", suffix: "cm²" },
      { key: "cutMeters", label: "Cut length", kind: "number", suffix: "m" },
      { key: "cutRate", label: "Cut rate", kind: "number", suffix: "PKR/m" },
      { key: "pierces", label: "Pierce points", kind: "number", suffix: "pts" },
      { key: "pierceCost", label: "Pierce cost", kind: "number", suffix: "PKR/pt" },
      { key: "setupFee", label: "Nesting & setup fee", kind: "number", suffix: "PKR" },
    ],
    presets: (s) => [
      {
        label: "Sheet material",
        options: [
          { label: "Acrylic 3mm", values: { material: "Acrylic 3mm clear", ratePerSqCm: s.laser.acrylic3mmPerSqCm } },
          { label: "Acrylic 5mm", values: { material: "Acrylic 5mm cast", ratePerSqCm: s.laser.acrylic5mmPerSqCm } },
          { label: "MDF 3mm", values: { material: "MDF 3mm", ratePerSqCm: s.laser.mdf3mmPerSqCm } },
          { label: "Mild steel 1.5mm", values: { material: "Mild steel 1.5mm", ratePerSqCm: s.laser.mildSteelPerSqCm } },
        ],
      },
    ],
    defaults: (s) => ({
      material: "Acrylic 3mm clear",
      ratePerSqCm: s.laser.acrylic3mmPerSqCm,
      area: 2500,
      cutMeters: 35,
      cutRate: s.laser.cutRatePerMeter,
      pierces: 60,
      pierceCost: s.laser.pierceCost,
      setupFee: s.laser.setupFee,
    }),
    build: (n, t) => [
      item(`Laser substrate: ${t("material") || "Sheet"} (${n("area")} cm²)`, n("area"), "cm²", n("ratePerSqCm")),
      item(`Laser cutting path (${n("cutMeters")} m)`, n("cutMeters"), "m", n("cutRate")),
      ...(n("pierces") > 0 ? [item(`Pierce points (${n("pierces")})`, n("pierces"), "pts", n("pierceCost"))] : []),
      ...(n("setupFee") > 0 ? [item("Beam alignment & sheet nesting setup", 1, "setup", n("setupFee"))] : []),
    ],
  },
  {
    id: "cnc",
    name: "CNC Machining",
    trade: "CNC Machining",
    fields: [
      { key: "material", label: "Stock material", kind: "text" },
      { key: "ratePerCc", label: "Material rate", kind: "number", suffix: "PKR/cm³" },
      { key: "volume", label: "Stock volume", kind: "number", suffix: "cm³" },
      { key: "hours", label: "Machine time", kind: "number", suffix: "hrs" },
      { key: "machineRate", label: "Machine rate", kind: "number", suffix: "PKR/hr" },
      { key: "fixtures", label: "Fixtures / setups", kind: "number" },
      { key: "setupPerFixture", label: "Setup per fixture", kind: "number", suffix: "PKR" },
      { key: "camFee", label: "CAM programming (0 = skip)", kind: "number", suffix: "PKR" },
    ],
    presets: (s) => [
      {
        label: "Stock material",
        options: [
          { label: "Aluminum 6061-T6", values: { material: "Aluminum 6061-T6", ratePerCc: s.cnc.aluminum6061PerCc } },
          { label: "Brass C360", values: { material: "Brass C360", ratePerCc: s.cnc.brassPerCc } },
          { label: "Delrin / Acetal", values: { material: "Delrin / Acetal", ratePerCc: s.cnc.delrinPerCc } },
          { label: "Carbon steel 1018", values: { material: "Carbon steel 1018", ratePerCc: s.cnc.steelPerCc } },
        ],
      },
    ],
    defaults: (s) => ({
      material: "Aluminum 6061-T6",
      ratePerCc: s.cnc.aluminum6061PerCc,
      volume: 350,
      hours: 6,
      machineRate: s.cnc.machineRatePerHour,
      fixtures: 2,
      setupPerFixture: s.cnc.setupPerFixture,
      camFee: s.cnc.camProgrammingFee,
    }),
    build: (n, t) => [
      item(`Stock material: ${t("material") || "Billet"} (${n("volume")} cm³)`, n("volume"), "cm³", n("ratePerCc")),
      item(`CNC milling / turning time (${n("hours")} hrs)`, n("hours"), "hrs", n("machineRate")),
      ...(n("fixtures") > 0 && n("setupPerFixture") > 0
        ? [item(`Fixture setup & calibration (${n("fixtures")} setups)`, n("fixtures"), "setups", n("setupPerFixture"))]
        : []),
      ...(n("camFee") > 0 ? [item("CAM toolpath programming & verification", 1, "job", n("camFee"))] : []),
    ],
  },
  {
    id: "cad",
    name: "CAD Design",
    trade: "CAD Design",
    fields: [
      { key: "complexity", label: "Complexity", kind: "text" },
      { key: "multiplier", label: "Complexity multiplier", kind: "number", suffix: "×" },
      { key: "hours", label: "Design hours", kind: "number", suffix: "hrs" },
      { key: "hourlyRate", label: "Hourly rate", kind: "number", suffix: "PKR/hr" },
      { key: "revisions", label: "Included revisions", kind: "number" },
    ],
    presets: (s) => [
      {
        label: "Complexity",
        options: [
          { label: "Simple", values: { complexity: "Simple", multiplier: s.cad.simpleMultiplier } },
          { label: "Medium", values: { complexity: "Medium", multiplier: s.cad.mediumMultiplier } },
          { label: "Complex", values: { complexity: "Complex", multiplier: s.cad.complexMultiplier } },
        ],
      },
    ],
    defaults: (s) => ({
      complexity: "Medium",
      multiplier: s.cad.mediumMultiplier,
      hours: 15,
      hourlyRate: s.cad.hourlyRatePkr,
      revisions: 2,
    }),
    build: (n, t) => {
      const unitRate = Math.round(n("hourlyRate") * (n("multiplier") || 1));
      return [
        item(`3D parametric CAD modelling (${t("complexity") || "Standard"}, ${n("hours")} hrs)`, n("hours"), "hrs", unitRate),
        item(`Engineering drawings & ${n("revisions")} revision cycle(s)`, 1, "package", Math.round(unitRate * 1.5)),
      ];
    },
  },
  {
    id: "fabrication",
    name: "Fabrication",
    trade: "Industrial Fabrication",
    fields: [
      { key: "structure", label: "Structure type", kind: "text" },
      { key: "ratePerSqFt", label: "Rate", kind: "number", suffix: "PKR/sq.ft" },
      { key: "area", label: "Covered area", kind: "number", suffix: "sq.ft" },
    ],
    presets: (s) => [
      {
        label: "Structure type",
        options: [
          { label: "Industrial shed", values: { structure: "Industrial shed steel truss", ratePerSqFt: s.construction.industrialShedPerSqFt } },
          { label: "Grey structure", values: { structure: "Commercial grey structure", ratePerSqFt: s.construction.greyStructurePerSqFt } },
          { label: "Turnkey", values: { structure: "Turnkey complete finishing", ratePerSqFt: s.construction.turnkeyPerSqFt } },
        ],
      },
    ],
    defaults: (s) => ({
      structure: "Industrial shed steel truss",
      ratePerSqFt: s.construction.industrialShedPerSqFt,
      area: 1200,
    }),
    build: (n, t) => [
      item(`Structural fabrication & erection: ${t("structure") || "Structure"} (${n("area")} sq.ft)`, n("area"), "sq.ft", n("ratePerSqFt")),
    ],
  },
];

export const RateCalculator: React.FC<{
  settings: TradeRatesSettings;
  formatCurrency: (n: number) => string;
  onAdd: (items: QuoteLineItem[]) => void;
}> = ({ settings, formatCurrency, onAdd }) => {
  const [calcId, setCalcId] = useState(CALCULATORS[0].id);
  const [valuesById, setValuesById] = useState<Record<string, Values>>({});
  const def = CALCULATORS.find((c) => c.id === calcId) || CALCULATORS[0];
  const values = valuesById[def.id] || def.defaults(settings);

  const setValues = (patch: Values) => setValuesById((prev) => ({ ...prev, [def.id]: { ...values, ...patch } }));
  const num = (key: string) => Number(values[key]) || 0;
  const text = (key: string) => String(values[key] ?? "").trim();

  const preview = def.build(num, text).map((d) => ({ ...d, amount: lineAmount(d.quantity, d.unitPrice) }));
  const previewTotal = preview.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800">
      <div className="flex items-start gap-2">
        <Calculator className="w-4 h-4 mt-0.5 text-[#fe7518] shrink-0" aria-hidden="true" />
        <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
          Price a job from your workshop rates, then add the result as normal line items you can still edit.
        </p>
      </div>

      <Segmented
        label="Calculator"
        value={calcId}
        options={CALCULATORS.map((c) => ({ value: c.id, label: c.name }))}
        onChange={setCalcId}
      />

      {def.presets(settings).map((group) => (
        <div key={group.label} className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">{group.label} presets</div>
          <SuggestionChips
            label={`${group.label} presets`}
            options={group.options.map((o) => o.label)}
            onPick={(label) => {
              const opt = group.options.find((o) => o.label === label);
              if (opt) setValues(opt.values);
            }}
          />
        </div>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {def.fields.map((f) =>
          f.kind === "text" ? (
            <TextField key={f.key} label={f.label} value={String(values[f.key] ?? "")} onValue={(v) => setValues({ [f.key]: v })} />
          ) : (
            <NumberField key={f.key} label={f.label} suffix={f.suffix} value={num(f.key)} onValue={(v) => setValues({ [f.key]: v })} />
          )
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800">
        {preview.map((d, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 px-3 py-2 text-xs">
            <span className="min-w-0 break-words font-semibold text-slate-800 dark:text-zinc-200">{d.description}</span>
            <span className="shrink-0 font-bold tabular-nums text-slate-950 dark:text-white">{formatCurrency(d.amount)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs font-black">
          <span className="text-slate-700 dark:text-zinc-300">Calculated</span>
          <span className="tabular-nums text-[#fe7518]">{formatCurrency(previewTotal)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAdd(preview.map((d) => ({ ...d, id: uid("li"), trade: def.trade, details: "", highlights: [] })))}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[36px] px-4 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs touch-manipulation"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add {preview.length} line item{preview.length === 1 ? "" : "s"} to quote
      </button>
    </div>
  );
};
