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
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { TradeRatesSettings } from "@/types";

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToDefaults, 
    purgeDemoData, 
    isDemoDataPresent, 
    contacts, 
    quotes, 
    jobs, 
    invoices 
  } = useCrm();
  const [form, setForm] = useState<TradeRatesSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      version: "2.0",
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

  const handlePurgeDemo = async () => {
    if (confirm("Are you sure you want to remove all 4 demo mock clients (Tariq, Bilal, Ayesha, Zubair) and their demo records? Your real custom clients will be kept.")) {
      setIsPurging(true);
      try {
        await purgeDemoData();
      } finally {
        setIsPurging(false);
      }
    }
  };

  const handleReset = async () => {
    if (confirm("Warning: Reset database to factory demo defaults? This will overwrite all custom records.")) {
      setIsResetting(true);
      try {
        await resetToDefaults();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#202532] pb-5 sm:pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#fe7518]" />
            <span>PAKMEC Trade Rates & Database Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-sans">
            Configure hourly machine rates, material prices (PKR), bank IBAN, and Multan workshop defaults.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#171922] hover:bg-slate-200 dark:hover:bg-[#202430] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#262c3a] text-xs font-mono py-2.5 px-3 min-h-[40px] rounded-lg transition-all btn-haptic touch-manipulation"
          >
            <Download className="w-3.5 h-3.5 text-[#fe7518]" />
            <span>Export Backup</span>
          </button>

          {isDemoDataPresent && (
            <button
              type="button"
              disabled={isPurging}
              onClick={handlePurgeDemo}
              className="flex items-center justify-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-mono py-2.5 px-3 min-h-[40px] rounded-lg transition-all btn-haptic touch-manipulation"
              title="Remove default demo template records while keeping custom records"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isPurging ? "Purging…" : "Purge Demo Data"}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isResetting}
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#171922] hover:bg-rose-100 dark:hover:bg-[#2b0f14] text-slate-700 dark:text-zinc-300 hover:text-rose-900 dark:hover:text-rose-300 border border-slate-300 dark:border-[#262c3a] hover:border-rose-400 dark:hover:border-rose-800 text-xs font-mono py-2.5 px-3 min-h-[40px] rounded-lg transition-all btn-haptic touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isResetting ? "Resetting…" : "Reset Defaults"}</span>
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
            <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Database Sync Active</span>
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
              <label htmlFor="setting-company-email" className="block text-[var(--muted)] mb-1">Official Email</label>
              <input
                id="setting-company-email"
                aria-label="Official Email"
                type="email"
                value={form.company.email}
                onChange={(e) => setForm({ ...form, company: { ...form.company, email: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-bank-name" className="block text-[var(--muted)] mb-1">Bank Name</label>
              <input
                id="setting-bank-name"
                aria-label="Bank Name"
                type="text"
                value={form.company.bankName}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankName: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-bank-title" className="block text-[var(--muted)] mb-1">Account Title</label>
              <input
                id="setting-bank-title"
                aria-label="Account Title"
                type="text"
                value={form.company.bankAccountTitle}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankAccountTitle: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="setting-bank-iban" className="block text-[var(--muted)] mb-1">Bank IBAN (24 Digits)</label>
              <input
                id="setting-bank-iban"
                aria-label="Bank IBAN"
                type="text"
                value={form.company.bankIban}
                onChange={(e) => setForm({ ...form, company: { ...form.company, bankIban: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
              />
            </div>

            <div>
              <label htmlFor="setting-jazzcash" className="block text-[var(--muted)] mb-1">JazzCash Merchant/Mobile #</label>
              <input
                id="setting-jazzcash"
                aria-label="JazzCash Mobile Number"
                type="text"
                value={form.company.jazzCashNumber}
                onChange={(e) => setForm({ ...form, company: { ...form.company, jazzCashNumber: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>

            <div>
              <label htmlFor="setting-easypaisa" className="block text-[var(--muted)] mb-1">EasyPaisa Account #</label>
              <input
                id="setting-easypaisa"
                aria-label="EasyPaisa Account Number"
                type="text"
                value={form.company.easyPaisaNumber}
                onChange={(e) => setForm({ ...form, company: { ...form.company, easyPaisaNumber: e.target.value } })}
                className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Machine & Trade Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CNC Machining */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Cpu className="w-4 h-4 text-[#fe7518]" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">CNC Machining Rates (PKR)</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="setting-cnc-hourly" className="block text-[var(--muted)] mb-1">Machine Rate (PKR/hr)</label>
                <input
                  id="setting-cnc-hourly"
                  aria-label="CNC Machine Hourly Rate in PKR"
                  type="number"
                  value={form.cnc.machineRatePerHour}
                  onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, machineRatePerHour: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-cnc-cam" className="block text-[var(--muted)] mb-1">CAM Programming Fee</label>
                <input
                  id="setting-cnc-cam"
                  aria-label="CAM Programming Fee in PKR"
                  type="number"
                  value={form.cnc.camProgrammingFee}
                  onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, camProgrammingFee: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-cnc-al6061" className="block text-[var(--muted)] mb-1">Al 6061-T6 (PKR/cm³)</label>
                <input
                  id="setting-cnc-al6061"
                  aria-label="Aluminum 6061 Rate in PKR per Cubic Centimeter"
                  type="number"
                  value={form.cnc.aluminum6061PerCc}
                  onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, aluminum6061PerCc: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
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
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3D Printing */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">3D Printing Rates (PKR)</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="setting-3d-hourly" className="block text-[var(--muted)] mb-1">Machine (PKR/hr)</label>
                <input
                  id="setting-3d-hourly"
                  aria-label="3D Printing Machine Hourly Rate in PKR"
                  type="number"
                  value={form.printing.machineRatePerHour}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, machineRatePerHour: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-3d-setup" className="block text-[var(--muted)] mb-1">Setup Fee</label>
                <input
                  id="setting-3d-setup"
                  aria-label="3D Printing Setup Fee in PKR"
                  type="number"
                  value={form.printing.setupFee}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, setupFee: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-3d-pla" className="block text-[var(--muted)] mb-1">PLA (PKR/gram)</label>
                <input
                  id="setting-3d-pla"
                  aria-label="PLA Filament Rate in PKR per Gram"
                  type="number"
                  step="0.5"
                  value={form.printing.plaPerGram}
                  onChange={(e) => setForm({ ...form, printing: { ...form.printing, plaPerGram: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-3d-resin" className="block text-[var(--muted)] mb-1">Resin (PKR/gram)</label>
                <input
                  id="setting-3d-resin"
                  aria-label="Resin Rate in PKR per Gram"
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

          {/* CAD Design */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Compass className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-[var(--foreground)]">CAD Engineering Design (PKR)</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label htmlFor="setting-cad-hourly" className="block text-[var(--muted)] mb-1">Base Hourly Rate (PKR)</label>
                <input
                  id="setting-cad-hourly"
                  aria-label="CAD Base Hourly Rate in PKR"
                  type="number"
                  value={form.cad.hourlyRatePkr}
                  onChange={(e) => setForm({ ...form, cad: { ...form.cad, hourlyRatePkr: Number(e.target.value) } })}
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] outline-none"
                />
              </div>
              <div>
                <label htmlFor="setting-cad-revision" className="block text-[var(--muted)] mb-1">Extra Revision Fee</label>
                <input
                  id="setting-cad-revision"
                  aria-label="CAD Extra Revision Fee in PKR"
                  type="number"
                  value={form.cad.extraRevisionRate}
                  onChange={(e) => setForm({ ...form, cad: { ...form.cad, extraRevisionRate: Number(e.target.value) } })}
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
              <span>Settings saved to database successfully!</span>
            </span>
          ) : (
            <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono flex items-center gap-1 font-medium">
              <Database className="w-3.5 h-3.5 text-[#fe7518]" />
              <span>Direct database sync active</span>
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs py-2.5 px-6 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
