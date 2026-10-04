/**
 * Trade / service name. Free text so new services never need a code change;
 * DEFAULT_TRADES in lib/trades only seeds suggestions.
 */
export type TradeType = string;

export type Currency = "PKR";

export interface WhatsAppLog {
  id: string;
  date: string;
  author: string;
  text: string;
  type: "inquiry" | "quote" | "payment" | "general" | "delivery";
  updatedAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string; // WhatsApp enabled
  email: string;
  city: string;
  address?: string;
  tradeTags: TradeType[];
  notes?: string;
  createdAt: string;
  whatsappLogs: WhatsAppLog[];
  isArchived?: boolean;
  archivedAt?: string;
}

export interface QuoteKeyValue {
  id: string;
  label: string;
  value: string;
}

export interface QuoteLineItem {
  id: string;
  description: string; // item title
  trade: TradeType; // category line printed under the title
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  details?: string; // long-form scope paragraph
  highlights?: QuoteKeyValue[]; // key specs printed inline, e.g. "Spindle: 300 W"
}

/** Extra row in the totals column, e.g. "Estimated Completion: 7–10 Working Days". */
export interface QuoteInfoRow extends QuoteKeyValue {
  emphasis?: boolean;
}

export interface QuoteListGroup {
  id: string;
  title: string;
  items: string[];
  accent?: boolean;
}

export interface QuoteClause {
  id: string;
  title: string;
  body: string;
}

export type QuoteBlockKind = "highlights" | "table" | "lists" | "clauses" | "text";

/** One section on an additional quotation page. Fields used depend on `kind`. */
export interface QuoteBlock {
  id: string;
  kind: QuoteBlockKind;
  heading: string;
  note?: string;
  rows?: QuoteKeyValue[]; // highlights, table
  columns?: [string, string]; // table
  groups?: QuoteListGroup[]; // lists
  clauses?: QuoteClause[]; // clauses
  body?: string; // text
}

export interface QuotePage {
  id: string;
  title: string;
  blocks: QuoteBlock[];
}

/** Reusable quotation layout saved from the builder. */
export interface QuoteTemplate {
  id: string;
  name: string;
  createdAt: string;
  trade: TradeType;
  title: string;
  validDays: number;
  advancePercent: number;
  advanceStatus?: "required" | "received";
  balanceLabel?: string;
  terms: string;
  lineItems: QuoteLineItem[];
  infoRows: QuoteInfoRow[];
  pages: QuotePage[];
}

export interface TradeSpecs {
  trade: TradeType;
  // 3D Printing specs
  material?: string;
  weightGrams?: number;
  printHours?: number;
  infillPercent?: number;
  finishing?: string;
  
  // Laser Cutting specs
  sheetMaterial?: string;
  thicknessMm?: number;
  areaSqCm?: number;
  cutLengthMeters?: number;
  pierces?: number;
  
  // CNC Machining specs
  metalType?: string;
  materialVolumeCc?: number;
  machiningHours?: number;
  fixturesCount?: number;
  camProgrammingNeeded?: boolean;
  
  // CAD Design specs
  complexity?: "Simple" | "Medium" | "Complex";
  estimatedCadHours?: number;
  includedRevisions?: number;
  
  // Fabrication specs
  structureType?: string;
  areaSqFt?: number;
  materialGrade?: string;

  // Custom Domain specs
  customDomainName?: string;
  customCategory?: string;
  customScope?: string;
  customLeadTime?: string;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "expired";

export interface Quote {
  id: string; // e.g. QT-2026-001
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactCompany?: string;
  title: string;
  trade: TradeType;
  status: QuoteStatus;
  currency: "PKR";
  date: string;
  validUntil: string;
  specs: TradeSpecs;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discount: number;
  total: number;
  advancePercent: number;
  advanceRequired: number;
  notes: string;
  terms: string;
  convertedToJobId?: string;
  isArchived?: boolean;
  archivedAt?: string;
  // Document fields (optional so quotes saved before the modular builder still load)
  clientAddress?: string;
  advanceStatus?: "required" | "received";
  balanceLabel?: string;
  infoRows?: QuoteInfoRow[];
  paymentDetails?: QuoteKeyValue[];
  pages?: QuotePage[];
}

export type JobStage = "queued" | "in_progress" | "qc" | "ready" | "delivered";
export type JobPriority = "low" | "medium" | "high" | "urgent";

export interface ReferenceItem {
  id: string;
  title: string;
  type: "image" | "cad_file" | "note" | "link" | "progress_photo" | "file";
  url: string; // url or data-uri or relative path in /uploads/
  notes?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  tag?: string;
}

export interface Job {
  id: string; // e.g. JOB-2026-042
  quoteId?: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactCompany?: string;
  title: string;
  trade: TradeType;
  stage: JobStage;
  priority: JobPriority;
  currency: "PKR";
  totalAmount: number;
  advancePaid: number;
  advanceStatus: "pending" | "partial" | "collected";
  balanceDue: number;
  startDate: string;
  deadline: string;
  completedDate?: string;
  specsSummary: string;
  referenceItems: ReferenceItem[];
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: "Cash" | "Bank Transfer" | "JazzCash" | "EasyPaisa" | "Cheque";
  referenceNumber: string;
  receivedBy: string;
  notes?: string;
  type?: "advance" | "settlement";
}

export interface Invoice {
  id: string; // e.g. INV-2026-018
  jobId?: string;
  quoteId?: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  contactCompany?: string;
  date: string;
  dueDate: string;
  currency: "PKR";
  totalAmount: number;
  advanceDeducted: number;
  balancePayable: number;
  amountPaid: number;
  status: InvoiceStatus;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  payments: PaymentRecord[];
  notes?: string;
  isArchived?: boolean;
  archivedAt?: string;
}

export interface TradeRatesSettings {
  // 3D Printing
  printing: {
    plaPerGram: number;
    petgPerGram: number;
    absPerGram: number;
    resinPerGram: number;
    tpuPerGram: number;
    machineRatePerHour: number;
    setupFee: number;
  };
  // Laser Cutting
  laser: {
    acrylic3mmPerSqCm: number;
    acrylic5mmPerSqCm: number;
    mdf3mmPerSqCm: number;
    mildSteelPerSqCm: number;
    cutRatePerMeter: number;
    pierceCost: number;
    setupFee: number;
  };
  // CNC Machining
  cnc: {
    aluminum6061PerCc: number;
    brassPerCc: number;
    delrinPerCc: number;
    steelPerCc: number;
    machineRatePerHour: number;
    camProgrammingFee: number;
    setupPerFixture: number;
  };
  // CAD Design (PKR only)
  cad: {
    hourlyRatePkr: number;
    simpleMultiplier: number;
    mediumMultiplier: number;
    complexMultiplier: number;
    extraRevisionRate: number;
  };
  // Construction
  construction: {
    greyStructurePerSqFt: number;
    turnkeyPerSqFt: number;
    industrialShedPerSqFt: number;
  };
  // Company info (Multan location)
  company: {
    name: string;
    tagline: string;
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    bankName: string;
    bankAccountTitle: string;
    bankIban: string;
    bankBranch?: string;
    bankAccountNumber?: string;
    website?: string;
    jazzCashNumber: string;
    easyPaisaNumber: string;
    defaultAdvancePercent: number;
  };
  quoteTemplates?: QuoteTemplate[];
}

// User Authentication & Role-Based Access Control (RBAC)
export type UserRole = "admin" | "machinist" | "sales";

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  phone?: string;
  lastLogin?: string;
}

export interface RolePermissions {
  canViewFinancials: boolean;
  canRecordSettlements: boolean;
  canDeleteOrArchive: boolean;
  canManageSettings: boolean;
  canCreateQuotes: boolean;
  canManageProduction: boolean;
}
