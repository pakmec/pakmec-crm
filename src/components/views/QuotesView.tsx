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
  Building,
  FileText,
  AlertCircle,
  ChevronLeft,
  Edit,
  Trash2,
  UserPlus,
  Users,
  X
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
          description: `Fixture Clamping & Soft-Jaw Calibrations (${cncFixtures} operations)`,
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

    // Existing client mode
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

  // Open Edit Quote Modal
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

  // Add Custom Line Item in Edit Modal
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

  // Update Line Item in Edit Modal
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

  // Remove Line Item in Edit Modal
  const handleRemoveEditLineItem = (index: number) => {
    setEditLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Save Edited Quote
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

  // Edit Modal Totals Calculation
  const editSubtotal = editLineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const editTotal = Math.max(0, editSubtotal - editDiscount);
  const editAdvanceRequired = Math.round(editTotal * (editAdvancePercent / 100));

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5 sm:pb-6 no-print">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#fe7518]" />
              <span>PAKMEC Auto-Quoter</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-[#161922] dark:text-zinc-100 border border-slate-800 dark:border-[#2a3040] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518]" />
              Multan Workshop
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 mt-1">
            Calculate precision manufacturing costs in Pakistani Rupees for walk-in leads or registered clients.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto bg-slate-100 dark:bg-[#14161f] p-1 rounded-lg border border-slate-300 dark:border-[#232734] flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab("generator")}
              className={`flex-1 sm:flex-initial px-4 py-2 min-h-[40px] rounded-md font-bold transition-colors flex items-center justify-center btn-haptic touch-manipulation ${
                activeTab === "generator" 
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-sm" 
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Quoter Generator
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 sm:flex-initial px-4 py-2 min-h-[40px] rounded-md font-bold transition-colors flex items-center justify-center btn-haptic touch-manipulation ${
                activeTab === "list" 
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-sm" 
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Saved Quotes ({activeQuotes.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "generator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
          {/* Left Form (7 Cols): Trade Selector & Parameter Inputs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Trade Domain */}
            <div className="bg-white dark:bg-[#12141a] p-5 rounded-xl border border-slate-200 dark:border-[#222735] space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-bold">
                  Step 1: Select Manufacturing Domain
                </span>
                <span className="text-xs font-mono font-bold text-[#fe7518]">PKR Currency Engine</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: "3D Printing", icon: Layers, desc: "FDM & SLA Resin" },
                  { name: "Laser Cutting", icon: Flame, desc: "Acrylic, MDF & Sheet" },
                  { name: "CNC Machining", icon: Cpu, desc: "6061 Billet & Brass" },
                  { name: "CAD Design", icon: Compass, desc: "SolidWorks & Drawings" },
                  { name: "Industrial Fabrication", icon: Building, desc: "Structural & Sheds" },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedTrade === t.name;
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => setSelectedTrade(t.name as TradeType)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "bg-orange-50/50 dark:bg-[#1f2433] border-2 border-[#fe7518] text-slate-950 dark:text-white shadow-sm ring-1 ring-[#fe7518]/30" 
                          : "bg-white dark:bg-[#161821] border border-slate-300 dark:border-[#242938] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-2 ${isSelected ? "text-[#fe7518]" : "text-slate-600 dark:text-zinc-400"}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t.name}</div>
                        <div className="text-[11px] text-slate-600 dark:text-zinc-400">{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Trade-Specific Spec Fields */}
            <div className="bg-white dark:bg-[#12141a] p-5 rounded-xl border border-slate-200 dark:border-[#222735] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#202533] pb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#fe7518]" />
                  <span>{selectedTrade} Calculation Parameters</span>
                </h2>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">All in PKR</span>
              </div>

              {/* 3D Printing Fields */}
              {selectedTrade === "3D Printing" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Filament / Resin Material</label>
                    <select
                      value={printMaterial}
                      aria-label="Filament or Resin Material"
                      onChange={(e) => setPrintMaterial(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    >
                      <option value="PLA">PLA Standard (PKR 4.5/g)</option>
                      <option value="PETG">PETG High-Strength (PKR 6.5/g)</option>
                      <option value="ABS">ABS Heat-Resistant (PKR 7.0/g)</option>
                      <option value="Resin">High-Detail SLA Resin (PKR 18.0/g)</option>
                      <option value="TPU">TPU Flexible (PKR 10.0/g)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Part Weight (Grams)</label>
                    <input
                      type="number"
                      aria-label="Part Weight in Grams"
                      min={1}
                      value={printWeightGrams}
                      onChange={(e) => setPrintWeightGrams(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Estimated Print Time (Hours)</label>
                    <input
                      type="number"
                      aria-label="Estimated Print Time in Hours"
                      min={0.5}
                      step={0.5}
                      value={printHours}
                      onChange={(e) => setPrintHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Infill Density (%)</label>
                    <input
                      type="number"
                      aria-label="Infill Density Percentage"
                      min={10}
                      max={100}
                      value={printInfill}
                      onChange={(e) => setPrintInfill(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Surface Post-Processing</label>
                    <select
                      value={printFinish}
                      aria-label="Surface Post-Processing Finish"
                      onChange={(e) => setPrintFinish(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
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
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Sheet Substrate & Thickness</label>
                    <select
                      value={laserMaterial}
                      aria-label="Sheet Substrate and Thickness"
                      onChange={(e) => setLaserMaterial(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    >
                      <option value="Acrylic 3mm Clear">Cast Acrylic 3mm Clear (PKR 0.7/cm²)</option>
                      <option value="Acrylic 5mm Cast">Cast Acrylic 5mm Frosted (PKR 1.2/cm²)</option>
                      <option value="MDF 3mm Sheet">MDF Laser Wood 3mm (PKR 0.35/cm²)</option>
                      <option value="Mild Steel Sheet 1.5mm">Mild Steel 1.5mm (PKR 1.8/cm²)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Material Area (cm²)</label>
                    <input
                      type="number"
                      aria-label="Material Area in Square Centimeters"
                      min={10}
                      value={laserAreaSqCm}
                      onChange={(e) => setLaserAreaSqCm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Cut Path Length (Meters)</label>
                    <input
                      type="number"
                      aria-label="Cut Path Length in Meters"
                      min={1}
                      value={laserCutMeters}
                      onChange={(e) => setLaserCutMeters(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Pierce / Lead-in Points</label>
                    <input
                      type="number"
                      aria-label="Pierce and Lead-in Points"
                      min={1}
                      value={laserPierces}
                      onChange={(e) => setLaserPierces(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* CNC Machining Fields */}
              {selectedTrade === "CNC Machining" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Billet Alloy / Stock</label>
                    <select
                      value={cncMetal}
                      aria-label="Billet Alloy or Stock Material"
                      onChange={(e) => setCncMetal(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    >
                      <option value="Aluminum 6061-T6">Aluminum 6061-T6 (PKR 20/cm³)</option>
                      <option value="Brass C360">Brass C360 Free-Cutting (PKR 42/cm³)</option>
                      <option value="Delrin / Acetal">Delrin / Acetal Polymer (PKR 14/cm³)</option>
                      <option value="Carbon Steel 1018">Carbon Steel 1018 (PKR 12/cm³)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Stock Envelope Volume (cm³ / cc)</label>
                    <input
                      type="number"
                      min={10}
                      value={cncVolumeCc}
                      aria-label="Stock Envelope Volume in cubic centimeters"
                      onChange={(e) => setCncVolumeCc(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Machine Run Time (Hours)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={cncMachiningHours}
                      aria-label="Machine Run Time in Hours"
                      onChange={(e) => setCncMachiningHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Fixtures & Setup Count</label>
                    <input
                      type="number"
                      min={1}
                      value={cncFixtures}
                      aria-label="Fixtures and Setup Count"
                      onChange={(e) => setCncFixtures(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
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
                    <label htmlFor="camCheck" className="text-slate-800 dark:text-zinc-200 font-medium cursor-pointer text-xs">
                      Include Mastercam Toolpath Programming & Verification (+PKR {settings.cnc.camProgrammingFee})
                    </label>
                  </div>
                </div>
              )}

              {/* CAD Design Fields */}
              {selectedTrade === "CAD Design" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Project Complexity</label>
                    <select
                      value={cadComplexity}
                      aria-label="Project Complexity"
                      onChange={(e) => setCadComplexity(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    >
                      <option value="Simple">Simple (Basic bracket or 2D profile - PKR {settings.cad.hourlyRatePkr}/hr)</option>
                      <option value="Medium">Medium (Multi-component assembly - PKR {Math.round(settings.cad.hourlyRatePkr * 1.35)}/hr)</option>
                      <option value="Complex">Complex (Full mechanism assembly, FEA study - PKR {Math.round(settings.cad.hourlyRatePkr * 1.85)}/hr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Estimated Engineering Hours</label>
                    <input
                      type="number"
                      min={1}
                      value={cadHours}
                      aria-label="Estimated Engineering Hours"
                      onChange={(e) => setCadHours(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Included Revision Cycles</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={cadRevisions}
                      aria-label="Included Revision Cycles"
                      onChange={(e) => setCadRevisions(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Construction Fields */}
              {selectedTrade === "Industrial Fabrication" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Structure Grade / Category</label>
                    <select
                      value={constStructureType}
                      aria-label="Structure Grade or Category"
                      onChange={(e) => setConstStructureType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    >
                      <option value="Industrial Shed">Industrial Shed Steel Truss (PKR 2,300/sqft)</option>
                      <option value="Grey Structure">Heavy Commercial Grey Structure (PKR 1,850/sqft)</option>
                      <option value="Turnkey Industrial">Turnkey Complete Finishing (PKR 3,600/sqft)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Total Covered Area (Square Feet)</label>
                    <input
                      type="number"
                      min={100}
                      value={constAreaSqFt}
                      aria-label="Total Covered Area in Square Feet"
                      onChange={(e) => setConstAreaSqFt(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Client & Commercial Terms (With Walk-in Lead Support) */}
            <div className="bg-white dark:bg-[#12141a] p-5 rounded-xl border border-slate-200 dark:border-[#222735] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#202533] pb-3">
                <span className="text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-bold">
                  Step 3: Client & Advance Terms
                </span>
                {/* Client Mode Toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#161922] border border-slate-300 dark:border-[#272b38] text-xs">
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1.5 ${
                      clientMode === "existing"
                        ? "bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs border border-slate-300 dark:border-zinc-700"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#fe7518]" />
                    <span>Registered Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientMode("walkin")}
                    className={`px-3 py-1 rounded-md transition-all font-bold flex items-center gap-1.5 ${
                      clientMode === "walkin"
                        ? "bg-[#fe7518] text-slate-950 shadow-xs"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Walk-in / Direct Lead</span>
                  </button>
                </div>
              </div>

              {/* Client Selection vs Walk-in Input */}
              {clientMode === "existing" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Target Client (Multan Database) *</label>
                    <select
                      value={selectedContactId}
                      aria-label="Target Client from Multan Database"
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
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
                    <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Quotation Title / Ref</label>
                    <input
                      type="text"
                      value={quoteTitle}
                      aria-label="Quotation Title or Reference"
                      onChange={(e) => setQuoteTitle(e.target.value)}
                      placeholder="e.g. 50x Drone Motor Mounts CNC 6061"
                      className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 rounded-xl bg-orange-50/40 dark:bg-[#181a24] border border-orange-200 dark:border-[#2c3244]">
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#fe7518]" />
                    <span>Instant Direct Client Registration</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Client Full Name *</label>
                      <input
                        type="text"
                        required
                        value={walkinName}
                        onChange={(e) => setWalkinName(e.target.value)}
                        placeholder="e.g. Tariq Mahmood"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#282d3e] focus:border-[#fe7518] outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">WhatsApp Phone *</label>
                      <input
                        type="text"
                        required
                        value={walkinPhone}
                        onChange={(e) => setWalkinPhone(e.target.value)}
                        placeholder="e.g. 0300 1234567"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#282d3e] focus:border-[#fe7518] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Company / Workshop (Optional)</label>
                      <input
                        type="text"
                        value={walkinCompany}
                        onChange={(e) => setWalkinCompany(e.target.value)}
                        placeholder="e.g. AeroDynamics Multan"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#282d3e] focus:border-[#fe7518] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={walkinCity}
                        onChange={(e) => setWalkinCity(e.target.value)}
                        placeholder="Multan"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#282d3e] focus:border-[#fe7518] outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    This client will be automatically saved to your Multan database and linked to this quotation upon generation.
                  </p>
                </div>
              )}

              {/* Advance Deposit Terms */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-300 dark:border-[#272c3d] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label htmlFor="custom-advance-input" className="block text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Advance Deposit Required (PKR or %)
                    </label>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                      Enter custom deposit amount in PKR or select standard preset percentages.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white dark:bg-[#10121a] dark:text-zinc-100 border border-slate-700 dark:border-[#32394c]">
                    {calculatedAdvancePercent}% Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-mono font-bold text-slate-600 dark:text-zinc-400">
                      PKR
                    </div>
                    <input
                      id="custom-advance-input"
                      type="number"
                      min={0}
                      max={total}
                      step={100}
                      value={isManualAdvance && customAdvancePkr !== null ? customAdvancePkr : (total > 0 ? advanceRequired : "")}
                      aria-label="Advance Deposit Amount in Pakistani Rupees"
                      placeholder="e.g. 5000"
                      onChange={(e) => {
                        setIsManualAdvance(true);
                        const val = e.target.value;
                        if (val === "") {
                          setCustomAdvancePkr(null);
                        } else {
                          const num = Number(val);
                          setCustomAdvancePkr(isNaN(num) ? 0 : num);
                        }
                      }}
                      className="w-full pl-12 pr-3 py-2 bg-white dark:bg-[#12141c] text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-400 dark:border-[#272d3e] focus:border-[#fe7518] focus:outline-none font-mono font-bold text-sm"
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
                        isManualAdvance 
                          ? calculatedAdvancePercent === item.pct
                          : advancePercent === item.pct
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
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                            isCurrent
                              ? "bg-[#fe7518] text-slate-950 font-black shadow-sm scale-[1.02]"
                              : "bg-white dark:bg-[#141620] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#272d3f] hover:border-slate-900 dark:hover:border-[#fe7518]"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-700 dark:text-zinc-300 pt-2 border-t border-slate-200 dark:border-[#202533]">
                  <span>Deposit: <strong className="text-slate-950 dark:text-white font-bold">{formatCurrency(advanceRequired)}</strong> ({calculatedAdvancePercent}%)</span>
                  <span>Balance Due: <strong className="text-slate-950 dark:text-white font-bold">{formatCurrency(balanceDue)}</strong></span>
                </div>
              </div>

              {/* Discount & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Discount Amount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    aria-label="Discount Amount in Pakistani Rupees"
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Quotation Validity (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={validDays}
                    aria-label="Quotation Validity in Days"
                    onChange={(e) => setValidDays(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Quotation Terms & Delivery Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  aria-label="Quotation Terms and Delivery Notes"
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-zinc-100 p-2.5 rounded-lg border border-slate-300 dark:border-[#252a37] focus:border-[#fe7518] outline-none resize-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Right Live Calculation & Save (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#12141a] rounded-xl border border-slate-200 dark:border-[#222735] p-5 space-y-4 sticky top-20 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#202533] pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Auto-Calculated Line Items</h3>
                <span className="text-xs font-mono font-bold text-[#fe7518]">{lineItems.length} items</span>
              </div>

              {/* Itemized Table */}
              <div 
                tabIndex={0}
                aria-label="Itemized quotation line items"
                className="space-y-2.5 max-h-64 overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-[#fe7518]"
              >
                {lineItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-3 rounded-lg bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-[#212633] space-y-1">
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <span className="text-slate-900 dark:text-zinc-100 font-medium leading-tight">{item.description}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 tabular-nums">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 flex items-center justify-between pt-1">
                      <span>{item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}/{item.unit}</span>
                      <span className="text-[#fe7518] font-bold">{item.trade}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c0d12] border border-slate-200 dark:border-[#1e2330] space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-semibold">
                  <span>Subtotal Calculated:</span>
                  <CurrencyDisplay amount={subtotal} size="sm" />
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount Applied:</span>
                    <CurrencyDisplay amount={-discount} size="sm" numberColor="text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white pt-2.5 border-t border-slate-200 dark:border-[#1e2330]">
                  <span className="text-[#fe7518]">Quote Total:</span>
                  <CurrencyDisplay amount={total} size="lg" numberColor="text-[#fe7518]" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#151824] border border-slate-300 dark:border-[#272d3f] border-l-4 border-l-[#fe7518] space-y-1.5 mt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#fe7518]" />
                      Advance Required ({calculatedAdvancePercent}%):
                    </span>
                    <CurrencyDisplay amount={advanceRequired} size="sm" numberColor="text-[#fe7518]" />
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
                    Balance of <strong className="text-slate-950 dark:text-white font-bold">{formatCurrency(balanceDue)}</strong> due upon final Multan delivery.
                  </p>
                </div>
              </div>

              {/* Generate & Save Action */}
              <button
                type="button"
                onClick={handleCreateQuote}
                className="w-full flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 py-3 px-4 rounded-xl font-black text-sm shadow-sm border border-[#e56208] btn-haptic"
              >
                <FileText className="w-4 h-4" />
                <span>Save to Database & Issue Quote</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Quotes Tab & Clean Isolated Printable Sheet */
        <div className="space-y-4">
          {/* Mobile View Switcher Tab */}
          <div className="lg:hidden flex items-center gap-2 p-1 rounded-lg bg-slate-100 dark:bg-[#14161f] border border-slate-300 dark:border-[#232734] text-xs no-print">
            <button
              type="button"
              onClick={() => setQuotesMobileTab("list")}
              className={`flex-1 py-2 px-3 rounded-md font-bold min-h-[38px] flex items-center justify-center gap-1.5 touch-manipulation ${
                quotesMobileTab === "list"
                  ? "bg-[#fe7518] text-slate-950 shadow-sm"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quotes List ({activeQuotes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setQuotesMobileTab("preview")}
              disabled={!selectedQuoteForPreview}
              className={`flex-1 py-2 px-3 rounded-md font-bold min-h-[38px] flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-40 ${
                quotesMobileTab === "preview"
                  ? "bg-[#fe7518] text-slate-950 shadow-sm"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Quotation Sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quotes List (4 Cols) */}
            <div className={`lg:col-span-4 space-y-3 no-print ${quotesMobileTab === "preview" ? "hidden lg:block" : "block"}`}>
              <h2 className="text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-300 font-bold">
                Saved Quotations ({activeQuotes.length})
              </h2>

              <div 
                tabIndex={0}
                aria-label="Saved quotations list"
                className="space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 focus:outline-none focus:ring-1 focus:ring-[#fe7518]"
              >
                {activeQuotes.length === 0 ? (
                  <div className="p-6 text-left bg-white dark:bg-[#12141a] rounded-xl border border-slate-200 dark:border-[#222735] space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#1a1e28] text-[#fe7518] border border-slate-200 dark:border-[#2b3040] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">No Quotations Generated</h3>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        Configure trade parameters to automatically calculate PKR machine rates and issue quotes.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("generator")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-bold btn-haptic"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Launch Auto-Quoter</span>
                    </button>
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
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 min-h-[50px] touch-manipulation ${
                          isSelected 
                            ? "bg-white dark:bg-[#1c202d] border-2 border-[#fe7518] shadow-md ring-1 ring-[#fe7518]/50" 
                            : "bg-white dark:bg-[#12141a] border-slate-200 dark:border-[#222735] hover:bg-slate-50 dark:hover:bg-[#161821]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs sm:text-sm font-bold text-[#fe7518]">{q.id}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono uppercase font-bold px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700/60 bg-emerald-100 dark:bg-[#0d1f16] text-emerald-950 dark:text-emerald-300">
                              {q.status}
                            </span>
                            {/* Quick Edit Quote Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Edit Quotation"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#f1f3f7] truncate">
                          {q.title}
                        </div>

                        <div className="text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between font-medium">
                          <span>{q.contactName}</span>
                          <CurrencyDisplay amount={q.total} size="sm" color="orange" />
                        </div>

                        {q.convertedToJobId ? (
                          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800/60 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Converted to {q.convertedToJobId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/60">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-[#1a1e28] hover:bg-slate-200 dark:hover:bg-[#252b3a] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#2d3446] text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[36px]"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                              <span>Edit Quote</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConvertModal(q);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 min-h-[36px]"
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
            <div className={`lg:col-span-8 ${quotesMobileTab === "list" ? "hidden lg:block" : "block"}`}>
              {selectedQuoteForPreview ? (
                <div className="space-y-4">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white dark:bg-[#12141a] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#222735] shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuotesMobileTab("list")}
                        className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg bg-slate-800 text-white text-xs font-semibold btn-haptic mr-1"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                        <span>Quotes</span>
                      </button>
                      <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Previewing:</span>
                      <strong className="text-slate-900 dark:text-white font-mono text-sm sm:text-base">{selectedQuoteForPreview.id}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Edit Quote Button */}
                      <button
                        onClick={() => handleOpenEditModal(selectedQuoteForPreview)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-[#1a1d27] hover:bg-slate-200 dark:hover:bg-[#232836] text-slate-800 dark:text-zinc-100 border border-slate-300 dark:border-[#2b3142] text-xs font-bold py-2.5 px-3.5 min-h-[40px] rounded-lg btn-haptic"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                        <span>Edit Quote</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2.5 px-4 min-h-[40px] rounded-lg shadow-sm border border-[#e56208] btn-haptic"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Quotation</span>
                      </button>

                      {!selectedQuoteForPreview.convertedToJobId && (
                        <button
                          onClick={() => handleOpenConvertModal(selectedQuoteForPreview)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3.5 min-h-[40px] rounded-lg btn-haptic"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Start Production</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Printable Document Canvas (with isolated #quotation-print-area) */}
                  <div 
                    id="quotation-print-area"
                    className="printable-document bg-white text-black p-8 sm:p-10 rounded-xl shadow-xl border border-gray-200 print-surface font-sans space-y-8 min-h-[750px]"
                  >
                    {/* Top Header */}
                    <div className="print-header flex items-start justify-between border-b-2 border-black pb-5 gap-4">
                      <div className="space-y-1">
                        <div className="w-48 h-auto">
                          <img 
                            src="/pakmec-logo.png" 
                            alt="PAKMEC Engineering" 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-700 font-mono tracking-wide pt-1">
                          {settings.company.tagline}
                        </p>
                        <p className="text-[11px] text-gray-600 font-mono">
                          {settings.company.address.replace(/\s+,/g, ",")} • {settings.company.phone}
                        </p>
                      </div>

                      <div className="print-title-col text-right font-mono shrink-0 whitespace-nowrap">
                        <div className="text-2xl font-black text-black">QUOTATION</div>
                        <div className="text-sm font-bold text-[#c2410c]">{selectedQuoteForPreview.id}</div>
                        <div className="text-xs text-gray-700 mt-1 whitespace-nowrap">
                          Date:&nbsp;<span className="font-semibold text-gray-900">{selectedQuoteForPreview.date}</span>
                        </div>
                        <div className="text-xs text-gray-700 whitespace-nowrap">
                          Valid Until:&nbsp;<span className="font-semibold text-gray-900">{selectedQuoteForPreview.validUntil}</span>
                        </div>
                      </div>
                    </div>

                    {/* Client & Specs Info */}
                    <div className="print-meta-grid grid grid-cols-2 gap-6 text-xs">
                      <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                        <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Client / Organization</span>
                        <div className="font-bold text-sm text-black">{selectedQuoteForPreview.contactName}</div>
                        {selectedQuoteForPreview.contactCompany && (
                          <div className="text-gray-700">{selectedQuoteForPreview.contactCompany}</div>
                        )}
                        <div className="text-gray-600 font-mono">{selectedQuoteForPreview.contactPhone}</div>
                      </div>

                      <div className="print-meta-card p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                        <span className="font-mono font-bold text-gray-500 uppercase text-[10px]">Trade Domain</span>
                        <div className="font-bold text-sm text-[#c2410c]">{selectedQuoteForPreview.trade}</div>
                        <div className="text-gray-700">{selectedQuoteForPreview.title}</div>
                        <div className="text-gray-600 font-mono text-[11px]">Advance Term: {selectedQuoteForPreview.advancePercent}% Required</div>
                      </div>
                    </div>

                    {/* Line Items Table */}
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
                          <tr className="border-b-2 border-black font-mono text-[11px] text-gray-700">
                            <th className="py-2.5 px-2 text-center">#</th>
                            <th className="py-2.5 px-2 text-left">Item & Engineering Description</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Qty</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Unit Rate (PKR)</th>
                            <th className="py-2.5 px-2 text-right whitespace-nowrap">Amount (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 font-mono">
                          {selectedQuoteForPreview.lineItems.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td className="py-3 px-2 text-gray-500 text-center">{idx + 1}</td>
                              <td className="py-3 px-2 font-sans font-medium text-black">
                                {item.description}
                                <div className="text-[10px] text-gray-500 font-mono">{item.trade}</div>
                              </td>
                              <td className="py-3 px-2 text-right text-gray-800 whitespace-nowrap">{item.quantity} {item.unit}</td>
                              <td className="py-3 px-2 text-right text-gray-800 tabular-nums whitespace-nowrap">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-3 px-2 text-right font-bold text-black tabular-nums whitespace-nowrap">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Financial Summary */}
                    <div className="print-bottom border-t-2 border-black pt-4 flex flex-col sm:flex-row justify-between gap-6">
                      <div className="print-audit-col max-w-md space-y-2 text-xs">
                        <span className="font-mono font-bold text-[10px] uppercase text-gray-600">Terms & Payment Details (Multan)</span>
                        <p className="text-gray-700 leading-relaxed font-mono text-[11px]">
                          {selectedQuoteForPreview.terms}
                        </p>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[10px] font-mono text-gray-600 space-y-0.5">
                          <div><strong>Bank:</strong> {settings.company.bankName}</div>
                          <div><strong>Title:</strong> {settings.company.bankAccountTitle}</div>
                          <div><strong>IBAN:</strong> {settings.company.bankIban}</div>
                          <div><strong>JazzCash / EasyPaisa:</strong> {settings.company.jazzCashNumber}</div>
                        </div>
                      </div>

                      <div className="print-totals-col w-84 sm:w-[350px] min-w-[340px] space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-baseline gap-3 text-gray-700 whitespace-nowrap">
                          <span className="shrink-0">Subtotal:</span>
                          <span className="tabular-nums font-bold text-right">{formatCurrency(selectedQuoteForPreview.subtotal)}</span>
                        </div>
                        {selectedQuoteForPreview.discount > 0 && (
                          <div className="flex justify-between items-baseline gap-3 text-emerald-700 font-semibold whitespace-nowrap">
                            <span className="shrink-0">Discount:</span>
                            <span className="tabular-nums text-right font-bold">{formatCurrency(-selectedQuoteForPreview.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-baseline gap-3 text-base font-black text-black border-t border-black pt-2 whitespace-nowrap">
                          <span className="shrink-0">Total:</span>
                          <span className="tabular-nums text-[#c2410c] text-right">
                            {formatCurrency(selectedQuoteForPreview.total)}
                          </span>
                        </div>

                        <div className="p-2.5 rounded bg-slate-100 border-2 border-slate-900 mt-2">
                          <div className="flex justify-between items-baseline gap-3 font-bold text-xs text-slate-950 whitespace-nowrap">
                            <span className="shrink-0">{selectedQuoteForPreview.advancePercent}% Advance Due:</span>
                            <span className="tabular-nums text-right font-black">
                              {formatCurrency(selectedQuoteForPreview.advanceRequired)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Footer */}
                    <div className="text-center text-[10px] text-gray-500 font-mono pt-4 border-t border-gray-200">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-white dark:bg-[#12141a] border border-slate-300 dark:border-[#2a3040] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="border-b border-slate-200 dark:border-[#202533] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#fe7518]" />
                  <span>Edit Quotation ({editingQuote.id})</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                  Modify line items, quantities, rates, discounts, or terms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-haptic"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-4 text-xs">
              {/* Title & Trade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Quotation Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-[#252a38] focus:border-[#fe7518] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Manufacturing Trade</label>
                  <select
                    value={editTrade}
                    onChange={(e) => setEditTrade(e.target.value as TradeType)}
                    className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-[#252a38] focus:border-[#fe7518] outline-none"
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
                  <label className="block text-slate-800 dark:text-zinc-200 font-bold">Line Items & Rates</label>
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
                    <div key={item.id || idx} className="p-3 rounded-lg bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-[#242938] space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.description}
                          placeholder="Item Description"
                          onChange={(e) => handleUpdateEditLineItem(idx, "description", e.target.value)}
                          className="flex-1 bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-[#2b3142] focus:border-[#fe7518] outline-none text-xs"
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

                      <div className="grid grid-cols-3 gap-2 font-mono">
                        <div>
                          <label className="block text-[10px] text-slate-600 dark:text-zinc-400">Qty & Unit</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateEditLineItem(idx, "quantity", Number(e.target.value))}
                              className="w-16 bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-[#2b3142] text-xs"
                            />
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateEditLineItem(idx, "unit", e.target.value)}
                              className="w-14 bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-[#2b3142] text-xs font-sans"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-600 dark:text-zinc-400">Rate (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateEditLineItem(idx, "unitPrice", Number(e.target.value))}
                            className="w-full bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1 rounded border border-slate-300 dark:border-[#2b3142] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-600 dark:text-zinc-400">Amount (PKR)</label>
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
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-[#242938]">
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-[#2b3142] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Advance Required (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editAdvancePercent}
                    onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141a] text-slate-900 dark:text-white p-1.5 rounded border border-slate-300 dark:border-[#2b3142] text-xs font-mono"
                  />
                </div>
              </div>

              {/* Recalculated Summary */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#0c0d12] border border-slate-300 dark:border-[#202534] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-600 dark:text-zinc-400">Total: </span>
                  <strong className="text-[#fe7518] text-sm">{formatCurrency(editTotal)}</strong>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-zinc-400">Advance: </span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(editAdvanceRequired)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Notes & Specifications</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white p-2 rounded-lg border border-slate-300 dark:border-[#242938] focus:border-[#fe7518] outline-none text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#202533]">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-[#181a22] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#20242f] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md btn-haptic"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#12141a] border border-slate-300 dark:border-[#2a3040] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="border-b border-slate-200 dark:border-[#202533] pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#fe7518]" />
                <span>Approve Quote & Start Production</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                Converts {convertModalQuote.id} into an active Job on the Kanban board and issues invoice with advance deduction.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-[#181a24] rounded-lg border border-slate-200 dark:border-[#242938] space-y-1 font-mono">
                <div className="text-slate-900 dark:text-white font-bold text-sm">{convertModalQuote.title}</div>
                <div className="text-[#fe7518] font-bold">Client: {convertModalQuote.contactName}</div>
                <div className="text-slate-700 dark:text-zinc-300">
                  Total: {formatCurrency(convertModalQuote.total)} | Advance: {formatCurrency(convertModalQuote.advanceRequired)}
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-zinc-200 font-medium mb-1">Target Completion Deadline</label>
                <input
                  type="date"
                  value={convertDeadline}
                  aria-label="Target Completion Deadline"
                  onChange={(e) => setConvertDeadline(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#161821] text-slate-900 dark:text-white p-2 rounded-md border border-slate-300 dark:border-[#242938] focus:border-[#fe7518] outline-none font-mono"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#181b24] border border-slate-200 dark:border-[#252a38] flex items-center gap-3">
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
                  <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                    Marks deposit as collected and deducts from final invoice balance
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#202533]">
              <button
                type="button"
                onClick={() => setConvertModalQuote(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-[#181a22] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#20242f] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-4 py-2 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs shadow-md btn-haptic"
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
