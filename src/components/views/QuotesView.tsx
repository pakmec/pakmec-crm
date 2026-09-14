"use client";

import React, { useState, useEffect } from "react";
import { 
  Calculator, 
  Plus, 
  Printer, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Flame, 
  Cpu, 
  Compass, 
  Building2,
  FileText,
  AlertCircle,
  ChevronLeft,
  Edit,
  Trash2,
  UserPlus,
  Users,
  X,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { TradeType, Quote, QuoteLineItem, TradeSpecs } from "@/types";
import { printIsolatedElement } from "@/lib/printHelper";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

interface QuotesViewProps {
  preselectedContactId?: string;
  onJobCreated?: (jobId: string) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ 
  preselectedContactId,
  onJobCreated 
}) => {
  const { 
    contacts, 
    quotes, 
    settings, 
    createQuote, 
    createQuoteWithNewContact,
    updateQuote,
    deleteQuote,
    convertQuoteToJob, 
    formatCurrency 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<"generator" | "list">("generator");
  const [quotesMobileTab, setQuotesMobileTab] = useState<"list" | "preview">("list");
  const activeQuotes = quotes.filter((q) => !q.isArchived);
  const activeContacts = contacts.filter((c) => !c.isArchived);
  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quote | null>(activeQuotes[0] || null);

  // Client Selection Mode: "existing" registered contact vs "walkin" direct lead
  const [clientMode, setClientMode] = useState<"existing" | "walkin">("existing");
  const [selectedContactId, setSelectedContactId] = useState<string>(
    preselectedContactId || activeContacts[0]?.id || ""
  );

  // Walk-in client direct input fields
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinCompany, setWalkinCompany] = useState("");
  const [walkinCity, setWalkinCity] = useState("Multan");

  useEffect(() => {
    if (preselectedContactId) {
      setSelectedContactId(preselectedContactId);
      setClientMode("existing");
    } else if (activeContacts.length > 0) {
      if (!selectedContactId || !activeContacts.some((c) => c.id === selectedContactId)) {
        setSelectedContactId(activeContacts[0].id);
      }
    } else {
      setClientMode("walkin");
    }
  }, [preselectedContactId, activeContacts, selectedContactId]);

  const [quoteTitle, setQuoteTitle] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<TradeType>("CNC Machining");
  const [advancePercent, setAdvancePercent] = useState<number>(settings.company.defaultAdvancePercent || 50);
  const [customAdvancePkr, setCustomAdvancePkr] = useState<number | null>(null);
  const [isManualAdvance, setIsManualAdvance] = useState<boolean>(false);
  const [validDays, setValidDays] = useState<number>(14);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("Precision tolerance within ±0.03mm. Quality inspection report provided upon delivery in Multan.");

  // Trade Specs State
  // 3D Printing
  const [printMaterial, setPrintMaterial] = useState("PLA");
  const [printWeightGrams, setPrintWeightGrams] = useState(120);
  const [printHours, setPrintHours] = useState(5);
  const [printInfill, setPrintInfill] = useState(30);
  const [printFinish, setPrintFinish] = useState("None");

  // Laser Cutting
  const [laserMaterial, setLaserMaterial] = useState("Acrylic 3mm Clear");
  const [laserAreaSqCm, setLaserAreaSqCm] = useState(2500);
  const [laserCutMeters, setLaserCutMeters] = useState(35);
  const [laserPierces, setLaserPierces] = useState(60);

  // CNC Machining
  const [cncMetal, setCncMetal] = useState("Aluminum 6061-T6");
  const [cncVolumeCc, setCncVolumeCc] = useState(350);
  const [cncMachiningHours, setCncMachiningHours] = useState(6);
  const [cncFixtures, setCncFixtures] = useState(2);
  const [cncCamProgramming, setCncCamProgramming] = useState(true);

  // CAD Design
  const [cadHours, setCadHours] = useState(15);
  const [cadComplexity, setCadComplexity] = useState<"Simple" | "Medium" | "Complex">("Medium");
  const [cadRevisions, setCadRevisions] = useState(2);

  // Construction
  const [constAreaSqFt, setConstAreaSqFt] = useState(1200);
  const [constStructureType, setConstStructureType] = useState("Industrial Shed");

  // Generated Line Items
  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);

  // Conversion Modal State
  const [convertModalQuote, setConvertModalQuote] = useState<Quote | null>(null);
  const [convertAdvanceReceived, setConvertAdvanceReceived] = useState(true);
  const [convertDeadline, setConvertDeadline] = useState("");

  // Edit Quote Modal State
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTrade, setEditTrade] = useState<TradeType>("CNC Machining");
  const [editLineItems, setEditLineItems] = useState<QuoteLineItem[]>([]);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editAdvancePercent, setEditAdvancePercent] = useState<number>(50);
  const [editNotes, setEditNotes] = useState("");
  const [editTerms, setEditTerms] = useState("");
  const [editContactId, setEditContactId] = useState("");

  // Auto Calculate whenever specs change
  useEffect(() => {
    let items: QuoteLineItem[] = [];

    if (selectedTrade === "3D Printing") {
      const matRates: Record<string, number> = {
        PLA: settings.printing.plaPerGram,
        PETG: settings.printing.petgPerGram,
        ABS: settings.printing.absPerGram,
        Resin: settings.printing.resinPerGram,
        TPU: settings.printing.tpuPerGram,
      };
      const finishRates: Record<string, number> = {
        None: 0,
        "Sanding & Deburr": 400,
        "Vapor Smoothing": 900,
        "Industrial Paint Finish": 1500,
      };

      const matRate = matRates[printMaterial] || 5;
      const matCost = Math.round(printWeightGrams * matRate);
      const machineCost = Math.round(printHours * settings.printing.machineRatePerHour);
      const finishCost = finishRates[printFinish] || 0;

      items = [
        {
          id: "li-gen-1",
          description: `Material: ${printMaterial} filament/resin (${printWeightGrams}g @ ${printInfill}% infill)`,
          trade: "3D Printing",
          quantity: printWeightGrams,
          unit: "grams",
          unitPrice: matRate,
          amount: matCost
        },
        {
          id: "li-gen-2",
          description: `Additive Machine Run Time (${printHours} hrs automated cycle)`,
          trade: "3D Printing",
          quantity: printHours,
          unit: "hrs",
          unitPrice: settings.printing.machineRatePerHour,
          amount: machineCost
        },
        {
          id: "li-gen-3",
          description: "Build Chamber Setup, Slicing & Calibration",
          trade: "3D Printing",
          quantity: 1,
          unit: "setup",
          unitPrice: settings.printing.setupFee,
          amount: settings.printing.setupFee
        }
      ];

      if (finishCost > 0) {
        items.push({
          id: "li-gen-4",
          description: `Post-Processing & Finishing: ${printFinish}`,
          trade: "3D Printing",
          quantity: 1,
          unit: "job",
          unitPrice: finishCost,
          amount: finishCost
        });
      }
    } else if (selectedTrade === "Laser Cutting") {
      const matRates: Record<string, number> = {
        "Acrylic 3mm Clear": settings.laser.acrylic3mmPerSqCm,
        "Acrylic 5mm Cast": settings.laser.acrylic5mmPerSqCm,
        "MDF 3mm Sheet": settings.laser.mdf3mmPerSqCm,
        "Mild Steel Sheet 1.5mm": settings.laser.mildSteelPerSqCm,
      };
      const mRate = matRates[laserMaterial] || 0.8;
      const matCost = Math.round(laserAreaSqCm * mRate);
      const cutCost = Math.round(laserCutMeters * settings.laser.cutRatePerMeter);
      const pierceCost = Math.round(laserPierces * settings.laser.pierceCost);

      items = [
        {
          id: "li-gen-1",
          description: `Laser Substrate: ${laserMaterial} (${laserAreaSqCm} cm²)`,
          trade: "Laser Cutting",
          quantity: laserAreaSqCm,
          unit: "cm²",
          unitPrice: mRate,
          amount: matCost
        },
        {
          id: "li-gen-2",
          description: `Laser Vector Cutting Path Run (${laserCutMeters} meters)`,
          trade: "Laser Cutting",
          quantity: laserCutMeters,
          unit: "meters",
          unitPrice: settings.laser.cutRatePerMeter,
          amount: cutCost
        },
        {
          id: "li-gen-3",
          description: `Contour Pierces & Vector Insets (${laserPierces} pierce points)`,
          trade: "Laser Cutting",
          quantity: laserPierces,
          unit: "pts",
          unitPrice: settings.laser.pierceCost,
          amount: pierceCost
        },
        {
          id: "li-gen-4",
          description: "Laser Beam Optical Alignment & Sheet Nesting Setup",
          trade: "Laser Cutting",
          quantity: 1,
          unit: "setup",
          unitPrice: settings.laser.setupFee,
          amount: settings.laser.setupFee
        }
      ];
    } else if (selectedTrade === "CNC Machining") {
      const metalRates: Record<string, number> = {
        "Aluminum 6061-T6": settings.cnc.aluminum6061PerCc,
        "Brass C360": settings.cnc.brassPerCc,
        "Delrin / Acetal": settings.cnc.delrinPerCc,
        "Carbon Steel 1018": settings.cnc.steelPerCc,
      };
      const metalRate = metalRates[cncMetal] || 20;
      const metalCost = Math.round(cncVolumeCc * metalRate);
      const machCost = Math.round(cncMachiningHours * settings.cnc.machineRatePerHour);
      const fixCost = Math.round(cncFixtures * settings.cnc.setupPerFixture);

      items = [
        {
          id: "li-gen-1",
          description: `Billet Stock Material: ${cncMetal} (${cncVolumeCc} cm³ raw envelope)`,
          trade: "CNC Machining",
          quantity: cncVolumeCc,
          unit: "cm³",
          unitPrice: metalRate,
          amount: metalCost
        },
        {
          id: "li-gen-2",
          description: `Precision CNC Milling / Turning Machine Time (${cncMachiningHours} hrs)`,
          trade: "CNC Machining",
          quantity: cncMachiningHours,
          unit: "hrs",
          unitPrice: settings.cnc.machineRatePerHour,
          amount: machCost
        },
        {
          id: "li-gen-3",
          description: `Fixture Clamping & Setup Calibrations (${cncFixtures} operations)`,
          trade: "CNC Machining",
          quantity: cncFixtures,
          unit: "fixtures",
          unitPrice: settings.cnc.setupPerFixture,
          amount: fixCost
        }
      ];

      if (cncCamProgramming) {
        items.push({
          id: "li-gen-4",
          description: "Mastercam 3D Toolpath CAM Programming & Machine Code Verification",
          trade: "CNC Machining",
          quantity: 1,
          unit: "setup",
          unitPrice: settings.cnc.camProgrammingFee,
          amount: settings.cnc.camProgrammingFee
        });
      }
    } else if (selectedTrade === "CAD Design") {
      const rate = settings.cad.hourlyRatePkr;
      const mults = {
        Simple: settings.cad.simpleMultiplier,
        Medium: settings.cad.mediumMultiplier,
        Complex: settings.cad.complexMultiplier,
      };
      const mult = mults[cadComplexity] || 1.35;
      const unitRate = Math.round(rate * mult);
      const totalCad = Math.round(cadHours * unitRate);

      items = [
        {
          id: "li-gen-1",
          description: `SolidWorks 3D Parametric CAD Modelling (${cadComplexity} Complexity, ${cadHours} hrs)`,
          trade: "CAD Design",
          quantity: cadHours,
          unit: "hrs",
          unitPrice: unitRate,
          amount: totalCad
        },
        {
          id: "li-gen-2",
          description: `Engineering Drawings (.DWG/.PDF), Tolerancing & ${cadRevisions} Revision Cycle(s)`,
          trade: "CAD Design",
          quantity: 1,
          unit: "package",
          unitPrice: Math.round(unitRate * 1.5),
          amount: Math.round(unitRate * 1.5)
        }
      ];
    } else if (selectedTrade === "Industrial Fabrication") {
      const rates: Record<string, number> = {
        "Grey Structure": settings.construction.greyStructurePerSqFt,
        "Turnkey Industrial": settings.construction.turnkeyPerSqFt,
        "Industrial Shed": settings.construction.industrialShedPerSqFt,
      };
      const r = rates[constStructureType] || 2300;
      const total = Math.round(constAreaSqFt * r);

      items = [
        {
          id: "li-gen-1",
          description: `Structural Fabrication & Erection: ${constStructureType} (${constAreaSqFt} sq.ft)`,
          trade: "Industrial Fabrication",
          quantity: constAreaSqFt,
          unit: "sq.ft",
          unitPrice: r,
          amount: total
        }
      ];
    }

    setLineItems(items);
  }, [
    selectedTrade,
    printMaterial,
    printWeightGrams,
    printHours,
    printInfill,
    printFinish,
    laserMaterial,
    laserAreaSqCm,
    laserCutMeters,
    laserPierces,
    cncMetal,
    cncVolumeCc,
    cncMachiningHours,
    cncFixtures,
    cncCamProgramming,
    cadHours,
    cadComplexity,
    cadRevisions,
    constAreaSqFt,
    constStructureType,
    settings
  ]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const total = Math.max(0, subtotal - discount);

  const rawAdvance = isManualAdvance && customAdvancePkr !== null
    ? customAdvancePkr
    : Math.round(total * (advancePercent / 100));

  const isAdvanceExceeded = total > 0 && isManualAdvance && customAdvancePkr !== null && customAdvancePkr > total;
  const isAdvanceNegative = isManualAdvance && customAdvancePkr !== null && customAdvancePkr < 0;

  const advanceRequired = total <= 0 ? 0 : Math.min(total, Math.max(0, rawAdvance));
  const balanceDue = Math.max(0, total - advanceRequired);
  const calculatedAdvancePercent = total > 0 ? Math.round((advanceRequired / total) * 100) : advancePercent;

  // Handle Quote Generation
  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + validDays);

    if (clientMode === "walkin") {
      if (!walkinName.trim() || !walkinPhone.trim()) {
        alert("Please enter the client full name and WhatsApp phone number.");
        return;
      }

      const title = quoteTitle.trim() || `${selectedTrade} Custom Order for ${walkinName.trim()}`;

      const { quote: createdQuote, contact: createdContact } = createQuoteWithNewContact(
        {
          title,
          trade: selectedTrade,
          status: "sent",
          currency: "PKR",
          date: today.toISOString().split("T")[0],
          validUntil: validUntilDate.toISOString().split("T")[0],
          specs: {
            trade: selectedTrade,
            material: printMaterial,
            weightGrams: printWeightGrams,
            sheetMaterial: laserMaterial,
            metalType: cncMetal,
            complexity: cadComplexity,
          },
          lineItems: lineItems,
          subtotal: subtotal,
          discount: discount,
          total: total,
          advancePercent: calculatedAdvancePercent,
          advanceRequired: advanceRequired,
          notes: notes,
          terms: `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`,
        },
        {
          name: walkinName.trim(),
          phone: walkinPhone.trim(),
          company: walkinCompany.trim(),
          city: walkinCity.trim() || "Multan"
        }
      );

      setSelectedContactId(createdContact.id);
      setSelectedQuoteForPreview(createdQuote);
      setActiveTab("list");
      return;
    }

    const contact = contacts.find((c) => c.id === selectedContactId);
    if (!contact) {
      alert("Please select a registered client or switch to New Client mode.");
      return;
    }

    const title = quoteTitle.trim() || `${selectedTrade} Custom Order for ${contact.name}`;

    const created = createQuote({
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactCompany: contact.company,
      title: title,
      trade: selectedTrade,
      status: "sent",
      currency: "PKR",
      date: today.toISOString().split("T")[0],
      validUntil: validUntilDate.toISOString().split("T")[0],
      specs: {
        trade: selectedTrade,
        material: printMaterial,
        weightGrams: printWeightGrams,
        sheetMaterial: laserMaterial,
        metalType: cncMetal,
        complexity: cadComplexity,
      },
      lineItems: lineItems,
      subtotal: subtotal,
      discount: discount,
      total: total,
      advancePercent: calculatedAdvancePercent,
      advanceRequired: advanceRequired,
      notes: notes,
      terms: `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`,
    });

    setSelectedQuoteForPreview(created);
    setActiveTab("list");
  };

  const handleOpenEditModal = (quote: Quote) => {
    setEditingQuote(quote);
    setEditTitle(quote.title);
    setEditTrade(quote.trade);
    setEditLineItems([...(quote.lineItems || [])]);
    setEditDiscount(quote.discount || 0);
    setEditAdvancePercent(quote.advancePercent || 50);
    setEditNotes(quote.notes || "");
    setEditTerms(quote.terms || "");
    setEditContactId(quote.contactId);
  };

  const handleAddEditLineItem = () => {
    const newItem: QuoteLineItem = {
      id: `li-custom-${Date.now()}`,
      description: "Custom Machining / Material Item",
      trade: editTrade,
      quantity: 1,
      unit: "pcs",
      unitPrice: 1000,
      amount: 1000
    };
    setEditLineItems(prev => [...prev, newItem]);
  };

  const handleUpdateEditLineItem = (index: number, field: keyof QuoteLineItem, value: any) => {
    setEditLineItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        item.amount = Math.round((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveEditLineItem = (index: number) => {
    setEditLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditedQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    const contact = contacts.find(c => c.id === editContactId) || {
      id: editingQuote.contactId,
      name: editingQuote.contactName,
      phone: editingQuote.contactPhone,
      company: editingQuote.contactCompany
    };

    const newSubtotal = editLineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const newTotal = Math.max(0, newSubtotal - editDiscount);
    const newAdvanceRequired = Math.round(newTotal * (editAdvancePercent / 100));
    const newBalanceDue = Math.max(0, newTotal - newAdvanceRequired);

    const updatedQuote: Quote = {
      ...editingQuote,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      contactCompany: contact.company,
      title: editTitle.trim() || editingQuote.title,
      trade: editTrade,
      lineItems: editLineItems,
      subtotal: newSubtotal,
      discount: editDiscount,
      total: newTotal,
      advancePercent: editAdvancePercent,
      advanceRequired: newAdvanceRequired,
      notes: editNotes,
      terms: editTerms || `${editAdvancePercent}% advance deposit (${formatCurrency(newAdvanceRequired)}) required. Remaining balance of ${formatCurrency(newBalanceDue)} payable upon delivery.`,
    };

    updateQuote(updatedQuote);
    if (selectedQuoteForPreview?.id === updatedQuote.id) {
      setSelectedQuoteForPreview(updatedQuote);
    }
    setEditingQuote(null);
  };

  const handleOpenConvertModal = (quote: Quote) => {
    setConvertModalQuote(quote);
    setConvertDeadline(quote.validUntil);
  };

  const handleConfirmConvert = () => {
    if (!convertModalQuote) return;
    const job = convertQuoteToJob(
      convertModalQuote.id,
      convertDeadline,
      convertAdvanceReceived
    );
    setConvertModalQuote(null);
    if (onJobCreated) {
      onJobCreated(job.id);
    }
  };

  const handlePrint = () => {
    printIsolatedElement("quotation-print-area", `Quotation ${selectedQuoteForPreview?.id || "PAKMEC"}`);
  };

  const editSubtotal = editLineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const editTotal = Math.max(0, editSubtotal - editDiscount);
  const editAdvanceRequired = Math.round(editTotal * (editAdvancePercent / 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#fe7518]" />
              <span>Precision Auto-Quoter</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              Multan Workshop (PKR)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
            Calculate instant manufacturing estimates for walk-in leads or registered clients.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto bg-slate-100 dark:bg-[#161822] p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all ${
                activeTab === "generator" 
                  ? "bg-[#fe7518] text-slate-950 font-bold shadow-xs" 
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Quoter Generator
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all ${
                activeTab === "list" 
                  ? "bg-[#fe7518] text-slate-950 font-bold shadow-xs" 
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Saved Quotes ({activeQuotes.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "generator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
          {/* Left Form: Step 1, 2, 3 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Manufacturing Domain */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>Select Manufacturing Domain</span>
                </span>
                <span className="text-xs font-semibold text-[#fe7518]">PKR Currency Engine</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "3D Printing", icon: Layers, desc: "FDM & SLA Resin" },
                  { name: "Laser Cutting", icon: Flame, desc: "Acrylic, MDF & Sheet" },
                  { name: "CNC Machining", icon: Cpu, desc: "6061 Billet & Brass" },
                  { name: "CAD Design", icon: Compass, desc: "SolidWorks & Drawings" },
                  { name: "Industrial Fabrication", icon: Building2, desc: "Structural & Sheds" },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedTrade === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTrade(t.name as TradeType)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "bg-orange-50/60 dark:bg-[#1f2433] border-[#fe7518] shadow-xs ring-1 ring-[#fe7518]/30" 
                          : "bg-white dark:bg-[#161822] border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2.5 ${isSelected ? "text-[#fe7518]" : "text-slate-500 dark:text-zinc-400"}`} />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100">{t.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Technical Parameters */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>{selectedTrade} Parameters</span>
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live Auto-Pricing</span>
              </div>

              {/* 3D Printing Fields */}
              {selectedTrade === "3D Printing" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Filament / Resin Material</label>
                    <select
                      value={printMaterial}
                      onChange={(e) => setPrintMaterial(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="PLA">PLA Standard (PKR 4.5/g)</option>
                      <option value="PETG">PETG High-Strength (PKR 6.5/g)</option>
                      <option value="ABS">ABS Heat-Resistant (PKR 7.0/g)</option>
                      <option value="Resin">High-Detail SLA Resin (PKR 18.0/g)</option>
                      <option value="TPU">TPU Flexible (PKR 10.0/g)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Part Weight (Grams)</label>
                    <input
                      type="number"
                      min={1}
                      value={printWeightGrams}
                      onChange={(e) => setPrintWeightGrams(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Estimated Print Time (Hours)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={printHours}
                      onChange={(e) => setPrintHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Infill Density (%)</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={printInfill}
                      onChange={(e) => setPrintInfill(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Surface Post-Processing</label>
                    <select
                      value={printFinish}
                      onChange={(e) => setPrintFinish(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="None">None (Standard Support Removal only)</option>
                      <option value="Sanding & Deburr">Sanding & Deburr (+PKR 400)</option>
                      <option value="Vapor Smoothing">Acetone Vapor Smoothing (+PKR 900)</option>
                      <option value="Industrial Paint Finish">Industrial Primer & Matte Black Paint (+PKR 1,500)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Laser Cutting Fields */}
              {selectedTrade === "Laser Cutting" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Sheet Substrate & Thickness</label>
                    <select
                      value={laserMaterial}
                      onChange={(e) => setLaserMaterial(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="Acrylic 3mm Clear">Cast Acrylic 3mm Clear (PKR 0.7/cm²)</option>
                      <option value="Acrylic 5mm Cast">Cast Acrylic 5mm Frosted (PKR 1.2/cm²)</option>
                      <option value="MDF 3mm Sheet">MDF Laser Wood 3mm (PKR 0.35/cm²)</option>
                      <option value="Mild Steel Sheet 1.5mm">Mild Steel 1.5mm (PKR 1.8/cm²)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Material Area (cm²)</label>
                    <input
                      type="number"
                      min={10}
                      value={laserAreaSqCm}
                      onChange={(e) => setLaserAreaSqCm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Cut Path Length (Meters)</label>
                    <input
                      type="number"
                      min={1}
                      value={laserCutMeters}
                      onChange={(e) => setLaserCutMeters(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Pierce / Lead-in Points</label>
                    <input
                      type="number"
                      min={1}
                      value={laserPierces}
                      onChange={(e) => setLaserPierces(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* CNC Machining Fields */}
              {selectedTrade === "CNC Machining" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Billet Alloy / Stock</label>
                    <select
                      value={cncMetal}
                      onChange={(e) => setCncMetal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="Aluminum 6061-T6">Aluminum 6061-T6 (PKR 20/cm³)</option>
                      <option value="Brass C360">Brass C360 Free-Cutting (PKR 42/cm³)</option>
                      <option value="Delrin / Acetal">Delrin / Acetal Polymer (PKR 14/cm³)</option>
                      <option value="Carbon Steel 1018">Carbon Steel 1018 (PKR 12/cm³)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Stock Envelope Volume (cm³ / cc)</label>
                    <input
                      type="number"
                      min={10}
                      value={cncVolumeCc}
                      onChange={(e) => setCncVolumeCc(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Machine Run Time (Hours)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={cncMachiningHours}
                      onChange={(e) => setCncMachiningHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Fixtures & Setup Count</label>
                    <input
                      type="number"
                      min={1}
                      value={cncFixtures}
                      onChange={(e) => setCncFixtures(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="camCheck"
                      checked={cncCamProgramming}
                      onChange={(e) => setCncCamProgramming(e.target.checked)}
                      className="w-4 h-4 accent-[#fe7518] rounded cursor-pointer"
                    />
                    <label htmlFor="camCheck" className="text-slate-800 dark:text-zinc-200 font-semibold cursor-pointer text-xs">
                      Include Mastercam Toolpath Programming & Verification (+PKR {settings.cnc.camProgrammingFee})
                    </label>
                  </div>
                </div>
              )}

              {/* CAD Design Fields */}
              {selectedTrade === "CAD Design" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Project Complexity</label>
                    <select
                      value={cadComplexity}
                      onChange={(e) => setCadComplexity(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="Simple">Simple (Basic bracket or 2D profile - PKR {settings.cad.hourlyRatePkr}/hr)</option>
                      <option value="Medium">Medium (Multi-component assembly - PKR {Math.round(settings.cad.hourlyRatePkr * 1.35)}/hr)</option>
                      <option value="Complex">Complex (Full mechanism assembly, FEA study - PKR {Math.round(settings.cad.hourlyRatePkr * 1.85)}/hr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Estimated Engineering Hours</label>
                    <input
                      type="number"
                      min={1}
                      value={cadHours}
                      onChange={(e) => setCadHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Included Revision Cycles</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={cadRevisions}
                      onChange={(e) => setCadRevisions(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Fabrication Fields */}
              {selectedTrade === "Industrial Fabrication" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Structure Grade</label>
                    <select
                      value={constStructureType}
                      onChange={(e) => setConstStructureType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                    >
                      <option value="Industrial Shed">Industrial Shed Steel Truss (PKR 2,300/sqft)</option>
                      <option value="Grey Structure">Heavy Commercial Grey Structure (PKR 1,850/sqft)</option>
                      <option value="Turnkey Industrial">Turnkey Complete Finishing (PKR 3,600/sqft)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Total Covered Area (Sq.Ft)</label>
                    <input
                      type="number"
                      min={100}
                      value={constAreaSqFt}
                      onChange={(e) => setConstAreaSqFt(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Client & Commercial Terms */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[11px] font-bold">3</span>
                  <span>Client & Deposit Terms</span>
                </span>
                
                {/* Segmented Client Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#161822] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      clientMode === "existing"
                        ? "bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#fe7518]" />
                    <span>Registered Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode("walkin")}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      clientMode === "walkin"
                        ? "bg-[#fe7518] text-slate-950 shadow-xs font-bold"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Walk-in Lead</span>
                  </button>
                </div>
              </div>

              {clientMode === "existing" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Target Client *</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-medium"
                    >
                      {activeContacts.length === 0 ? (
                        <option value="">No registered clients. Switch to Walk-in Lead mode.</option>
                      ) : (
                        activeContacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.company ? `(${c.company})` : ""} - {c.city}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Quotation Title / Ref</label>
                    <input
                      type="text"
                      value={quoteTitle}
                      onChange={(e) => setQuoteTitle(e.target.value)}
                      placeholder="e.g. 50x Drone Motor Mounts CNC 6061"
                      className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-orange-50/40 dark:bg-[#181a24] border border-orange-200 dark:border-[#2c3244]">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#fe7518]" />
                    <span>Instant Direct Client Registration</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Client Full Name *</label>
                      <input
                        type="text"
                        required
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="e.g. Tariq Mahmood"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">WhatsApp Phone *</label>
                      <input
                        type="text"
                        required
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        placeholder="e.g. 0300 1234567"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Company (Optional)</label>
                      <input
                        type="text"
                        value={walkinCompany}
                        onChange={(e) => setWalkinCompany(e.target.value)}
                        placeholder="e.g. AeroDynamics Multan"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">City</label>
                      <input
                        type="text"
                        value={walkinCity}
                        onChange={(e) => setWalkinCity(e.target.value)}
                        placeholder="Multan"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advance Deposit Presets + Custom Amount */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Advance Deposit Terms
                  </label>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-900 text-white dark:bg-zinc-800 dark:text-zinc-200">
                    {calculatedAdvancePercent}% Deposit Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                      PKR
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={total}
                      step={100}
                      value={isManualAdvance && customAdvancePkr !== null ? customAdvancePkr : (total > 0 ? advanceRequired : "")}
                      placeholder="e.g. 5000"
                      onChange={(e) => {
                        setIsManualAdvance(true);
                        const val = e.target.value;
                        setCustomAdvancePkr(val === "" ? null : Number(val));
                      }}
                      className="w-full pl-12 pr-3 py-2 bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-semibold text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6 flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: "0%", pct: 0 },
                      { label: "30%", pct: 30 },
                      { label: "50%", pct: 50 },
                      { label: "70%", pct: 70 },
                      { label: "100%", pct: 100 },
                    ].map((item) => {
                      const isCurrent = !isAdvanceExceeded && !isAdvanceNegative && (
                        isManualAdvance ? calculatedAdvancePercent === item.pct : advancePercent === item.pct
                      );
                      return (
                        <button
                          key={item.pct}
                          type="button"
                          onClick={() => {
                            setAdvancePercent(item.pct);
                            setIsManualAdvance(false);
                            setCustomAdvancePkr(Math.round(total * (item.pct / 100)));
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-[#fe7518] text-slate-950 shadow-xs"
                              : "bg-white dark:bg-[#141620] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:border-slate-400"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <span>Advance: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(advanceRequired)}</strong></span>
                  <span>Balance Due: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(balanceDue)}</strong></span>
                </div>
              </div>

              {/* Discount & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Discount Amount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={validDays}
                    onChange={(e) => setValidDays(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Estimate & Issue (Sticky 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-5 sticky top-20 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Quotation Breakdown</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-[#fe7518]">
                  {lineItems.length} items
                </span>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {lineItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800 space-y-1">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-800 dark:text-zinc-200 font-medium leading-tight">{item.description}</span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between pt-1">
                      <span>{item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}/{item.unit}</span>
                      <span className="text-[#fe7518] font-semibold">{item.trade}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c0d12] border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                  <span>Subtotal Calculated:</span>
                  <CurrencyDisplay amount={subtotal} size="sm" />
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Discount Applied:</span>
                    <CurrencyDisplay amount={-discount} size="sm" numberColor="text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex items-center justify-between text-base font-bold text-slate-900 dark:text-white pt-2.5 border-t border-slate-200 dark:border-zinc-800">
                  <span className="text-[#fe7518]">Total:</span>
                  <CurrencyDisplay amount={total} size="lg" numberColor="text-[#fe7518]" />
                </div>

                <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#151824] border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs font-semibold">
                  <span>Advance Due ({calculatedAdvancePercent}%):</span>
                  <CurrencyDisplay amount={advanceRequired} size="sm" numberColor="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleCreateQuote}
                className="w-full flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 py-3 px-4 rounded-xl font-bold text-sm shadow-sm border border-[#e56208] btn-haptic"
              >
                <FileText className="w-4 h-4" />
                <span>Save & Issue Quotation</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Quotes View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quotes List (4 Cols) */}
            <div className="lg:col-span-4 space-y-3 no-print">
              <h2 className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Saved Quotations ({activeQuotes.length})
              </h2>

              <div className="space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                {activeQuotes.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-2">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Quotations Generated</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configure trade parameters to generate instant estimates.
                    </p>
                  </div>
                ) : (
                  activeQuotes.map((q) => {
                    const isSelected = selectedQuoteForPreview?.id === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSelectedQuoteForPreview(q);
                          setQuotesMobileTab("preview");
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected 
                            ? "bg-white dark:bg-[#1c202d] border-[#fe7518] shadow-xs ring-1 ring-[#fe7518]/40" 
                            : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-[#161822]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#fe7518] font-mono">{q.id}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] uppercase font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {q.status}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              title="Edit Quotation"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {q.title}
                        </div>

                        <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between font-medium">
                          <span>{q.contactName}</span>
                          <CurrencyDisplay amount={q.total} size="sm" color="orange" />
                        </div>

                        {q.convertedToJobId ? (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Converted to {q.convertedToJobId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConvertModal(q);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <span>Start Job</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Branded Quotation Preview (8 Cols) */}
            <div className="lg:col-span-8">
              {selectedQuoteForPreview ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white dark:bg-[#12141c] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-zinc-400">Previewing:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm">{selectedQuoteForPreview.id}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOpenEditModal(selectedQuoteForPreview)}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold py-2 px-3.5 rounded-xl btn-haptic"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                        <span>Edit Quote</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold py-2 px-4 rounded-xl shadow-xs border border-[#e56208] btn-haptic"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Quotation</span>
                      </button>

                      {!selectedQuoteForPreview.convertedToJobId && (
                        <button
                          onClick={() => handleOpenConvertModal(selectedQuoteForPreview)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-xl btn-haptic"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Start Production</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Isolated Printable Quotation */}
                  <div 
                    id="quotation-print-area"
                    className="printable-document bg-white text-black p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-200 print-surface font-sans space-y-8 min-h-[750px]"
                  >
                    <div className="print-header flex items-start justify-between border-b-2 border-black pb-5 gap-4">
                      <div className="space-y-1">
                        <div className="w-48 h-auto">
                          <img 
                            src="/pakmec-logo.png" 
                            alt="PAKMEC Engineering" 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-700 tracking-wide pt-1 font-medium">
                          {settings.company.tagline}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          {settings.company.address.replace(/\s+,/g, ",")} • {settings.company.phone}
                        </p>
                      </div>

                      <div className="print-title-col text-right shrink-0 whitespace-nowrap">
                        <div className="text-2xl font-black text-black">QUOTATION</div>
                        <div className="text-sm font-bold text-[#c2410c] font-mono">{selectedQuoteForPreview.id}</div>
                        <div className="text-xs text-gray-700 mt-1 whitespace-nowrap">
                          Date:&nbsp;<span className="font-semibold text-gray-900">{selectedQuoteForPreview.date}</span>
                        </div>
                        <div className="text-xs text-gray-700 whitespace-nowrap">
                          Valid Until:&nbsp;<span className="font-semibold text-gray-900">{selectedQuoteForPreview.validUntil}</span>
                        </div>
                      </div>
                    </div>

                    <div className="print-meta-grid grid grid-cols-2 gap-6 text-xs">
                      <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">Client / Organization</span>
                        <div className="font-bold text-sm text-black">{selectedQuoteForPreview.contactName}</div>
                        {selectedQuoteForPreview.contactCompany && (
                          <div className="text-gray-700">{selectedQuoteForPreview.contactCompany}</div>
                        )}
                        <div className="text-gray-600 font-mono">{selectedQuoteForPreview.contactPhone}</div>
                      </div>

                      <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                        <span className="font-bold text-gray-500 uppercase text-[10px]">Trade Domain</span>
                        <div className="font-bold text-sm text-[#c2410c]">{selectedQuoteForPreview.trade}</div>
                        <div className="text-gray-700">{selectedQuoteForPreview.title}</div>
                        <div className="text-gray-600 text-[11px]">Advance Term: {selectedQuoteForPreview.advancePercent}% Required</div>
                      </div>
                    </div>

                    <div>
                      <table className="print-table w-full text-left text-xs border-collapse">
                        <colgroup>
                          <col style={{ width: "5%" }} />
                          <col style={{ width: "50%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "17%" }} />
                          <col style={{ width: "18%" }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b-2 border-black text-[11px] text-gray-700 font-bold">
                            <th className="py-2.5 px-2 text-center">#</th>
                            <th className="py-2.5 px-2 text-left">Item & Description</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Qty</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Unit Rate (PKR)</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Amount (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedQuoteForPreview.lineItems.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td className="py-3 px-2 text-gray-500 text-center">{idx + 1}</td>
                              <td className="py-3 px-2 font-medium text-black">
                                {item.description}
                                <div className="text-[10px] text-gray-500">{item.trade}</div>
                              </td>
                              <td className="py-3 px-2 text-right text-gray-800 whitespace-nowrap">{item.quantity} {item.unit}</td>
                              <td className="py-3 px-2 text-right text-gray-800 tabular-nums whitespace-nowrap font-mono">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-3 px-2 text-right font-bold text-black tabular-nums whitespace-nowrap font-mono">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="print-bottom border-t-2 border-black pt-4 flex flex-col sm:flex-row justify-between gap-6">
                      <div className="print-audit-col max-w-md space-y-2 text-xs">
                        <span className="font-bold text-[10px] uppercase text-gray-600">Terms & Payment Details (Multan)</span>
                        <p className="text-gray-700 leading-relaxed text-[11px]">
                          {selectedQuoteForPreview.terms}
                        </p>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] text-gray-600 space-y-0.5 font-mono">
                          <div><strong>Bank:</strong> {settings.company.bankName}</div>
                          <div><strong>Title:</strong> {settings.company.bankAccountTitle}</div>
                          <div><strong>IBAN:</strong> {settings.company.bankIban}</div>
                          <div><strong>JazzCash / EasyPaisa:</strong> {settings.company.jazzCashNumber}</div>
                        </div>
                      </div>

                      <div className="print-totals-col w-84 sm:w-[350px] min-w-[340px] space-y-2 text-xs">
                        <div className="flex justify-between items-baseline gap-3 text-gray-700 whitespace-nowrap">
                          <span>Subtotal:</span>
                          <span className="tabular-nums font-bold text-right font-mono">{formatCurrency(selectedQuoteForPreview.subtotal)}</span>
                        </div>
                        {selectedQuoteForPreview.discount > 0 && (
                          <div className="flex justify-between items-baseline gap-3 text-emerald-700 font-semibold whitespace-nowrap">
                            <span>Discount:</span>
                            <span className="tabular-nums text-right font-bold font-mono">{formatCurrency(-selectedQuoteForPreview.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline gap-3 text-base font-black text-black border-t border-black pt-2 whitespace-nowrap">
                          <span>Total:</span>
                          <span className="tabular-nums text-[#c2410c] text-right font-mono">
                            {formatCurrency(selectedQuoteForPreview.total)}
                          </span>
                        </div>

                        <div className="p-2.5 rounded bg-slate-100 border-2 border-slate-900 mt-2">
                          <div className="flex justify-between items-baseline gap-3 font-bold text-xs text-slate-950 whitespace-nowrap">
                            <span>{selectedQuoteForPreview.advancePercent}% Advance Due:</span>
                            <span className="tabular-nums text-right font-black font-mono">
                              {formatCurrency(selectedQuoteForPreview.advanceRequired)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-500 pt-4 border-t border-gray-200">
                      PAKMEC Precision Engineering • Multan, Pakistan • www.pakmec.com
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Edit Quotation Modal */}
      {editingQuote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-white dark:bg-[#12141c] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#fe7518]" />
                  <span>Edit Quotation ({editingQuote.id})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Modify line items, quantities, rates, discounts, or terms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Quotation Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Manufacturing Trade</label>
                  <select
                    value={editTrade}
                    onChange={(e) => setEditTrade(e.target.value as TradeType)}
                    className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm"
                  >
                    <option value="CNC Machining">CNC Machining</option>
                    <option value="3D Printing">3D Printing</option>
                    <option value="Laser Cutting">Laser Cutting</option>
                    <option value="CAD Design">CAD Design</option>
                    <option value="Industrial Fabrication">Industrial Fabrication</option>
                  </select>
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">Line Items & Rates</label>
                  <button
                    type="button"
                    onClick={handleAddEditLineItem}
                    className="flex items-center gap-1 text-xs font-bold text-[#fe7518] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editLineItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.description}
                          placeholder="Item Description"
                          onChange={(e) => handleUpdateEditLineItem(idx, "description", e.target.value)}
                          className="flex-1 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditLineItem(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                          title="Remove Line Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">Qty & Unit</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateEditLineItem(idx, "quantity", Number(e.target.value))}
                              className="w-16 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateEditLineItem(idx, "unit", e.target.value)}
                              className="w-14 bg-white dark:bg-[#12141c] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-zinc-700 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">Rate (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateEditLineItem(idx, "unitPrice", Number(e.target.value))}
                            className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">Amount (PKR)</label>
                          <div className="p-1 bg-slate-100 dark:bg-[#12141c] rounded text-xs font-bold text-slate-900 dark:text-zinc-100 text-right">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount & Advance % */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-white p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Advance Deposit (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editAdvancePercent}
                    onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-white p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#0c0d12] border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Total: </span>
                  <strong className="text-[#fe7518] text-sm">{formatCurrency(editTotal)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Advance: </span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(editAdvanceRequired)}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-bold shadow-xs btn-haptic"
                >
                  Save Changes to Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Job Modal */}
      {convertModalQuote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#12141c] border border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#fe7518]" />
                <span>Approve Quote & Start Production</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Converts {convertModalQuote.id} into an active Job on the Kanban board.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#181a24] rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <div className="text-slate-900 dark:text-white font-bold text-sm">{convertModalQuote.title}</div>
                <div className="text-[#fe7518] font-semibold">Client: {convertModalQuote.contactName}</div>
                <div className="text-slate-600 dark:text-zinc-400">
                  Total: {formatCurrency(convertModalQuote.total)} | Advance: {formatCurrency(convertModalQuote.advanceRequired)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Target Completion Deadline</label>
                <input
                  type="date"
                  value={convertDeadline}
                  onChange={(e) => setConvertDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161822] text-slate-900 dark:text-white p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-semibold text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#181b24] border border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="advanceRec"
                  checked={convertAdvanceReceived}
                  onChange={(e) => setConvertAdvanceReceived(e.target.checked)}
                  className="w-4 h-4 accent-[#fe7518] rounded cursor-pointer"
                />
                <label htmlFor="advanceRec" className="cursor-pointer">
                  <span className="text-slate-900 dark:text-white font-bold block">
                    Advance Deposit of {formatCurrency(convertModalQuote.advanceRequired)} Received
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Marks deposit as collected and deducts from final invoice balance
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConvertModalQuote(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-4 py-2 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-bold text-xs shadow-xs btn-haptic"
              >
                Start Production Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
