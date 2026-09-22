"use client";

import React, { useState, useEffect } from "react";
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
  Sliders,
  Wrench
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

  const [activeTab, setActiveTab] = useState<"generator" | "list">(preselectedContactId ? "generator" : "list");
  const [quotesMobileTab, setQuotesMobileTab] = useState<"list" | "preview">("list");
  const [quoteSearch, setQuoteSearch] = useState("");
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | "sent" | "approved" | "converted">("all");
  const activeQuotes = quotes.filter((q) => !q.isArchived);
  const activeContacts = contacts.filter((c) => !c.isArchived);

  const filteredQuotes = activeQuotes.filter((q) => {
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

  // Commercial Terms & Deposit Detail State (fully editable)
  const [terms, setTerms] = useState<string>("");
  const [isTermsManuallyEdited, setIsTermsManuallyEdited] = useState<boolean>(false);

  // Per-Quote Rate & Setup Fee States (dynamically prefilled from settings)
  const [printMachineRate, setPrintMachineRate] = useState<number>(settings.printing.machineRatePerHour);
  const [printSetupFee, setPrintSetupFee] = useState<number>(settings.printing.setupFee);

  const [laserCutRate, setLaserCutRate] = useState<number>(settings.laser.cutRatePerMeter);
  const [laserSetupFee, setLaserSetupFee] = useState<number>(settings.laser.setupFee);

  const [cncMachineRate, setCncMachineRate] = useState<number>(settings.cnc.machineRatePerHour);
  const [cncSetupPerFixture, setCncSetupPerFixture] = useState<number>(settings.cnc.setupPerFixture);
  const [cncCamFee, setCncCamFee] = useState<number>(settings.cnc.camProgrammingFee);

  const [cadHourlyRate, setCadHourlyRate] = useState<number>(settings.cad.hourlyRatePkr);
  const [constRatePerSqFt, setConstRatePerSqFt] = useState<number>(settings.construction.industrialShedPerSqFt || 2300);

  // Custom Domain Rate & Setup states
  const [customSetupFee, setCustomSetupFee] = useState<number>(3500);

  // Sync rate defaults whenever company settings change
  useEffect(() => {
    setPrintMachineRate(settings.printing.machineRatePerHour);
    setPrintSetupFee(settings.printing.setupFee);
    setLaserCutRate(settings.laser.cutRatePerMeter);
    setLaserSetupFee(settings.laser.setupFee);
    setCncMachineRate(settings.cnc.machineRatePerHour);
    setCncSetupPerFixture(settings.cnc.setupPerFixture);
    setCncCamFee(settings.cnc.camProgrammingFee);
    setCadHourlyRate(settings.cad.hourlyRatePkr);
  }, [settings]);

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

  // Custom Domain State
  const [customTradeTitle, setCustomTradeTitle] = useState("Custom Engineering Services");
  const [customScopeNotes, setCustomScopeNotes] = useState("Bespoke fabrication, specialized machining, and assembly to custom drawings.");
  const [customLeadTime, setCustomLeadTime] = useState("5-7 Business Days");
  const [customLineItems, setCustomLineItems] = useState<QuoteLineItem[]>([
    {
      id: "li-cust-init-1",
      description: "Custom Raw Material Stock & Tooling Preparation",
      trade: "Custom Domain",
      quantity: 1,
      unit: "lot",
      unitPrice: 12500,
      amount: 12500
    },
    {
      id: "li-cust-init-2",
      description: "Specialized Precision Machining & Skilled Labor (Workshop Queue)",
      trade: "Custom Domain",
      quantity: 8,
      unit: "hrs",
      unitPrice: 1800,
      amount: 14400
    },
    {
      id: "li-cust-init-3",
      description: "Quality Control CMM Inspection & Protective Packaging (Multan)",
      trade: "Custom Domain",
      quantity: 1,
      unit: "job",
      unitPrice: 3500,
      amount: 3500
    }
  ]);

  const handleAddCustomItem = () => {
    const newItem: QuoteLineItem = {
      id: `li-cust-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      description: "Custom Deliverable / Operation",
      trade: "Custom Domain",
      quantity: 1,
      unit: "pcs",
      unitPrice: 2500,
      amount: 2500
    };
    setCustomLineItems(prev => [...prev, newItem]);
  };

  const handleUpdateCustomItem = (index: number, field: keyof QuoteLineItem, value: any) => {
    setCustomLineItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        item.amount = Math.round((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleRemoveCustomItem = (index: number) => {
    setCustomLineItems(prev => {
      if (prev.length <= 1) {
        return [{
          id: `li-cust-${Date.now()}`,
          description: "Custom Engineering Deliverable",
          trade: "Custom Domain",
          quantity: 1,
          unit: "job",
          unitPrice: 1000,
          amount: 1000
        }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddOrUpdateCustomSetupFee = (amount: number = customSetupFee) => {
    setCustomLineItems(prev => {
      const existingIdx = prev.findIndex(item => item.unit === "setup" || item.description.toLowerCase().includes("setup"));
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          unitPrice: amount,
          amount: Math.round((Number(updated[existingIdx].quantity) || 1) * amount)
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `li-cust-setup-${Date.now()}`,
          description: "Workshop Machine Setup, Tooling & Calibration",
          trade: "Custom Domain",
          quantity: 1,
          unit: "setup",
          unitPrice: amount,
          amount: amount
        }
      ];
    });
  };

  const handleLoadCustomTemplate = (templateType: "material_labor" | "turnkey" | "consulting" | "repair") => {
    if (templateType === "material_labor") {
      setCustomLineItems([
        {
          id: `li-t1-1-${Date.now()}`,
          description: "Specialized Raw Material Stock & Ingot Sourcing",
          trade: "Custom Domain",
          quantity: 1,
          unit: "lot",
          unitPrice: 15000,
          amount: 15000
        },
        {
          id: `li-t1-2-${Date.now()}`,
          description: "Dedicated Master Machinist Run Time & Tooling Setup",
          trade: "Custom Domain",
          quantity: 10,
          unit: "hrs",
          unitPrice: 2000,
          amount: 20000
        },
        {
          id: `li-t1-3-${Date.now()}`,
          description: "Post-Machining Surface Finishing & Deburring",
          trade: "Custom Domain",
          quantity: 1,
          unit: "job",
          unitPrice: 4000,
          amount: 4000
        }
      ]);
    } else if (templateType === "turnkey") {
      setCustomLineItems([
        {
          id: `li-t2-1-${Date.now()}`,
          description: "Complete Turnkey System Engineering & Mechanical Assembly",
          trade: "Custom Domain",
          quantity: 1,
          unit: "system",
          unitPrice: 45000,
          amount: 45000
        },
        {
          id: `li-t2-2-${Date.now()}`,
          description: "Factory Acceptance Testing (FAT) & 24hr Load Run",
          trade: "Custom Domain",
          quantity: 1,
          unit: "test",
          unitPrice: 8500,
          amount: 8500
        }
      ]);
    } else if (templateType === "consulting") {
      setCustomLineItems([
        {
          id: `li-t3-1-${Date.now()}`,
          description: "Specialized Engineering R&D / Reverse Engineering Analysis",
          trade: "Custom Domain",
          quantity: 12,
          unit: "hrs",
          unitPrice: 2500,
          amount: 30000
        },
        {
          id: `li-t3-2-${Date.now()}`,
          description: "Production Drawing Package (.STEP, .DXF, .PDF with Tolerances)",
          trade: "Custom Domain",
          quantity: 1,
          unit: "package",
          unitPrice: 12000,
          amount: 12000
        }
      ]);
    } else if (templateType === "repair") {
      setCustomLineItems([
        {
          id: `li-t4-1-${Date.now()}`,
          description: "Workshop Component Disassembly, Cleaning & Ultrasonic Degreasing",
          trade: "Custom Domain",
          quantity: 1,
          unit: "job",
          unitPrice: 6000,
          amount: 6000
        },
        {
          id: `li-t4-2-${Date.now()}`,
          description: "Precision Hardfacing / Metal Spray Re-machining to OEM Specs",
          trade: "Custom Domain",
          quantity: 4,
          unit: "hrs",
          unitPrice: 2800,
          amount: 11200
        },
        {
          id: `li-t4-3-${Date.now()}`,
          description: "Replacement Seals, High-Tensile Fasteners & Final Pressure Test",
          trade: "Custom Domain",
          quantity: 1,
          unit: "set",
          unitPrice: 7500,
          amount: 7500
        }
      ]);
    }
  };

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
      const machineCost = Math.round(printHours * printMachineRate);
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
          unitPrice: printMachineRate,
          amount: machineCost
        }
      ];

      if (printSetupFee > 0) {
        items.push({
          id: "li-gen-3",
          description: "Build Chamber Setup, Slicing & Calibration",
          trade: "3D Printing",
          quantity: 1,
          unit: "setup",
          unitPrice: printSetupFee,
          amount: printSetupFee
        });
      }

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
      const cutCost = Math.round(laserCutMeters * laserCutRate);
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
          unitPrice: laserCutRate,
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
        }
      ];

      if (laserSetupFee > 0) {
        items.push({
          id: "li-gen-4",
          description: "Laser Beam Optical Alignment & Sheet Nesting Setup",
          trade: "Laser Cutting",
          quantity: 1,
          unit: "setup",
          unitPrice: laserSetupFee,
          amount: laserSetupFee
        });
      }
    } else if (selectedTrade === "CNC Machining") {
      const metalRates: Record<string, number> = {
        "Aluminum 6061-T6": settings.cnc.aluminum6061PerCc,
        "Brass C360": settings.cnc.brassPerCc,
        "Delrin / Acetal": settings.cnc.delrinPerCc,
        "Carbon Steel 1018": settings.cnc.steelPerCc,
      };
      const metalRate = metalRates[cncMetal] || 20;
      const metalCost = Math.round(cncVolumeCc * metalRate);
      const machCost = Math.round(cncMachiningHours * cncMachineRate);
      const fixCost = Math.round(cncFixtures * cncSetupPerFixture);

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
          unitPrice: cncMachineRate,
          amount: machCost
        }
      ];

      if (fixCost > 0) {
        items.push({
          id: "li-gen-3",
          description: `Fixture Clamping & Setup Calibrations (${cncFixtures} operations)`,
          trade: "CNC Machining",
          quantity: cncFixtures,
          unit: "fixtures",
          unitPrice: cncSetupPerFixture,
          amount: fixCost
        });
      }

      if (cncCamProgramming && cncCamFee > 0) {
        items.push({
          id: "li-gen-4",
          description: "Mastercam 3D Toolpath CAM Programming & Machine Code Verification",
          trade: "CNC Machining",
          quantity: 1,
          unit: "setup",
          unitPrice: cncCamFee,
          amount: cncCamFee
        });
      }
    } else if (selectedTrade === "CAD Design") {
      const rate = cadHourlyRate;
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
      const total = Math.round(constAreaSqFt * constRatePerSqFt);

      items = [
        {
          id: "li-gen-1",
          description: `Structural Fabrication & Erection: ${constStructureType} (${constAreaSqFt} sq.ft)`,
          trade: "Industrial Fabrication",
          quantity: constAreaSqFt,
          unit: "sq.ft",
          unitPrice: constRatePerSqFt,
          amount: total
        }
      ];
    } else if (selectedTrade === "Custom Domain") {
      items = customLineItems.map(item => ({
        ...item,
        trade: "Custom Domain" as TradeType
      }));
    }

    setLineItems(items);
  }, [
    selectedTrade,
    printMaterial,
    printWeightGrams,
    printHours,
    printInfill,
    printFinish,
    printMachineRate,
    printSetupFee,
    laserMaterial,
    laserAreaSqCm,
    laserCutMeters,
    laserPierces,
    laserCutRate,
    laserSetupFee,
    cncMetal,
    cncVolumeCc,
    cncMachiningHours,
    cncFixtures,
    cncCamProgramming,
    cncMachineRate,
    cncSetupPerFixture,
    cncCamFee,
    cadHours,
    cadComplexity,
    cadRevisions,
    cadHourlyRate,
    constAreaSqFt,
    constStructureType,
    constRatePerSqFt,
    customLineItems,
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

  // Auto-synchronize commercial terms when not manually customized
  useEffect(() => {
    if (!isTermsManuallyEdited) {
      setTerms(
        `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`
      );
    }
  }, [calculatedAdvancePercent, advanceRequired, balanceDue, isTermsManuallyEdited]);

  // Handle Quote Generation
  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + validDays);

    const tradeLabel = selectedTrade === "Custom Domain" ? (customTradeTitle.trim() || "Custom Domain") : selectedTrade;
    const finalTerms = terms.trim() || `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`;

    if (clientMode === "walkin") {
      if (!walkinName.trim() || !walkinPhone.trim()) {
        alert("Please enter the client full name and WhatsApp phone number.");
        return;
      }

      const title = quoteTitle.trim() || `${tradeLabel} Custom Order for ${walkinName.trim()}`;

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
            material: selectedTrade === "Custom Domain" ? (customTradeTitle.trim() || "Custom Domain") : printMaterial,
            weightGrams: printWeightGrams,
            sheetMaterial: laserMaterial,
            metalType: cncMetal,
            complexity: cadComplexity,
            customDomainName: customTradeTitle.trim(),
            customScope: customScopeNotes.trim(),
            customLeadTime: customLeadTime.trim()
          },
          lineItems: lineItems,
          subtotal: subtotal,
          discount: discount,
          total: total,
          advancePercent: calculatedAdvancePercent,
          advanceRequired: advanceRequired,
          notes: notes,
          terms: finalTerms,
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

    const title = quoteTitle.trim() || `${tradeLabel} Custom Order for ${contact.name}`;

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
        material: selectedTrade === "Custom Domain" ? (customTradeTitle.trim() || "Custom Domain") : printMaterial,
        weightGrams: printWeightGrams,
        sheetMaterial: laserMaterial,
        metalType: cncMetal,
        complexity: cadComplexity,
        customDomainName: customTradeTitle.trim(),
        customScope: customScopeNotes.trim(),
        customLeadTime: customLeadTime.trim()
      },
      lineItems: lineItems,
      subtotal: subtotal,
      discount: discount,
      total: total,
      advancePercent: calculatedAdvancePercent,
      advanceRequired: advanceRequired,
      notes: notes,
      terms: finalTerms,
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
      terms: editTerms.trim() || `${editAdvancePercent}% advance deposit (${formatCurrency(newAdvanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(newBalanceDue)} payable upon delivery.`,
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
              <span>{activeTab === "list" ? "Quotations & Estimates" : "New Quotation"}</span>
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700">
              {activeTab === "list" ? `${activeQuotes.length} Total Saved` : "Multan Workshop (PKR)"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
            {activeTab === "list" 
              ? "Search, review, print, and convert saved quotations or issue a new custom order estimate." 
              : "Select manufacturing specifications to calculate instant estimates for walk-in leads or registered clients."}
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
        <div className="space-y-4 no-print">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-[#fe7518] dark:hover:text-[#fe7518] transition-colors btn-haptic"
            >
              <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
              <span>← Back to Saved Quotations ({activeQuotes.length})</span>
            </button>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Drafting New Custom Estimate
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Step 1, 2, 3 */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Manufacturing Domain */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#fe7518] text-slate-950 flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-[#fe7518]/30 shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                      STEP 1: SELECT MANUFACTURING DOMAIN
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      Choose trade to load instant Multan workshop engineering rates
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 uppercase tracking-wider shrink-0">
                  PKR Engine
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
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
                    desc: "Acrylic, MDF & Sheet",
                    badge: "Vector CNC",
                    activeStyle: "bg-rose-50/90 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/40",
                    activeIcon: "text-rose-600 dark:text-rose-400",
                    activeTitle: "text-rose-700 dark:text-rose-300"
                  },
                  { 
                    name: "CNC Machining", 
                    icon: Cpu, 
                    desc: "6061 Billet & Brass",
                    badge: "Subtractive",
                    activeStyle: "bg-sky-50/90 dark:bg-sky-950/30 border-sky-500 ring-2 ring-sky-500/40",
                    activeIcon: "text-sky-600 dark:text-sky-400",
                    activeTitle: "text-sky-700 dark:text-sky-300"
                  },
                  { 
                    name: "CAD Design", 
                    icon: Compass, 
                    desc: "SolidWorks & Drawings",
                    badge: "Engineering",
                    activeStyle: "bg-violet-50/90 dark:bg-violet-950/30 border-violet-500 ring-2 ring-violet-500/40",
                    activeIcon: "text-violet-600 dark:text-violet-400",
                    activeTitle: "text-violet-700 dark:text-violet-300"
                  },
                  { 
                    name: "Industrial Fabrication", 
                    icon: Building2, 
                    desc: "Structural & Sheds",
                    badge: "Heavy Fab",
                    activeStyle: "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40",
                    activeIcon: "text-emerald-600 dark:text-emerald-400",
                    activeTitle: "text-emerald-700 dark:text-emerald-300"
                  },
                  { 
                    name: "Custom Domain", 
                    icon: Sliders, 
                    desc: "Bespoke & Custom Rates",
                    badge: "Bespoke",
                    activeStyle: "bg-amber-50/90 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/40",
                    activeIcon: "text-amber-600 dark:text-amber-400",
                    activeTitle: "text-amber-700 dark:text-amber-300"
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
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#fe7518] text-slate-950 shadow-xs">
                            Active
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

            {/* Step 2: Technical Parameters */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#fe7518] text-slate-950 flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-[#fe7518]/30 shrink-0">
                    2
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                      STEP 2: {selectedTrade === "Custom Domain" ? (customTradeTitle || "CUSTOM DOMAIN").toUpperCase() : selectedTrade.toUpperCase()} CALCULATION PARAMETERS
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      {selectedTrade === "Custom Domain"
                        ? "Define custom domain, specifications, and bespoke itemized cost formulas"
                        : "Configure stock envelope, machine run hours, and workshop finishing"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700 uppercase tracking-wider shrink-0">
                  {selectedTrade === "Custom Domain" ? "Bespoke Engine" : "Live Rates"}
                </span>
              </div>

              {/* 3D Printing Fields */}
              {selectedTrade === "3D Printing" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Filament / Resin Material</label>
                    <select
                      value={printMaterial}
                      onChange={(e) => setPrintMaterial(e.target.value)}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    >
                      <option value="PLA">PLA Standard (PKR {settings.printing.plaPerGram}/g)</option>
                      <option value="PETG">PETG High-Strength (PKR {settings.printing.petgPerGram}/g)</option>
                      <option value="ABS">ABS Heat-Resistant (PKR {settings.printing.absPerGram}/g)</option>
                      <option value="Resin">High-Detail SLA Resin (PKR {settings.printing.resinPerGram}/g)</option>
                      <option value="TPU">TPU Flexible (PKR {settings.printing.tpuPerGram}/g)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Part Weight (Grams)</label>
                    <input
                      type="number"
                      min={1}
                      value={printWeightGrams}
                      onChange={(e) => setPrintWeightGrams(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Estimated Print Time (Hours)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={printHours}
                      onChange={(e) => setPrintHours(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Infill Density (%)</label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={printInfill}
                      onChange={(e) => setPrintInfill(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Machine Hourly Rate (PKR/hr)</label>
                    <input
                      type="number"
                      min={0}
                      value={printMachineRate}
                      onChange={(e) => setPrintMachineRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Build Setup & Calibration Fee (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={printSetupFee}
                      onChange={(e) => setPrintSetupFee(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Surface Post-Processing</label>
                    <select
                      value={printFinish}
                      onChange={(e) => setPrintFinish(e.target.value)}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Sheet Substrate & Thickness</label>
                    <select
                      value={laserMaterial}
                      onChange={(e) => setLaserMaterial(e.target.value)}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    >
                      <option value="Acrylic 3mm Clear">Cast Acrylic 3mm Clear (PKR {settings.laser.acrylic3mmPerSqCm}/cm²)</option>
                      <option value="Acrylic 5mm Cast">Cast Acrylic 5mm Frosted (PKR {settings.laser.acrylic5mmPerSqCm}/cm²)</option>
                      <option value="MDF 3mm Sheet">MDF Laser Wood 3mm (PKR {settings.laser.mdf3mmPerSqCm}/cm²)</option>
                      <option value="Mild Steel Sheet 1.5mm">Mild Steel 1.5mm (PKR {settings.laser.mildSteelPerSqCm}/cm²)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Material Area (cm²)</label>
                    <input
                      type="number"
                      min={10}
                      value={laserAreaSqCm}
                      onChange={(e) => setLaserAreaSqCm(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Cut Path Length (Meters)</label>
                    <input
                      type="number"
                      min={1}
                      value={laserCutMeters}
                      onChange={(e) => setLaserCutMeters(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Pierce / Lead-in Points</label>
                    <input
                      type="number"
                      min={1}
                      value={laserPierces}
                      onChange={(e) => setLaserPierces(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Cut Rate (PKR/meter)</label>
                    <input
                      type="number"
                      min={0}
                      value={laserCutRate}
                      onChange={(e) => setLaserCutRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Laser Nesting & Setup Fee (PKR)</label>
                    <input
                      type="number"
                      min={0}
                      value={laserSetupFee}
                      onChange={(e) => setLaserSetupFee(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* CNC Machining Fields */}
              {selectedTrade === "CNC Machining" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Billet Alloy / Stock</label>
                    <select
                      value={cncMetal}
                      onChange={(e) => setCncMetal(e.target.value)}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    >
                      <option value="Aluminum 6061-T6">Aluminum 6061-T6 (PKR {settings.cnc.aluminum6061PerCc}/cm³)</option>
                      <option value="Brass C360">Brass C360 Free-Cutting (PKR {settings.cnc.brassPerCc}/cm³)</option>
                      <option value="Delrin / Acetal">Delrin / Acetal Polymer (PKR {settings.cnc.delrinPerCc}/cm³)</option>
                      <option value="Carbon Steel 1018">Carbon Steel 1018 (PKR {settings.cnc.steelPerCc}/cm³)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Stock Envelope Volume (cm³ / cc)</label>
                    <input
                      type="number"
                      min={10}
                      value={cncVolumeCc}
                      onChange={(e) => setCncVolumeCc(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Machine Run Time (Hours)</label>
                    <input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={cncMachiningHours}
                      onChange={(e) => setCncMachiningHours(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Fixtures & Setup Count</label>
                    <input
                      type="number"
                      min={1}
                      value={cncFixtures}
                      onChange={(e) => setCncFixtures(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">CNC Hourly Rate (PKR/hr)</label>
                    <input
                      type="number"
                      min={0}
                      value={cncMachineRate}
                      onChange={(e) => setCncMachineRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Fixture Setup Fee (PKR/fixture)</label>
                    <input
                      type="number"
                      min={0}
                      value={cncSetupPerFixture}
                      onChange={(e) => setCncSetupPerFixture(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="camCheck"
                        checked={cncCamProgramming}
                        onChange={(e) => setCncCamProgramming(e.target.checked)}
                        className="w-4 h-4 accent-[#fe7518] rounded cursor-pointer"
                      />
                      <label htmlFor="camCheck" className="text-slate-950 dark:text-zinc-100 font-bold cursor-pointer text-sm">
                        Include Mastercam 3D Toolpath Verification
                      </label>
                    </div>
                    {cncCamProgramming && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 whitespace-nowrap">CAM Fee (PKR):</label>
                        <input
                          type="number"
                          min={0}
                          value={cncCamFee}
                          onChange={(e) => setCncCamFee(Number(e.target.value))}
                          className="w-28 bg-white dark:bg-[#12141c] text-slate-950 dark:text-white px-2.5 py-1 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                        />
                      </div>
                    )}
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
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    >
                      <option value="Simple">Simple (Basic bracket or 2D profile - PKR {cadHourlyRate}/hr)</option>
                      <option value="Medium">Medium (Multi-component assembly - PKR {Math.round(cadHourlyRate * 1.35)}/hr)</option>
                      <option value="Complex">Complex (Full mechanism assembly, FEA study - PKR {Math.round(cadHourlyRate * 1.85)}/hr)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Estimated Engineering Hours</label>
                    <input
                      type="number"
                      min={1}
                      value={cadHours}
                      onChange={(e) => setCadHours(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Hourly Design Rate (PKR/hr)</label>
                    <input
                      type="number"
                      min={0}
                      value={cadHourlyRate}
                      onChange={(e) => setCadHourlyRate(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Included Revision Cycles</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={cadRevisions}
                      onChange={(e) => setCadRevisions(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setConstStructureType(val);
                        if (val === "Industrial Shed") setConstRatePerSqFt(settings.construction.industrialShedPerSqFt || 2300);
                        else if (val === "Grey Structure") setConstRatePerSqFt(settings.construction.greyStructurePerSqFt || 1850);
                        else if (val === "Turnkey Industrial") setConstRatePerSqFt(settings.construction.turnkeyPerSqFt || 3600);
                      }}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    >
                      <option value="Industrial Shed">Industrial Shed Steel Truss</option>
                      <option value="Grey Structure">Heavy Commercial Grey Structure</option>
                      <option value="Turnkey Industrial">Turnkey Complete Finishing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Total Covered Area (Sq.Ft)</label>
                    <input
                      type="number"
                      min={100}
                      value={constAreaSqFt}
                      onChange={(e) => setConstAreaSqFt(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Fabrication & Erection Rate (PKR/sq.ft)</label>
                    <input
                      type="number"
                      min={0}
                      value={constRatePerSqFt}
                      onChange={(e) => setConstRatePerSqFt(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Custom Domain Builder Fields */}
              {selectedTrade === "Custom Domain" && (
                <div className="space-y-4">
                  {/* Custom Domain Name + Presets */}
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-[#161822] border-2 border-amber-200 dark:border-zinc-700 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100">
                          Custom Trade / Domain Title *
                        </label>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          Free-form or click preset below
                        </span>
                      </div>
                      <input
                        type="text"
                        value={customTradeTitle}
                        onChange={(e) => setCustomTradeTitle(e.target.value)}
                        placeholder="e.g. Electronics & PCB Assembly, Tool & Die Making, Surface Finishing..."
                        className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm sm:text-base shadow-xs"
                      />
                    </div>

                    {/* Quick Preset Pills */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Popular Domain Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Electronics & PCB Assembly",
                          "Tool & Die Making",
                          "Powder Coating & Anodizing",
                          "Hydraulics & Pneumatics",
                          "Reverse Engineering & CMM",
                          "Sheet Metal Stamping",
                          "General Workshop Repair",
                          "Custom Automation & Robotics"
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCustomTradeTitle(preset)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              customTradeTitle === preset
                                ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                                : "bg-white dark:bg-[#1f2230] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:border-amber-400"
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Technical Scope & Lead Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-xs text-slate-950 dark:text-zinc-200 mb-1">
                          Technical Scope & Workshop Specs
                        </label>
                        <input
                          type="text"
                          value={customScopeNotes}
                          onChange={(e) => setCustomScopeNotes(e.target.value)}
                          placeholder="e.g. Turnkey assembly with material procurement and tolerance inspection"
                          className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-medium p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-xs text-slate-950 dark:text-zinc-200 mb-1">
                          Estimated Lead Time
                        </label>
                        <input
                          type="text"
                          value={customLeadTime}
                          onChange={(e) => setCustomLeadTime(e.target.value)}
                          placeholder="e.g. 5-7 Business Days"
                          className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-bold p-2.5 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Line Items & Rates Builder */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-300 dark:border-zinc-700 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                      <div>
                        <div className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-[#fe7518]" />
                          <span>Custom Calculation Line Items & Rates</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                          Build custom cost parameters, labor rates, and machine operations
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCustomItem}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fe7518] hover:bg-[#e56208] text-slate-950 text-xs font-black shadow-xs btn-haptic shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Line Item</span>
                      </button>
                    </div>

                    {/* Quick Template Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-bold text-slate-600 dark:text-zinc-400 text-[11px]">Templates:</span>
                      <button
                        type="button"
                        onClick={() => handleLoadCustomTemplate("material_labor")}
                        className="px-2 py-1 rounded bg-white dark:bg-[#1f2230] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 font-semibold text-[11px]"
                      >
                        + Material + Labor + Setup
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadCustomTemplate("turnkey")}
                        className="px-2 py-1 rounded bg-white dark:bg-[#1f2230] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 font-semibold text-[11px]"
                      >
                        + Turnkey System
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadCustomTemplate("consulting")}
                        className="px-2 py-1 rounded bg-white dark:bg-[#1f2230] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 font-semibold text-[11px]"
                      >
                        + Engineering / R&D
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadCustomTemplate("repair")}
                        className="px-2 py-1 rounded bg-white dark:bg-[#1f2230] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-zinc-700 hover:border-slate-500 font-semibold text-[11px]"
                      >
                        + Workshop Repair
                      </button>
                    </div>

                    {/* Setup & Tooling Fee Quick Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#12141c] rounded-xl border-2 border-slate-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                          Setup & Tooling Fee (PKR):
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={customSetupFee}
                          onChange={(e) => setCustomSetupFee(Number(e.target.value))}
                          className="w-28 bg-slate-50 dark:bg-[#181b24] text-slate-950 dark:text-white px-2.5 py-1 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddOrUpdateCustomSetupFee(customSetupFee)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700"
                        >
                          + Apply Setup Line
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        Directly calculates into live quotation subtotal and deposit
                      </span>
                    </div>

                    {/* Line Items List */}
                    <div className="space-y-2.5 pt-1">
                      {customLineItems.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-xl bg-white dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 space-y-2 shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center text-[10px] font-black shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={item.description}
                              placeholder="Item / Operation Description..."
                              onChange={(e) => handleUpdateCustomItem(idx, "description", e.target.value)}
                              className="flex-1 bg-slate-50 dark:bg-[#161822] text-slate-950 dark:text-white px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomItem(idx)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-zinc-400 uppercase">Quantity</label>
                              <input
                                type="number"
                                min={0.1}
                                step={0.1}
                                value={item.quantity}
                                onChange={(e) => handleUpdateCustomItem(idx, "quantity", Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#161822] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-zinc-400 uppercase">Unit</label>
                              <select
                                value={item.unit}
                                onChange={(e) => handleUpdateCustomItem(idx, "unit", e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#161822] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                              >
                                <option value="pcs">pcs</option>
                                <option value="hrs">hrs</option>
                                <option value="lot">lot</option>
                                <option value="job">job</option>
                                <option value="set">set</option>
                                <option value="units">units</option>
                                <option value="kg">kg</option>
                                <option value="grams">grams</option>
                                <option value="meters">meters</option>
                                <option value="sq.ft">sq.ft</option>
                                <option value="days">days</option>
                                <option value="package">package</option>
                                <option value="system">system</option>
                              </select>
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-zinc-400 uppercase">Unit Rate (PKR)</label>
                              <input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) => handleUpdateCustomItem(idx, "unitPrice", Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-[#161822] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-700 dark:text-zinc-400 uppercase">Amount</label>
                              <div className="p-1.5 bg-slate-100 dark:bg-[#181a24] rounded-lg text-xs font-black text-slate-950 dark:text-white text-right tabular-nums">
                                {formatCurrency(item.amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs font-bold">
                      <span className="text-slate-600 dark:text-zinc-400">Step 2 Subtotal Calculated:</span>
                      <span className="text-base font-black text-slate-950 dark:text-white tabular-nums">
                        {formatCurrency(customLineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Client & Commercial Terms */}
            <div className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border-2 border-slate-300 dark:border-zinc-700 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#fe7518] text-slate-950 flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-[#fe7518]/30 shrink-0">
                    3
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                      STEP 3: CLIENT & COMMERCIAL TERMS
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      Assign registered client or walk-in lead and configure deposit terms
                    </p>
                  </div>
                </div>
                
                {/* Segmented Client Toggle */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#161822] border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      clientMode === "existing"
                        ? "bg-[#fe7518] text-slate-950 shadow-sm font-black"
                        : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 font-bold"
                    }`}
                  >
                    <Users className="w-4 h-4" />
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
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm sm:text-base shadow-xs"
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
                      className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] focus:bg-white dark:focus:bg-[#1a1d29] focus:ring-2 focus:ring-[#fe7518]/30 outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-zinc-500 shadow-xs"
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
                        className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base placeholder-slate-400 shadow-xs"
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
                        className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base placeholder-slate-400 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Company (Optional)</label>
                      <input
                        type="text"
                        value={walkinCompany}
                        onChange={(e) => setWalkinCompany(e.target.value)}
                        placeholder="e.g. Nishat Mills"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base placeholder-slate-400 shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">City</label>
                      <input
                        type="text"
                        value={walkinCity}
                        onChange={(e) => setWalkinCity(e.target.value)}
                        placeholder="Multan"
                        className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-semibold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base placeholder-slate-400 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advance Deposit Presets + Custom Amount */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-sm font-extrabold text-slate-950 dark:text-zinc-100">
                    Advance Deposit Terms
                  </label>
                  <span className="text-xs font-black px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {calculatedAdvancePercent}% Deposit Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-600 dark:text-zinc-400">
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
                      className="w-full pl-12 pr-3.5 py-2.5 bg-white dark:bg-[#12141c] text-slate-950 dark:text-zinc-100 font-bold rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
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
                          className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all ${
                            isCurrent
                              ? "bg-[#fe7518] text-slate-950 shadow-xs ring-2 ring-[#fe7518]/50"
                              : "bg-white dark:bg-[#141620] text-slate-800 dark:text-zinc-200 border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-500"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-700 dark:text-zinc-300 pt-2.5 border-t border-slate-200 dark:border-zinc-800 font-semibold">
                  <span>Advance: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{formatCurrency(advanceRequired)}</strong></span>
                  <span>Balance Due: <strong className="text-amber-800 dark:text-amber-400 font-bold">{formatCurrency(balanceDue)}</strong></span>
                </div>
              </div>

              {/* Discount & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Discount Amount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100 mb-1.5">Validity (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={validDays}
                    onChange={(e) => setValidDays(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-bold p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-sm sm:text-base shadow-xs"
                  />
                </div>
              </div>

              {/* Payment Terms & Commercial Details */}
              <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-sm text-slate-950 dark:text-zinc-100">
                    Payment Terms & Advance Conditions
                  </label>
                  {isTermsManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTermsManuallyEdited(false);
                        const autoTerms = `${calculatedAdvancePercent}% advance deposit (${formatCurrency(advanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(balanceDue)} payable upon delivery.`;
                        setTerms(autoTerms);
                      }}
                      className="text-xs font-bold text-[#fe7518] hover:underline"
                    >
                      ↺ Reset to Formula
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => {
                    setTerms(e.target.value);
                    setIsTermsManuallyEdited(true);
                  }}
                  placeholder="e.g. 50% advance deposit (PKR 5,000) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of PKR 5,000 payable upon delivery."
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-zinc-100 font-medium p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 hover:border-slate-400 focus:border-[#fe7518] outline-none text-xs sm:text-sm shadow-xs resize-y"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                  Editable payment condition printed directly on the client quotation and WhatsApp dispatch.
                </p>
              </div>
            </div>
          </div>

          {/* Right Live Estimate & Issue (Sticky 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#12141c] rounded-2xl border-2 border-slate-300 dark:border-zinc-700 p-6 space-y-5 sticky top-20 shadow-md">
              <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-zinc-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#fe7518] text-slate-950 flex items-center justify-center text-sm font-black shadow-sm ring-2 ring-[#fe7518]/30 shrink-0">
                    4
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-black tracking-wide text-slate-950 dark:text-white uppercase">
                      STEP 4: LIVE ESTIMATE BREAKDOWN
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                      Real-time automated line items & totals
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700 uppercase tracking-wider shrink-0">
                  {lineItems.length} items
                </span>
              </div>

              {/* Itemized Table */}
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

              {/* Price Summary Breakdown */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0c0d12] border-2 border-slate-200 dark:border-zinc-800 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-bold">
                  <span>Subtotal Calculated:</span>
                  <CurrencyDisplay amount={subtotal} size="sm" />
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-bold">
                    <span>Discount Applied:</span>
                    <CurrencyDisplay amount={-discount} size="sm" numberColor="text-emerald-700 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-black text-slate-950 dark:text-white pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
                  <span className="text-[#fe7518]">Total Quotation:</span>
                  <CurrencyDisplay amount={total} size="lg" numberColor="text-[#fe7518]" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#151824] border-2 border-slate-300 dark:border-zinc-700 flex items-center justify-between text-xs sm:text-sm font-black">
                  <span className="text-slate-900 dark:text-zinc-100">Advance Deposit ({calculatedAdvancePercent}%):</span>
                  <CurrencyDisplay amount={advanceRequired} size="sm" numberColor="text-emerald-700 dark:text-emerald-400" />
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                onClick={handleCreateQuote}
                className="w-full flex items-center justify-center gap-2 bg-[#fe7518] hover:bg-[#e56208] text-slate-950 py-3.5 px-4 rounded-xl font-black text-sm shadow-md border-2 border-[#e56208] btn-haptic"
              >
                <FileText className="w-4 h-4" />
                <span>Save & Issue Quotation</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Saved Quotes View */
        <div className="space-y-4">
          {/* Mobile View Switcher Tab */}
          <div className="lg:hidden flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#12141c] border-2 border-slate-200 dark:border-zinc-800 text-xs no-print">
            <button
              type="button"
              onClick={() => setQuotesMobileTab("list")}
              className={`flex-1 py-2 px-3 rounded-lg transition-all font-bold min-h-[40px] flex items-center justify-center gap-1.5 touch-manipulation ${
                quotesMobileTab === "list"
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
                  : "text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Quotes List ({filteredQuotes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setQuotesMobileTab("preview")}
              disabled={!selectedQuoteForPreview}
              className={`flex-1 py-2 px-3 rounded-lg transition-all font-bold min-h-[40px] flex items-center justify-center gap-1.5 touch-manipulation disabled:opacity-40 ${
                quotesMobileTab === "preview"
                  ? "bg-[#fe7518] text-slate-950 font-black shadow-xs"
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
              {/* Search & Status Filters */}
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
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(q);
                              }}
                              className="py-1.5 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-slate-300 dark:border-zinc-700"
                            >
                              <Edit className="w-3.5 h-3.5 text-[#fe7518]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuoteToDelete(q);
                              }}
                              className="py-1.5 px-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1 border border-rose-300 dark:border-rose-800"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
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
            <div className={`lg:col-span-8 ${quotesMobileTab === "list" ? "hidden lg:block" : "block"}`}>
              {selectedQuoteForPreview ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white dark:bg-[#12141c] p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuotesMobileTab("list")}
                        className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 text-xs font-bold border border-slate-300 dark:border-zinc-700 btn-haptic"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#fe7518]" />
                        <span>Quotes List</span>
                      </button>
                      <span className="text-xs text-slate-600 dark:text-zinc-400 font-bold">Previewing:</span>
                      <strong className="text-slate-950 dark:text-white font-mono text-sm">{selectedQuoteForPreview.id}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
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

                  {/* Isolated Printable Quotation */}
                  <div 
                    id="quotation-print-area"
                    className="printable-document bg-white text-black p-4 sm:p-8 sm:p-10 rounded-2xl shadow-xl print-surface font-sans space-y-8 min-h-[750px] overflow-x-auto"
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
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="border-b-2 border-slate-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-[#fe7518]" />
                  <span>Edit Quotation ({editingQuote.id})</span>
                </h3>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">
                  Modify line items, quantities, rates, discounts, or terms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="text-slate-500 hover:text-slate-950 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Quotation Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-white px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm font-bold shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Manufacturing Trade</label>
                  <select
                    value={editTrade}
                    onChange={(e) => setEditTrade(e.target.value as TradeType)}
                    className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-white px-3 py-2 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-sm font-bold shadow-xs"
                  >
                    <option value="CNC Machining">CNC Machining</option>
                    <option value="3D Printing">3D Printing</option>
                    <option value="Laser Cutting">Laser Cutting</option>
                    <option value="CAD Design">CAD Design</option>
                    <option value="Industrial Fabrication">Industrial Fabrication</option>
                    <option value="Custom Domain">Custom Domain</option>
                  </select>
                </div>
              </div>

              {/* Line Items Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100">Line Items & Rates</label>
                  <button
                    type="button"
                    onClick={handleAddEditLineItem}
                    className="flex items-center gap-1 text-xs font-bold text-[#fe7518] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {editLineItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.description}
                          placeholder="Item Description"
                          onChange={(e) => handleUpdateEditLineItem(idx, "description", e.target.value)}
                          className="flex-1 bg-white dark:bg-[#12141c] text-slate-950 dark:text-white px-3 py-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none text-xs font-semibold"
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
                          <label className="block text-[11px] font-bold text-slate-900 dark:text-zinc-200">Qty & Unit</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleUpdateEditLineItem(idx, "quantity", Number(e.target.value))}
                              className="w-16 bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleUpdateEditLineItem(idx, "unit", e.target.value)}
                              className="w-14 bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 dark:text-zinc-200">Rate (PKR)</label>
                          <input
                            type="number"
                            min={0}
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateEditLineItem(idx, "unitPrice", Number(e.target.value))}
                            className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-1.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-900 dark:text-zinc-200">Amount (PKR)</label>
                          <div className="p-1.5 bg-slate-100 dark:bg-[#12141c] rounded-lg text-xs font-black text-slate-950 dark:text-zinc-100 text-right">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount & Advance % */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#161822] border-2 border-slate-200 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-200 mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-2 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-200 mb-1">Advance Deposit (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editAdvancePercent}
                    onChange={(e) => setEditAdvancePercent(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-2 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Terms & Payment Conditions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-950 dark:text-zinc-200">
                    Payment Terms & Deposit Conditions
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditTerms(
                        `${editAdvancePercent}% advance deposit (${formatCurrency(editAdvanceRequired)}) required to procure materials and reserve workshop machine queue in Multan. Remaining balance of ${formatCurrency(Math.max(0, editTotal - editAdvanceRequired))} payable upon delivery.`
                      );
                    }}
                    className="text-[10px] font-bold text-[#fe7518] hover:underline"
                  >
                    ↺ Reset to Formula
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={editTerms}
                  onChange={(e) => setEditTerms(e.target.value)}
                  className="w-full bg-white dark:bg-[#12141c] text-slate-950 dark:text-white p-2.5 rounded-lg border-2 border-slate-300 dark:border-zinc-700 text-xs font-medium focus:border-[#fe7518] outline-none shadow-xs"
                  placeholder="e.g. 50% advance deposit (PKR 5,000) required to procure materials..."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#0c0d12] border-2 border-slate-300 dark:border-zinc-800 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">Total: </span>
                  <strong className="text-[#fe7518] text-base font-black ml-1">{formatCurrency(editTotal)}</strong>
                </div>
                <div>
                  <span className="text-slate-700 dark:text-zinc-300 font-bold">Advance Required: </span>
                  <strong className="text-emerald-700 dark:text-emerald-400 text-base font-black ml-1">{formatCurrency(editAdvanceRequired)}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    const q = editingQuote;
                    setEditingQuote(null);
                    setQuoteToDelete(q);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-800 font-bold text-xs btn-haptic"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Quote</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingQuote(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs shadow-xs btn-haptic"
                  >
                    Save Changes to Quote
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert to Job Modal */}
      {convertModalQuote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-[#12141c] border-2 border-slate-300 dark:border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="border-b-2 border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#fe7518]" />
                <span>Approve Quote & Start Production</span>
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mt-0.5">
                Converts {convertModalQuote.id} into an active Job on the Kanban board.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-[#181a24] rounded-xl border-2 border-slate-200 dark:border-zinc-800 space-y-1.5">
                <div className="text-slate-950 dark:text-white font-black text-sm">{convertModalQuote.title}</div>
                <div className="text-[#fe7518] font-bold text-xs">Client: {convertModalQuote.contactName}</div>
                <div className="text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-700">
                  <span>Total: {formatCurrency(convertModalQuote.total)}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">Advance: {formatCurrency(convertModalQuote.advanceRequired)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-950 dark:text-zinc-100 mb-1.5">Target Completion Deadline</label>
                <input
                  type="date"
                  value={convertDeadline}
                  onChange={(e) => setConvertDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-[#161822] text-slate-950 dark:text-white p-3 rounded-xl border-2 border-slate-300 dark:border-zinc-700 focus:border-[#fe7518] outline-none font-bold text-sm shadow-xs"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#181b24] border-2 border-slate-300 dark:border-zinc-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="advanceRec"
                  checked={convertAdvanceReceived}
                  onChange={(e) => setConvertAdvanceReceived(e.target.checked)}
                  className="w-5 h-5 accent-[#fe7518] rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="advanceRec" className="cursor-pointer">
                  <span className="text-slate-950 dark:text-white font-extrabold text-sm block">
                    Advance Deposit of {formatCurrency(convertModalQuote.advanceRequired)} Received
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mt-0.5">
                    Marks deposit as collected and deducts from final invoice balance
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConvertModalQuote(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-5 py-2.5 rounded-xl bg-[#fe7518] hover:bg-[#e56208] text-slate-950 font-black text-xs shadow-xs btn-haptic"
              >
                Start Production Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quote Confirmation Modal */}
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
              This will permanently remove quotation <strong className="font-mono text-slate-950 dark:text-white">{quoteToDelete.id}</strong> ({quoteToDelete.title}). This action cannot be undone.
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
    </div>
  );
};
