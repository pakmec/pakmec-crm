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
    // Check if contacts are seeded in Supabase
    try {
      const { data, error } = await supabase.from("contacts").select("id").limit(1);
      if (!error && (!data || data.length === 0)) {
        // Seed default dataset to Supabase
        await supabase.from("contacts").upsert(initialContacts.map(c => ({ id: c.id, data: c })));
        await supabase.from("quotes").upsert(initialQuotes.map(q => ({ id: q.id, data: q })));
        await supabase.from("jobs").upsert(initialJobs.map(j => ({ id: j.id, data: j })));
        await supabase.from("invoices").upsert(initialInvoices.map(i => ({ id: i.id, data: i })));
        await supabase.from("settings").upsert([{ id: "main", data: initialSettings }]);
      }
    } catch (err) {
      console.warn("Supabase check/seed warning:", err);
    }
    initialized = true;
    return;
  }

  // Local SQLite Mode
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

  // Seed default data if empty
  const contactCheck = await db.execute("SELECT COUNT(*) as count FROM contacts");
  const count = Number(contactCheck.rows[0]?.count || 0);

  if (count === 0) {
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

    await db.execute({
      sql: "INSERT OR REPLACE INTO settings (id, data) VALUES ('main', ?)",
      args: [JSON.stringify(initialSettings)]
    });
  }

  initialized = true;
}

export async function getAllData() {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const [cRes, qRes, jRes, iRes, sRes] = await Promise.all([
      supabase.from("contacts").select("data"),
      supabase.from("quotes").select("data"),
      supabase.from("jobs").select("data"),
      supabase.from("invoices").select("data"),
      supabase.from("settings").select("data").eq("id", "main").maybeSingle(),
    ]);

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

export async function syncEntity(table: "contacts" | "quotes" | "jobs" | "invoices" | "settings", id: string, data: any, action: "upsert" | "delete") {
  await initDatabase();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    if (action === "delete") {
      await supabase.from(table).delete().eq("id", id);
    } else {
      await supabase.from(table).upsert({ id, data });
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
