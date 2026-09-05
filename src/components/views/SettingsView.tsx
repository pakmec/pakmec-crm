"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Building, 
  Cpu, 
  Layers, 
  Flame, 
  Compass, 
  CheckCircle2,
  Database,
  ShieldCheck
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { TradeRatesSettings } from "@/types";

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaults, contacts, quotes, jobs, invoices } = useCrm();
  const [form, setForm] = useState<TradeRatesSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      location: "Multan, Pakistan",
      currency: "PKR",
      contacts,
      quotes,
      jobs,
      invoices,
      settings: form,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pakmec_multan_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#202532] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#fe7518]" />
            <span>PAKMEC Trade Rates & Database Settings</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 font-sans">
            Configure hourly machine rates, material prices (PKR), bank IBAN, and Multan workshop defaults. Persisted in SQLite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#171922] hover:bg-slate-200 dark:hover:bg-[#202430] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#262c3a] text-xs font-mono py-2 px-3 rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#fe7518]" />
            <span>Export SQLite Backup</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Reset CRM database to default Multan workshop records?")) {
                resetToDefaults();
              }
            }}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#171922] hover:bg-rose-100 dark:hover:bg-[#2b0f14] text-slate-700 dark:text-zinc-300 hover:text-rose-900 dark:hover:text-rose-300 border border-slate-300 dark:border-[#262c3a] hover:border-rose-400 dark:hover:border-rose-800 text-xs font-mono py-2 px-3 rounded-lg transition-all btn-haptic"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Company Profile & Banking */}
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#fe7518]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">PAKMEC Multan Workshop Profile & Banking</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SQLite Connected</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label htmlFor="setting-company-name" className="block text-[var(--muted)] mb-1">Company Name</label>
              <input
                id="setting-company-name"
                aria-label="Company Name"
                type="text"
                value={form.company.name}
                onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-city" className="block text-[var(--muted)] mb-1">City / Region</label>
              <input
                id="setting-company-city"
                aria-label="City or Region"
                type="text"
                value={form.company.city || "Multan"}
                onChange={(e) => setForm({ ...form, company: { ...form.company, city: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="setting-company-address" className="block text-[var(--muted)] mb-1">Multan Workshop Address</label>
              <input
                id="setting-company-address"
                aria-label="Multan Workshop Address"
                type="text"
                value={form.company.address}
                onChange={(e) => setForm({ ...form, company: { ...form.company, address: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-whatsapp" className="block text-[var(--muted)] mb-1">Official WhatsApp Phone</label>
              <input
                id="setting-company-whatsapp"
                aria-label="Official WhatsApp Phone"
                type="text"
                value={form.company.whatsapp}
                onChange={(e) => setForm({ ...form, company: { ...form.company, whatsapp: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-advance" className="block text-[var(--muted)] mb-1">Default Advance Deposit Required (%)</label>
              <input
                id="setting-company-advance"
                aria-label="Default Advance Deposit Required Percentage"
                type="number"
                value={form.company.defaultAdvancePercent}
                onChange={(e) => setForm({ ...form, company: { ...form.company, defaultAdvancePercent: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-bank" className="block text-[var(--muted)] mb-1">Bank Name & Title</label>
              <input
                id="setting-company-bank"
                aria-label="Bank Name and Title"
                type="text"
                value={form.company.bankName}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankName: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-account-title" className="block text-[var(--muted)] mb-1">Account Title</label>
              <input
                id="setting-company-account-title"
                aria-label="Account Title"
                type="text"
                value={form.company.bankAccountTitle}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankAccountTitle: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-iban" className="block text-[var(--muted)] mb-1">Bank Account IBAN</label>
              <input
                id="setting-company-iban"
                aria-label="Bank Account IBAN"
                type="text"
                value={form.company.bankIban}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankIban: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-company-jazzcash" className="block text-[var(--muted)] mb-1">JazzCash / EasyPaisa Number</label>
              <input
                id="setting-company-jazzcash"
                aria-label="JazzCash or EasyPaisa Number"
                type="text"
                value={form.company.jazzCashNumber}
                onChange={(e) => setForm({ ...form, company: { ...form.company, jazzCashNumber: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: CNC Machining Rates (PKR) */}
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">CNC Machining Rates (PKR)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <label htmlFor="setting-cnc-machine-rate" className="block text-[var(--muted)] mb-1">Machine Rate (PKR/Hour)</label>
              <input
                id="setting-cnc-machine-rate"
                aria-label="CNC Machine Rate in PKR per Hour"
                type="number"
                value={form.cnc.machineRatePerHour}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, machineRatePerHour: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-cnc-cam" className="block text-[var(--muted)] mb-1">CAM Programming Setup (PKR)</label>
              <input
                id="setting-cnc-cam"
                aria-label="Mastercam CAM Programming Setup Fee in PKR"
                type="number"
                value={form.cnc.camProgrammingFee}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, camProgrammingFee: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-cnc-fixture" className="block text-[var(--muted)] mb-1">Fixture Clamping (PKR/Fixture)</label>
              <input
                id="setting-cnc-fixture"
                aria-label="Fixture Clamping Setup in PKR per Fixture"
                type="number"
                value={form.cnc.setupPerFixture}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, setupPerFixture: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-cnc-al6061" className="block text-[var(--muted)] mb-1">Aluminum 6061 (PKR/cm³)</label>
              <input
                id="setting-cnc-al6061"
                aria-label="Aluminum 6061 Rate in PKR per Cubic Centimeter"
                type="number"
                value={form.cnc.aluminum6061PerCc}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, aluminum6061PerCc: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-cnc-brass" className="block text-[var(--muted)] mb-1">Brass C360 (PKR/cm³)</label>
              <input
                id="setting-cnc-brass"
                aria-label="Brass C360 Rate in PKR per Cubic Centimeter"
                type="number"
                value={form.cnc.brassPerCc}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, brassPerCc: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-cnc-delrin" className="block text-[var(--muted)] mb-1">Delrin Polymer (PKR/cm³)</label>
              <input
                id="setting-cnc-delrin"
                aria-label="Delrin Acetal Polymer Rate in PKR per Cubic Centimeter"
                type="number"
                value={form.cnc.delrinPerCc}
                onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, delrinPerCc: Number(e.target.value) } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: 3D Printing & Laser Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 3D Printing */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">3D Printing Rates (PKR)</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="setting-print-machine" className="block text-[var(--muted)] mb-1">Machine (PKR/hr)</label>
                <input
                  id="setting-print-machine"
                  aria-label="3D Printing Machine Rate in PKR per Hour"
                  type="number"
                  value={form.printing.machineRatePerHour}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, machineRatePerHour: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-print-pla" className="block text-[var(--muted)] mb-1">PLA (PKR/g)</label>
                <input
                  id="setting-print-pla"
                  aria-label="PLA Filament Rate in PKR per Gram"
                  type="number"
                  step="0.5"
                  value={form.printing.plaPerGram}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, plaPerGram: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-print-petg" className="block text-[var(--muted)] mb-1">PETG (PKR/g)</label>
                <input
                  id="setting-print-petg"
                  aria-label="PETG Filament Rate in PKR per Gram"
                  type="number"
                  step="0.5"
                  value={form.printing.petgPerGram}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, petgPerGram: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-print-resin" className="block text-[var(--muted)] mb-1">SLA Resin (PKR/g)</label>
                <input
                  id="setting-print-resin"
                  aria-label="SLA Photopolymer Resin Rate in PKR per Gram"
                  type="number"
                  step="0.5"
                  value={form.printing.resinPerGram}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, resinPerGram: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Laser Cutting */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">Laser Cutting Rates (PKR)</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="setting-laser-cut" className="block text-[var(--muted)] mb-1">Cut (PKR/meter)</label>
                <input
                  id="setting-laser-cut"
                  aria-label="Laser Cut Path Rate in PKR per Meter"
                  type="number"
                  value={form.laser.cutRatePerMeter}
                  onChange={(e) => setForm({ ...form, laser: { ...form.laser, cutRatePerMeter: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-laser-pierce" className="block text-[var(--muted)] mb-1">Pierce (PKR/point)</label>
                <input
                  id="setting-laser-pierce"
                  aria-label="Laser Pierce Cost in PKR per Point"
                  type="number"
                  value={form.laser.pierceCost}
                  onChange={(e) => setForm({ ...form, laser: { ...form.laser, pierceCost: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-laser-acrylic3" className="block text-[var(--muted)] mb-1">Acrylic 3mm (PKR/cm²)</label>
                <input
                  id="setting-laser-acrylic3"
                  aria-label="Cast Acrylic 3mm Rate in PKR per Square Centimeter"
                  type="number"
                  step="0.1"
                  value={form.laser.acrylic3mmPerSqCm}
                  onChange={(e) => setForm({ ...form, laser: { ...form.laser, acrylic3mmPerSqCm: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-laser-acrylic5" className="block text-[var(--muted)] mb-1">Acrylic 5mm (PKR/cm²)</label>
                <input
                  id="setting-laser-acrylic5"
                  aria-label="Cast Acrylic 5mm Rate in PKR per Square Centimeter"
                  type="number"
                  step="0.1"
                  value={form.laser.acrylic5mmPerSqCm}
                  onChange={(e) => setForm({ ...form, laser: { ...form.laser, acrylic5mmPerSqCm: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#202532]">
          {savedSuccess ? (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved to SQLite database successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono flex items-center gap-1 font-medium">
              <Database className="w-3.5 h-3.5 text-[#fe7518]" />
              <span>Direct SQLite sync active in data/pakmec.db</span>
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs py-2.5 px-6 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save to SQLite</span>
          </button>
        </div>
      </form>
    </div>
  );
};
