import { chromium } from "file:///C:/Users/lap zone/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

async function run() {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // 1. Production & Pins Tab
  await page.getByText("Production & Pins").click();
  await page.waitForTimeout(800);
  await page.screenshot({ 
    path: "C:/Users/lap zone/.gemini/antigravity-ide/brain/e212cb25-b80f-4386-b28d-878c575b9b14/production_kanban_pins.png" 
  });

  // 2. Invoices & Payments Tab
  await page.getByText("Invoices & Payments").click();
  await page.waitForTimeout(800);
  await page.screenshot({ 
    path: "C:/Users/lap zone/.gemini/antigravity-ide/brain/e212cb25-b80f-4386-b28d-878c575b9b14/invoices_payments.png" 
  });

  // 3. Saved Quotes Branded Document Preview
  await page.getByText("Auto-Quoter").click();
  await page.waitForTimeout(600);
  await page.getByText("Saved Quotes").click();
  await page.waitForTimeout(800);
  await page.screenshot({ 
    path: "C:/Users/lap zone/.gemini/antigravity-ide/brain/e212cb25-b80f-4386-b28d-878c575b9b14/saved_quote_preview.png" 
  });

  // 4. Rates & Branding Settings Tab
  await page.getByText("Rates & Branding").click();
  await page.waitForTimeout(800);
  await page.screenshot({ 
    path: "C:/Users/lap zone/.gemini/antigravity-ide/brain/e212cb25-b80f-4386-b28d-878c575b9b14/rates_branding_settings.png" 
  });

  await browser.close();
  console.log("ALL VIEWS CAPTURED SUCCESSFULLY!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
