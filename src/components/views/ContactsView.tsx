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
  ChevronLeft,
  Edit,
  Sparkles,
  Database,
  X,
  MoreVertical
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { Contact, TradeType, WhatsAppLog } from "@/types";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

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
    permissions 
  } = useCrm();

  const [statusTab, setStatusTab] = useState<"active" | "archived">("active");
  const [filterTrade, setFilterTrade] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  
  const [newLogText, setNewLogText] = useState("");
  const [logType, setLogType] = useState<WhatsAppLog["type"]>("general");

  const [editingLog, setEditingLog] = useState<{ contactId: string; log: WhatsAppLog } | null>(null);
  const [editLogText, setEditLogText] = useState("");
  const [editLogType, setEditLogType] = useState<WhatsAppLog["type"]>("general");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"archive" | "delete">("archive");
  const [actionTargetContact, setActionTargetContact] = useState<Contact | null>(null);

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
      return {
        ...prev,
        tradeTags: exists ? prev.tradeTags.filter((t) => t !== tag) : [...prev.tradeTags, tag],
      };
    });
  };

  const toggleEditTradeTag = (tag: TradeType) => {
    setEditContact((prev) => {
      const exists = prev.tradeTags.includes(tag);
      return {
        ...prev,
        tradeTags: exists ? prev.tradeTags.filter((t) => t !== tag) : [...prev.tradeTags, tag],
      };
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
          <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Connecting to Multan database…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden no-print font-sans">
      {/* Left Column: Contact List & Filters */}
      <div className={`w-full lg:w-96 border-r border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#0c0e14] flex flex-col shrink-0 ${
        showMobileDetail ? "hidden lg:flex" : "flex"
      }`}>
        {/* Top Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3 bg-white dark:bg-[#12141c]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#fe7518]" />
                <span>Client Database</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Multan accounts & WhatsApp logs</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm border border-[#e56208] btn-haptic"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Client</span>
            </button>
          </div>

          {/* Demo Data Banner */}
          {isDemoDataPresent && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2 text-xs">
              <span className="text-amber-800 dark:text-amber-300 font-medium">Demo records active</span>
              <button
                onClick={() => setIsPurgeConfirmOpen(true)}
                className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold btn-haptic"
              >
                Clear Demo Data
              </button>
            </div>
          )}          <div className="relative">
            <Search className="w-4 h-4 text-slate-700 dark:text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name, company, city, phone…"
              className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] focus:bg-white dark:focus:bg-zinc-900 outline-none text-xs sm:text-sm font-bold shadow-xs"
            />
          </div>

          {/* Status Filter (Active vs Archived) */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200 dark:bg-[#161822] text-xs font-bold border border-slate-300 dark:border-zinc-700">
            <button
              type="button"
              data-testid="tab-active-contacts"
              onClick={() => setStatusTab("active")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                statusTab === "active"
                  ? "bg-white dark:bg-[#202534] text-slate-950 dark:text-zinc-100 shadow-sm font-black"
                  : "text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200 font-bold"
              }`}
            >
              <Users className="w-4 h-4 text-[#fe7518]" />
              <span>Active ({activeContactsCount})</span>
            </button>
            <button
              type="button"
              data-testid="tab-archived-contacts"
              onClick={() => setStatusTab("archived")}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                statusTab === "archived"
                  ? "bg-white dark:bg-[#202534] text-slate-950 dark:text-zinc-100 shadow-sm font-black"
                  : "text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-zinc-200 font-bold"
              }`}
            >
              <Archive className="w-4 h-4 text-amber-500" />
              <span>Archived ({archivedContactsCount})</span>
            </button>
          </div>

          {/* Trade Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs w-full">
            {["all", "CNC Machining", "3D Printing", "Laser Cutting", "CAD Design"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTrade(t)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-bold transition-colors ${
                  filterTrade === t 
                    ? "bg-[#fe7518] text-slate-950 font-black shadow-xs" 
                    : "text-slate-800 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white bg-slate-200 dark:bg-[#161822] border border-slate-300 dark:border-zinc-700"
                }`}
              >
                {t === "all" ? "All Trades" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center space-y-2 bg-white dark:bg-[#12141c] rounded-2xl border-2 border-slate-200 dark:border-zinc-800">
              <Users className="w-6 h-6 text-slate-400 mx-auto" />
              <h3 className="text-sm font-black text-slate-950 dark:text-zinc-100">No Clients Found</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                Register a client account or adjust search filter.
              </p>
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
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border-2 text-left space-y-1.5 ${
                    isSelected 
                      ? "bg-white dark:bg-[#181c28] border-[#fe7518] shadow-sm ring-2 ring-[#fe7518]/30" 
                      : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-sm text-slate-950 dark:text-zinc-100 truncate">
                      {c.name}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-950 dark:text-zinc-100 shrink-0 font-bold border border-slate-300 dark:border-zinc-600">
                      {c.city}
                    </span>
                  </div>

                  {c.company && (
                    <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#fe7518] shrink-0" />
                      <span>{c.company}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex flex-wrap gap-1">
                      {(c.tradeTags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-emerald-800 dark:text-emerald-300 font-black flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{c.whatsappLogs?.length || 0}</span>
                      </span>
                      {permissions.canDeleteOrArchive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionTargetContact(c);
                            setConfirmAction("delete");
                            setIsConfirmModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Client"
                          aria-label="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: Contact Overview & WhatsApp Log Stream */}
      {activeContact ? (
        <div className={`flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#0f1118] ${showMobileDetail ? "flex" : "hidden md:flex"}`}>
          {/* Contact Header */}
          <div className="p-4 sm:p-6 border-b-2 border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#12141c]">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 font-bold"
              >
                <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                    {activeContact.name}
                  </h1>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                    {activeContact.id}
                  </span>
                  {activeContact.isArchived && (
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300">
                      Archived
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-zinc-300 flex-wrap">
                  {activeContact.company && (
                    <span className="flex items-center gap-1 font-extrabold text-slate-950 dark:text-zinc-100">
                      <Building2 className="w-3.5 h-3.5 text-[#fe7518]" />
                      <span>{activeContact.company}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                    <span>{activeContact.city}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                    <span>{activeContact.phone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {!activeContact.isArchived && onOpenNewQuoteForContact && permissions.canCreateQuotes && (
                <button
                  onClick={() => onOpenNewQuoteForContact(activeContact.id)}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl shadow-sm border border-[#e56208] btn-haptic"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>+ Create Quote</span>
                </button>
              )}

              <a
                href={`https://wa.me/${formatWhatsAppPhone(activeContact.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm btn-haptic"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp ({activeContact.phone})</span>
              </a>

              <button
                onClick={() => handleOpenEditModal(activeContact)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold border-2 border-slate-300 dark:border-zinc-700 btn-haptic"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {permissions.canDeleteOrArchive && (
                <>
                  {!activeContact.isArchived ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("archive");
                          setIsConfirmModalOpen(true);
                        }}
                        title="Archive Client"
                        aria-label="Archive Client"
                        className="p-2 rounded-xl text-slate-700 hover:text-amber-700 dark:text-zinc-300 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors btn-haptic border-2 border-slate-300 dark:border-zinc-700"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("delete");
                          setIsConfirmModalOpen(true);
                        }}
                        title="Delete Client"
                        aria-label="Delete Client"
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors btn-haptic border-2 border-rose-300 dark:border-rose-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => unarchiveContact(activeContact.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm btn-haptic"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Client</span>
                      </button>
                      <button
                        onClick={() => {
                          setActionTargetContact(activeContact);
                          setConfirmAction("delete");
                          setIsConfirmModalOpen(true);
                        }}
                        title="Delete Client Permanently"
                        aria-label="Delete Client Permanently"
                        className="p-2 rounded-xl text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors btn-haptic border-2 border-rose-300 dark:border-rose-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Metric Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 border-b-2 border-slate-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-[#0c0e14]">
            <div className="bg-white dark:bg-[#12141c] p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1">Total Invoiced</span>
              <CurrencyDisplay amount={totalSpentPKR} size="md" />
            </div>

            <div className="bg-white dark:bg-[#12141c] p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1">Outstanding Balance</span>
              <CurrencyDisplay amount={pendingDuePKR} size="md" color={pendingDuePKR > 0 ? "amber" : "green"} />
            </div>

            <div className="bg-white dark:bg-[#12141c] p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1">Production Jobs</span>
              <div className="text-base sm:text-lg font-black text-slate-950 dark:text-zinc-100">
                {contactJobs.length} Jobs
              </div>
            </div>

            <div className="bg-white dark:bg-[#12141c] p-4 rounded-xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1">Trade Domains</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {(activeContact.tradeTags || []).map((t) => (
                  <span key={t} className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Conversation Timeline & Entry Form */}
          <div className="p-4 sm:p-6 flex-1 space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-zinc-100 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Conversation Notes</span>
              </h2>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">
                Record client inquiries, quotations sent, advance confirmations, and delivery updates.
              </p>
            </div>

            {/* Note Composer */}
            <form onSubmit={handleAddLog} className="bg-white dark:bg-[#12141c] p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-200">Category:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(["general", "inquiry", "quote", "payment", "delivery"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLogType(t)}
                      className={`text-xs font-bold capitalize px-3 py-1.5 rounded-lg transition-colors ${
                        logType === t 
                          ? "bg-[#fe7518] text-slate-950 font-black shadow-xs" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700"
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
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Type or paste client WhatsApp message summary…"
                className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 p-3.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] focus:bg-white dark:focus:bg-zinc-900 outline-none resize-none leading-relaxed text-xs sm:text-sm font-semibold"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-700 dark:text-zinc-300 font-bold">
                  Saves directly into database
                </span>
                <button
                  type="submit"
                  disabled={!newLogText.trim()}
                  className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] disabled:opacity-40 text-slate-950 text-xs font-black py-2.5 px-4 rounded-xl btn-haptic shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Log Note</span>
                </button>
              </div>
            </form>

            {/* Conversation Log Feed */}
            <div className="space-y-3">
              {(activeContact.whatsappLogs || []).length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                  <MessageSquare className="w-6 h-6 text-slate-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Notes Logged Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Use the composer above to log client conversation details.
                  </p>
                </div>
              ) : (
                (activeContact.whatsappLogs || []).map((log) => {
                  const badgeStyles: Record<string, string> = {
                    inquiry: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                    quote: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                    payment: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                    delivery: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                    general: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
                  };

                  return (
                    <div 
                      key={log.id} 
                      className="p-4 rounded-2xl bg-white dark:bg-[#12141c] border border-slate-200 dark:border-zinc-800 space-y-2 hover:border-[#fe7518]/50 transition-colors shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {log.author}
                          </span>
                          <span className={`text-[11px] capitalize font-semibold px-2 py-0.5 rounded-md border ${badgeStyles[log.type]}`}>
                            {log.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {log.date}
                            {log.updatedAt && <span className="ml-1 text-slate-400">(edited)</span>}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditLog(activeContact.id, log)}
                            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Edit Note"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteLog(activeContact.id, log.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141c] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#fe7518]" />
                <span>Edit Conversation Note</span>
              </h3>
              <button 
                onClick={() => setEditingLog(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
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
                      className={`text-xs font-semibold capitalize px-3 py-1.5 rounded-lg transition-colors ${
                        editLogType === t 
                          ? "bg-[#fe7518] text-slate-950 font-bold shadow-xs" 
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-bold mb-1.5">Message Note</label>
                <textarea
                  rows={4}
                  required
                  value={editLogText}
                  onChange={(e) => setEditLogText(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-bold shadow-xs btn-haptic"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#fe7518]" />
                <span>Register Client</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Tariq Mahmood"
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Company / Workshop</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="e.g. AeroDynamics Multan"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">City</label>
                  <input
                    type="text"
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    placeholder="Multan"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Primary Trade Tags</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(["3D Printing", "Laser Cutting", "CNC Machining", "CAD Design", "Industrial Fabrication", "Custom Domain"] as TradeType[]).map((tag) => {
                    const active = newContact.tradeTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleNewTradeTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          active 
                            ? "bg-[#fe7518] text-slate-950 font-black shadow-sm" 
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t-2 border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md border-2 border-[#e56208] btn-haptic"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#fe7518]" />
                <span>Edit Client Profile</span>
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editContact.name}
                  onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Company / Workshop</label>
                  <input
                    type="text"
                    value={editContact.company}
                    onChange={(e) => setEditContact({ ...editContact, company: e.target.value })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">City</label>
                  <input
                    type="text"
                    value={editContact.city}
                    onChange={(e) => setEditContact({ ...editContact, city: e.target.value })}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    value={editContact.phone}
                    onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editContact.email}
                    onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Primary Trade Tags</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(["3D Printing", "Laser Cutting", "CNC Machining", "CAD Design", "Industrial Fabrication", "Custom Domain"] as TradeType[]).map((tag) => {
                    const active = editContact.tradeTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleEditTradeTag(tag)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          active 
                            ? "bg-[#fe7518] text-slate-950 font-bold shadow-xs" 
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                {permissions.canDeleteOrArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = activeContact;
                      setIsEditModalOpen(false);
                      if (c) {
                        setActionTargetContact(c);
                        setConfirmAction("delete");
                        setIsConfirmModalOpen(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 font-bold text-xs btn-haptic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Client</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-bold shadow-xs btn-haptic"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Delete Confirmation Modal */}
      {isConfirmModalOpen && actionTargetContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141c] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
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
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {actionTargetContact.name} ({actionTargetContact.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
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
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction === "delete" ? handleExecuteDelete : handleExecuteArchive}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs btn-haptic ${
                  confirmAction === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700 text-slate-950"
                }`}
              >
                {confirmAction === "delete" ? "Delete Permanently" : "Confirm Archive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purge Demo Modal */}
      {isPurgeConfirmOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#12141c] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Clear Demo Data</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Purge initial placeholder records</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              This will remove demo client records (<code className="text-[#fe7518]">cnt-001</code> to <code className="text-[#fe7518]">cnt-004</code>) and their associated mock jobs, while keeping your real client data intact.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsPurgeConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurging}
                onClick={handleExecutePurgeDemo}
                className="px-4 py-2 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold shadow-xs btn-haptic"
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
