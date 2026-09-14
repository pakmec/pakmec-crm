"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Calculator, 
  Search,
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
  ShieldCheck,
  Zap,
  Clock,
  Share2,
  Check,
  Sliders,
  Scale,
  Gauge,
  HelpCircle,
  PackageCheck
} from "lucide-react";
import { useCrm } from "@/context/CrmContext";
import { TradeType, Quote, QuoteLineItem } from "@/types";
import { printIsolatedElement } from "@/lib/printHelper";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { formatWhatsAppPhone } from "@/components/views/ContactsView";

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

  const [activeTab, setActiveTab] = useState<"generator" | "list">(preselectedContactId ? "generator" : "list");
  const [quotesMobileTab, setQuotesMobileTab] = useState<"list" | "preview">("list");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | "sent" | "approved" | "converted">("all");
  const [quoteSortBy, setQuoteSortBy] = useState<"newest" | "highest" | "client">("newest");
  
  const activeQuotes = quotes.filter((q) => !q.isArchived);
  const activeContacts = contacts.filter((c) => !c.isArchived);

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
      setActiveTab("generator");
    } else if (activeContacts.length > 0) {
      if (!selectedContactId || !activeContacts.some((c) => c.id === selectedContactId)) {
        setSelectedContactId(activeContacts[0].id);
      }
    } else {
      setClientMode("walkin");
    }
  }, [preselectedContactId, activeContacts, selectedContactId]);

  // Quote Configuration Core State
  const [quoteTitle, setQuoteTitle] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<TradeType>("CNC Machining");
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [leadTimeTier, setLeadTimeTier] = useState<"standard" | "express" | "rush">("standard");
  const [toleranceGrade, setToleranceGrade] = useState<"standard" | "precision">("standard");
  
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
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTrade, setEditTrade] = useState<TradeType>("CNC Machining");
  const [editLineItems, setEditLineItems] = useState<QuoteLineItem[]>([]);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editAdvancePercent, setEditAdvancePercent] = useState<number>(50);
  const [editNotes, setEditNotes] = useState("");
  const [editTerms, setEditTerms] = useState("");
  const [editContactId, setEditContactId] = useState("");

  // Filtered & Sorted Saved Quotes
  const filteredQuotes = useMemo(() => {
    let result = activeQuotes.filter((q) => {
      const matchesStatus = quoteStatusFilter === "all" || (quoteStatusFilter === "converted" ? Boolean(q.convertedToJobId) : q.status === quoteStatusFilter);
      const searchLower = quoteSearch.toLowerCase().trim();
      const matchesSearch = !searchLower || (
        q.id.toLowerCase().includes(searchLower) ||
        q.title.toLowerCase().includes(searchLower) ||
        q.contactName.toLowerCase().includes(searchLower) ||
        (q.contactCompany && q.contactCompany.toLowerCase().includes(searchLower)) ||
        (q.contactPhone && q.contactPhone.includes(searchLower)) ||
        q.trade.toLowerCase().includes(searchLower)
      );
      return matchesStatus && matchesSearch;
    });

    if (quoteSortBy === "highest") {
      result.sort((a, b) => b.total - a.total);
    } else if (quoteSortBy === "client") {
      result.sort((a, b) => a.contactName.localeCompare(b.contactName));
    } else {
      // newest
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return result;
  }, [activeQuotes, quoteSearch, quoteStatusFilter, quoteSortBy]);

  const [selectedQuoteForPreview, setSelectedQuoteForPreview] = useState<Quote | null>(
    activeQuotes[0] || null
  );

  useEffect(() => {
    if (!selectedQuoteForPreview && filteredQuotes.length > 0) {
      setSelectedQuoteForPreview(filteredQuotes[0]);
    }
  }, [filteredQuotes, selectedQuoteForPreview]);

  // Dynamic Volume Discount Percentage
  const volumeDiscountPercent = useMemo(() => {
    if (partQuantity >= 50) return 15;
    if (partQuantity >= 25) return 10;
    if (partQuantity >= 5) return 5;
    return 0;
  }, [partQuantity]);

  // Lead Time Multiplier
  const leadTimeSurgePercent = useMemo(() => {
    if (leadTimeTier === "express") return 15;
    if (leadTimeTier === "rush") return 30;
    return 0;
  }, [leadTimeTier]);

  // Tolerance Multiplier
  const toleranceSurgePercent = useMemo(() => {
    if (toleranceGrade === "precision") return 10;
    return 0;
  }, [toleranceGrade]);

  // Auto Calculate whenever specs, quantity, lead time or tolerances change
  useEffect(() => {
    let items: QuoteLineItem[] = [];
    const qty = Math.max(1, partQuantity);

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
      const totalWeight = printWeightGrams * qty;
      const matCost = Math.round(totalWeight * matRate);
      const machineCost = Math.round(printHours * qty * settings.printing.machineRatePerHour);
      const finishCost = (finishRates[printFinish] || 0) * qty;

      items.push({
        id: "li-gen-1",
        description: `Material: ${printMaterial} filament/resin (${totalWeight}g total for ${qty} pcs @ ${printInfill}% infill)`,
        trade: "3D Printing",
        quantity: totalWeight,
        unit: "grams",
        unitPrice: matRate,
        amount: matCost
      });

      items.push({
        id: "li-gen-2",
        description: `Additive Machine Run Time (${(printHours * qty).toFixed(1)} hrs automated cycle)`,
        trade: "3D Printing",
        quantity: Math.round(printHours * qty * 10) / 10,
        unit: "hrs",
        unitPrice: settings.printing.machineRatePerHour,
        amount: machineCost
      });

      items.push({
        id: "li-gen-3",
        description: "Build Chamber Slicing, Bed Levelling & Clean Setup",
        trade: "3D Printing",
        quantity: 1,
        unit: "setup",
        unitPrice: settings.printing.setupFee,
        amount: settings.printing.setupFee
      });

      if (finishCost > 0) {
        items.push({
          id: "li-gen-4",
          description: `Surface Finishing: ${printFinish} (${qty} units)`,
          trade: "3D Printing",
          quantity: qty,
          unit: "pcs",
          unitPrice: finishRates[printFinish],
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
      const totalArea = laserAreaSqCm * qty;
      const totalCutMeters = laserCutMeters * qty;
      const totalPierces = laserPierces * qty;

      const matCost = Math.round(totalArea * mRate);
      const cutCost = Math.round(totalCutMeters * settings.laser.cutRatePerMeter);
      const pierceCost = Math.round(totalPierces * settings.laser.pierceCost);

      items.push({
        id: "li-gen-1",
        description: `Laser Stock Substrate: ${laserMaterial} (${totalArea} cm² for ${qty} pcs)`,
        trade: "Laser Cutting",
        quantity: totalArea,
        unit: "cm²",
        unitPrice: mRate,
        amount: matCost
      });

      items.push({
        id: "li-gen-2",
        description: `Laser Vector Cutting Path Run (${totalCutMeters} meters)`,
        trade: "Laser Cutting",
        quantity: totalCutMeters,
        unit: "meters",
        unitPrice: settings.laser.cutRatePerMeter,
        amount: cutCost
      });

      items.push({
        id: "li-gen-3",
        description: `Contour Pierces & Vector Insets (${totalPierces} points)`,
        trade: "Laser Cutting",
        quantity: totalPierces,
        unit: "pts",
        unitPrice: settings.laser.pierceCost,
        amount: pierceCost
      });

      items.push({
        id: "li-gen-4",
        description: "Laser Beam Optical Alignment & Sheet Nesting Setup",
        trade: "Laser Cutting",
        quantity: 1,
        unit: "setup",
        unitPrice: settings.laser.setupFee,
        amount: settings.laser.setupFee
      });
    } else if (selectedTrade === "CNC Machining") {
      const metalRates: Record<string, number> = {
        "Aluminum 6061-T6": settings.cnc.aluminum6061PerCc,
        "Brass C360": settings.cnc.brassPerCc,
        "Delrin / Acetal": settings.cnc.delrinPerCc,
        "Carbon Steel 1018": settings.cnc.steelPerCc,
      };
      const metalRate = metalRates[cncMetal] || 20;
      const totalVolume = cncVolumeCc * qty;
      const totalMachHours = cncMachiningHours * qty;

      const metalCost = Math.round(totalVolume * metalRate);
      const machCost = Math.round(totalMachHours * settings.cnc.machineRatePerHour);
      const fixCost = Math.round(cncFixtures * settings.cnc.setupPerFixture);

      items.push({
        id: "li-gen-1",
        description: `Billet Stock Material: ${cncMetal} (${totalVolume} cm³ for ${qty} pcs)`,
        trade: "CNC Machining",
        quantity: totalVolume,
        unit: "cm³",
        unitPrice: metalRate,
        amount: metalCost
      });

      items.push({
        id: "li-gen-2",
        description: `Precision CNC Milling / Turning Machine Time (${totalMachHours} hrs)`,
        trade: "CNC Machining",
        quantity: totalMachHours,
        unit: "hrs",
        unitPrice: settings.cnc.machineRatePerHour,
        amount: machCost
      });

      items.push({
        id: "li-gen-3",
        description: `Fixture Clamping & Setup Calibrations (${cncFixtures} operations)`,
        trade: "CNC Machining",
        quantity: cncFixtures,
        unit: "fixtures",
        unitPrice: settings.cnc.setupPerFixture,
        amount: fixCost
      });

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
    partQuantity,
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

  const baseSubtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate adjusted subtotal with volume discount, lead time surge, and tolerance
  const volumeDiscountAmount = Math.round(baseSubtotal * (volumeDiscountPercent / 100));
  const leadTimeSurgeAmount = Math.round(baseSubtotal * (leadTimeSurgePercent / 100));
  const toleranceSurgeAmount = Math.round(baseSubtotal * (toleranceSurgePercent / 100));

  const subtotal = Math.max(0, baseSubtotal - volumeDiscountAmount + leadTimeSurgeAmount + toleranceSurgeAmount);
  const total = Math.max(0, subtotal - discount);

  const rawAdvance = isManualAdvance && customAdvancePkr !== null
    ? customAdvancePkr
    : Math.round(total * (advancePercent / 100));

  const isAdvanceExceeded = total > 0 && isManualAdvance && customAdvancePkr !== null && customAdvancePkr > total;
  const isAdvanceNegative = isManualAdvance && customAdvancePkr !== null && customAdvancePkr < 0;

  const advanceRequired = total <= 0 ? 0 : Math.min(total, Math.max(0, rawAdvance));
  const balanceDue = Math.max(0, total - advanceRequired);
  const calculatedAdvancePercent = total > 0 ? Math.round((advanceRequired / total) * 100) : advancePercent;

  // Estimated Delivery Days
  const estimatedDays = useMemo(() => {
    if (leadTimeTier === "rush") return 2;
    if (leadTimeTier === "express") return 4;
    return validDays;
  }, [leadTimeTier, validDays]);

  // Handle Quote Generation
  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + estimatedDays);

    const activeClient = contacts.find((c) => c.id === selectedContactId);

    if (clientMode === "walkin") {
      if (!walkinName.trim() || !walkinPhone.trim()) {
        alert("Please enter the client full name and WhatsApp phone number.");
        return;
      }

      const title = quoteTitle.trim() || `${selectedTrade} Order (${partQuantity}x) for ${walkinName.trim()}`;

      const { quote: createdQuote } = createQuoteWithNewContact(
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
          terms: `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`,
        },
        {
          name: walkinName.trim(),
          phone: walkinPhone.trim(),
          company: walkinCompany.trim(),
          city: walkinCity.trim() || "Multan"
        }
      );

      setSelectedQuoteForPreview(createdQuote);
      setActiveTab("list");
      return;
    }

    if (!activeClient) {
      alert("Please select a registered client or switch to Walk-in Lead mode.");
      return;
    }

    const title = quoteTitle.trim() || `${selectedTrade} Order (${partQuantity}x) for ${activeClient.name}`;

    const created = createQuote({
      contactId: activeClient.id,
      contactName: activeClient.name,
      contactPhone: activeClient.phone,
      contactCompany: activeClient.company,
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

  const handleConfirmDeleteQuote = () => {
    if (!quoteToDelete) return;
    deleteQuote(quoteToDelete.id);
    if (selectedQuoteForPreview?.id === quoteToDelete.id) {
      const remaining = activeQuotes.filter(q => q.id !== quoteToDelete.id);
      setSelectedQuoteForPreview(remaining[0] || null);
    }
    if (editingQuote?.id === quoteToDelete.id) {
      setEditingQuote(null);
    }
    setQuoteToDelete(null);
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

  const getWhatsAppShareUrl = (quote: Quote) => {
    const text = `*PAKMEC ENGINEERING - OFFICIAL QUOTATION*\n\n` +
      `*Quotation Ref:* ${quote.id}\n` +
      `*Project:* ${quote.title}\n` +
      `*Client:* ${quote.contactName}\n` +
      `*Trade:* ${quote.trade}\n` +
      `*Total Estimate:* ${formatCurrency(quote.total)}\n` +
      `*Advance Deposit Required (${quote.advancePercent}%):* ${formatCurrency(quote.advanceRequired)}\n` +
      `*Balance Payable:* ${formatCurrency(quote.total - quote.advanceRequired)}\n` +
      `*Valid Until:* ${quote.validUntil}\n\n` +
      `_Terms: ${quote.terms}_\n\n` +
      `PAKMEC Workshop Facility • Multan, Pakistan`;
    
    return `https://wa.me/${formatWhatsAppPhone(quote.contactPhone)}?text=${encodeURIComponent(text)}`;
  };

  const editSubtotal = editLineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const editTotal = Math.max(0, editSubtotal - editDiscount);
  const editAdvanceRequired = Math.round(editTotal * (editAdvancePercent / 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-zinc-800 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#fe7518]" />
              <span>{activeTab === "list" ? "Quotations & Estimates" : "Precision Quotation Engine"}</span>
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
              {activeTab === "list" ? `${activeQuotes.length} Total Saved` : "Multan Facility (PKR)"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
            {activeTab === "list" 
              ? "Search, review, print, and convert saved quotations or launch a new custom order estimate." 
              : "Instant DFM pricing for CNC Machining, 3D Printing, Laser Cutting & Industrial CAD."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {activeTab === "list" ? (
            <button
              type="button"
              onClick={() => setActiveTab("generator")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs sm:text-sm font-black py-2.5 px-5 rounded-xl shadow-sm border border-[#e56208] btn-haptic touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Quotation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl border-2 border-slate-300 dark:border-zinc-700 btn-haptic touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
              <span>← Back to Saved Quotes ({activeQuotes.length})</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === "generator" ? (
        <div className="space-y-6 no-print">
          {/* Quick Breadcrumb Navigation Rail */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-[#fe7518] dark:hover:text-[#fe7518] transition-colors btn-haptic"
            >
              <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
              <span>Back to Saved Quotes List ({activeQuotes.length})</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Engine • ISO 2768-m Calibration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form: Step 1, 2, 3, 4 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STEP 1: Select Manufacturing Domain */}
              <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 text-white dark:bg-[#fe7518] dark:text-slate-950 flex items-center justify-center text-sm font-black shadow-xs ring-2 ring-slate-900/10 dark:ring-orange-500/20">
                      1
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                        STEP 1: SELECT MANUFACTURING PROCESS
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Select production technology to load instant Multan workshop machine rates
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 uppercase tracking-wider shrink-0">
                    PKR Rates
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { 
                      name: "CNC Machining", 
                      icon: Cpu, 
                      desc: "Billet Milling & Turning",
                      badge: "Subtractive",
                      activeStyle: "bg-sky-50/90 dark:bg-sky-950/30 border-sky-500 ring-2 ring-sky-500/40",
                      activeIcon: "text-sky-600 dark:text-sky-400",
                      activeTitle: "text-sky-700 dark:text-sky-300"
                    },
                    { 
                      name: "3D Printing", 
                      icon: Layers, 
                      desc: "FDM & SLA Resin",
                      badge: "Additive",
                      activeStyle: "bg-orange-50/90 dark:bg-orange-950/30 border-[#fe7518] ring-2 ring-[#fe7518]/40",
                      activeIcon: "text-[#fe7518]",
                      activeTitle: "text-[#fe7518]"
                    },
                    { 
                      name: "Laser Cutting", 
                      icon: Flame, 
                      desc: "Acrylic, Sheet & MDF",
                      badge: "Vector CNC",
                      activeStyle: "bg-rose-50/90 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/40",
                      activeIcon: "text-rose-600 dark:text-rose-400",
                      activeTitle: "text-rose-700 dark:text-rose-300"
                    },
                    { 
                      name: "CAD Design", 
                      icon: Compass, 
                      desc: "SolidWorks & 2D DWG",
                      badge: "Engineering",
                      activeStyle: "bg-violet-50/90 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/40",
                      activeIcon: "text-violet-600 dark:text-violet-400",
                      activeTitle: "text-violet-700 dark:text-violet-300"
                    },
                    { 
                      name: "Industrial Fabrication", 
                      icon: Building2, 
                      desc: "Structural Sheds & Grey",
                      badge: "Heavy Fab",
                      activeStyle: "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40",
                      activeIcon: "text-emerald-600 dark:text-emerald-400",
                      activeTitle: "text-emerald-700 dark:text-emerald-300"
                    },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedTrade === t.name;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setSelectedTrade(t.name as TradeType)}
                        className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between relative overflow-hidden ${
                          isSelected 
                            ? `${t.activeStyle} shadow-sm` 
                            : "bg-slate-50/70 dark:bg-[#151824] border-slate-300 dark:border-zinc-700 hover:border-slate-500 dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-[#1a1d2d]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-white dark:bg-[#12141c] shadow-xs" : "bg-white dark:bg-zinc-800"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? t.activeIcon : "text-slate-700 dark:text-zinc-300"}`} />
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs">
                              Selected
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-black leading-tight ${isSelected ? t.activeTitle : "text-slate-950 dark:text-white"}`}>
                            {t.name}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-zinc-400 mt-1">
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Technical Specifications & Stock */}
              <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 text-white dark:bg-[#fe7518] dark:text-slate-950 flex items-center justify-center text-sm font-black shadow-xs ring-2 ring-slate-900/10 dark:ring-orange-500/20">
                      2
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                        STEP 2: {selectedTrade.toUpperCase()} PARAMETERS
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Configure raw material stock, envelope dimensions, and machining duration
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700 uppercase tracking-wider shrink-0">
                    DFM Verified
                  </span>
                </div>

                {/* CNC Machining Fields */}
                {selectedTrade === "CNC Machining" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-2">Billet Alloy / Stock Selection</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "Aluminum 6061-T6", desc: "Aerospace Structural Billet", rate: "PKR 20/cm³" },
                          { id: "Brass C360", desc: "Free-Cutting Bushings & Terminals", rate: "PKR 42/cm³" },
                          { id: "Delrin / Acetal", desc: "Low-Friction Engineering Polymer", rate: "PKR 14/cm³" },
                          { id: "Carbon Steel 1018", desc: "High-Tensile Industrial Fixtures", rate: "PKR 12/cm³" },
                        ].map((mat) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => setCncMetal(mat.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                              cncMetal === mat.id
                                ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/30"
                                : "bg-white dark:bg-[#161822] border-slate-300 dark:border-zinc-700 hover:border-slate-400"
                            }`}
                          >
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-950 dark:text-zinc-100">{mat.id}</div>
                              <div className="text-[11px] text-slate-600 dark:text-zinc-400">{mat.desc}</div>
                            </div>
                            <span className="text-xs font-bold text-sky-700 dark:text-sky-300 shrink-0">{mat.rate}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Stock Envelope (cm³)</label>
                        <input
                          type="number"
                          min={10}
                          value={cncVolumeCc}
                          onChange={(e) => setCncVolumeCc(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Spindle Time (Hours)</label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={cncMachiningHours}
                          onChange={(e) => setCncMachiningHours(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Setup Fixtures</label>
                        <input
                          type="number"
                          min={1}
                          value={cncFixtures}
                          onChange={(e) => setCncFixtures(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="camCheck"
                        checked={cncCamProgramming}
                        onChange={(e) => setCncCamProgramming(e.target.checked)}
                        className="w-4 h-4 accent-[#fe7518] rounded cursor-pointer"
                      />
                      <label htmlFor="camCheck" className="text-slate-950 dark:text-zinc-100 font-bold cursor-pointer text-xs sm:text-sm">
                        Mastercam 3D Toolpath CAM Programming & Machine Code Verification (+PKR {settings.cnc.camProgrammingFee})
                      </label>
                    </div>
                  </div>
                )}

                {/* 3D Printing Fields */}
                {selectedTrade === "3D Printing" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-2">Filament / Resin Material</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          { id: "PLA", desc: "Concept Prototyping", rate: "PKR 4.5/g" },
                          { id: "PETG", desc: "Tough End-Use Parts", rate: "PKR 6.5/g" },
                          { id: "ABS", desc: "Heat & Impact Resistant", rate: "PKR 7.0/g" },
                          { id: "Resin", desc: "Ultra-Detail SLA 50µm", rate: "PKR 18.0/g" },
                          { id: "TPU", desc: "Flexible Elastic Rubber", rate: "PKR 10.0/g" },
                        ].map((mat) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => setPrintMaterial(mat.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              printMaterial === mat.id
                                ? "bg-orange-50 dark:bg-orange-950/40 border-[#fe7518] ring-2 ring-[#fe7518]/30"
                                : "bg-white dark:bg-[#161822] border-slate-300 dark:border-zinc-700 hover:border-slate-400"
                            }`}
                          >
                            <div className="text-xs sm:text-sm font-black text-slate-950 dark:text-zinc-100">{mat.id}</div>
                            <div className="text-[11px] text-slate-600 dark:text-zinc-400">{mat.desc}</div>
                            <div className="text-xs font-bold text-[#fe7518] mt-1">{mat.rate}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Weight / Unit (g)</label>
                        <input
                          type="number"
                          min={1}
                          value={printWeightGrams}
                          onChange={(e) => setPrintWeightGrams(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Print Hours / Unit</label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={printHours}
                          onChange={(e) => setPrintHours(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Infill Density (%)</label>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={printInfill}
                          onChange={(e) => setPrintInfill(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Post-Processing Finish</label>
                      <select
                        value={printFinish}
                        onChange={(e) => setPrintFinish(e.target.value)}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
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
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-2">Sheet Substrate & Thickness</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {[
                          { id: "Acrylic 3mm Clear", desc: "High Optical Clarity Acrylic", rate: "PKR 0.7/cm²" },
                          { id: "Acrylic 5mm Cast", desc: "Heavy Cast Acrylic Sheet", rate: "PKR 1.2/cm²" },
                          { id: "MDF 3mm Sheet", desc: "Laser Wood & Architectural Models", rate: "PKR 0.35/cm²" },
                          { id: "Mild Steel Sheet 1.5mm", desc: "Sheet Metal Brackets & Enclosures", rate: "PKR 1.8/cm²" },
                        ].map((mat) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => setLaserMaterial(mat.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                              laserMaterial === mat.id
                                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30"
                                : "bg-white dark:bg-[#161822] border-slate-300 dark:border-zinc-700 hover:border-slate-400"
                            }`}
                          >
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-950 dark:text-zinc-100">{mat.id}</div>
                              <div className="text-[11px] text-slate-600 dark:text-zinc-400">{mat.desc}</div>
                            </div>
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 shrink-0">{mat.rate}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Area / Unit (cm²)</label>
                        <input
                          type="number"
                          min={10}
                          value={laserAreaSqCm}
                          onChange={(e) => setLaserAreaSqCm(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Cut Meters / Unit</label>
                        <input
                          type="number"
                          min={1}
                          value={laserCutMeters}
                          onChange={(e) => setLaserCutMeters(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-xs sm:text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Pierces / Unit</label>
                        <input
                          type="number"
                          min={1}
                          value={laserPierces}
                          onChange={(e) => setLaserPierces(Number(e.target.value))}
                          className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CAD Design Fields */}
                {selectedTrade === "CAD Design" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Project Complexity</label>
                      <select
                        value={cadComplexity}
                        onChange={(e) => setCadComplexity(e.target.value as any)}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                      >
                        <option value="Simple">Simple (Basic bracket or 2D profile - PKR {settings.cad.hourlyRatePkr}/hr)</option>
                        <option value="Medium">Medium (Multi-component assembly - PKR {Math.round(settings.cad.hourlyRatePkr * 1.35)}/hr)</option>
                        <option value="Complex">Complex (Full mechanism assembly, FEA study - PKR {Math.round(settings.cad.hourlyRatePkr * 1.85)}/hr)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Engineering Hours</label>
                      <input
                        type="number"
                        min={1}
                        value={cadHours}
                        onChange={(e) => setCadHours(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Fabrication Fields */}
                {selectedTrade === "Industrial Fabrication" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Structure Grade</label>
                      <select
                        value={constStructureType}
                        onChange={(e) => setConstStructureType(e.target.value)}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                      >
                        <option value="Industrial Shed">Industrial Shed Steel Truss (PKR 2,300/sqft)</option>
                        <option value="Grey Structure">Heavy Commercial Grey Structure (PKR 1,850/sqft)</option>
                        <option value="Turnkey Industrial">Turnkey Complete Finishing (PKR 3,600/sqft)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Covered Area (Sq.Ft)</label>
                      <input
                        type="number"
                        min={100}
                        value={constAreaSqFt}
                        onChange={(e) => setConstAreaSqFt(Number(e.target.value))}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Batch Quantity, Lead Time & Tolerances (Xometry / Fictiv Grade) */}
              <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 text-white dark:bg-[#fe7518] dark:text-slate-950 flex items-center justify-center text-sm font-black shadow-xs ring-2 ring-slate-900/10 dark:ring-orange-500/20">
                      3
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                        STEP 3: QUANTITY BREAKS & FULFILLMENT SPEED
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Select production batch size, tolerance grade, and Multan priority dispatch
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity Breaks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-sm text-slate-950 dark:text-zinc-100">
                      Batch Quantity: <strong className="text-[#fe7518]">{partQuantity} units</strong>
                    </label>
                    {volumeDiscountPercent > 0 && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                        {volumeDiscountPercent}% Volume Break Applied
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { qty: 1, label: "1 (Prototype)", disc: null },
                      { qty: 5, label: "5 (Pilot)", disc: "5% off" },
                      { qty: 25, label: "25 (Batch)", disc: "10% off" },
                      { qty: 50, label: "50 (Production)", disc: "15% off" },
                      { qty: 100, label: "100 (Scale)", disc: "15% off" },
                    ].map((item) => (
                      <button
                        key={item.qty}
                        type="button"
                        onClick={() => setPartQuantity(item.qty)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1.5 ${
                          partQuantity === item.qty
                            ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white shadow-xs"
                            : "bg-white dark:bg-[#161822] text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:border-slate-500"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.disc && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                            ({item.disc})
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="relative w-24">
                      <input
                        type="number"
                        min={1}
                        value={partQuantity}
                        onChange={(e) => setPartQuantity(Math.max(1, Number(e.target.value)))}
                        placeholder="Custom"
                        className="w-full py-2 px-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold text-center bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Lead Time / Production Speed */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { id: "standard", title: "Standard Dispatch", days: "7-10 Days", badge: "Normal Queue", surge: "+0%" },
                    { id: "express", title: "Express Production", days: "3-5 Days", badge: "Priority Spindle", surge: "+15%" },
                    { id: "rush", title: "Emergency 48h Run", days: "1-2 Days", badge: "24/7 Dedicated", surge: "+30%" },
                  ].map((speed) => (
                    <button
                      key={speed.id}
                      type="button"
                      onClick={() => setLeadTimeTier(speed.id as any)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                        leadTimeTier === speed.id
                          ? "bg-orange-50 dark:bg-orange-950/30 border-[#fe7518] ring-2 ring-[#fe7518]/30 shadow-xs"
                          : "bg-white dark:bg-[#161822] border-slate-300 dark:border-zinc-700 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-950 dark:text-zinc-100">{speed.title}</span>
                        <span className="text-[#fe7518]">{speed.surge}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1 font-semibold">{speed.days}</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase mt-0.5 font-bold">{speed.badge}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 4: Client & Commercial Terms */}
              <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-950 text-white dark:bg-[#fe7518] dark:text-slate-950 flex items-center justify-center text-sm font-black shadow-xs ring-2 ring-slate-900/10 dark:ring-orange-500/20">
                      4
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                        STEP 4: CLIENT ACCOUNT & DEPOSIT
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                        Assign registered client or walk-in lead and configure deposit terms
                      </p>
                    </div>
                  </div>
                  
                  {/* Segmented Client Toggle */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#161822] border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setClientMode("existing")}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        clientMode === "existing"
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm font-black"
                          : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 font-bold"
                      }`}
                    >
                      <Users className="w-4 h-4 text-[#fe7518]" />
                      <span>Registered Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientMode("walkin")}
                      className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        clientMode === "walkin"
                          ? "bg-[#fe7518] text-slate-950 shadow-sm font-black"
                          : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 font-bold"
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Walk-in Lead</span>
                    </button>
                  </div>
                </div>

                {clientMode === "existing" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Target Client (Multan Database) *</label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => setSelectedContactId(e.target.value)}
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
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
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Quotation Title / Ref</label>
                      <input
                        type="text"
                        value={quoteTitle}
                        onChange={(e) => setQuoteTitle(e.target.value)}
                        placeholder="e.g. 50x Drone Motor Mounts CNC 6061"
                        className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-5 rounded-xl bg-orange-50/60 dark:bg-[#181a24] border-2 border-orange-300 dark:border-[#2c3244]">
                    <div className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#fe7518]" />
                      <span>Instant Direct Client Registration</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Client Full Name *</label>
                        <input
                          type="text"
                          required
                          value={walkinName}
                          onChange={(e) => setWalkinName(e.target.value)}
                          placeholder="e.g. Tariq Mahmood"
                          className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">WhatsApp Phone *</label>
                        <input
                          type="text"
                          required
                          value={walkinPhone}
                          onChange={(e) => setWalkinPhone(e.target.value)}
                          placeholder="e.g. 0300 1234567"
                          className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Advance Deposit Interactive Controller */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-950 dark:text-zinc-100">
                      Required Advance Deposit: <strong className="text-emerald-700 dark:text-emerald-400 font-black">{calculatedAdvancePercent}%</strong> ({formatCurrency(advanceRequired)})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsManualAdvance(!isManualAdvance)}
                      className="text-xs font-bold text-[#fe7518] hover:underline"
                    >
                      {isManualAdvance ? "Switch to Preset %" : "Enter Custom PKR"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {[0, 30, 50, 70, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setAdvancePercent(pct);
                          setIsManualAdvance(false);
                          setCustomAdvancePkr(Math.round(total * (pct / 100)));
                        }}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                          !isManualAdvance && advancePercent === pct
                            ? "bg-[#fe7518] text-slate-950 border-[#fe7518] font-black shadow-xs"
                            : "bg-white dark:bg-[#12141c] text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700 hover:border-slate-500"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    {isManualAdvance && (
                      <div className="relative w-36">
                        <input
                          type="number"
                          min={0}
                          max={total}
                          value={customAdvancePkr !== null ? customAdvancePkr : advanceRequired}
                          onChange={(e) => setCustomAdvancePkr(Number(e.target.value))}
                          placeholder="PKR Amount"
                          className="w-full py-1.5 px-2.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Discount & Validity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Direct Discount (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Validity Days</label>
                    <input
                      type="number"
                      min={1}
                      value={validDays}
                      onChange={(e) => setValidDays(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sticky Estimate Console (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#12141c] rounded-2xl border-2 border-slate-300 dark:border-zinc-700 p-6 space-y-5 sticky top-20 shadow-md">
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-[#fe7518]" />
                    <h2 className="text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                      LIVE ESTIMATE BREAKDOWN
                    </h2>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 uppercase tracking-wider shrink-0">
                    {lineItems.length} items
                  </span>
                </div>

                {/* Line Items List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {lineItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-700 space-y-1">
                      <div className="flex items-start justify-between gap-2 text-xs sm:text-sm">
                        <span className="text-slate-950 dark:text-zinc-100 font-bold leading-tight">{item.description}</span>
                        <span className="font-black text-slate-950 dark:text-white shrink-0 tabular-nums">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center justify-between pt-1 font-semibold">
                        <span>{item.quantity} {item.unit} @ {formatCurrency(item.unitPrice)}/{item.unit}</span>
                        <span className="text-[#fe7518] font-bold">{item.trade}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0c0d12] border-2 border-slate-200 dark:border-zinc-800 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-bold">
                    <span>Base Subtotal:</span>
                    <CurrencyDisplay amount={baseSubtotal} size="sm" />
                  </div>

                  {volumeDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                      <span>Volume Discount ({volumeDiscountPercent}%):</span>
                      <CurrencyDisplay amount={-volumeDiscountAmount} size="xs" numberColor="text-emerald-700 dark:text-emerald-400" />
                    </div>
                  )}

                  {leadTimeSurgeAmount > 0 && (
                    <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 font-bold text-xs">
                      <span>{leadTimeTier.toUpperCase()} Priority Surge:</span>
                      <CurrencyDisplay amount={leadTimeSurgeAmount} size="xs" numberColor="text-amber-700 dark:text-amber-400" />
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold text-xs">
                      <span>Manual Discount Applied:</span>
                      <CurrencyDisplay amount={-discount} size="xs" numberColor="text-emerald-700 dark:text-emerald-400" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-lg font-black text-slate-950 dark:text-white pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
                    <span className="text-[#fe7518]">Total Quotation:</span>
                    <CurrencyDisplay amount={total} size="lg" numberColor="text-[#fe7518]" />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#151824] border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-between text-xs sm:text-sm font-black">
                    <span className="text-slate-900 dark:text-zinc-100">Advance Required ({calculatedAdvancePercent}%):</span>
                    <CurrencyDisplay amount={advanceRequired} size="sm" numberColor="text-emerald-700 dark:text-emerald-400" />
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleCreateQuote}
                  className="w-full flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 py-4 px-4 rounded-xl font-black text-sm shadow-md border-2 border-[#e56208] btn-haptic touch-manipulation"
                >
                  <FileText className="w-5 h-5" />
                  <span>Save & Issue Quotation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Saved Quotes Primary Hub */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quotes List (4 Cols) */}
            <div className="lg:col-span-4 space-y-3 no-print">
              {/* Search, Filter & Sort Bar */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-700 dark:text-zinc-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={quoteSearch}
                    onChange={(e) => setQuoteSearch(e.target.value)}
                    placeholder="Search quotes by ID, title, client…"
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 placeholder-slate-500 dark:placeholder-zinc-400 pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs sm:text-sm font-bold shadow-xs"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {[
                    { id: "all", label: `All (${activeQuotes.length})` },
                    { id: "sent", label: "Sent" },
                    { id: "approved", label: "Approved" },
                    { id: "converted", label: "Converted" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQuoteStatusFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 font-bold transition-colors ${
                        quoteStatusFilter === tab.id
                          ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
                          : "text-slate-800 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white bg-slate-200 dark:bg-[#161822] border border-slate-300 dark:border-zinc-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotes Card Stream */}
              <div className="space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
                {filteredQuotes.length === 0 ? (
                  <div className="p-6 text-center bg-white dark:bg-[#12141c] rounded-2xl border-2 border-slate-200 dark:border-zinc-800 space-y-2">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Quotations Found</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {quoteSearch || quoteStatusFilter !== "all" 
                        ? "No quotations match your current search or filter."
                        : "Click '+ Create New Quotation' to generate instant estimates."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("generator")}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Quotation</span>
                    </button>
                  </div>
                ) : (
                  filteredQuotes.map((q) => {
                    const isSelected = selectedQuoteForPreview?.id === q.id;

                    return (
                      <div
                        key={q.id}
                        onClick={() => {
                          setSelectedQuoteForPreview(q);
                          setQuotesMobileTab("preview");
                        }}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer space-y-2.5 ${
                          isSelected 
                            ? "bg-white dark:bg-[#1c202d] border-[#fe7518] shadow-sm ring-2 ring-[#fe7518]/40" 
                            : "bg-white dark:bg-[#12141c] border-slate-200 dark:border-zinc-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-[#161822]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-[#fe7518] font-mono tracking-wider">{q.id}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {q.status}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="p-1 rounded-lg text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                              title="Edit Quotation"
                              aria-label="Edit Quotation"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuoteToDelete(q);
                              }}
                              className="p-1 rounded-lg text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Quotation"
                              aria-label="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-sm font-black text-slate-950 dark:text-zinc-100 truncate">
                          {q.title}
                        </div>

                        <div className="text-xs text-slate-700 dark:text-zinc-300 flex items-center justify-between font-bold">
                          <span>{q.contactName}</span>
                          <CurrencyDisplay amount={q.total} size="sm" color="orange" />
                        </div>

                        {q.convertedToJobId ? (
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-zinc-800 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Converted to {q.convertedToJobId}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                            <a
                              href={getWhatsAppShareUrl(q)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-emerald-300 dark:border-emerald-800"
                              title="Share on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenConvertModal(q);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black transition-all flex items-center justify-center gap-1 shadow-xs"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white dark:bg-[#12141c] p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Previewing:</span>
                      <strong className="text-slate-950 dark:text-white font-mono text-sm">{selectedQuoteForPreview.id}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={getWhatsAppShareUrl(selectedQuoteForPreview)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 px-3.5 rounded-xl shadow-xs btn-haptic"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(selectedQuoteForPreview)}
                        className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold py-2 px-3.5 rounded-xl border border-slate-300 dark:border-zinc-700 btn-haptic"
                      >
                        <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                        <span>Edit Quote</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuoteToDelete(selectedQuoteForPreview)}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold py-2 px-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800 btn-haptic"
                        title="Delete Quotation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black py-2 px-4 rounded-xl shadow-xs border border-[#e56208] btn-haptic"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Quotation</span>
                      </button>

                      {!selectedQuoteForPreview.convertedToJobId && (
                        <button
                          type="button"
                          onClick={() => handleOpenConvertModal(selectedQuoteForPreview)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 px-4 rounded-xl btn-haptic shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Start Production</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Isolated Printable Quotation Document */}
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
                        <div className="text-xs text-gray-700 font-semibold leading-relaxed pt-1">
                          <div><strong>PAKMEC Precision Engineering Workshop</strong></div>
                          <div>Plot 14-B, Industrial Estate Phase 2, Multan, Pakistan</div>
                          <div>WhatsApp / Phone: +92 300 8472910 | support@pakmec.com</div>
                          <div>NTN: 8492019-3 | ISO 9001:2015 Precision Certified</div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="inline-block px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-wider rounded">
                          Official Quotation
                        </div>
                        <div className="text-xl font-black font-mono pt-1 text-black">{selectedQuoteForPreview.id}</div>
                        <div className="text-xs text-gray-700 font-medium">Date: <strong className="font-mono">{selectedQuoteForPreview.date}</strong></div>
                        <div className="text-xs text-gray-700 font-medium">Valid Until: <strong className="font-mono">{selectedQuoteForPreview.validUntil}</strong></div>
                      </div>
                    </div>

                    {/* Client Meta */}
                    <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                      <div className="space-y-1">
                        <span className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Quotation Prepared For:</span>
                        <div className="text-sm font-black text-black">{selectedQuoteForPreview.contactName}</div>
                        {selectedQuoteForPreview.contactCompany && (
                          <div className="font-bold text-gray-800">{selectedQuoteForPreview.contactCompany}</div>
                        )}
                        <div className="text-gray-600 font-mono">{selectedQuoteForPreview.contactPhone}</div>
                      </div>

                      <div className="space-y-1 text-right">
                        <span className="text-gray-500 font-bold uppercase tracking-wider block text-[10px]">Manufacturing Domain:</span>
                        <div className="text-sm font-black text-[#fe7518] uppercase">{selectedQuoteForPreview.trade}</div>
                        <div className="text-gray-700 font-semibold">{selectedQuoteForPreview.title}</div>
                        <div className="text-[11px] text-emerald-700 font-bold">Facility: Multan Precision Workshop</div>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-2">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b-2 border-black text-black uppercase font-black tracking-wider text-[11px]">
                            <th className="py-2 px-1">#</th>
                            <th className="py-2 px-3">Description & Specifications</th>
                            <th className="py-2 px-2 text-center">Qty</th>
                            <th className="py-2 px-2 text-right">Rate (PKR)</th>
                            <th className="py-2 px-2 text-right">Total (PKR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedQuoteForPreview.lineItems.map((item, index) => (
                            <tr key={item.id || index} className="text-gray-900 font-medium">
                              <td className="py-3 px-1 font-mono text-gray-500">{index + 1}</td>
                              <td className="py-3 px-3">
                                <div className="font-bold text-black">{item.description}</div>
                                <div className="text-[11px] text-gray-600">{item.trade}</div>
                              </td>
                              <td className="py-3 px-2 text-center font-mono font-bold">{item.quantity} {item.unit}</td>
                              <td className="py-3 px-2 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-3 px-2 text-right font-mono font-bold text-black">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Breakdown */}
                    <div className="grid grid-cols-12 gap-6 pt-4 border-t-2 border-black">
                      <div className="col-span-7 space-y-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                          <span className="font-black text-black uppercase block text-[10px]">Payment & Production Terms:</span>
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {selectedQuoteForPreview.terms}
                          </p>
                        </div>
                        {selectedQuoteForPreview.notes && (
                          <div className="text-gray-600 italic text-[11px]">
                            Note: {selectedQuoteForPreview.notes}
                          </div>
                        )}
                      </div>

                      <div className="col-span-5 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-gray-200 font-semibold text-gray-700">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatCurrency(selectedQuoteForPreview.subtotal)}</span>
                        </div>
                        {selectedQuoteForPreview.discount > 0 && (
                          <div className="flex justify-between py-1 border-b border-gray-200 font-semibold text-emerald-700">
                            <span>Special Discount:</span>
                            <span className="font-mono">-{formatCurrency(selectedQuoteForPreview.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b-2 border-black text-sm font-black text-black">
                          <span>Net Quotation Total:</span>
                          <span className="font-mono text-base">{formatCurrency(selectedQuoteForPreview.total)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 font-bold text-black bg-gray-100 px-2 rounded">
                          <span>Advance Deposit ({selectedQuoteForPreview.advancePercent}%):</span>
                          <span className="font-mono text-emerald-700">{formatCurrency(selectedQuoteForPreview.advanceRequired)}</span>
                        </div>
                        <div className="flex justify-between py-1 font-semibold text-gray-700 px-2">
                          <span>Balance Due on Delivery:</span>
                          <span className="font-mono">{formatCurrency(selectedQuoteForPreview.total - selectedQuoteForPreview.advanceRequired)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Signatures & Bank Details */}
                    <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs">
                      <div>
                        <span className="font-bold text-black uppercase block mb-1">Meezan Bank Account:</span>
                        <div className="font-mono text-gray-700">Title: PAKMEC ENGINEERING SERVICES</div>
                        <div className="font-mono text-gray-700">IBAN: PK82MEZN0001890281920192</div>
                        <div className="font-mono text-gray-700">JazzCash: 0300-8472910</div>
                      </div>
                      <div className="text-right space-y-8">
                        <div className="text-gray-500">Authorized Workshop Signature</div>
                        <div className="border-b border-black w-40 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Convert to Job Modal */}
      {convertModalQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Convert {convertModalQuote.id} to Job
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  {convertModalQuote.contactName} • {formatCurrency(convertModalQuote.total)}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Total Amount:</span>
                <span className="font-mono text-slate-950 dark:text-white">{formatCurrency(convertModalQuote.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span>Advance Required ({convertModalQuote.advancePercent}%):</span>
                <span className="font-mono">{formatCurrency(convertModalQuote.advanceRequired)}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-950 dark:text-zinc-100 mb-1">Production Target Deadline</label>
                <input
                  type="date"
                  value={convertDeadline}
                  onChange={(e) => setConvertDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="advCollectCheck"
                  checked={convertAdvanceReceived}
                  onChange={(e) => setConvertAdvanceReceived(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="advCollectCheck" className="font-bold text-slate-950 dark:text-zinc-100 cursor-pointer">
                  Mark {formatCurrency(convertModalQuote.advanceRequired)} Advance as Collected in Multan
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConvertModalQuote(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm btn-haptic"
              >
                Confirm & Launch Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quote Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#12141c] border-2 border-rose-300 dark:border-rose-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Delete Quotation {quoteToDelete.id}?
                </h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  {quoteToDelete.contactName} • {formatCurrency(quoteToDelete.total)}
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-[#181a24] p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
              This will permanently delete quotation <strong className="font-mono text-slate-950 dark:text-white">{quoteToDelete.id}</strong> ({quoteToDelete.title}). This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuote}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm btn-haptic"
              >
                Delete Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quote Modal */}
      {editingQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#fe7518]" />
                <h3 className="text-base font-black text-slate-950 dark:text-white">
                  Edit Quotation {editingQuote.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-950 dark:text-zinc-100 mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-950 dark:text-zinc-100 mb-1">Trade</label>
                  <select
                    value={editTrade}
                    onChange={(e) => setEditTrade(e.target.value as TradeType)}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 font-bold outline-none"
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
                  <label className="font-black text-slate-950 dark:text-zinc-100">Itemized Cost Elements</label>
                  <button
                    type="button"
                    onClick={handleAddEditLineItem}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#fe7518] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Custom Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {editLineItems.map((item, idx) => (
                    <div key={item.id || idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800">
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateEditLineItem(idx, "description", e.target.value)}
                          placeholder="Description"
                          className="w-full bg-white dark:bg-[#12141c] p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateEditLineItem(idx, "quantity", Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full bg-white dark:bg-[#12141c] p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateEditLineItem(idx, "unitPrice", Number(e.target.value))}
                          placeholder="Rate"
                          className="w-full bg-white dark:bg-[#12141c] p-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-xs font-bold text-right"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEditLineItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-950 dark:text-zinc-100 mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-950 dark:text-zinc-100 mb-1">Advance (%)</label>
                  <input
                    type="number"
                    value={editAdvancePercent}
                    onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#161822] flex items-center justify-between font-black text-sm">
                <span>Calculated Total:</span>
                <span className="text-[#fe7518] text-base">{formatCurrency(editTotal)}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setQuoteToDelete(editingQuote);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800"
                >
                  Delete Quote
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingQuote(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black shadow-md btn-haptic"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
