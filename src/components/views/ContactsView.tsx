"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Clock, 
  Send,
  FilePlus,
  Tag,
  Archive,
  Trash2,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  ChevronLeft
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Contact, TradeType, WhatsAppLog } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface ContactsViewProps {
  onOpenNewQuoteForContact?: (contactId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onOpenNewQuoteForContact }) => {
  const { 
    contacts, 
    addContact, 
    deleteContact,
    archiveContact,
    unarchiveContact,
    addWhatsAppLog, 
    quotes,
    jobs, 
    invoices, 
    formatCurrency,
    currentRole,
    permissions 
  } = useCrm();

  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");
  const [filterTrade, setFilterTrade] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(contacts[0] || null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [newLogText, setNewLogText] = useState("");
  const [logType, setLogType] = useState<WhatsAppLog["type"]>("general");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Archive & Delete Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"archive" | "delete">("archive");
  const [actionTargetContact, setActionTargetContact] = useState<Contact | null>(null);

  // New contact form state
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "Multan",
    address: "",
    tradeTags: ["CNC Machining"] as TradeType[],
    notes: "",
  });

  const activeContactsCount = contacts.filter((c) => !c.isArchived).length;
  const archivedContactsCount = contacts.filter((c) => !!c.isArchived).length;

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesStatus = statusTab === "active" ? !c.isArchived : !!c.isArchived;
    const matchesTrade = filterTrade === "all" || c.tradeTags.includes(filterTrade as TradeType);
    const matchesSearch = 
      c.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(localSearch.toLowerCase()) ||
      c.phone.includes(localSearch) ||
      c.city.toLowerCase().includes(localSearch.toLowerCase());
    return matchesStatus && matchesTrade && matchesSearch;
  });

  const activeContact = filteredContacts.find((c) => c.id === selectedContact?.id) || filteredContacts[0] || null;

  // Compute metrics for selected contact
  const contactQuotes = quotes.filter((q) => q.contactId === activeContact?.id);
  const contactJobs = jobs.filter((j) => j.contactId === activeContact?.id);
  const contactInvoices = invoices.filter((i) => i.contactId === activeContact?.id);
  const totalSpentPKR = contactInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const pendingDuePKR = contactJobs
    .filter((j) => j.stage !== "delivered")
    .reduce((sum, j) => sum + j.balanceDue, 0);

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) return;

    const created = addContact({
      name: newContact.name.trim(),
      company: newContact.company.trim(),
      phone: newContact.phone.trim(),
      email: newContact.email.trim(),
      city: newContact.city.trim() || "Multan",
      address: newContact.address.trim(),
      tradeTags: newContact.tradeTags,
      notes: newContact.notes.trim(),
    });

    setSelectedContact(created);
    setIsAddModalOpen(false);
    setNewContact({
      name: "",
      company: "",
      phone: "",
      email: "",
      city: "Multan",
      address: "",
      tradeTags: ["CNC Machining"],
      notes: "",
    });
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact || !newLogText.trim()) return;

    addWhatsAppLog(activeContact.id, newLogText.trim(), logType);
    setNewLogText("");
  };

  const toggleTradeTag = (tag: TradeType) => {
    setNewContact((prev) => {
      const exists = prev.tradeTags.includes(tag);
      if (exists) {
        return { ...prev, tradeTags: prev.tradeTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tradeTags: [...prev.tradeTags, tag] };
      }
    });
  };

  const handleExecuteArchive = () => {
    if (!actionTargetContact) return;
    archiveContact(actionTargetContact.id, true);
    setIsConfirmModalOpen(false);
    setActionTargetContact(null);
  };

  const handleExecuteDelete = () => {
    if (!actionTargetContact) return;
    deleteContact(actionTargetContact.id, true);
    setIsConfirmModalOpen(false);
    setActionTargetContact(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden no-print">
      {/* Left Column: Contact List & Filters */}
      <div className={`w-full lg:w-96 border-r border-[var(--border)] bg-[var(--surface-50)] flex flex-col shrink-0 ${
        showMobileDetail ? "hidden lg:flex" : "flex"
      }`}>
        {/* Top Controls */}
        <div className="p-4 border-b border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fe7518]" />
                <span>Multan Client Database</span>
              </h2>
              <p className="text-xs text-[var(--muted)]">Manage client profiles & WhatsApp logs</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-white text-xs font-semibold py-1.5 px-3 rounded-md shadow-sm border border-[#e56208] btn-haptic"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name, company, city, phone…"
              className="w-full bg-[var(--surface-100)] text-[16px] sm:text-xs text-[var(--foreground)] placeholder-[var(--muted)] pl-8 pr-3 py-2 min-h-[40px] rounded-md border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono touch-manipulation"
            />
          </div>

          {/* Status Filter (Active vs Archived) */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#131620] border border-slate-200 dark:border-zinc-800 text-xs font-mono">
            <button
              type="button"
              data-testid="tab-active-contacts"
              onClick={() => setStatusTab("active")}
              className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 font-bold transition-all btn-haptic ${
                statusTab === "active"
                  ? "bg-white dark:bg-[#1f2433] text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-300 dark:border-zinc-700"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#fe7518]" />
              <span>Active ({activeContactsCount})</span>
            </button>
            <button
              type="button"
              data-testid="tab-archived-contacts"
              onClick={() => setStatusTab("archived")}
              className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 font-bold transition-all btn-haptic ${
                statusTab === "archived"
                  ? "bg-white dark:bg-[#1f2433] text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-300 dark:border-zinc-700"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              <span>Archived ({archivedContactsCount})</span>
            </button>
          </div>

          {/* Trade Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-[11px] font-mono w-full">
            {["all", "CNC Machining", "3D Printing", "Laser Cutting", "CAD Design"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTrade(t)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  filterTrade === t 
                    ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-200)]"
                }`}
              >
                {t === "all" ? "All Trades" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div 
          tabIndex={0}
          aria-label="Clients list"
          className="flex-1 overflow-y-auto divide-y divide-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[#fe7518]"
        >
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-left space-y-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[var(--foreground)]">No Clients Found</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Register a client account with Multan workshop WhatsApp contact details.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold btn-haptic"
              >
                <Plus className="w-3 h-3" />
                <span>Add Client</span>
              </button>
            </div>
          ) : (
            filteredContacts.map((c) => {
              const isSelected = activeContact?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedContact(c);
                    setShowMobileDetail(true);
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl cursor-pointer transition-all border text-left min-h-[50px] touch-manipulation space-y-2.5 ${
                    isSelected 
                      ? "bg-white dark:bg-[#1a1e2c] border-2 border-[#fe7518] shadow-sm font-semibold" 
                      : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--surface-100)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm sm:text-base text-[var(--foreground)] truncate">
                      {c.name}
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                      {c.city}
                    </span>
                  </div>

                  {c.company && (
                    <div className="text-xs text-[var(--muted)] truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#fe7518] shrink-0" />
                      <span className="font-medium">{c.company}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
                    <div className="flex flex-wrap gap-1.5">
                      {c.tradeTags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--surface-200)] text-slate-700 dark:text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{c.whatsappLogs?.length || 0}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Contact Details, WhatsApp Log & Timeline */}
      {activeContact ? (
        <div 
          tabIndex={0}
          aria-label="Client details and activity"
          className={`flex-1 bg-[var(--background)] flex flex-col overflow-y-auto focus:outline-none focus:ring-1 focus:ring-[#fe7518] ${
            !showMobileDetail ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Contact Header Card */}
          <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-50)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowMobileDetail(false)}
                  className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 min-h-[36px] rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-xs font-semibold btn-haptic mr-1"
                >
                  <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                  <span>Clients</span>
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">{activeContact.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-200)] text-[var(--muted)] border border-[var(--border)]">
                  {activeContact.id}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[var(--muted)] flex-wrap font-mono">
                {activeContact.company && (
                  <span className="flex items-center gap-1 text-[var(--foreground)]">
                    <Building2 className="w-3.5 h-3.5 text-[#fe7518]" />
                    {activeContact.company}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {activeContact.city}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {activeContact.phone}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Call & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/${activeContact.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#075E54] dark:text-[#25D366] font-semibold border border-[#25D366]/40 text-xs py-2 px-3.5 rounded-lg transition-all btn-haptic"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {!activeContact.isArchived && onOpenNewQuoteForContact && permissions.canCreateQuotes && (
                <button
                  onClick={() => onOpenNewQuoteForContact(activeContact.id)}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Create Quote</span>
                </button>
              )}

              {permissions.canDeleteOrArchive && (
                <>
                  {!activeContact.isArchived ? (
                    <>
                      <button
                        data-testid="btn-archive-client"
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("archive");
                          setIsConfirmModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-zinc-300 hover:text-amber-800 dark:hover:text-amber-300 border border-slate-300 dark:border-zinc-700 text-xs font-semibold py-2 px-3 rounded-lg btn-haptic"
                        title="Move client and all their quotes & jobs to Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>

                      <button
                        data-testid="btn-delete-client"
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("delete");
                          setIsConfirmModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-zinc-300 hover:text-rose-800 dark:hover:text-rose-300 border border-slate-300 dark:border-zinc-700 text-xs font-semibold py-2 px-3 rounded-lg btn-haptic"
                        title="Permanently remove client and all data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        data-testid="btn-restore-client"
                        onClick={() => unarchiveContact(activeContact.id)}
                        className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm border border-emerald-800 btn-haptic"
                        title="Restore client and all associated quotes, jobs, and invoices to active pipeline"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Client & Data</span>
                      </button>

                      <button
                        data-testid="btn-delete-archived-client"
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("delete");
                          setIsConfirmModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm border border-rose-800 btn-haptic"
                        title="Permanently wipe client and all records"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Archived Client Banner */}
          {activeContact.isArchived && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-50 dark:bg-[#20180a] border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-200 text-xs font-mono flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold block">Archived Client Profile</span>
                  <span className="text-[11px] text-amber-800 dark:text-amber-300">
                    This client and their {contactQuotes.length} quotes, {contactJobs.length} jobs, and {contactInvoices.length} invoices are archived.
                  </span>
                </div>
              </div>
              <button
                onClick={() => unarchiveContact(activeContact.id)}
                className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0 btn-haptic flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Now</span>
              </button>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-50)]">
            <div className="bg-[var(--card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--muted)] uppercase font-semibold">Lifetime Invoiced</span>
              <div className="mt-1.5">
                <CurrencyDisplay amount={totalSpentPKR} size="md" />
              </div>
            </div>
            <div className="bg-[var(--card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--muted)] uppercase font-semibold">Current Balance Due</span>
              <div className="mt-1.5">
                <CurrencyDisplay amount={pendingDuePKR} size="md" color={pendingDuePKR > 0 ? "amber" : "green"} />
              </div>
            </div>
            <div className="bg-[var(--card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--muted)] uppercase font-semibold">Associated Jobs</span>
              <div className="text-base sm:text-lg font-bold font-mono text-[var(--foreground)] mt-1.5">
                {contactJobs.length} Jobs
              </div>
            </div>
            <div className="bg-[var(--card)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--muted)] uppercase font-semibold">Trade Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeContact.tradeTags.map((t) => (
                  <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--surface-200)] text-slate-700 dark:text-zinc-300 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Conversation Timeline & Entry Form */}
          <div className="p-4 sm:p-6 flex-1 space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Conversation Summary Log</span>
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Team notes of client specifications, quotes sent, advance deposit confirmations, and delivery updates.
              </p>
            </div>

            {/* Add New Note Box */}
            <form onSubmit={handleAddLog} className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[var(--muted)] font-mono">Category:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["general", "inquiry", "quote", "payment", "delivery"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLogType(t)}
                      className={`text-xs font-mono uppercase px-3 py-1 min-h-[30px] rounded-md transition-colors ${
                        logType === t 
                          ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm" 
                          : "bg-[var(--surface-200)] text-[var(--muted)] hover:bg-[var(--surface-100)]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={3}
                value={newLogText}
                aria-label="WhatsApp message summary note"
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Type or paste client WhatsApp message summary…"
                className="w-full bg-[var(--surface-100)] text-[16px] sm:text-xs text-[var(--foreground)] placeholder-[var(--muted)] p-3.5 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[var(--muted)] font-mono">
                  Saves directly into database
                </span>
                <button
                  type="submit"
                  disabled={!newLogText.trim()}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white text-xs font-semibold py-1.5 px-3.5 rounded-md btn-haptic"
                >
                  <Send className="w-3 h-3" />
                  <span>Log Note</span>
                </button>
              </div>
            </form>

            {/* Conversation Log Feed */}
            <div className="space-y-3">
              {(activeContact.whatsappLogs || []).length === 0 ? (
                <div className="p-6 text-left bg-white dark:bg-[var(--surface-50)] rounded-xl border border-[var(--border)] space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-[var(--foreground)]">No Conversation Logs Yet</h4>
                  <p className="text-[11px] text-[var(--muted)]">
                    Use the field above to record key details from WhatsApp client chats, quotation revisions, or payment agreements.
                  </p>
                </div>
              ) : (
                (activeContact.whatsappLogs || []).map((log) => {
                  const badgeStyles: Record<string, string> = {
                    inquiry: "bg-blue-100 dark:bg-[#0c1929] text-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 font-semibold",
                    quote: "bg-amber-100 dark:bg-[#251909] text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-semibold",
                    payment: "bg-emerald-100 dark:bg-[#0c1f15] text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-semibold",
                    delivery: "bg-slate-200 dark:bg-[#191c26] text-slate-900 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 font-semibold",
                    general: "bg-slate-200 dark:bg-[#191c26] text-slate-900 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 font-semibold",
                  };

                  return (
                    <div 
                      key={log.id} 
                      className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-2 hover:border-[#fe7518]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--foreground)] flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#fe7518]"></span>
                            {log.author}
                          </span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${badgeStyles[log.type]}`}>
                            {log.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--muted)] font-mono">{log.date}</span>
                      </div>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                        {log.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* New Client Modal */}
      {isAddModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-contact-title"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 id="add-contact-title" className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fe7518]" />
                <span>Register Client (Multan Database)</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Tariq Mahmood"
                  className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Company / Workshop</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="e.g. AeroDynamics Multan"
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">City</label>
                  <input
                    type="text"
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    placeholder="Multan"
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted)] font-mono mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full bg-[var(--surface-100)] text-[var(--foreground)] p-2 rounded-lg border border-[var(--border)] focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--muted)] font-mono mb-1">Primary Trade Tags</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(["3D Printing", "Laser Cutting", "CNC Machining", "CAD Design", "Industrial Fabrication"] as TradeType[]).map((tag) => {
                    const active = newContact.tradeTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTradeTag(tag)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                          active 
                            ? "bg-[#fe7518] text-white font-semibold shadow-sm" 
                            : "bg-[var(--surface-200)] text-[var(--muted)] hover:bg-[var(--surface-100)]"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface-100)] text-[var(--muted)] hover:bg-[var(--surface-200)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-white font-medium shadow-md shadow-[#fe7518]/25"
                >
                  Save to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Delete Safety Confirmation Modal */}
      {isConfirmModalOpen && actionTargetContact && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {confirmAction === "archive" ? (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Archive className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 id="confirm-modal-title" className="text-base font-bold text-[var(--foreground)]">
                    {confirmAction === "archive" ? "Archive Client & Linked Data" : "Permanently Delete Client & All Data"}
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--muted)]">
                    Target ID: {actionTargetContact.id} • {actionTargetContact.name}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsConfirmModalOpen(false)} 
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            {/* Target Client Profile Card */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#131620] border border-slate-200 dark:border-zinc-800 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{actionTargetContact.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                  {actionTargetContact.city}
                </span>
              </div>
              {actionTargetContact.company && (
                <div className="text-slate-600 dark:text-zinc-400 flex items-center gap-1 text-[11px]">
                  <Building2 className="w-3 h-3 text-[#fe7518]" />
                  <span>{actionTargetContact.company}</span>
                </div>
              )}
              <div className="text-slate-500 dark:text-zinc-400 text-[11px]">
                WhatsApp: {actionTargetContact.phone}
              </div>
            </div>

            {/* Impact Assessment Card */}
            {(() => {
              const targetQuotes = quotes.filter((q) => q.contactId === actionTargetContact.id);
              const targetJobs = jobs.filter((j) => j.contactId === actionTargetContact.id);
              const targetInvoices = invoices.filter((inv) => inv.contactId === actionTargetContact.id);
              const targetLogs = actionTargetContact.whatsappLogs || [];

              return (
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold uppercase text-slate-600 dark:text-zinc-400">
                    Associated Records Impact Assessment:
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151924] border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Saved Quotes</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {targetQuotes.length} Quotations
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151924] border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Workshop Jobs</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {targetJobs.length} Jobs
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151924] border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Invoices & Receipts</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {targetInvoices.length} Invoices
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#151924] border border-slate-200 dark:border-zinc-800">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">WhatsApp Logs</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                        {targetLogs.length} Entries
                      </span>
                    </div>
                  </div>

                  {confirmAction === "archive" ? (
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Archive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Non-Destructive Archival (Recommended)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900 dark:text-amber-300">
                        This client and all {targetQuotes.length} quotes, {targetJobs.length} jobs, and {targetInvoices.length} invoices will be moved to the <strong>Archived</strong> tab. Active Kanban and auto-quoter lists stay clean while your tax and financial history remains completely safe. You can restore this client anytime.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Permanent Cascade Deletion Warning</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-900 dark:text-rose-300">
                        This action <strong>cannot be undone</strong>. This will permanently wipe <strong>{actionTargetContact.name}</strong>, along with all {targetQuotes.length} quotes, {targetJobs.length} production jobs, and {targetInvoices.length} invoices from the database.
                      </p>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold btn-haptic"
                    >
                      Cancel
                    </button>

                    {confirmAction === "delete" && (
                      <button
                        type="button"
                        data-testid="btn-archive-instead"
                        onClick={() => setConfirmAction("archive")}
                        className="px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 text-xs font-bold btn-haptic flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive Instead</span>
                      </button>
                    )}

                    {confirmAction === "archive" ? (
                      <button
                        type="button"
                        data-testid="btn-confirm-archive"
                        onClick={handleExecuteArchive}
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md btn-haptic flex items-center gap-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Confirm Archive</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        data-testid="btn-confirm-delete"
                        onClick={handleExecuteDelete}
                        className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md btn-haptic flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Permanently Delete Everything</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
