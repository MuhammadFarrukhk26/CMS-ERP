/**
 * Enterprise Campus Management System (Campus ERP)
 * Export as PDF Utility Engine using html2pdf.js
 * 
 * Honors the exact same CSS print media rules to ensure 100% consistent
 * document and report formatting across print and PDF downloads.
 */

import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
  filename?: string;
  title?: string;
  landscape?: boolean;
  campusName?: string;
  moduleName?: string;
  generatedBy?: string;
  format?: 'a4' | 'letter';
  margin?: number | [number, number, number, number];
  scale?: number;
}

/**
 * Helper to reliably resolve html2pdf callable across ESM/bundler module formats
 */
const getHtml2PdfWorker = () => {
  const lib = (html2pdf as any)?.default || html2pdf;
  if (typeof lib === 'function') {
    return lib();
  }
  if (typeof (window as any).html2pdf === 'function') {
    return (window as any).html2pdf();
  }
  throw new Error('html2pdf library could not be initialized');
};

/**
 * Creates an isolated sandbox clone that strictly enforces the same
 * CSS print media rules used by the university print layout.
 */
const preparePrintSandbox = (
  sourceElement: HTMLElement,
  options: PdfExportOptions = {}
): { sandbox: HTMLElement; cleanup: () => void } => {
  // Create off-screen sandbox container with standard A4 print dimensions
  const sandbox = document.createElement('div');
  sandbox.id = `pdf-export-sandbox-${Date.now()}`;
  sandbox.className = 'pdf-export-sandbox exporting-pdf';

  // Apply strict print media styling matching index.css @media print
  const isLandscape = options.landscape || false;
  const targetWidthPx = isLandscape ? 1120 : 794; // A4 standard pixel widths at 96 DPI

  sandbox.style.position = 'fixed';
  sandbox.style.left = '-99999px';
  sandbox.style.top = '0';
  sandbox.style.width = `${targetWidthPx}px`;
  sandbox.style.minHeight = '1000px';
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.color = '#0f172a';
  sandbox.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
  sandbox.style.fontSize = '11px';
  sandbox.style.lineHeight = '1.4';
  sandbox.style.padding = '20px';
  sandbox.style.boxSizing = 'border-box';
  sandbox.style.zIndex = '-9999';

  // Embed scoped print stylesheet inside sandbox to enforce print media rules
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .pdf-export-sandbox * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .pdf-export-sandbox header,
    .pdf-export-sandbox aside,
    .pdf-export-sandbox .print-hide,
    .pdf-export-sandbox .no-print,
    .pdf-export-sandbox button:not(.pdf-preserve),
    .pdf-export-sandbox input[type="text"],
    .pdf-export-sandbox input[type="search"],
    .pdf-export-sandbox select:not(.pdf-preserve),
    .pdf-export-sandbox .pagination-controls {
      display: none !important;
    }
    .pdf-export-sandbox table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 12px 0 !important;
      font-size: 11px !important;
    }
    .pdf-export-sandbox th,
    .pdf-export-sandbox td {
      padding: 6px 8px !important;
      border: 1px solid #cbd5e1 !important;
      text-align: left !important;
      font-size: 11px !important;
      background-clip: padding-box !important;
    }
    .pdf-export-sandbox th {
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
      font-weight: 700 !important;
    }
    .pdf-export-sandbox .printable-document-root {
      box-shadow: none !important;
      border: none !important;
      max-width: 100% !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .pdf-export-sandbox .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    }
    .pdf-export-sandbox .challan-copy {
      border: 1px dashed #94a3b8 !important;
      padding: 12px !important;
      margin-bottom: 16px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      background: #ffffff !important;
    }
    .pdf-export-sandbox tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .pdf-export-sandbox .metric-card {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      background: #ffffff !important;
      border: 1px solid #e2e8f0 !important;
    }
  `;
  sandbox.appendChild(styleTag);

  // If exporting the full view (not a single pre-formatted document like challan/transcript),
  // prepend an institutional university report header
  const isDedicatedDocument = sourceElement.classList.contains('printable-document-root') ||
    sourceElement.querySelector('.printable-document-root') !== null;

  if (!isDedicatedDocument && (options.moduleName || options.title)) {
    const reportHeader = document.createElement('div');
    reportHeader.style.borderBottom = '2px solid #DD2A2A';
    reportHeader.style.paddingBottom = '14px';
    reportHeader.style.marginBottom = '20px';
    reportHeader.style.display = 'flex';
    reportHeader.style.justifyContent = 'space-between';
    reportHeader.style.alignItems = 'flex-start';

    reportHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; background-color: #DD2A2A; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; border-radius: 6px;">
          CU
        </div>
        <div>
          <h1 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;">
            NATIONAL CAPITAL UNIVERSITY
          </h1>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b;">
            Campus Management System (ERP) · Official View Export
          </p>
          <p style="margin: 2px 0 0 0; font-size: 10px; color: #DD2A2A; font-weight: 700;">
            ${options.moduleName || options.title || 'Executive Report'}
          </p>
        </div>
      </div>
      <div style="text-align: right; font-family: monospace; font-size: 10px; color: #64748b;">
        <p style="margin: 0; font-weight: 700; color: #334155;">Campus: ${options.campusName || 'Main Campus'}</p>
        <p style="margin: 2px 0 0 0;">Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p style="margin: 2px 0 0 0;">Authorized: ${options.generatedBy || 'Institutional User'}</p>
      </div>
    `;
    sandbox.appendChild(reportHeader);
  }

  // Deep clone the source content
  const clone = sourceElement.cloneNode(true) as HTMLElement;

  // Clean clone of interactive-only and hidden elements to respect print media rules
  const elementsToPrune = clone.querySelectorAll(
    'button:not(.pdf-preserve), .print-hide, .no-print, input[type="text"], input[type="search"], select, .pagination-controls'
  );
  elementsToPrune.forEach((el) => {
    // If it's a table action column header/cells, remove cleanly
    const parentCell = el.closest('th, td');
    if (parentCell && (parentCell.textContent?.trim() === '' || el.tagName.toLowerCase() === 'button')) {
      // Keep structural integrity if needed or blank it out
      el.remove();
    } else {
      el.remove();
    }
  });

  // If the cloned element was a table with search bar at top, strip search bar
  const searchBars = clone.querySelectorAll('.relative.min-w-\\[240px\\], [placeholder*="Search"]');
  searchBars.forEach((sb) => sb.remove());

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  return {
    sandbox,
    cleanup: () => {
      if (document.body.contains(sandbox)) {
        document.body.removeChild(sandbox);
      }
    },
  };
};

/**
 * Exports a specific DOM element (or element by ID) to PDF using html2pdf.js,
 * rigorously honoring the application's CSS print media rules.
 */
export const exportElementToPdf = async (
  elementOrId: string | HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> => {
  const targetElement = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!targetElement) {
    console.warn(`[PdfExport] Target element not found:`, elementOrId);
    return false;
  }

  const { sandbox, cleanup } = preparePrintSandbox(targetElement, options);

  try {
    const rawFilename = options.filename || options.title || 'campus_erp_document';
    const cleanFilename = rawFilename
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    const worker = getHtml2PdfWorker();

    const pdfOptions = {
      margin: options.margin ?? (options.landscape ? [10, 10, 10, 10] : [10, 12, 10, 12]),
      filename: `${cleanFilename}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: options.scale || 2, // High resolution retina rendering
        useCORS: true,
        logging: false,
        letterRendering: true,
        backgroundColor: '#ffffff',
        scrollY: 0,
        windowWidth: options.landscape ? 1200 : 860,
      },
      jsPDF: {
        unit: 'mm',
        format: options.format || 'a4',
        orientation: options.landscape ? 'landscape' : 'portrait',
        compress: true,
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        avoid: [
          '.avoid-break',
          'tr',
          '.challan-copy',
          '.printable-document-root',
          '.metric-card',
          'thead',
        ],
      },
    };

    await worker.set(pdfOptions).from(sandbox).save();
    return true;
  } catch (err) {
    console.error('[PdfExport] PDF generation with html2pdf failed:', err);
    return false;
  } finally {
    cleanup();
  }
};

/**
 * Universal utility to export the CURRENT VIEW (active module screen or document)
 * to a standardized executive PDF report honoring CSS print rules.
 */
export const exportCurrentViewToPdf = async (options: PdfExportOptions = {}): Promise<boolean> => {
  // Priority 1: Check if an official document modal is currently open
  const docModalElement = document.getElementById('printable-university-document');
  if (docModalElement && docModalElement.offsetParent !== null) {
    return exportElementToPdf(docModalElement, {
      ...options,
      landscape: false,
      title: options.title || 'Official University Document',
    });
  }

  // Priority 2: Check if an active module view container is present
  const activeViewElement = document.getElementById('active-module-view') ||
    document.querySelector('main > div') as HTMLElement;

  if (activeViewElement) {
    return exportElementToPdf(activeViewElement, {
      ...options,
      landscape: options.landscape ?? true, // Default to landscape for broad data dashboards
      title: options.title || 'Campus ERP Executive View Report',
    });
  }

  // Priority 3: Fallback to whole main viewport
  const mainViewport = document.querySelector('main') as HTMLElement;
  if (mainViewport) {
    return exportElementToPdf(mainViewport, {
      ...options,
      landscape: true,
    });
  }

  return false;
};
