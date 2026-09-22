"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Building2, 
  Cpu, 
  Layers, 
  Flame, 
  Compass, 
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Wrench,
  AlertTriangle,
  FolderDown
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
  const [activeTab, setActiveTab] = useState<"profile" | "banking" | "rates" | "database">("profile");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
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
    if (confirm("Are you sure you want to remove all demo mock clients (Tariq, Bilal, Ayesha, Zubair) and their demo records? Your custom clients will be kept.")) {
      setIsPurging(true);
      try {
        await purgeDemoData();
      } finally {
        setIsPurging(false);
      }
    }
  };

  const handleReset = async () => {
    if (confirm("Warning: Reset database to factory demo defaults? This will overwrite custom records.")) {
      setIsResetting(true);
      try {
        await resetToDefaults();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto no-print">
      {/* Executive Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#fe7518] flex items-center justify-center border border-orange-500/20 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
                Workshop Settings & Rates
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
                Configure Multan workshop profile, bank accounts, and PKR trade calculations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Saved Successfully</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-zinc-800 text-sm no-scrollbar">
        {[
          { id: "profile", label: "Workshop Profile", icon: Building2 },
          { id: "banking", label: "Banking & Payments", icon: CreditCard },
          { id: "rates", label: "Machine & Trade Rates", icon: Cpu },
          { id: "database", label: "Database & Backups", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap btn-haptic ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4 text-[#fe7518]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Workshop Profile */}
        {activeTab === "profile" && (
          <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Workshop Information</h2>
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-0.5">Details printed on invoices, quotations, and client headers.</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Multan Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={form.company.name}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, name: e.target.value } })}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  City / Hub Location
                </label>
                <input
                  type="text"
                  value={form.company.city || "Multan"}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, city: e.target.value } })}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm shadow-xs transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Workshop Physical Address
                </label>
                <input
                  type="text"
                  value={form.company.address}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, address: e.target.value } })}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Official WhatsApp Phone
                </label>
                <input
                  type="text"
                  value={form.company.whatsapp}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, whatsapp: e.target.value } })}
                  placeholder="+92 300 8472910"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm shadow-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={form.company.email}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, email: e.target.value } })}
                  placeholder="engineering@pakmec.com"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm shadow-xs transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Banking & Payments */}
        {activeTab === "banking" && (
          <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-5">
            <div className="border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Settlement & Payment Channels</h2>
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-0.5">Displayed on official invoices for advance deposits and balance settlements.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={form.company.bankName}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, bankName: e.target.value } })}
                  placeholder="Meezan Bank Ltd"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Bank Account Title
                </label>
                <input
                  type="text"
                  value={form.company.bankAccountTitle}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, bankAccountTitle: e.target.value } })}
                  placeholder="PAKMEC ENGINEERING SERVICES"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  Bank IBAN (24 Digits)
                </label>
                <input
                  type="text"
                  value={form.company.bankIban}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, bankIban: e.target.value } })}
                  placeholder="PK42MEZN0099340102938471"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none font-mono text-sm tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  JazzCash Merchant / Account #
                </label>
                <input
                  type="text"
                  value={form.company.jazzCashNumber}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, jazzCashNumber: e.target.value } })}
                  placeholder="0300-8472910"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                  EasyPaisa Account #
                </label>
                <input
                  type="text"
                  value={form.company.easyPaisaNumber}
                  onChange={(e) => setForm({ ...form, company: { ...form.company, easyPaisaNumber: e.target.value } })}
                  placeholder="0300-8472910"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Machine & Trade Rates */}
        {activeTab === "rates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CNC Machining Rates */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
                <Cpu className="w-5 h-5 text-[#fe7518]" />
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">CNC Machining Rates (PKR)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Machine Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    value={form.cnc.machineRatePerHour}
                    onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, machineRatePerHour: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    CAM Programming Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.cnc.camProgrammingFee}
                    onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, camProgrammingFee: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Setup / Fixture Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.cnc.setupPerFixture}
                    onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, setupPerFixture: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Al 6061-T6 (PKR/cm³)
                  </label>
                  <input
                    type="number"
                    value={form.cnc.aluminum6061PerCc}
                    onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, aluminum6061PerCc: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Brass C360 (PKR/cm³)
                  </label>
                  <input
                    type="number"
                    value={form.cnc.brassPerCc}
                    onChange={(e) => setForm({ ...form, cnc: { ...form.cnc, brassPerCc: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3D Printing Rates */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
                <Layers className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">3D Printing Rates (PKR)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Machine Rate (PKR/hr)
                  </label>
                  <input
                    type="number"
                    value={form.printing.machineRatePerHour}
                    onChange={(e) => setForm({ ...form, printing: { ...form.printing, machineRatePerHour: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Setup Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.printing.setupFee}
                    onChange={(e) => setForm({ ...form, printing: { ...form.printing, setupFee: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    PLA (PKR/gram)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.printing.plaPerGram}
                    onChange={(e) => setForm({ ...form, printing: { ...form.printing, plaPerGram: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    SLA Resin (PKR/gram)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.printing.resinPerGram}
                    onChange={(e) => setForm({ ...form, printing: { ...form.printing, resinPerGram: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Laser Cutting Rates */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">Laser Cutting Rates (PKR)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Cut Rate (PKR/meter)
                  </label>
                  <input
                    type="number"
                    value={form.laser.cutRatePerMeter}
                    onChange={(e) => setForm({ ...form, laser: { ...form.laser, cutRatePerMeter: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Setup Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.laser.setupFee}
                    onChange={(e) => setForm({ ...form, laser: { ...form.laser, setupFee: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Pierce Cost (PKR/point)
                  </label>
                  <input
                    type="number"
                    value={form.laser.pierceCost}
                    onChange={(e) => setForm({ ...form, laser: { ...form.laser, pierceCost: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Acrylic 3mm (PKR/cm²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.laser.acrylic3mmPerSqCm}
                    onChange={(e) => setForm({ ...form, laser: { ...form.laser, acrylic3mmPerSqCm: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Acrylic 5mm (PKR/cm²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.laser.acrylic5mmPerSqCm}
                    onChange={(e) => setForm({ ...form, laser: { ...form.laser, acrylic5mmPerSqCm: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* CAD Design Rates */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
                <Compass className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">CAD Engineering Design (PKR)</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Base Hourly Rate (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.cad.hourlyRatePkr}
                    onChange={(e) => setForm({ ...form, cad: { ...form.cad, hourlyRatePkr: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-100 mb-1.5">
                    Extra Revision Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={form.cad.extraRevisionRate}
                    onChange={(e) => setForm({ ...form, cad: { ...form.cad, extraRevisionRate: Number(e.target.value) } })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Database & Backups */}
        {activeTab === "database" && (
          <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="border-b-2 border-slate-100 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Database & System Management</h2>
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-0.5">Export complete CRM backups, manage demo mock clients, or reset defaults.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#fe7518] flex items-center justify-center mb-2.5 border border-orange-500/20">
                    <FolderDown className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">Export Backup</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-1">Download complete JSON snapshot of all clients, jobs, quotes, and ledger.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-sm btn-haptic"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2.5 border border-amber-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">Clear Demo Mock Clients</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-1">Purge the 4 initial demo clients while preserving your real business data.</p>
                </div>
                <button
                  type="button"
                  disabled={!isDemoDataPresent || isPurging}
                  onClick={handlePurgeDemo}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-black shadow-sm btn-haptic"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isPurging ? "Purging…" : isDemoDataPresent ? "Clear Demo Records" : "No Demo Data"}</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2.5 border border-rose-500/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">Factory Reset</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mt-1">Revert all database records and trade pricing back to standard defaults.</p>
                </div>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-900 dark:text-zinc-100 hover:text-rose-900 dark:hover:text-rose-300 text-xs font-bold border border-slate-300 dark:border-zinc-700 btn-haptic"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isResetting ? "Resetting…" : "Reset to Defaults"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between pt-5 border-t-2 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400">
            <Database className="w-4 h-4 text-[#fe7518]" />
            <span>Supabase Cloud PostgreSQL & SQLite Synced</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs py-3 px-6 rounded-xl shadow-md border-2 border-[#e56208] btn-haptic"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
