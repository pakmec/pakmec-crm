"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DashboardView } from "@/components/views/DashboardView";
import { ContactsView } from "@/components/views/ContactsView";
import { QuotesView } from "@/components/views/QuotesView";
import { JobsKanbanView } from "@/components/views/JobsKanbanView";
import { InvoicesView } from "@/components/views/InvoicesView";
import { SettingsView } from "@/components/views/SettingsView";
import { LoginView } from "@/components/auth/LoginView";
import { useCrm } from "@/context/CrmContext";
import { Plus, Users, KanbanSquare } from "lucide-react";
import { TradeType, JobPriority } from "@/types";

export default function Home() {
  const { 
    addContact, 
    createJob, 
    contacts, 
    formatCurrency, 
    isAuthenticated, 
    authHydrated, 
    currentRole, 
    permissions 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [targetJobId, setTargetJobId] = useState<string | null>(null);
  const [targetContactIdForQuote, setTargetContactIdForQuote] = useState<string | undefined>(undefined);

  // Enforce role-based active tab boundaries
  useEffect(() => {
    if (currentRole === "machinist") {
      if (activeTab !== "dashboard" && activeTab !== "jobs") {
        setActiveTab("jobs");
      }
    } else if (currentRole === "sales") {
      if (activeTab === "invoices" || activeTab === "settings") {
        setActiveTab("dashboard");
      }
    }
  }, [currentRole, activeTab]);

  // New Contact modal state
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactCity, setContactCity] = useState("Multan");
  const [contactTrade, setContactTrade] = useState<TradeType>("CNC Machining");

  // New Job modal state
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobContactId, setJobContactId] = useState(contacts[0]?.id || "");
  const [jobTrade, setJobTrade] = useState<TradeType>("CNC Machining");
  const [jobTotal, setJobTotal] = useState(25000);
  const [jobAdvance, setJobAdvance] = useState(12500);
  const [jobPriority, setJobPriority] = useState<JobPriority>("high");
  const [jobDeadline, setJobDeadline] = useState("");

  // Keyboard shortcut listener (Cmd/Ctrl + K or Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector("input[placeholder*='Search']") as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenJobDetail = (jobId: string) => {
    setTargetJobId(jobId);
    setActiveTab("jobs");
  };

  const handleOpenNewQuoteForContact = (contactId: string) => {
    setTargetContactIdForQuote(contactId);
    setActiveTab("quotes");
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    addContact({
      name: contactName.trim(),
      company: contactCompany.trim(),
      phone: contactPhone.trim(),
      email: "",
      city: contactCity.trim(),
      tradeTags: [contactTrade],
    });

    setIsNewContactOpen(false);
    setContactName("");
    setContactPhone("");
    setContactCompany("");
    setActiveTab("contacts");
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === jobContactId) || contacts[0];
    if (!contact || !jobTitle.trim()) return;

    const newJob = createJob({
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactCompany: contact.company,
      title: jobTitle.trim(),
      trade: jobTrade,
      stage: "queued",
      priority: jobPriority,
      currency: "PKR",
      totalAmount: jobTotal,
      advancePaid: jobAdvance,
      advanceStatus: jobAdvance >= jobTotal ? "collected" : jobAdvance > 0 ? "partial" : "pending",
      balanceDue: Math.max(0, jobTotal - jobAdvance),
      startDate: new Date().toISOString().split("T")[0],
      deadline: jobDeadline || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      specsSummary: `${jobTrade} workshop run`,
      referenceItems: [
        {
          id: `ref-${Date.now()}`,
          title: "Initial Job Setup Brief",
          type: "note",
          url: "",
          notes: "Job initiated manually on floor.",
          uploadedBy: "PAKMEC Multan",
          uploadedAt: new Date().toLocaleString(),
          tag: "Setup"
        }
      ]
    });

    setIsNewJobOpen(false);
    setJobTitle("");
    handleOpenJobDetail(newJob.id);
  };

  // Show loading skeleton while checking session
  if (!authHydrated) {
    return (
      <div className="min-h-screen bg-[#08090d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#fe7518] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render Login Portal if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9] dark:bg-[#0a0b0e] text-[#0f172a] dark:text-[#f4f5f8] transition-colors duration-200">
      {/* Dark Linear-Style Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewQuote={() => setActiveTab("quotes")}
        onOpenNewContact={() => setIsNewContactOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenNewQuote={() => setActiveTab("quotes")}
          onOpenNewJob={() => setIsNewJobOpen(true)}
          onOpenNewContact={() => setIsNewContactOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onOpenNewQuote={() => setActiveTab("quotes")}
              onOpenJobDetail={handleOpenJobDetail}
            />
          )}

          {activeTab === "contacts" && (
            <ContactsView
              onOpenNewQuoteForContact={handleOpenNewQuoteForContact}
            />
          )}

          {activeTab === "quotes" && (
            <QuotesView
              preselectedContactId={targetContactIdForQuote}
              onJobCreated={handleOpenJobDetail}
            />
          )}

          {activeTab === "jobs" && (
            <JobsKanbanView
              selectedJobIdFromGlobal={targetJobId}
              onNavigateToInvoice={() => setActiveTab("invoices")}
            />
          )}

          {activeTab === "invoices" && (
            <InvoicesView
              initialSelectedJobId={targetJobId}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Quick New Contact Modal */}
      {isNewContactOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141a] border border-[#2a3040] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[#202533] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fe7518]" />
                <span>Quick Add Client</span>
              </h3>
              <button 
                onClick={() => setIsNewContactOpen(false)} 
                aria-label="Close dialog"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#828c9c] font-mono mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Asim Munir"
                  className="w-full bg-[#161821] text-white p-2 rounded-md border border-[#242938] focus:border-[#fe7518] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#828c9c] font-mono mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +92 300 8472910"
                  className="w-full bg-[#161821] text-white p-2 rounded-md border border-[#242938] focus:border-[#fe7518] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#828c9c] font-mono mb-1">Company</label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="e.g. Precision Robotics"
                    className="w-full bg-[#161821] text-white p-2 rounded-md border border-[#242938] focus:border-[#fe7518] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#828c9c] font-mono mb-1">City</label>
                  <input
                    type="text"
                    value={contactCity}
                    onChange={(e) => setContactCity(e.target.value)}
                    className="w-full bg-[#161821] text-white p-2 rounded-md border border-[#242938] focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#828c9c] font-mono mb-1">Primary Trade Interest</label>
                <select
                  value={contactTrade}
                  onChange={(e) => setContactTrade(e.target.value as TradeType)}
                  className="w-full bg-[#161821] text-white p-2 rounded-md border border-[#242938] focus:border-[#fe7518] outline-none"
                >
                  <option value="CNC Machining">CNC Machining</option>
                  <option value="3D Printing">3D Printing</option>
                  <option value="Laser Cutting">Laser Cutting</option>
                  <option value="CAD Design">CAD Design</option>
                  <option value="Industrial Fabrication">Industrial Fabrication</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202533]">
                <button
                  type="button"
                  onClick={() => setIsNewContactOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#181a22] text-[#8e98a8] hover:bg-[#20242f]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-white font-bold shadow-md"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick New Job Modal */}
      {isNewJobOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-[#fe7518]" />
                <span>Create New Workshop Job</span>
              </h3>
              <button 
                onClick={() => setIsNewJobOpen(false)} 
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. 20x Delrin Bushings CNC Turning"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Client</label>
                  <select
                    value={jobContactId}
                    onChange={(e) => setJobContactId(e.target.value)}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Trade</label>
                  <select
                    value={jobTrade}
                    onChange={(e) => setJobTrade(e.target.value as TradeType)}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  >
                    <option value="CNC Machining">CNC Machining</option>
                    <option value="3D Printing">3D Printing</option>
                    <option value="Laser Cutting">Laser Cutting</option>
                    <option value="CAD Design">CAD Design</option>
                    <option value="Industrial Fabrication">Industrial Fabrication</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Total Agreed (PKR)</label>
                  <input
                    type="number"
                    value={jobTotal}
                    onChange={(e) => setJobTotal(Number(e.target.value))}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Advance Received (PKR)</label>
                  <input
                    type="number"
                    value={jobAdvance}
                    onChange={(e) => setJobAdvance(Number(e.target.value))}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Priority</label>
                  <select
                    value={jobPriority}
                    onChange={(e) => setJobPriority(e.target.value as any)}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  >
                    <option value="medium">Standard Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Machine Run</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Deadline</label>
                  <input
                    type="date"
                    value={jobDeadline}
                    onChange={(e) => setJobDeadline(e.target.value)}
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsNewJobOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-white font-bold shadow-md"
                >
                  Create & Open Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
