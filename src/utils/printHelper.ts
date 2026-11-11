/**
 * Enterprise Campus Management System (Campus ERP)
 * Isolated Document Print & Export Utility Engine
 * 
 * Solves iFrame and browser sandbox printing restrictions by creating
 * an isolated rendering document with pure institutional print styles.
 */

export interface PrintOptions {
  title?: string;
  landscape?: boolean;
}

/**
 * Universal print helper that prints a specific DOM element cleanly
 * without including any application shell, navigation bars, or overlays.
 */
export const printElement = (elementId: string, options: PrintOptions = {}): boolean => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`[PrintHelper] Element with ID #${elementId} not found`);
    window.print();
    return false;
  }

  const title = options.title || 'Official University Document - Campus ERP';

  // Construct standalone clean print document
  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          @page {
            size: ${options.landscape ? 'A4 landscape' : 'A4 portrait'};
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
          }
          th, td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            font-size: 11px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a;
            font-weight: 700;
          }
          .font-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
          .text-slate-900 { color: #0f172a; }
          .text-slate-700 { color: #334155; }
          .text-slate-500 { color: #64748b; }
          .text-slate-400 { color: #94a3b8; }
          .bg-slate-50 { background-color: #f8fafc; }
          .border-b-2 { border-bottom: 2px solid #DD2A2A; }
          .border-slate-200 { border-color: #e2e8f0; }
          .challan-copy {
            border: 1px dashed #94a3b8;
            padding: 12px;
            margin-bottom: 16px;
            background: #fff;
            page-break-inside: avoid;
          }
          @media screen {
            body { padding: 24px; max-width: 900px; margin: auto; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `;

  // Method 1: Hidden Iframe Printing (Universal gold standard for SPAs & iframes)
  try {
    const iframe = document.createElement('iframe');
    iframe.name = 'campus_erp_print_frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('[PrintHelper] Iframe print call failed, triggering window.print() fallback', printErr);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 300);
      return true;
    }
  } catch (frameErr) {
    console.warn('[PrintHelper] Failed to setup print iframe, falling back to window.print()', frameErr);
  }

  // Fallback: direct window.print()
  window.print();
  return true;
};

/**
 * Download the document as a clean, self-contained printable HTML document
 * that users can open or save as PDF in any standard browser.
 */
export const downloadDocumentAsHtml = (
  elementId: string,
  filename: string,
  title: string
): boolean => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 11px;
      line-height: 1.4;
    }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px; text-align: left; }
    th { background-color: #f1f5f9 !important; color: #0f172a; font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }
    .border-b-2 { border-bottom: 2px solid #DD2A2A; }
    .print-bar {
      margin-bottom: 20px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div>
      <strong>Official University Document</strong> · Campus ERP v4.8
    </div>
    <button onclick="window.print()" style="background:#DD2A2A; color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:bold;">
      Print / Save as PDF
    </button>
  </div>
  ${element.innerHTML}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};
