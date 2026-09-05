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

  // Quotes
  createQuote: (quote: Omit<Quote, "id">) => Quote;
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
  resetToDefaults: () => void;

  // Utilities
  formatCurrency: (amount: number) => string;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

// Helper to sync to SQLite DB
async function syncToDb(table: "contacts" | "quotes" | "jobs" | "invoices" | "settings", id: string, data: any, action: "upsert" | "delete" = "upsert") {
  try {
    await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, id, data, action })
    });
  } catch (err) {
    console.warn("DB sync warning:", err);
  }
}

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [settings, setSettings] = useState<TradeRatesSettings>(initialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [hydrated, setHydrated] = useState(false);

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);

  const currentRole: UserRole = currentUser?.role || "admin";
  const permissions = getRolePermissions(currentRole);
  const isAuthenticated = Boolean(currentUser);

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
            if (dbData.contacts?.length) setContacts(dbData.contacts);
            if (dbData.quotes?.length) setQuotes(dbData.quotes);
            if (dbData.jobs?.length) setJobs(dbData.jobs);
            if (dbData.invoices?.length) setInvoices(dbData.invoices);
            if (dbData.settings) setSettings(dbData.settings);
          }
        })
        .catch(err => {
          console.warn("Could not fetch from DB, using defaults:", err);
        })
        .finally(() => {
          setHydrated(true);
        });
    } catch (e) {
      console.warn("Init error:", e);
      setHydrated(true);
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
    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}`,
          date: new Date().toLocaleString(),
          author: "PAKMEC",
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
    const newLog: WhatsAppLog = {
      id: `wlog-${Date.now()}`,
      date: new Date().toLocaleString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric", 
        hour: "numeric", 
        minute: "numeric", 
        hour12: true 
      }),
      author: "PAKMEC",
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
          uploadedBy: "PAKMEC",
          uploadedAt: new Date().toLocaleString(),
          tag: "Quote Record"
        }
      ]
    };

    updateQuote({
      ...quote,
      status: "approved",
      convertedToJobId: jobId
    });

    setJobs(prev => [newJob, ...prev]);
    syncToDb("jobs", newJob.id, newJob, "upsert");

    // Generate corresponding invoice
    const invCount = invoices.length + 1;
    const newInvoice: Invoice = {
      id: `INV-2026-${invCount.toString().padStart(3, "0")}`,
      jobId: newJob.id,
      quoteId: quote.id,
      contactId: quote.contactId,
      contactName: quote.contactName,
      contactPhone: quote.contactPhone,
      contactCompany: quote.contactCompany,
      date: new Date().toISOString().split("T")[0],
      dueDate: deadline,
      currency: "PKR",
      totalAmount: quote.total,
      advanceDeducted: advanceAmount,
      balancePayable: balanceDue,
      amountPaid: 0,
      status: balanceDue <= 0 ? "paid" : "unpaid",
      lineItems: [
        {
          description: `${quote.title} (Quote ${quote.id})`,
          quantity: 1,
          unitPrice: quote.total,
          amount: quote.total
        },
        ...(advanceAmount > 0 ? [{
          description: `Less: Advance Payment Received (${quote.advancePercent}%)`,
          quantity: 1,
          unitPrice: -advanceAmount,
          amount: -advanceAmount
        }] : [])
      ],
      payments: advanceReceived && advanceAmount > 0 ? [{
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        amount: advanceAmount,
        method: "Bank Transfer",
        referenceNumber: `ADV-${quote.id}`,
        receivedBy: "PAKMEC",
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
      uploadedBy: "PAKMEC",
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
    let updatedAdvancePaid = 0;
    let updatedBalanceDue = 0;

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        updatedAdvancePaid = j.advancePaid + amount;
        updatedBalanceDue = Math.max(0, j.totalAmount - updatedAdvancePaid);
        const updated: Job = {
          ...j,
          advancePaid: updatedAdvancePaid,
          balanceDue: updatedBalanceDue,
          advanceStatus: updatedBalanceDue <= 0 ? "collected" : "partial"
        };
        syncToDb("jobs", updated.id, updated, "upsert");
        return updated;
      }
      return j;
    }));

    // Bidirectionally synchronize the linked Invoice
    setInvoices(prev => prev.map(inv => {
      if (inv.jobId === jobId) {
        const newAdvanceDeducted = (inv.advanceDeducted || 0) + amount;
        const newBalancePayable = Math.max(0, inv.totalAmount - newAdvanceDeducted);
        const advanceRecord: PaymentRecord = {
          id: `pay-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          amount,
          method,
          referenceNumber: refNo || `ADV-${jobId}`,
          receivedBy: "PAKMEC",
          notes: `Advance deposit recorded for Job ${jobId}`,
          type: "advance"
        };
        const updatedPayments = [...inv.payments, advanceRecord];
        const settlements = updatedPayments.filter(p => p.type !== "advance");
        const settlementsPaid = settlements.reduce((sum, p) => sum + p.amount, 0);
        const isPaid = (newBalancePayable - settlementsPaid) <= 0;

        const updatedInv: Invoice = {
          ...inv,
          advanceDeducted: newAdvanceDeducted,
          balancePayable: newBalancePayable,
          payments: updatedPayments,
          status: isPaid ? "paid" : (settlementsPaid > 0 ? "partial" : "unpaid")
        };
        syncToDb("invoices", updatedInv.id, updatedInv, "upsert");
        return updatedInv;
      }
      return inv;
    }));

    const job = jobs.find(j => j.id === jobId);
    if (job) {
      addWhatsAppLog(
        job.contactId,
        `Advance deposit of ${formatCurrency(amount)} collected for Job ${job.id} via ${method} (Ref: ${refNo || "N/A"}). Remaining balance: ${formatCurrency(updatedBalanceDue)}.`,
        "payment"
      );
    }
  };

  // Invoices Actions
  const createInvoice = (invData: Omit<Invoice, "id">): Invoice => {
    const count = invoices.length + 1;
    const newInvoice: Invoice = {
      ...invData,
      currency: "PKR",
      id: `INV-2026-${count.toString().padStart(3, "0")}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
    syncToDb("invoices", newInvoice.id, newInvoice, "upsert");
    return newInvoice;
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    syncToDb("invoices", updated.id, updated, "upsert");
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    syncToDb("invoices", id, null, "delete");
  };

  const recordInvoicePayment = (
    invoiceId: string, 
    paymentData: Omit<PaymentRecord, "id" | "date" | "receivedBy">
  ) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      receivedBy: "PAKMEC",
      type: "settlement"
    };

    let targetJobId: string | undefined;
    let finalRemainingBalance = 0;

    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        targetJobId = inv.jobId;
        const newPayments = [...inv.payments, newPayment];
        const settlements = newPayments.filter(p => p.type !== "advance" && (!p.notes || !p.notes.toLowerCase().includes("advance")));
        const newAmountPaid = settlements.reduce((sum, p) => sum + p.amount, 0);
        finalRemainingBalance = Math.max(0, inv.balancePayable - newAmountPaid);
        const isPaid = finalRemainingBalance <= 0;
        const status: Invoice["status"] = isPaid ? "paid" : newAmountPaid > 0 ? "partial" : "unpaid";

        const updated = {
          ...inv,
          payments: newPayments,
          amountPaid: newAmountPaid,
          status
        };
        syncToDb("invoices", updated.id, updated, "upsert");
        return updated;
      }
      return inv;
    }));

    // Bidirectionally synchronize the linked Job balanceDue
    if (targetJobId) {
      const jobIdToUpdate = targetJobId;
      setJobs(prev => prev.map(j => {
        if (j.id === jobIdToUpdate) {
          const updatedJob: Job = {
            ...j,
            balanceDue: finalRemainingBalance
          };
          syncToDb("jobs", updatedJob.id, updatedJob, "upsert");
          return updatedJob;
        }
        return j;
      }));
    }

    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      addWhatsAppLog(
        inv.contactId,
        `Settlement payment of ${formatCurrency(paymentData.amount)} received for Invoice ${inv.id} via ${paymentData.method} (Ref: ${paymentData.referenceNumber || "N/A"}). Remaining balance: ${formatCurrency(finalRemainingBalance)}.`,
        "payment"
      );
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

  const resetToDefaults = () => {
    setContacts(initialContacts);
    setQuotes(initialQuotes);
    setJobs(initialJobs);
    setInvoices(initialInvoices);
    setSettings(initialSettings);
    localStorage.clear();
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
        setSearchQuery,
        toggleTheme,
        addContact,
        updateContact,
        deleteContact,
        archiveContact,
        unarchiveContact,
        addWhatsAppLog,
        createQuote,
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
