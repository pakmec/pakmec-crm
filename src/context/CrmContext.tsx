"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Contact, 
  Quote, 
  Job, 
  Invoice, 
  TradeRatesSettings, 
  JobStage, 
  WhatsAppLog, 
  ReferenceItem,
  PaymentRecord,
  UserAccount,
  UserRole,
  RolePermissions
} from "@/types";
import { 
  initialContacts, 
  initialQuotes, 
  initialJobs, 
  initialInvoices, 
  initialSettings 
} from "@/lib/mockData";
import { getRolePermissions, getUserByRole } from "@/lib/auth";

interface CrmContextType {
  // Data
  contacts: Contact[];
  quotes: Quote[];
  jobs: Job[];
  invoices: Invoice[];
  settings: TradeRatesSettings;
  searchQuery: string;
  theme: "dark" | "light";
  dataLoaded: boolean;
  isDemoDataPresent: boolean;

  // Auth & Role-Based Access Control (RBAC)
  currentUser: UserAccount | null;
  currentRole: UserRole;
  permissions: RolePermissions;
  isAuthenticated: boolean;
  authHydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Actions
  setSearchQuery: (query: string) => void;
  toggleTheme: () => void;
  
  // Contacts
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "whatsappLogs">) => Contact;
  updateContact: (contact: Contact) => void;
  deleteContact: (id: string, cascadeRelatedData?: boolean) => void;
  archiveContact: (id: string, archiveRelatedData?: boolean) => void;
  unarchiveContact: (id: string) => void;
  addWhatsAppLog: (contactId: string, text: string, type?: WhatsAppLog["type"]) => void;
  updateWhatsAppLog: (contactId: string, logId: string, text: string, type: WhatsAppLog["type"]) => void;
  deleteWhatsAppLog: (contactId: string, logId: string) => void;

  // Quotes
  createQuote: (quote: Omit<Quote, "id">) => Quote;
  createQuoteWithNewContact: (
    quoteData: Omit<Quote, "id" | "contactId" | "contactName" | "contactPhone" | "contactCompany">,
    newContactData: { name: string; phone: string; company?: string; city?: string }
  ) => { quote: Quote; contact: Contact };
  updateQuote: (quote: Quote) => void;
  deleteQuote: (id: string) => void;
  convertQuoteToJob: (quoteId: string, deadline: string, advanceReceived: boolean) => Job;

  // Jobs
  createJob: (job: Omit<Job, "id">) => Job;
  updateJob: (job: Job) => void;
  updateJobStage: (jobId: string, newStage: JobStage) => void;
  deleteJob: (id: string) => void;
  addReferenceItem: (jobId: string, item: Omit<ReferenceItem, "id" | "uploadedAt" | "uploadedBy">) => void;
  deleteReferenceItem: (jobId: string, itemId: string) => void;
  recordJobAdvance: (jobId: string, amount: number, method: PaymentRecord["method"], refNo: string) => void;
  recordJobSettlement: (jobId: string, amount: number, method: PaymentRecord["method"], refNo: string, notes?: string) => void;

  // Invoices
  createInvoice: (invoice: Omit<Invoice, "id">) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordInvoicePayment: (invoiceId: string, payment: Omit<PaymentRecord, "id" | "date" | "receivedBy">) => void;

  // Settings & DB
  updateSettings: (newSettings: TradeRatesSettings) => void;
  resetToDefaults: () => Promise<void>;
  purgeDemoData: () => Promise<void>;

  // Utilities
  formatCurrency: (amount: number) => string;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

// Helper to sync to Database (Supabase or SQLite)
async function syncToDb(table: "contacts" | "quotes" | "jobs" | "invoices" | "settings", id: string, data: any, action: "upsert" | "delete" = "upsert") {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, data, action })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`DB sync failed for ${table}/${id}:`, err);
    }
  } catch (err) {
    console.warn("DB sync warning:", err);
  }
}

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<TradeRatesSettings>(initialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [dataLoaded, setDataLoaded] = useState(false);

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  const currentRole: UserRole = currentUser?.role || "admin";
  const permissions = getRolePermissions(currentRole);
  const isAuthenticated = Boolean(currentUser);

  // Check if any demo IDs exist
  const DEMO_IDS = ["cnt-001", "cnt-002", "cnt-003", "cnt-004"];
  const isDemoDataPresent = contacts.some(c => DEMO_IDS.includes(c.id));

  // Initialize auth, theme and load from DB
  useEffect(() => {
    try {
      // Restore user session if saved
      const savedUserStr = localStorage.getItem("pakmec_crm_user");
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          setCurrentUser(parsed);
        } catch (e) {
          console.warn("Failed to parse saved user session:", e);
        }
      }
      setAuthHydrated(true);

      const savedTheme = localStorage.getItem("pakmec_crm_theme") as "dark" | "light" | null;
      const initialTheme = savedTheme || "dark";
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
      document.documentElement.setAttribute("data-theme", initialTheme);

      // Fetch from API (Supabase or SQLite)
      fetch("/api/data")
        .then(res => res.json())
        .then(dbData => {
          if (dbData && !dbData.error) {
            if (Array.isArray(dbData.contacts)) setContacts(dbData.contacts);
            if (Array.isArray(dbData.quotes)) setQuotes(dbData.quotes);
            if (Array.isArray(dbData.jobs)) setJobs(dbData.jobs);
            if (Array.isArray(dbData.invoices)) setInvoices(dbData.invoices);
            if (dbData.settings) setSettings(dbData.settings);
          } else {
            console.warn("API returned error or empty data:", dbData);
          }
        })
        .catch(err => {
          console.warn("Could not fetch from DB, using fallback defaults:", err);
          setContacts(initialContacts);
          setQuotes(initialQuotes);
          setJobs(initialJobs);
          setInvoices(initialInvoices);
        })
        .finally(() => {
          setDataLoaded(true);
        });
    } catch (e) {
      console.warn("Init error:", e);
      setDataLoaded(true);
      setAuthHydrated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("pakmec_crm_user", JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || "Invalid email or password" };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to connect to authentication server" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("pakmec_crm_user");
  };

  const switchRole = (role: UserRole) => {
    const user = getUserByRole(role);
    setCurrentUser(user);
    localStorage.setItem("pakmec_crm_user", JSON.stringify(user));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("pakmec_crm_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Format currency: Clean engineering PKR standard (non-breaking space & typographic minus prevents line-wrapping)
  const formatCurrency = (amount: number): string => {
    const formattedNum = Math.abs(amount).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? "\u2212" : "";
    return `${sign}PKR\u00A0${formattedNum}`;
  };

  // Contacts Actions
  const addContact = (contactData: Omit<Contact, "id" | "createdAt" | "whatsappLogs">): Contact => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now()}-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}-${randomSuffix}`,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          }),
          author: currentUser?.name || "PAKMEC",
          text: `Client registered in Multan database. Initial trade tags: ${contactData.tradeTags.join(", ")}`,
          type: "general"
        }
      ]
    };
    setContacts(prev => [newContact, ...prev]);
    syncToDb("contacts", newContact.id, newContact, "upsert");
    return newContact;
  };

  const updateContact = (updated: Contact) => {
    setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
    syncToDb("contacts", updated.id, updated, "upsert");
  };

  const archiveContact = (id: string, archiveRelatedData: boolean = true) => {
    const timestamp = new Date().toISOString();
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const updated: Contact = {
          ...c,
          isArchived: true,
          archivedAt: timestamp,
        };
        syncToDb("contacts", updated.id, updated, "upsert");
        return updated;
      }
      return c;
    }));

    if (archiveRelatedData) {
      setQuotes(prev => prev.map(q => {
        if (q.contactId === id) {
          const updated: Quote = { ...q, isArchived: true, archivedAt: timestamp };
          syncToDb("quotes", updated.id, updated, "upsert");
          return updated;
        }
        return q;
      }));

      setJobs(prev => prev.map(j => {
        if (j.contactId === id) {
          const updated: Job = { ...j, isArchived: true, archivedAt: timestamp };
          syncToDb("jobs", updated.id, updated, "upsert");
          return updated;
        }
        return j;
      }));

      setInvoices(prev => prev.map(inv => {
        if (inv.contactId === id) {
          const updated: Invoice = { ...inv, isArchived: true, archivedAt: timestamp };
          syncToDb("invoices", updated.id, updated, "upsert");
          return updated;
        }
        return inv;
      }));
    }
  };

  const unarchiveContact = (id: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const updated: Contact = {
          ...c,
          isArchived: false,
          archivedAt: undefined,
        };
        syncToDb("contacts", updated.id, updated, "upsert");
        return updated;
      }
      return c;
    }));

    setQuotes(prev => prev.map(q => {
      if (q.contactId === id) {
        const updated: Quote = { ...q, isArchived: false, archivedAt: undefined };
        syncToDb("quotes", updated.id, updated, "upsert");
        return updated;
      }
      return q;
    }));

    setJobs(prev => prev.map(j => {
      if (j.contactId === id) {
        const updated: Job = { ...j, isArchived: false, archivedAt: undefined };
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));

    setInvoices(prev => prev.map(inv => {
      if (inv.contactId === id) {
        const updated: Invoice = { ...inv, isArchived: false, archivedAt: undefined };
        syncToDb("invoices", updated.id, updated, "upsert");
        return updated;
      }
      return inv;
    }));
  };

  const deleteContact = (id: string, cascadeRelatedData: boolean = true) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    syncToDb("contacts", id, null, "delete");

    if (cascadeRelatedData) {
      quotes.filter(q => q.contactId === id).forEach(q => {
        syncToDb("quotes", q.id, null, "delete");
      });
      setQuotes(prev => prev.filter(q => q.contactId !== id));

      jobs.filter(j => j.contactId === id).forEach(j => {
        syncToDb("jobs", j.id, null, "delete");
      });
      setJobs(prev => prev.filter(j => j.contactId !== id));

      invoices.filter(inv => inv.contactId === id).forEach(inv => {
        syncToDb("invoices", inv.id, null, "delete");
      });
      setInvoices(prev => prev.filter(inv => inv.contactId !== id));
    }
  };

  const addWhatsAppLog = (contactId: string, text: string, type: WhatsAppLog["type"] = "general") => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newLog: WhatsAppLog = {
      id: `wlog-${Date.now()}-${randomSuffix}`,
      date: new Date().toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric", 
        hour: "numeric", 
        minute: "numeric", 
        hour12: true 
      }),
      author: currentUser?.name || "PAKMEC",
      text: text.trim(),
      type
    };

    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        const updated = {
          ...c,
          whatsappLogs: [newLog, ...(c.whatsappLogs || [])]
        };
        syncToDb("contacts", updated.id, updated, "upsert");
        return updated;
      }
      return c;
    }));
  };

  const updateWhatsAppLog = (contactId: string, logId: string, text: string, type: WhatsAppLog["type"] = "general") => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        const updatedLogs = (c.whatsappLogs || []).map(l => {
          if (l.id === logId) {
            return {
              ...l,
              text: text.trim(),
              type,
              updatedAt: new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true
              })
            };
          }
          return l;
        });
        const updated = { ...c, whatsappLogs: updatedLogs };
        syncToDb("contacts", updated.id, updated, "upsert");
        return updated;
      }
      return c;
    }));
  };

  const deleteWhatsAppLog = (contactId: string, logId: string) => {
    setContacts(prev => prev.map(c => {
      if (c.id === contactId) {
        const updatedLogs = (c.whatsappLogs || []).filter(l => l.id !== logId);
        const updated = { ...c, whatsappLogs: updatedLogs };
        syncToDb("contacts", updated.id, updated, "upsert");
        return updated;
      }
      return c;
    }));
  };

  // Quotes Actions
  const createQuote = (quoteData: Omit<Quote, "id">): Quote => {
    const count = quotes.length + 1;
    const newQuote: Quote = {
      ...quoteData,
      currency: "PKR",
      id: `QT-2026-${count.toString().padStart(3, "0")}`
    };
    setQuotes(prev => [newQuote, ...prev]);
    syncToDb("quotes", newQuote.id, newQuote, "upsert");

    addWhatsAppLog(
      newQuote.contactId,
      `Generated Quote ${newQuote.id}: "${newQuote.title}" for ${formatCurrency(newQuote.total)} (${newQuote.advancePercent}% advance = ${formatCurrency(newQuote.advanceRequired)}).`,
      "quote"
    );

    return newQuote;
  };

  const createQuoteWithNewContact = (
    quoteData: Omit<Quote, "id" | "contactId" | "contactName" | "contactPhone" | "contactCompany">,
    newContactData: { name: string; phone: string; company?: string; city?: string }
  ): { quote: Quote; contact: Contact } => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newContact: Contact = {
      name: newContactData.name.trim(),
      company: (newContactData.company || "").trim(),
      phone: newContactData.phone.trim(),
      email: "",
      city: (newContactData.city || "Multan").trim(),
      tradeTags: [quoteData.trade],
      notes: "Client registered during quote creation.",
      id: `cnt-${Date.now()}-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}-${randomSuffix}`,
          date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
          }),
          author: currentUser?.name || "PAKMEC",
          text: `Client registered in Multan database during quote creation. Initial trade: ${quoteData.trade}`,
          type: "general"
        }
      ]
    };

    setContacts(prev => [newContact, ...prev]);
    syncToDb("contacts", newContact.id, newContact, "upsert");

    const count = quotes.length + 1;
    const newQuote: Quote = {
      ...quoteData,
      contactId: newContact.id,
      contactName: newContact.name,
      contactPhone: newContact.phone,
      contactCompany: newContact.company,
      currency: "PKR",
      id: `QT-2026-${count.toString().padStart(3, "0")}`
    };

    setQuotes(prev => [newQuote, ...prev]);
    syncToDb("quotes", newQuote.id, newQuote, "upsert");

    addWhatsAppLog(
      newContact.id,
      `Generated initial Quote ${newQuote.id}: "${newQuote.title}" for ${formatCurrency(newQuote.total)} (${newQuote.advancePercent}% advance = ${formatCurrency(newQuote.advanceRequired)}).`,
      "quote"
    );

    return { quote: newQuote, contact: newContact };
  };

  const updateQuote = (updated: Quote) => {
    setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q));
    syncToDb("quotes", updated.id, updated, "upsert");
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    syncToDb("quotes", id, null, "delete");
  };

  const convertQuoteToJob = (quoteId: string, deadline: string, advanceReceived: boolean): Job => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) throw new Error("Quote not found");

    const jobCount = jobs.length + 1;
    const jobId = `JOB-2026-${jobCount.toString().padStart(3, "0")}`;

    const advanceAmount = advanceReceived ? quote.advanceRequired : 0;
    const balanceDue = quote.total - advanceAmount;

    const newJob: Job = {
      id: jobId,
      quoteId: quote.id,
      contactId: quote.contactId,
      contactName: quote.contactName,
      contactPhone: quote.contactPhone,
      contactCompany: quote.contactCompany,
      title: quote.title,
      trade: quote.trade,
      stage: "queued",
      priority: "high",
      currency: "PKR",
      totalAmount: quote.total,
      advancePaid: advanceAmount,
      advanceStatus: advanceReceived ? "collected" : "pending",
      balanceDue: balanceDue,
      startDate: new Date().toISOString().split("T")[0],
      deadline: deadline || quote.validUntil,
      specsSummary: `${quote.trade} - ${quote.lineItems.length} line item(s)`,
      notes: quote.notes,
      referenceItems: [
        {
          id: `ref-auto-${Date.now()}`,
          title: `Initial Quote Specs: ${quote.id}`,
          type: "note",
          url: "",
          notes: `Converted from Quote ${quote.id}. Total: ${formatCurrency(quote.total)}, Advance: ${formatCurrency(advanceAmount)}.`,
          uploadedBy: currentUser?.name || "PAKMEC",
          uploadedAt: new Date().toLocaleString(),
          tag: "Quote Record"
        }
      ]
    };

    setJobs(prev => [newJob, ...prev]);
    syncToDb("jobs", newJob.id, newJob, "upsert");

    // Update Quote status
    const updatedQuote: Quote = {
      ...quote,
      status: "approved",
      convertedToJobId: jobId
    };
    updateQuote(updatedQuote);

    // Auto-generate invoice
    const invCount = invoices.length + 1;
    const invId = `INV-2026-${invCount.toString().padStart(3, "0")}`;

    const newInvoice: Invoice = {
      id: invId,
      jobId: jobId,
      quoteId: quote.id,
      contactId: quote.contactId,
      contactName: quote.contactName,
      contactPhone: quote.contactPhone,
      contactCompany: quote.contactCompany,
      date: new Date().toISOString().split("T")[0],
      dueDate: deadline || quote.validUntil,
      currency: "PKR",
      totalAmount: quote.total,
      advanceDeducted: advanceAmount,
      balancePayable: balanceDue,
      amountPaid: advanceAmount,
      status: balanceDue === 0 ? "paid" : advanceAmount > 0 ? "partial" : "unpaid",
      lineItems: quote.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })),
      payments: advanceAmount > 0 ? [{
        id: `pay-adv-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: advanceAmount,
        method: "Bank Transfer",
        referenceNumber: `ADV-${quote.id}`,
        receivedBy: currentUser?.name || "PAKMEC",
        notes: `Initial advance deposit collected at job kickoff (${quote.advancePercent}%)`,
        type: "advance"
      }] : [],
      notes: `Invoice generated from Job ${jobId}. Remaining balance: ${formatCurrency(balanceDue)}.`
    };

    setInvoices(prev => [newInvoice, ...prev]);
    syncToDb("invoices", newInvoice.id, newInvoice, "upsert");

    addWhatsAppLog(
      quote.contactId,
      `Quote ${quote.id} approved and queued for production (${jobId}). Verified advance deposit of ${formatCurrency(advanceAmount)}.`,
      "payment"
    );

    return newJob;
  };

  // Jobs Actions
  const createJob = (jobData: Omit<Job, "id">): Job => {
    const count = jobs.length + 1;
    const newJob: Job = {
      ...jobData,
      currency: "PKR",
      id: `JOB-2026-${count.toString().padStart(3, "0")}`
    };
    setJobs(prev => [newJob, ...prev]);
    syncToDb("jobs", newJob.id, newJob, "upsert");
    return newJob;
  };

  const updateJob = (updated: Job) => {
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
    syncToDb("jobs", updated.id, updated, "upsert");
  };

  const updateJobStage = (jobId: string, newStage: JobStage) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updated = { ...j, stage: newStage };
        if (newStage === "delivered") {
          updated.completedDate = new Date().toISOString().split("T")[0];
        }
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));

    const job = jobs.find(j => j.id === jobId);
    if (job) {
      addWhatsAppLog(
        job.contactId,
        `Job ${job.id} stage moved to "${newStage.toUpperCase().replace("_", " ")}".`,
        newStage === "delivered" ? "delivery" : "general"
      );
    }
  };

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
    syncToDb("jobs", id, null, "delete");
  };

  const addReferenceItem = (jobId: string, itemData: Omit<ReferenceItem, "id" | "uploadedAt" | "uploadedBy">) => {
    const newItem: ReferenceItem = {
      ...itemData,
      id: `ref-${Date.now()}`,
      uploadedAt: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true }),
      uploadedBy: currentUser?.name || "PAKMEC",
    };

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          referenceItems: [newItem, ...(j.referenceItems || [])]
        };
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));
  };

  const deleteReferenceItem = (jobId: string, itemId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updated = {
          ...j,
          referenceItems: j.referenceItems.filter(r => r.id !== itemId)
        };
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));
  };

  const recordJobAdvance = (jobId: string, amount: number, method: PaymentRecord["method"], refNo: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const newAdvance = j.advancePaid + amount;
        const newBalance = Math.max(0, j.totalAmount - newAdvance);
        const updated: Job = {
          ...j,
          advancePaid: newAdvance,
          balanceDue: newBalance,
          advanceStatus: newAdvance >= j.totalAmount ? "collected" : "partial"
        };
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));

    // If an invoice is linked to this job, also record the advance payment on the invoice
    const inv = invoices.find(i => i.jobId === jobId);
    if (inv) {
      recordInvoicePayment(inv.id, {
        amount,
        method,
        referenceNumber: refNo || `ADV-${jobId}`,
        notes: `Advance deposit recorded from Job Board (${method})`,
        type: "advance"
      });
    }

    const job = jobs.find(j => j.id === jobId);
    if (job && !inv) {
      addWhatsAppLog(
        job.contactId,
        `Advance deposit of ${formatCurrency(amount)} recorded for Job ${job.id} via ${method} (Ref: ${refNo}).`,
        "payment"
      );
    }
  };

  // Invoices Actions
  const createInvoice = (invoiceData: Omit<Invoice, "id">): Invoice => {
    const count = invoices.length + 1;
    const newInvoice: Invoice = {
      ...invoiceData,
      currency: "PKR",
      id: `INV-2026-${count.toString().padStart(3, "0")}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
    syncToDb("invoices", newInvoice.id, newInvoice, "upsert");
    return newInvoice;
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i));
    syncToDb("invoices", updated.id, updated, "upsert");
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    syncToDb("invoices", id, null, "delete");
  };

  const recordInvoicePayment = (invoiceId: string, paymentData: Omit<PaymentRecord, "id" | "date" | "receivedBy">) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      receivedBy: currentUser?.name || "PAKMEC",
    };

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newAmountPaid = inv.amountPaid + paymentData.amount;
        const isFullyPaid = newAmountPaid >= inv.totalAmount;
        const newStatus = isFullyPaid ? "paid" : newAmountPaid > 0 ? "partial" : inv.status;

        const updated: Invoice = {
          ...inv,
          amountPaid: newAmountPaid,
          status: newStatus,
          payments: [newPayment, ...(inv.payments || [])]
        };
        syncToDb("invoices", updated.id, updated, "upsert");
        return updated;
      }
      return inv;
    }));

    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice) {
      addWhatsAppLog(
        invoice.contactId,
        `Payment of ${formatCurrency(paymentData.amount)} received via ${paymentData.method} for Invoice ${invoice.id} (Ref: ${paymentData.referenceNumber}).`,
        "payment"
      );

      // If associated with a job, update job balance
      if (invoice.jobId) {
        setJobs(prev => prev.map(j => {
          if (j.id === invoice.jobId) {
            const newBal = Math.max(0, j.balanceDue - paymentData.amount);
            const updatedJob = { ...j, balanceDue: newBal };
            syncToDb("jobs", updatedJob.id, updatedJob, "upsert");
            return updatedJob;
          }
          return j;
        }));
      }
    }
  };

  const recordJobSettlement = (
    jobId: string, 
    amount: number, 
    method: PaymentRecord["method"], 
    refNo: string, 
    notes?: string
  ) => {
    const inv = invoices.find(i => i.jobId === jobId);
    if (inv) {
      recordInvoicePayment(inv.id, {
        amount,
        method,
        referenceNumber: refNo || `SETTLE-${jobId}`,
        notes: notes || `Final balance settlement recorded from Job board prior to dispatch`
      });
    } else {
      setJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          const newBalance = Math.max(0, j.balanceDue - amount);
          const updated: Job = {
            ...j,
            balanceDue: newBalance,
          };
          syncToDb("jobs", updated.id, updated, "upsert");
          return updated;
        }
        return j;
      }));
    }
  };

  const updateSettings = (newSettings: TradeRatesSettings) => {
    setSettings(newSettings);
    syncToDb("settings", "main", newSettings, "upsert");
  };

  const purgeDemoData = async () => {
    const DEMO_CONTACT_IDS = ["cnt-001", "cnt-002", "cnt-003", "cnt-004"];
    const DEMO_QUOTE_IDS = ["QT-2026-001", "QT-2026-002", "QT-2026-003"];
    const DEMO_JOB_IDS = ["JOB-2026-001", "JOB-2026-002", "JOB-2026-003"];
    const DEMO_INVOICE_IDS = ["INV-2026-001", "INV-2026-002", "INV-2026-003"];

    setContacts(prev => prev.filter(c => !DEMO_CONTACT_IDS.includes(c.id)));
    setQuotes(prev => prev.filter(q => !DEMO_QUOTE_IDS.includes(q.id)));
    setJobs(prev => prev.filter(j => !DEMO_JOB_IDS.includes(j.id)));
    setInvoices(prev => prev.filter(i => !DEMO_INVOICE_IDS.includes(i.id)));

    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge_demo" })
      });
    } catch (e) {
      console.warn("Purge demo data API warning:", e);
    }
  };

  const resetToDefaults = async () => {
    setContacts(initialContacts);
    setQuotes(initialQuotes);
    setJobs(initialJobs);
    setInvoices(initialInvoices);
    setSettings(initialSettings);
    localStorage.removeItem("pakmec_crm_user");
    
    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" })
      });
    } catch (e) {
      console.warn("Reset to defaults API warning:", e);
    }
  };

  return (
    <CrmContext.Provider
      value={{
        contacts,
        quotes,
        jobs,
        invoices,
        settings,
        searchQuery,
        theme,
        dataLoaded,
        isDemoDataPresent,
        setSearchQuery,
        toggleTheme,
        addContact,
        updateContact,
        deleteContact,
        archiveContact,
        unarchiveContact,
        addWhatsAppLog,
        updateWhatsAppLog,
        deleteWhatsAppLog,
        createQuote,
        createQuoteWithNewContact,
        updateQuote,
        deleteQuote,
        convertQuoteToJob,
        createJob,
        updateJob,
        updateJobStage,
        deleteJob,
        addReferenceItem,
        deleteReferenceItem,
        recordJobAdvance,
        recordJobSettlement,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        updateSettings,
        resetToDefaults,
        purgeDemoData,
        formatCurrency,
        currentUser,
        currentRole,
        permissions,
        isAuthenticated,
        authHydrated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }
  return context;
};
