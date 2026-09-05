export function printIsolatedElement(elementId: string, docTitle: string = "PAKMEC Document") {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  // Create an isolated hidden iframe with exact A4 desktop dimensions
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "794px"; // 210mm at 96 DPI
  iframe.style.height = "1123px"; // 297mm at 96 DPI
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Extract external style tags as secondary enhancement
  const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 14mm;
          }
          
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            font-size: 10.5pt !important;
            line-height: 1.4 !important;
            -webkit-font-smoothing: antialiased !important;
          }

          /* Force printable container to full width with zero shadows */
          .printable-document {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #0f172a !important;
            min-height: auto !important;
            display: block !important;
          }

          /* Header Layout - side-by-side with fixed spacing */
          .print-header,
          .printable-document > div:first-child,
          .printable-document .flex.flex-col.sm\\:flex-row:first-of-type {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            width: 100% !important;
            border-bottom: 2px solid #0f172a !important;
            padding-bottom: 16px !important;
            margin-bottom: 20px !important;
            gap: 20px !important;
          }

          .print-title-col,
          .printable-document .text-left.sm\\:text-right {
            text-align: right !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
            margin-left: auto !important;
          }

          .print-title-col .text-2xl,
          .printable-document .text-2xl {
            font-size: 20pt !important;
            font-weight: 900 !important;
            letter-spacing: -0.02em !important;
            line-height: 1.1 !important;
            color: #0f172a !important;
          }

          /* Metadata Grid - Strict 2 Equal Columns */
          .print-meta-grid,
          .printable-document .grid.grid-cols-2 {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            width: 100% !important;
            margin-bottom: 20px !important;
          }

          .print-meta-card {
            padding: 12px 14px !important;
            border-radius: 6px !important;
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }

          /* Display utilities */
          .block { display: block !important; }
          .inline-block { display: inline-block !important; }
          .flex { display: flex !important; }
          .items-center { align-items: center !important; }
          .items-start { align-items: flex-start !important; }
          .items-baseline { align-items: baseline !important; }
          .justify-between { justify-content: space-between !important; }
          .shrink-0 { flex-shrink: 0 !important; }

          /* Table Architecture - Fixed proportions to prevent squishing */
          table,
          .print-table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            margin: 16px 0 20px 0 !important;
            page-break-inside: avoid !important;
          }

          thead tr {
            border-bottom: 2px solid #0f172a !important;
          }

          th {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            font-size: 8.5pt !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            color: #334155 !important;
            padding: 8px 6px !important;
            white-space: nowrap !important;
          }

          td {
            padding: 9px 6px !important;
            border-bottom: 1px solid #e2e8f0 !important;
            font-size: 9pt !important;
            vertical-align: top !important;
          }

          /* Text Alignments */
          .text-left { text-align: left !important; }
          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }

          /* Non-breaking numbers and currency to prevent ugly line drops */
          .tabular-nums,
          .font-mono,
          td.text-right,
          th.text-right,
          .whitespace-nowrap,
          .nowrap {
            font-variant-numeric: tabular-nums !important;
            white-space: nowrap !important;
            word-break: keep-all !important;
          }

          /* Bottom Section: Audit Log & Totals */
          .print-bottom,
          .printable-document .border-t-2.border-black {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 24px !important;
            width: 100% !important;
            border-top: 2px solid #0f172a !important;
            padding-top: 16px !important;
            margin-top: 16px !important;
            page-break-inside: avoid !important;
          }

          .print-audit-col,
          .printable-document .max-w-md {
            flex: 1 1 50% !important;
            max-width: 52% !important;
          }

          .print-totals-col,
          .printable-document .w-72,
          .printable-document .w-80,
          .printable-document .w-84,
          .printable-document .w-64 {
            flex: 0 0 340px !important;
            width: 340px !important;
            min-width: 340px !important;
          }

          /* Financial Summary Rows - Never break labels or values */
          .print-totals-col > div.flex,
          .printable-document .w-72 > div.flex,
          .printable-document .w-80 > div.flex,
          .printable-document .w-84 > div.flex,
          .printable-document .w-64 > div.flex {
            display: flex !important;
            justify-content: space-between !important;
            align-items: baseline !important;
            width: 100% !important;
            white-space: nowrap !important;
            gap: 12px !important;
            margin-bottom: 6px !important;
          }

          .print-totals-col span,
          .printable-document .w-72 span,
          .printable-document .w-80 span,
          .printable-document .w-84 span,
          .printable-document .w-64 span {
            white-space: nowrap !important;
            word-break: keep-all !important;
          }

          /* Spacing utilities */
          .space-y-0\\.5 > * + * { margin-top: 2px !important; }
          .space-y-1 > * + * { margin-top: 4px !important; }
          .space-y-1\\.5 > * + * { margin-top: 6px !important; }
          .space-y-2 > * + * { margin-top: 8px !important; }
          .space-y-3 > * + * { margin-top: 12px !important; }
          .space-y-4 > * + * { margin-top: 16px !important; }
          .space-y-6 > * + * { margin-top: 24px !important; }
          .space-y-8 > * + * { margin-top: 28px !important; }

          /* Clean backgrounds and borders */
          .bg-gray-50 { background-color: #f8fafc !important; }
          .bg-gray-100 { background-color: #f1f5f9 !important; }
          .bg-emerald-50 { background-color: #ecfdf5 !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }
          .border { border-width: 1px !important; border-style: solid !important; }
          .border-t { border-top-width: 1px !important; border-top-style: solid !important; }
          .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
          .border-gray-200 { border-color: #e2e8f0 !important; }
          .border-gray-300 { border-color: #cbd5e1 !important; }
          .border-emerald-200 { border-color: #a7f3d0 !important; }
          .border-emerald-600 { border-color: #059669 !important; }
          .border-orange-200 { border-color: #fed7aa !important; }
          .rounded { border-radius: 4px !important; }
          .rounded-lg { border-radius: 8px !important; }
          .rounded-xl { border-radius: 10px !important; }

          /* High-Contrast Colors */
          .text-black { color: #0f172a !important; }
          .text-gray-900 { color: #0f172a !important; }
          .text-gray-800 { color: #1e293b !important; }
          .text-gray-700 { color: #334155 !important; }
          .text-gray-600 { color: #475569 !important; }
          .text-gray-500 { color: #64748b !important; }
          .text-emerald-700 { color: #047857 !important; }
          .text-emerald-900 { color: #064e3b !important; }
          .text-emerald-950 { color: #022c22 !important; }
          .text-amber-600, .text-amber-700 { color: #b45309 !important; }
          .text-orange-950 { color: #7c2d12 !important; }
          .text-\\[\\#fe7518\\] { color: #fe7518 !important; }

          img {
            max-width: 180px !important;
            height: auto !important;
            display: block !important;
          }

          /* Hide UI interactive elements */
          .no-print, button, .lucide {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Wait for images and fonts in the iframe to finish rendering before triggering print
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Print error:", e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  };

  // Wait for all images inside iframe to load
  const images = Array.from(doc.images);
  if (images.length === 0) {
    setTimeout(triggerPrint, 150);
  } else {
    let loaded = 0;
    const checkAllLoaded = () => {
      loaded++;
      if (loaded >= images.length) {
        setTimeout(triggerPrint, 150);
      }
    };
    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
      }
    });
    // Fallback safety timeout
    setTimeout(triggerPrint, 600);
  }
}
