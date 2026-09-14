import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";
import { Contact, Quote, Job, Invoice, TradeRatesSettings } from "@/types";
import { 
  initialContacts, 
  initialQuotes, 
  initialJobs, 
  initialInvoices, 
  initialSettings 
} from "@/lib/mockData";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase";

// Ensure data folder exists for local SQLite mode
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    // Ignore in read-only environments (Vercel edge)
  }
}

const dbPath = path.join(dataDir, "pakmec.db");
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || `file:${dbPath.replace(/\\/g, "/")}`,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

let initialized = false;

export async function initDatabase() {
  if (initialized) return;

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    try {
      // Check if the system has been initialized before by checking the settings table
      const { data: settingsData, error: sErr } = await supabase.from("settings").select("id").eq("id", "main").maybeSingle();
      
      if (!sErr && !settingsData) {
        // First-time database setup only: create initial settings and initial seed dataset
        console.log("First-time Supabase initialization: seeding initial schema data...");
        await supabase.from("settings").upsert([{ id: "main", data: initialSettings }]);
        await supabase.from("contacts").upsert(initialContacts.map(c => ({ id: c.id, data: c })));
        await supabase.from("quotes").upsert(initialQuotes.map(q => ({ id: q.id, data: q })));
        await supabase.from("jobs").upsert(initialJobs.map(j => ({ id: j.id, data: j })));
        await supabase.from("invoices").upsert(initialInvoices.map(i => ({ id: i.id, data: i })));
      }
    } catch (err) {
      console.warn("Supabase check/seed warning:", err);
    }
    initialized = true;
    return;
  }

  // Local SQLite Mode: Create tables if not exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS quotes (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);

  // Check if SQLite system is initialized by inspecting settings
  const settingsCheck = await db.execute("SELECT id FROM settings WHERE id = 'main'");
  if (settingsCheck.rows.length === 0) {
    console.log("First-time SQLite initialization: seeding default settings and initial data...");
    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (id, data) VALUES ('main', ?)",
      args: [JSON.stringify(initialSettings)]
    });

    for (const c of initialContacts) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO contacts (id, data) VALUES (?, ?)",
        args: [c.id, JSON.stringify(c)]
      });
    }

    for (const q of initialQuotes) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO quotes (id, data) VALUES (?, ?)",
        args: [q.id, JSON.stringify(q)]
      });
    }

    for (const j of initialJobs) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO jobs (id, data) VALUES (?, ?)",
        args: [j.id, JSON.stringify(j)]
      });
    }

    for (const i of initialInvoices) {
      await db.execute({
        sql: "INSERT OR REPLACE INTO invoices (id, data) VALUES (?, ?)",
        args: [i.id, JSON.stringify(i)]
      });
    }
  }

  initialized = true;
}

export async function getAllData() {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const [cRes, qRes, jRes, iRes, sRes] = await Promise.all([
      supabase.from("contacts").select("id, data, created_at").order("created_at", { ascending: false }),
      supabase.from("quotes").select("id, data, created_at").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, data, created_at").order("created_at", { ascending: false }),
      supabase.from("invoices").select("id, data, created_at").order("created_at", { ascending: false }),
      supabase.from("settings").select("data").eq("id", "main").maybeSingle(),
    ]);

    if (cRes.error) console.error("Supabase contacts fetch error:", cRes.error);
    if (qRes.error) console.error("Supabase quotes fetch error:", qRes.error);
    if (jRes.error) console.error("Supabase jobs fetch error:", jRes.error);
    if (iRes.error) console.error("Supabase invoices fetch error:", iRes.error);
    if (sRes.error) console.error("Supabase settings fetch error:", sRes.error);

    const contacts: Contact[] = (cRes.data || []).map(r => r.data as Contact);
    const quotes: Quote[] = (qRes.data || []).map(r => r.data as Quote);
    const jobs: Job[] = (jRes.data || []).map(r => r.data as Job);
    const invoices: Invoice[] = (iRes.data || []).map(r => r.data as Invoice);
    const settings: TradeRatesSettings = sRes.data ? (sRes.data.data as TradeRatesSettings) : initialSettings;

    return { contacts, quotes, jobs, invoices, settings };
  }

  // Local SQLite fallback
  const [contactsRes, quotesRes, jobsRes, invoicesRes, settingsRes] = await Promise.all([
    db.execute("SELECT data FROM contacts ORDER BY rowid DESC"),
    db.execute("SELECT data FROM quotes ORDER BY rowid DESC"),
    db.execute("SELECT data FROM jobs ORDER BY rowid DESC"),
    db.execute("SELECT data FROM invoices ORDER BY rowid DESC"),
    db.execute("SELECT data FROM settings WHERE id = 'main'"),
  ]);

  const contacts: Contact[] = contactsRes.rows.map(r => JSON.parse(r.data as string));
  const quotes: Quote[] = quotesRes.rows.map(r => JSON.parse(r.data as string));
  const jobs: Job[] = jobsRes.rows.map(r => JSON.parse(r.data as string));
  const invoices: Invoice[] = invoicesRes.rows.map(r => JSON.parse(r.data as string));
  const settings: TradeRatesSettings = settingsRes.rows[0] 
    ? JSON.parse(settingsRes.rows[0].data as string)
    : initialSettings;

  return { contacts, quotes, jobs, invoices, settings };
}

export async function syncEntity(
  table: "contacts" | "quotes" | "jobs" | "invoices" | "settings", 
  id: string, 
  data: any, 
  action: "upsert" | "delete"
) {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    if (action === "delete") {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        console.error(`Supabase DELETE error on ${table} (id=${id}):`, error);
        throw new Error(`Failed to delete from ${table}: ${error.message}`);
      }
    } else {
      const { error } = await supabase.from(table).upsert({ 
        id, 
        data,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.error(`Supabase UPSERT error on ${table} (id=${id}):`, error);
        throw new Error(`Failed to save to ${table}: ${error.message}`);
      }
    }
    return;
  }

  // Local SQLite fallback
  if (action === "delete") {
    await db.execute({
      sql: `DELETE FROM ${table} WHERE id = ?`,
      args: [id]
    });
  } else {
    await db.execute({
      sql: `INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`,
      args: [id, JSON.stringify(data)]
    });
  }
}

const DEMO_CONTACT_IDS = ["cnt-001", "cnt-002", "cnt-003", "cnt-004"];
const DEMO_QUOTE_IDS = ["QT-2026-001", "QT-2026-002", "QT-2026-003"];
const DEMO_JOB_IDS = ["JOB-2026-001", "JOB-2026-002", "JOB-2026-003"];
const DEMO_INVOICE_IDS = ["INV-2026-001", "INV-2026-002", "INV-2026-003"];

/**
 * Purges only the default demo mock data while strictly preserving real client records.
 */
export async function purgeDemoData() {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    await Promise.all([
      supabase.from("contacts").delete().in("id", DEMO_CONTACT_IDS),
      supabase.from("quotes").delete().in("id", DEMO_QUOTE_IDS),
      supabase.from("jobs").delete().in("id", DEMO_JOB_IDS),
      supabase.from("invoices").delete().in("id", DEMO_INVOICE_IDS),
    ]);
    return;
  }

  // SQLite mode
  for (const id of DEMO_CONTACT_IDS) {
    await db.execute({ sql: "DELETE FROM contacts WHERE id = ?", args: [id] });
  }
  for (const id of DEMO_QUOTE_IDS) {
    await db.execute({ sql: "DELETE FROM quotes WHERE id = ?", args: [id] });
  }
  for (const id of DEMO_JOB_IDS) {
    await db.execute({ sql: "DELETE FROM jobs WHERE id = ?", args: [id] });
  }
  for (const id of DEMO_INVOICE_IDS) {
    await db.execute({ sql: "DELETE FROM invoices WHERE id = ?", args: [id] });
  }
}

/**
 * Resets database tables and re-seeds default template data.
 */
export async function resetAllData() {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    await Promise.all([
      supabase.from("contacts").delete().neq("id", "none"),
      supabase.from("quotes").delete().neq("id", "none"),
      supabase.from("jobs").delete().neq("id", "none"),
      supabase.from("invoices").delete().neq("id", "none"),
      supabase.from("settings").upsert([{ id: "main", data: initialSettings }]),
    ]);

    await Promise.all([
      supabase.from("contacts").upsert(initialContacts.map(c => ({ id: c.id, data: c }))),
      supabase.from("quotes").upsert(initialQuotes.map(q => ({ id: q.id, data: q }))),
      supabase.from("jobs").upsert(initialJobs.map(j => ({ id: j.id, data: j }))),
      supabase.from("invoices").upsert(initialInvoices.map(i => ({ id: i.id, data: i }))),
    ]);
    return;
  }

  // SQLite mode
  await db.execute("DELETE FROM contacts");
  await db.execute("DELETE FROM quotes");
  await db.execute("DELETE FROM jobs");
  await db.execute("DELETE FROM invoices");
  await db.execute({
    sql: "INSERT OR REPLACE INTO settings (id, data) VALUES ('main', ?)",
    args: [JSON.stringify(initialSettings)]
  });

  for (const c of initialContacts) {
    await db.execute({ sql: "INSERT OR REPLACE INTO contacts (id, data) VALUES (?, ?)", args: [c.id, JSON.stringify(c)] });
  }
  for (const q of initialQuotes) {
    await db.execute({ sql: "INSERT OR REPLACE INTO quotes (id, data) VALUES (?, ?)", args: [q.id, JSON.stringify(q)] });
  }
  for (const j of initialJobs) {
    await db.execute({ sql: "INSERT OR REPLACE INTO jobs (id, data) VALUES (?, ?)", args: [j.id, JSON.stringify(j)] });
  }
  for (const i of initialInvoices) {
    await db.execute({ sql: "INSERT OR REPLACE INTO invoices (id, data) VALUES (?, ?)", args: [i.id, JSON.stringify(i)] });
  }
}
