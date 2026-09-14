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
  ChevronLeft,
  Edit,
  Sparkles,
  Database,
  X,
  Check
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Contact, TradeType, WhatsAppLog } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

/**
 * Normalizes phone numbers for WhatsApp API (wa.me/...)
 * Handles Pakistani mobile patterns (03xx -> 923xx, +92 3xx -> 923xx).
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  let digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    digits = "92" + digits.slice(1);
  } else if (digits.length === 10 && digits.startsWith("3")) {
    digits = "92" + digits;
  }
  return digits;
}

interface ContactsViewProps {
  onOpenNewQuoteForContact?: (contactId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onOpenNewQuoteForContact }) => {
  const { 
    contacts, 
    addContact, 
    updateContact,
    deleteContact,
    archiveContact,
    unarchiveContact,
    addWhatsAppLog, 
    updateWhatsAppLog,
    deleteWhatsAppLog,
    purgeDemoData,
    isDemoDataPresent,
    dataLoaded,
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
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  // New Log State
  const [newLogText, setNewLogText] = useState("");
  const [logType, setLogType] = useState<WhatsAppLog["type"]>("general");

  // Edit Log State & Modal
  const [editingLog, setEditingLog] = useState<{ contactId: string; log: WhatsAppLog } | null>(null);
  const [editLogText, setEditLogText] = useState("");
  const [editLogType, setEditLogType] = useState<WhatsAppLog["type"]>("general");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

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

  // Edit contact form state
  const [editContact, setEditContact] = useState<{
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    tradeTags: TradeType[];
    notes: string;
  }>({
    id: "",
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "Multan",
    address: "",
    tradeTags: ["CNC Machining"],
    notes: "",
  });

  const activeContactsCount = contacts.filter((c) => !c.isArchived).length;
  const archivedContactsCount = contacts.filter((c) => !!c.isArchived).length;

  // Filter contacts with strict null guards
  const filteredContacts = contacts.filter((c) => {
    const matchesStatus = statusTab === "active" ? !c.isArchived : !!c.isArchived;
    const matchesTrade = filterTrade === "all" || (c.tradeTags || []).includes(filterTrade as TradeType);
    const searchLower = (localSearch || "").toLowerCase();
    const matchesSearch = 
      (c.name || "").toLowerCase().includes(searchLower) ||
      (c.company || "").toLowerCase().includes(searchLower) ||
      (c.phone || "").includes(localSearch) ||
      (c.city || "").toLowerCase().includes(searchLower) ||
      (c.email || "").toLowerCase().includes(searchLower);
    return matchesStatus && matchesTrade && matchesSearch;
  });

  const activeContact = filteredContacts.find((c) => c.id === selectedContactId) || filteredContacts[0] || null;

  // Compute metrics for selected contact
  const contactQuotes = quotes.filter((q) => q.contactId === activeContact?.id);
  const contactJobs = jobs.filter((j) => j.contactId === activeContact?.id);
  const contactInvoices = invoices.filter((i) => i.contactId === activeContact?.id);
  const totalSpentPKR = contactInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const pendingDuePKR = contactJobs
    .filter((j) => j.stage !== "delivered")
    .reduce((sum, j) => sum + (j.balanceDue || 0), 0);

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

    setSelectedContactId(created.id);
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

  const handleOpenEditModal = (contact: Contact) => {
    setEditContact({
      id: contact.id,
      name: contact.name,
      company: contact.company || "",
      phone: contact.phone || "",
      email: contact.email || "",
      city: contact.city || "Multan",
      address: contact.address || "",
      tradeTags: contact.tradeTags || ["CNC Machining"],
      notes: contact.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact || !editContact.name.trim() || !editContact.phone.trim()) return;

    const updated: Contact = {
      ...activeContact,
      name: editContact.name.trim(),
      company: editContact.company.trim(),
      phone: editContact.phone.trim(),
      email: editContact.email.trim(),
      city: editContact.city.trim() || "Multan",
      address: editContact.address.trim(),
      tradeTags: editContact.tradeTags,
      notes: editContact.notes.trim(),
    };

    updateContact(updated);
    setIsEditModalOpen(false);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact || !newLogText.trim()) return;

    addWhatsAppLog(activeContact.id, newLogText.trim(), logType);
    setNewLogText("");
  };

  const handleOpenEditLog = (contactId: string, log: WhatsAppLog) => {
    setEditingLog({ contactId, log });
    setEditLogText(log.text);
    setEditLogType(log.type);
  };

  const handleSaveEditLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog || !editLogText.trim()) return;

    updateWhatsAppLog(editingLog.contactId, editingLog.log.id, editLogText.trim(), editLogType);
    setEditingLog(null);
  };

  const handleDeleteLog = (contactId: string, logId: string) => {
    if (confirm("Are you sure you want to delete this log note?")) {
      deleteWhatsAppLog(contactId, logId);
    }
  };

  const toggleNewTradeTag = (tag: TradeType) => {
    setNewContact((prev) => {
      const exists = prev.tradeTags.includes(tag);
      if (exists) {
        return { ...prev, tradeTags: prev.tradeTags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tradeTags: [...prev.tradeTags, tag] };
      }
    });
  };

  const toggleEditTradeTag = (tag: TradeType) => {
    setEditContact((prev) => {
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

  const handleExecutePurgeDemo = async () => {
    setIsPurging(true);
    try {
      await purgeDemoData();
      setIsPurgeConfirmOpen(false);
    } finally {
      setIsPurging(false);
    }
  };

  if (!dataLoaded) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#fe7518] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-600 dark:text-zinc-400">Connecting to Multan database…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden no-print">
      {/* Left Column: Contact List & Filters */}
      <div className={`w-full lg:w-96 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-[#0e1017] flex flex-col shrink-0 ${
        showMobileDetail ? "hidden lg:flex" : "flex"
      }`}>
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fe7518]" />
                <span>Multan Client Database</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400">Manage client profiles & WhatsApp logs</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2 px-3 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client</span>
            </button>
          </div>

          {/* Demo Data Banner */}
          {isDemoDataPresent && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-amber-800 dark:text-amber-300 text-xs font-medium">Demo records active</span>
              <button
                onClick={() => setIsPurgeConfirmOpen(true)}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold btn-haptic"
              >
                Clear Demo Data
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name, company, city, phone…"
              className="w-full bg-white dark:bg-[#141722] text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-9 pr-3 py-2 min-h-[40px] rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-sans text-xs touch-manipulation"
            />
          </div>

          {/* Status Filter (Active vs Archived) */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-200/80 dark:bg-[#131620] border border-slate-300 dark:border-zinc-800 text-xs font-mono">
            <button
              type="button"
              data-testid="tab-active-contacts"
              onClick={() => setStatusTab("active")}
              className={`py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 font-bold transition-all btn-haptic ${
                statusTab === "active"
                  ? "bg-white dark:bg-[#1f2433] text-slate-900 dark:text-zinc-100 shadow-sm border border-slate-300 dark:border-zinc-700"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
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
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-500" />
              <span>Archived ({archivedContactsCount})</span>
            </button>
          </div>

          {/* Trade Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs w-full">
            {["all", "CNC Machining", "3D Printing", "Laser Cutting", "CAD Design"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTrade(t)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap shrink-0 font-medium transition-colors ${
                  filterTrade === t 
                    ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm" 
                    : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-[#171a24]"
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
          className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-zinc-800 p-2 space-y-2 focus:outline-none focus:ring-1 focus:ring-[#fe7518]"
        >
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-left space-y-3 bg-white dark:bg-[#12141a] rounded-xl border border-slate-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">No Clients Found</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Register a client account with Multan workshop WhatsApp contact details.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black btn-haptic"
              >
                <Plus className="w-3.5 h-3.5" />
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
                    setSelectedContactId(c.id);
                    setShowMobileDetail(true);
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left min-h-[50px] touch-manipulation space-y-2 ${
                    isSelected 
                      ? "bg-white dark:bg-[#1a1e2c] border-2 border-[#fe7518] shadow-sm font-semibold ring-1 ring-[#fe7518]/30" 
                      : "bg-white dark:bg-[#12151e] border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-[#161a26]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
                      {c.name}
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0 font-medium">
                      {c.city}
                    </span>
                  </div>

                  {c.company && (
                    <div className="text-xs text-slate-600 dark:text-zinc-400 truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#fe7518] shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{c.company}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex flex-wrap gap-1">
                      {(c.tradeTags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/40 shrink-0">
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
          className={`flex-1 bg-white dark:bg-[#090a0f] flex flex-col overflow-y-auto focus:outline-none focus:ring-1 focus:ring-[#fe7518] ${
            !showMobileDetail ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Contact Header Card */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#12151e] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
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
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-zinc-100">{activeContact.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700">
                  {activeContact.id}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-300 flex-wrap font-medium">
                {activeContact.company && (
                  <span className="flex items-center gap-1 text-slate-900 dark:text-zinc-100 font-bold">
                    <Building2 className="w-3.5 h-3.5 text-[#fe7518]" />
                    {activeContact.company}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  {activeContact.city}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  {activeContact.phone}
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Call & Primary Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/${formatWhatsAppPhone(activeContact.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#075E54] dark:text-[#25D366] font-bold border border-[#25D366]/50 text-xs py-2 px-3.5 rounded-lg transition-all btn-haptic"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Edit Client Profile Button */}
              <button
                onClick={() => handleOpenEditModal(activeContact)}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 text-xs font-bold py-2 px-3.5 rounded-lg btn-haptic"
                title="Edit Client Information"
              >
                <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                <span>Edit Client</span>
              </button>

              {!activeContact.isArchived && onOpenNewQuoteForContact && permissions.canCreateQuotes && (
                <button
                  onClick={() => onOpenNewQuoteForContact(activeContact.id)}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2 px-3.5 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
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
                        title="Restore client and all associated quotes, jobs, and invoices"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Client</span>
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

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0c0d12]">
            <div className="bg-white dark:bg-[#12151e] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">Lifetime Invoiced</span>
              <div className="mt-1.5">
                <CurrencyDisplay amount={totalSpentPKR} size="md" />
              </div>
            </div>
            <div className="bg-white dark:bg-[#12151e] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">Current Balance Due</span>
              <div className="mt-1.5">
                <CurrencyDisplay amount={pendingDuePKR} size="md" color={pendingDuePKR > 0 ? "amber" : "green"} />
              </div>
            </div>
            <div className="bg-white dark:bg-[#12151e] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">Associated Jobs</span>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-zinc-100 mt-1.5">
                {contactJobs.length} Jobs
              </div>
            </div>
            <div className="bg-white dark:bg-[#12151e] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-mono uppercase font-bold text-slate-600 dark:text-zinc-400">Trade Tags</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(activeContact.tradeTags || []).map((t) => (
                  <span key={t} className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Conversation Timeline & Entry Form */}
          <div className="p-4 sm:p-6 flex-1 space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <span>WhatsApp Conversation Summary Log</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Team notes of client specifications, quotes sent, advance deposit confirmations, and delivery updates. You can add, edit, or delete notes at any time.
              </p>
            </div>

            {/* Add New Note Box */}
            <form onSubmit={handleAddLog} className="bg-white dark:bg-[#12151e] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Category:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["general", "inquiry", "quote", "payment", "delivery"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLogType(t)}
                      className={`text-xs uppercase font-bold px-3 py-1 min-h-[30px] rounded-lg transition-colors ${
                        logType === t 
                          ? "bg-[#fe7518] text-slate-950 shadow-sm" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
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
                className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 p-3.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none resize-none leading-relaxed text-xs"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                  Saves directly into database
                </span>
                <button
                  type="submit"
                  disabled={!newLogText.trim()}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] disabled:cursor-not-allowed disabled:opacity-50 text-slate-950 text-xs font-black py-2 px-4 rounded-lg btn-haptic shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </div>
            </form>

            {/* Conversation Log Feed with Full Edit & Delete Options */}
            <div className="space-y-3">
              {(activeContact.whatsappLogs || []).length === 0 ? (
                <div className="p-6 text-left bg-white dark:bg-[#12151e] rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Conversation Logs Yet</h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Use the field above to record key details from WhatsApp client chats, quotation revisions, or payment agreements.
                  </p>
                </div>
              ) : (
                (activeContact.whatsappLogs || []).map((log) => {
                  const badgeStyles: Record<string, string> = {
                    inquiry: "bg-blue-100 dark:bg-[#0c1929] text-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700/60 font-bold",
                    quote: "bg-amber-100 dark:bg-[#251909] text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 font-bold",
                    payment: "bg-emerald-100 dark:bg-[#0c1f15] text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-bold",
                    delivery: "bg-purple-100 dark:bg-[#1f102a] text-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-700/60 font-bold",
                    general: "bg-slate-100 dark:bg-[#191c26] text-slate-900 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 font-bold",
                  };

                  return (
                    <div 
                      key={log.id} 
                      className="p-4 rounded-xl bg-white dark:bg-[#12151e] border border-slate-200 dark:border-zinc-800 space-y-2.5 hover:border-[#fe7518]/60 transition-colors shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#fe7518]"></span>
                            {log.author}
                          </span>
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${badgeStyles[log.type]}`}>
                            {log.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                            {log.date}
                            {log.updatedAt && <span className="ml-1 text-slate-500">(edited)</span>}
                          </span>

                          {/* Edit Log Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditLog(activeContact.id, log)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit this log note"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                          </button>

                          {/* Delete Log Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(activeContact.id, log.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete this log note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap font-sans">
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

      {/* Edit WhatsApp Log Modal */}
      {editingLog && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12151e] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#fe7518]" />
                <span>Edit Conversation Note</span>
              </h3>
              <button 
                onClick={() => setEditingLog(null)}
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLog} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1.5">Note Category</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["general", "inquiry", "quote", "payment", "delivery"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditLogType(t)}
                      className={`text-xs uppercase font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        editLogType === t 
                          ? "bg-[#fe7518] text-slate-950 shadow-sm" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1.5">Message / Summary Note</label>
                <textarea
                  rows={4}
                  required
                  value={editLogText}
                  onChange={(e) => setEditLogText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-3 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none resize-none leading-relaxed text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md btn-haptic"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {isAddModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-contact-title"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12151e] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 id="add-contact-title" className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
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
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Tariq Mahmood"
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Company / Workshop</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="e.g. AeroDynamics Multan"
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    placeholder="Multan"
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="e.g. 0300 1234567"
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Workshop Address</label>
                <input
                  type="text"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  placeholder="Plot 12, Industrial Estate, Multan"
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Primary Trade Tags</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(["3D Printing", "Laser Cutting", "CNC Machining", "CAD Design", "Industrial Fabrication"] as TradeType[]).map((tag) => {
                    const active = newContact.tradeTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleNewTradeTag(tag)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          active 
                            ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm" 
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  placeholder="Client preferences, payment terms, or machine tolerances…"
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md btn-haptic"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Profile Modal */}
      {isEditModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-contact-title"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12151e] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 id="edit-contact-title" className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#fe7518]" />
                <span>Edit Client Profile ({editContact.id})</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close dialog"
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editContact.name}
                  onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Company / Workshop</label>
                  <input
                    type="text"
                    value={editContact.company}
                    onChange={(e) => setEditContact({ ...editContact, company: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={editContact.city}
                    onChange={(e) => setEditContact({ ...editContact, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={editContact.phone}
                    onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editContact.email}
                    onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Workshop Address</label>
                <input
                  type="text"
                  value={editContact.address}
                  onChange={(e) => setEditContact({ ...editContact, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Primary Trade Tags</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(["3D Printing", "Laser Cutting", "CNC Machining", "CAD Design", "Industrial Fabrication"] as TradeType[]).map((tag) => {
                    const active = editContact.tradeTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleEditTradeTag(tag)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          active 
                            ? "bg-[#fe7518] text-slate-950 font-bold shadow-sm" 
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  value={editContact.notes}
                  onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md btn-haptic"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Delete Confirmation Modal */}
      {isConfirmModalOpen && actionTargetContact && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12151e] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmAction === "delete" ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600" : "bg-amber-100 dark:bg-amber-950/60 text-amber-600"
              }`}>
                {confirmAction === "delete" ? <Trash2 className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {confirmAction === "delete" ? "Permanently Delete Client" : "Archive Client Profile"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {actionTargetContact.name} ({actionTargetContact.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              {confirmAction === "delete" 
                ? "This will permanently remove this client and ALL linked quotations, jobs, and invoices from the database. This action cannot be undone."
                : "This will archive this client profile and hide their linked quotes and jobs from active views. You can restore them anytime."}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setActionTargetContact(null);
                }}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction === "delete" ? handleExecuteDelete : handleExecuteArchive}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow-md btn-haptic ${
                  confirmAction === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700 text-slate-950"
                }`}
              >
                {confirmAction === "delete" ? "Delete Permanently" : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Demo Data Modal */}
      {isPurgeConfirmOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-[#12151e] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Clear Demo Data</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">Purge initial placeholder records</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              This will remove demo client records (<code className="text-[#fe7518]">cnt-001</code> to <code className="text-[#fe7518]">cnt-004</code>) and their associated mock jobs, while keeping your real client data intact.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleExecutePurgeDemo}
                className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-md btn-haptic"
              >
                {isPurging ? "Purging…" : "Confirm Clear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
