-- ==============================================================================
-- PAKMEC CRM — Cloud PostgreSQL Schema for Supabase
-- Precision Engineering & Multi-Trade Production Pipeline (Multan Facility)
-- ==============================================================================

-- 1. Contacts & WhatsApp CRM
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Precision Engineering Quotations
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Production Floor Jobs (Kanban & Pin Board)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Invoices, Advance Deposits & Settlements
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Workshop Machine Rates & Multan Facility Settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Accounts & Staff Roles
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'machinist', -- 'admin', 'machinist', 'sales'
  department TEXT,
  phone TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes on JSONB Fields
CREATE INDEX IF NOT EXISTS idx_contacts_archived ON contacts (((data->>'isArchived')::boolean));
CREATE INDEX IF NOT EXISTS idx_quotes_archived ON quotes (((data->>'isArchived')::boolean));
CREATE INDEX IF NOT EXISTS idx_jobs_archived ON jobs (((data->>'isArchived')::boolean));
CREATE INDEX IF NOT EXISTS idx_invoices_archived ON invoices (((data->>'isArchived')::boolean));

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon (via API key) access for CRM operations
CREATE POLICY "Allow public read-write for API" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for API" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for API" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for API" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for API" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for API" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

-- Seed Initial Profiles
INSERT INTO user_profiles (id, email, name, role, department, phone)
VALUES 
  ('usr-admin-01', 'admin@pakmec.com', 'Yasir Aslam', 'admin', 'Managing Director & Chief Engineer', '+92 300 8631100'),
  ('usr-mach-01', 'machinist@pakmec.com', 'Rashid Ali (CNC Lead)', 'machinist', 'Shop Floor & Machine Operations', '+92 321 4458921'),
  ('usr-sales-01', 'sales@pakmec.com', 'Zainab Khan (Estimator)', 'sales', 'Client Relations & Quotations', '+92 301 7762244')
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

