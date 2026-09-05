import { Contact, Quote, Job, Invoice, TradeRatesSettings } from "@/types";

export const initialSettings: TradeRatesSettings = {
  printing: {
    plaPerGram: 4.5,
    petgPerGram: 6.5,
    absPerGram: 7.0,
    resinPerGram: 18.0,
    tpuPerGram: 10.0,
    machineRatePerHour: 250,
    setupFee: 300,
  },
  laser: {
    acrylic3mmPerSqCm: 0.7,
    acrylic5mmPerSqCm: 1.2,
    mdf3mmPerSqCm: 0.35,
    mildSteelPerSqCm: 1.8,
    cutRatePerMeter: 85,
    pierceCost: 6,
    setupFee: 400,
  },
  cnc: {
    aluminum6061PerCc: 20,
    brassPerCc: 42,
    delrinPerCc: 14,
    steelPerCc: 12,
    machineRatePerHour: 1800,
    camProgrammingFee: 2500,
    setupPerFixture: 1200,
  },
  cad: {
    hourlyRatePkr: 1800,
    simpleMultiplier: 1.0,
    mediumMultiplier: 1.35,
    complexMultiplier: 1.85,
    extraRevisionRate: 1500,
  },
  construction: {
    greyStructurePerSqFt: 1850,
    turnkeyPerSqFt: 3600,
    industrialShedPerSqFt: 2300,
  },
  company: {
    name: "PAKMEC Precision Engineering",
    tagline: "High-Precision CNC, 3D Printing, Laser Cutting & Industrial Design",
    phone: "+92 300 8472910",
    whatsapp: "+92 300 8472910",
    email: "engineering@pakmec.com",
    address: "Plot 18-A, Phase 2, Industrial Estate, Multan, Pakistan",
    city: "Multan",
    bankName: "Meezan Bank Ltd",
    bankAccountTitle: "PAKMEC ENGINEERING SERVICES",
    bankIban: "PK42MEZN0099340102938471",
    jazzCashNumber: "0300-8472910",
    easyPaisaNumber: "0300-8472910",
    defaultAdvancePercent: 50,
  }
};

export const initialContacts: Contact[] = [
  {
    id: "cnt-001",
    name: "Tariq Mahmood",
    company: "AeroDynamics Multan",
    phone: "+92 321 4458921",
    email: "tariq@aerodynamics.pk",
    city: "Multan",
    address: "Bosan Road, Multan",
    tradeTags: ["CNC Machining", "CAD Design"],
    notes: "Regular client for CNC aluminum aerospace prototypes. Prefers 50% bank advance.",
    createdAt: "2026-08-10T10:00:00Z",
    whatsappLogs: [
      {
        id: "wlog-101",
        date: "2026-09-01 11:20 AM",
        author: "PAKMEC",
        text: "Tariq messaged with STEP files for 50x drone motor mounts in 6061-T6 aluminum. Requested rush delivery within 7 days.",
        type: "inquiry"
      },
      {
        id: "wlog-102",
        date: "2026-09-02 03:45 PM",
        author: "PAKMEC",
        text: "Sent official Quote QT-2026-001 (PKR 48,500). Agreed to 50% advance. Client approved immediately.",
        type: "quote"
      },
      {
        id: "wlog-103",
        date: "2026-09-03 09:15 AM",
        author: "PAKMEC",
        text: "Received PKR 24,250 advance via Meezan Bank transfer. Verified transaction ID #MEZN883921. Moved job to queued production.",
        type: "payment"
      }
    ]
  },
  {
    id: "cnt-002",
    name: "Bilal Farooq",
    company: "RoboTech Systems",
    phone: "+92 301 8847219",
    email: "bilal@robotech.com.pk",
    city: "Multan",
    address: "Shah Rukn-e-Alam, Multan",
    tradeTags: ["3D Printing", "CAD Design"],
    notes: "Robotics projects. Requires lightweight high-infill PETG and Resin components for gripper claws.",
    createdAt: "2026-08-15T14:30:00Z",
    whatsappLogs: [
      {
        id: "wlog-201",
        date: "2026-09-03 04:00 PM",
        author: "PAKMEC",
        text: "Discussed custom gripper gear tolerance on WhatsApp audio. Client requested 0.15mm layer height on resin SLA.",
        type: "inquiry"
      },
      {
        id: "wlog-202",
        date: "2026-09-04 10:15 AM",
        author: "PAKMEC",
        text: "Sent quote QT-2026-002 for PKR 18,400. Client asked if we can do EasyPaisa for 50% deposit.",
        type: "quote"
      }
    ]
  },
  {
    id: "cnt-003",
    name: "Ayesha Khan",
    company: "Studio ArchMatrix",
    phone: "+92 333 5591204",
    email: "ayesha@archmatrix.design",
    city: "Multan",
    address: "Cantt, Multan",
    tradeTags: ["Laser Cutting"],
    notes: "Architectural firm. Demands pristine laser-cut acrylic and wood with zero scorch marks.",
    createdAt: "2026-08-20T09:15:00Z",
    whatsappLogs: [
      {
        id: "wlog-301",
        date: "2026-09-02 06:10 PM",
        author: "PAKMEC",
        text: "Sent DXF vectors for high-rise facade model. Needs 3mm frosted acrylic and 5mm clear panels.",
        type: "inquiry"
      },
      {
        id: "wlog-302",
        date: "2026-09-03 12:30 PM",
        author: "PAKMEC",
        text: "Advance payment of PKR 12,000 received via JazzCash. Production running on laser cutter.",
        type: "payment"
      }
    ]
  },
  {
    id: "cnt-004",
    name: "Zubair Hashmi",
    company: "Hashmi Automotive & Dies",
    phone: "+92 300 6128490",
    email: "zubair@hashmidies.com",
    city: "Multan",
    address: "Vehari Road, Industrial Area, Multan",
    tradeTags: ["CNC Machining", "Industrial Fabrication"],
    notes: "Heavy die and mould casting jobs. Needs mill-finish steel machining.",
    createdAt: "2026-08-25T11:00:00Z",
    whatsappLogs: [
      {
        id: "wlog-401",
        date: "2026-08-28 02:20 PM",
        author: "PAKMEC",
        text: "Client visited workshop in Multan with cast iron sample. Discussed fixture setup and tool wear fees.",
        type: "general"
      }
    ]
  }
];

export const initialQuotes: Quote[] = [
  {
    id: "QT-2026-001",
    contactId: "cnt-001",
    contactName: "Tariq Mahmood",
    contactPhone: "+92 321 4458921",
    contactCompany: "AeroDynamics Multan",
    title: "50x CNC Machined 6061-T6 Drone Motor Brackets",
    trade: "CNC Machining",
    status: "approved",
    currency: "PKR",
    date: "2026-09-02",
    validUntil: "2026-09-16",
    specs: {
      trade: "CNC Machining",
      metalType: "Aluminum 6061-T6",
      materialVolumeCc: 450,
      machiningHours: 12,
      fixturesCount: 2,
      camProgrammingNeeded: true,
    },
    lineItems: [
      { id: "li-1", description: "Raw Billet Aluminum 6061-T6 (450 cm³)", trade: "CNC Machining", quantity: 50, unit: "pcs", unitPrice: 380, amount: 19000 },
      { id: "li-2", description: "3-Axis Precision CNC Machining Time (12 hrs total)", trade: "CNC Machining", quantity: 12, unit: "hrs", unitPrice: 1800, amount: 21600 },
      { id: "li-3", description: "Mastercam Toolpath Programming & Simulation", trade: "CNC Machining", quantity: 1, unit: "setup", unitPrice: 2500, amount: 2500 },
      { id: "li-4", description: "Soft-Jaw Custom Fixturing & Calibration", trade: "CNC Machining", quantity: 2, unit: "fixtures", unitPrice: 1200, amount: 2400 },
      { id: "li-5", description: "Tumble Deburring & Ultrasonic Cleaning", trade: "CNC Machining", quantity: 50, unit: "pcs", unitPrice: 60, amount: 3000 },
    ],
    subtotal: 48500,
    discount: 0,
    total: 48500,
    advancePercent: 50,
    advanceRequired: 24250,
    notes: "Tolerances held within ±0.03mm. Anodizing can be quoted separately if required.",
    terms: "50% advance required to initiate machine scheduling and stock procurement. Balance due upon delivery inspection.",
    convertedToJobId: "JOB-2026-001"
  },
  {
    id: "QT-2026-002",
    contactId: "cnt-002",
    contactName: "Bilal Farooq",
    contactPhone: "+92 301 8847219",
    contactCompany: "RoboTech Systems",
    title: "10x High-Detail SLA Resin Robotic Gripper Mechanism",
    trade: "3D Printing",
    status: "approved",
    currency: "PKR",
    date: "2026-09-03",
    validUntil: "2026-09-17",
    specs: {
      trade: "3D Printing",
      material: "Tough UV Resin (Black)",
      weightGrams: 320,
      printHours: 18,
      infillPercent: 100,
      finishing: "IPA Wash + UV Post-Cure + Matte Finish",
    },
    lineItems: [
      { id: "li-201", description: "Engineering Tough Resin Material (320g)", trade: "3D Printing", quantity: 320, unit: "grams", unitPrice: 18, amount: 5760 },
      { id: "li-202", description: "Elegoo Saturn 4 Ultra SLA Machine Time (18 hrs)", trade: "3D Printing", quantity: 18, unit: "hrs", unitPrice: 500, amount: 9000 },
      { id: "li-203", description: "Automated IPA Wash, Support Removal & 405nm UV Curing", trade: "3D Printing", quantity: 10, unit: "sets", unitPrice: 200, amount: 2000 },
      { id: "li-204", description: "Build Plate Calibration & Slicing Setup", trade: "3D Printing", quantity: 1, unit: "setup", unitPrice: 1640, amount: 1640 },
    ],
    subtotal: 18400,
    discount: 0,
    total: 18400,
    advancePercent: 50,
    advanceRequired: 9200,
    notes: "0.05mm layer height. Dimensional inspection report included.",
    terms: "50% advance prior to print batch execution.",
    convertedToJobId: "JOB-2026-002"
  },
  {
    id: "QT-2026-003",
    contactId: "cnt-003",
    contactName: "Ayesha Khan",
    contactPhone: "+92 333 5591204",
    contactCompany: "Studio ArchMatrix",
    title: "Architectural Scale Model Laser Cutting (Acrylic & MDF)",
    trade: "Laser Cutting",
    status: "approved",
    currency: "PKR",
    date: "2026-09-02",
    validUntil: "2026-09-16",
    specs: {
      trade: "Laser Cutting",
      sheetMaterial: "Cast Acrylic 3mm & 5mm Clear",
      thicknessMm: 3,
      areaSqCm: 4500,
      cutLengthMeters: 65,
      pierces: 120,
    },
    lineItems: [
      { id: "li-301", description: "Cast Acrylic Sheet 3mm Clear (3000 cm²)", trade: "Laser Cutting", quantity: 3000, unit: "cm²", unitPrice: 0.7, amount: 2100 },
      { id: "li-302", description: "Cast Acrylic Sheet 5mm Frosted (1500 cm²)", trade: "Laser Cutting", quantity: 1500, unit: "cm²", unitPrice: 1.2, amount: 1800 },
      { id: "li-303", description: "CO2 150W Laser Cutting Path Vector Run (65 meters)", trade: "Laser Cutting", quantity: 65, unit: "meters", unitPrice: 85, amount: 5525 },
      { id: "li-304", description: "Micro-pierces & Corner Raster Engravings (120 pts)", trade: "Laser Cutting", quantity: 120, unit: "pts", unitPrice: 6, amount: 720 },
      { id: "li-305", description: "Protective Film Peel & Edge Flame Polish", trade: "Laser Cutting", quantity: 1, unit: "batch", unitPrice: 1855, amount: 1855 },
    ],
    subtotal: 12000,
    discount: 0,
    total: 12000,
    advancePercent: 50,
    advanceRequired: 6000,
    notes: "Clean polished edges, zero burns, protective paper left on reverse side.",
    terms: "50% advance confirmed.",
    convertedToJobId: "JOB-2026-003"
  }
];

export const initialJobs: Job[] = [
  {
    id: "JOB-2026-001",
    quoteId: "QT-2026-001",
    contactId: "cnt-001",
    contactName: "Tariq Mahmood",
    contactPhone: "+92 321 4458921",
    contactCompany: "AeroDynamics Multan",
    title: "50x CNC Machined 6061 Drone Motor Brackets",
    trade: "CNC Machining",
    stage: "in_progress",
    priority: "urgent",
    currency: "PKR",
    totalAmount: 48500,
    advancePaid: 24250,
    advanceStatus: "collected",
    balanceDue: 24250,
    startDate: "2026-09-03",
    deadline: "2026-09-09",
    specsSummary: "Aluminum 6061-T6, 3-Axis CNC, ±0.03mm tolerance, 50 pieces",
    notes: "Currently running second fixture operation on CNC mill.",
    referenceItems: [
      {
        id: "ref-item-1",
        title: "Client WhatsApp Spec Photo",
        type: "image",
        url: "/samples/ref-1.jpg",
        notes: "Reference image sent by Tariq showing desired chamfer angle and pocket depth.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-02 11:30 AM",
        fileSize: "82 KB",
        tag: "Client Reference"
      },
      {
        id: "ref-item-2",
        title: "Workshop Progress: Raw Billet Fixturing",
        type: "progress_photo",
        url: "/samples/ref-2.jpg",
        notes: "Soft-jaw setup in CNC vise.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-04 02:15 PM",
        fileSize: "86 KB",
        tag: "In-Progress"
      },
      {
        id: "ref-item-3",
        title: "Production STEP CAD File (Rev 2.4)",
        type: "cad_file",
        url: "file:///c:/PAKMEC%20CRM/cad/drone_bracket_rev2_4.step",
        notes: "Final validated 3D model with 3.2mm mounting hole offsets.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-02 04:00 PM",
        fileSize: "4.8 MB",
        tag: "CAD Model"
      },
      {
        id: "ref-item-4",
        title: "Machine Tooling Spec Note",
        type: "note",
        url: "",
        notes: "Use 6mm 3-flute carbide endmill for roughing at 8,000 RPM, 1200 mm/min. Finish pass with 3mm ball-nose for fillets.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-03 09:00 AM",
        tag: "CAM Setup"
      }
    ]
  },
  {
    id: "JOB-2026-002",
    quoteId: "QT-2026-002",
    contactId: "cnt-002",
    contactName: "Bilal Farooq",
    contactPhone: "+92 301 8847219",
    contactCompany: "RoboTech Systems",
    title: "10x High-Detail SLA Resin Robotic Gripper Mechanism",
    trade: "3D Printing",
    stage: "qc",
    priority: "high",
    currency: "PKR",
    totalAmount: 18400,
    advancePaid: 9200,
    advanceStatus: "collected",
    balanceDue: 9200,
    startDate: "2026-09-03",
    deadline: "2026-09-07",
    specsSummary: "Black Tough UV Resin, 0.05mm layer height, 10 sets",
    notes: "Printing finished. Currently in UV curing oven.",
    referenceItems: [
      {
        id: "ref-item-201",
        title: "Post-Cure Inspection Photo",
        type: "progress_photo",
        url: "/samples/ref-3.jpg",
        notes: "High-resolution macro shot of gear teeth post-curing.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-05 10:00 AM",
        fileSize: "79 KB",
        tag: "Quality Control"
      }
    ]
  },
  {
    id: "JOB-2026-003",
    quoteId: "QT-2026-003",
    contactId: "cnt-003",
    contactName: "Ayesha Khan",
    contactPhone: "+92 333 5591204",
    contactCompany: "Studio ArchMatrix",
    title: "Architectural Scale Model Laser Cutting",
    trade: "Laser Cutting",
    stage: "ready",
    priority: "medium",
    currency: "PKR",
    totalAmount: 12000,
    advancePaid: 6000,
    advanceStatus: "collected",
    balanceDue: 0,
    startDate: "2026-09-02",
    deadline: "2026-09-06",
    specsSummary: "3mm Clear & 5mm Frosted Acrylic, 65m cutting length",
    notes: "All panels cut and packed in bubble wrap. 100% paid, cleared for dispatch.",
    referenceItems: [
      {
        id: "ref-item-301",
        title: "Final Cut Panels In Workshop",
        type: "progress_photo",
        url: "/samples/ref-4.jpg",
        notes: "Assembled test facade demonstrating interlocking joints.",
        uploadedBy: "PAKMEC",
        uploadedAt: "2026-09-04 04:45 PM",
        fileSize: "86 KB",
        tag: "Ready for Delivery"
      }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-001",
    jobId: "JOB-2026-003",
    quoteId: "QT-2026-003",
    contactId: "cnt-003",
    contactName: "Ayesha Khan",
    contactPhone: "+92 333 5591204",
    contactCompany: "Studio ArchMatrix",
    date: "2026-09-05",
    dueDate: "2026-09-12",
    currency: "PKR",
    totalAmount: 12000,
    advanceDeducted: 6000,
    balancePayable: 6000,
    amountPaid: 6000,
    status: "paid",
    lineItems: [
      { description: "Total Agreed Job Quote: Architectural Laser Cutting Panels", quantity: 1, unitPrice: 12000, amount: 12000 },
      { description: "Less: Advance Deposit Received via JazzCash on 2026-09-02", quantity: 1, unitPrice: -6000, amount: -6000 }
    ],
    payments: [
      {
        id: "pay-101",
        date: "2026-09-02",
        amount: 6000,
        method: "JazzCash",
        referenceNumber: "JC-99281729",
        receivedBy: "PAKMEC",
        type: "advance",
        notes: "50% initial advance deposit"
      },
      {
        id: "pay-102",
        date: "2026-09-05",
        amount: 6000,
        method: "Bank Transfer",
        referenceNumber: "HBL-TRX-449102",
        receivedBy: "PAKMEC",
        type: "settlement",
        notes: "Final balance settled prior to parcel dispatch"
      }
    ],
    notes: "Paid in full. Parcel tracking #TCS-88392019."
  },
  {
    id: "INV-2026-002",
    jobId: "JOB-2026-001",
    quoteId: "QT-2026-001",
    contactId: "cnt-001",
    contactName: "Tariq Mahmood",
    contactPhone: "+92 321 4458921",
    contactCompany: "AeroDynamics Multan",
    date: "2026-09-04",
    dueDate: "2026-09-11",
    currency: "PKR",
    totalAmount: 48500,
    advanceDeducted: 24250,
    balancePayable: 24250,
    amountPaid: 0,
    status: "unpaid",
    lineItems: [
      { description: "50x CNC Machined 6061-T6 Drone Motor Brackets", quantity: 50, unitPrice: 970, amount: 48500 },
      { description: "Less: 50% Production Advance Received on 2026-09-03", quantity: 1, unitPrice: -24250, amount: -24250 }
    ],
    payments: [
      {
        id: "pay-103",
        date: "2026-09-03",
        amount: 24250,
        method: "Bank Transfer",
        referenceNumber: "MEZN-991024",
        receivedBy: "PAKMEC",
        type: "advance",
        notes: "50% production advance deposit"
      }
    ],
    notes: "Remaining balance of PKR 24,250 payable upon delivery inspection."
  },
  {
    id: "INV-2026-003",
    jobId: "JOB-2026-002",
    quoteId: "QT-2026-002",
    contactId: "cnt-002",
    contactName: "Bilal Farooq",
    contactPhone: "+92 301 8847219",
    contactCompany: "RoboTech Systems",
    date: "2026-09-04",
    dueDate: "2026-09-14",
    currency: "PKR",
    totalAmount: 18400,
    advanceDeducted: 9200,
    balancePayable: 9200,
    amountPaid: 0,
    status: "unpaid",
    lineItems: [
      { description: "10x High-Detail SLA Resin Robotic Gripper Mechanism", quantity: 10, unitPrice: 1840, amount: 18400 },
      { description: "Less: 50% Production Advance Received on 2026-09-03", quantity: 1, unitPrice: -9200, amount: -9200 }
    ],
    payments: [
      {
        id: "pay-104",
        date: "2026-09-03",
        amount: 9200,
        method: "Bank Transfer",
        referenceNumber: "NP-8837192",
        receivedBy: "PAKMEC",
        type: "advance",
        notes: "50% SLA print advance deposit"
      }
    ],
    notes: "Remaining balance of PKR 9,200 payable before delivery dispatch."
  }
];
