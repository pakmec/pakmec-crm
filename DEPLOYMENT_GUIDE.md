# PAKMEC CRM — Live Online Deployment Guide (Vercel + Supabase)

Deploy PAKMEC CRM live online with multi-device access anywhere, Role-Based Access Control (RBAC), and persistent cloud PostgreSQL data storage at **$0/month**.

---

## Architecture Overview

- **Frontend & Serverless API**: Hosted on **Vercel** (Edge CDN close to Pakistan: Singapore/Middle East, automatic free SSL, sub-30ms response time).
- **Online Database & Auth**: Hosted on **Supabase** (PostgreSQL in cloud, real-time sync, visual table editor).
- **Local Fallback**: Runs with local SQLite (`pakmec.db`) automatically if Supabase keys are not present.

---

## Step 1: Set Up Free Supabase Database (2 Minutes)

1. Go to **[https://supabase.com](https://supabase.com)** and click **"Start your project"** (free).
2. Click **"New Project"**:
   - **Name**: `pakmec-crm`
   - **Database Password**: Choose a strong password and save it.
   - **Region**: Select **Singapore (`ap-southeast-1`)** or **Mumbai (`ap-south-1`)** for lowest latency to Pakistan.
   - Click **"Create new project"**.
3. **Run the Database Schema**:
   - In your Supabase project sidebar, click on the **SQL Editor** (the terminal/code icon `>_`).
   - Click **"New query"**.
   - Open [supabase-schema.sql](file:///c:/PAKMEC%20CRM/supabase-schema.sql) in this repository, copy all its contents, paste them into the Supabase SQL editor, and click **"Run"**.
   - ✅ This creates all tables (`contacts`, `quotes`, `jobs`, `invoices`, `settings`, `user_profiles`) with performance indexes and permissions.
4. **Copy your API Credentials**:
   - Go to **Project Settings** (gear icon) ➔ **API**.
   - Copy:
     - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
     - **Project API Anon Key** (`anon` `public` key)

---

## Step 2: Deploy to Vercel (1 Minute)

1. Push this repository to your **GitHub** account:
   ```bash
   git add .
   git commit -m "feat: live cloud deployment, login auth and rbac"
   git push origin main
   ```
2. Go to **[https://vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **"Add New..."** ➔ **"Project"**.
4. Select your `pakmec-crm` repository and click **"Import"**.
5. In the **Environment Variables** section, paste the two keys from Step 1:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOi...`
6. Click **"Deploy"**.
7. In ~60 seconds, your site is live at a URL like:
   `https://pakmec-crm.vercel.app`

---

## Step 3: Connect Custom Domain (e.g. `crm.pakmec.com`)

1. In your Vercel Project dashboard, go to **Settings** ➔ **Domains**.
2. Type your desired domain: `crm.pakmec.com` or `pakmec.com` and click **Add**.
3. Vercel will give you a DNS CNAME record:
   - **Type**: `CNAME`
   - **Name**: `crm`
   - **Value**: `cname.vercel-dns.com`
4. Add this CNAME record in your domain registrar (Hostinger, GoDaddy, Namecheap, or Cloudflare).
5. Vercel automatically issues an **SSL/HTTPS Certificate** in ~2 minutes!

---

## Step 4: Login with Default Team Accounts

When you or your staff visit your live URL, you are greeted with the PAKMEC Security Gateway:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Director - Yasir Aslam)** | `admin@pakmec.com` | `Yasir@123..` | Full Authority: Financial Inflow, Invoices, Settlements, Rates, Deletion/Archive |
| **🛠️ Machinist (Floor Lead)** | `machinist@pakmec.com` | `pakmec2026!` | Shop Floor Only: Production Kanban, QC, Machine Pins. Financials & Billing are hidden. |
| **📋 Sales Estimator** | `sales@pakmec.com` | `pakmec2026!` | Quoter & CRM: Auto-Quoter, Client Database, WhatsApp. Bank settings & deletions locked. |

*Tip: You can also use the 1-click **Quick Role Switcher** buttons at the bottom of the login screen or in the sidebar to test each role's permissions instantly.*

---

## Step 5: Viewing Data in Supabase

You can log into **supabase.com** anytime and click **Table Editor** to view and edit your clients, quotes, jobs, and invoices directly in an interactive spreadsheet, or export them to Excel/CSV with one click!
