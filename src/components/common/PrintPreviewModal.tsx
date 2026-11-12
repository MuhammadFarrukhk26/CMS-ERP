/**
 * Enterprise Campus Management System (Campus ERP)
 * Interactive Print Preview & Section Customization Modal
 * 
 * Overlays content before exporting, allowing users to toggle specific sections
 * on or off, adjust orientation, and verify layout before final PDF generation.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileDown,
  Printer,
  CheckCircle2,
  Eye,
  Sliders,
  LayoutTemplate,
  Layers,
  RotateCw,
  Building2,
  FileText,
  Calendar,
  CheckSquare,
  Square,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  exportElementToPdf,
  getDynamicPdfFilename,
  SectionToggles,
} from '../../utils/pdfExport';
import { printElement } from '../../utils/printHelper';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  moduleTitle: string;
  campusName?: string;
  userName?: string;
  userRole?: string;
  sourceElementId?: string;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  moduleTitle,
  campusName = 'Main Campus (Capital)',
  userName = 'Dr. Zulfiqar Haider',
  userRole = 'Super Admin',
  sourceElementId,
}) => {
  // Orientation: default to landscape for wide data tables/dashboards
  const [isLandscape, setIsLandscape] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(85); // percentage
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Section Toggles
  const [toggles, setToggles] = useState<SectionToggles>({
    showHeader: true,
    showMetrics: true,
    showCharts: true,
    showTable: true,
    showApprovals: true,
    showSignatures: true,
  });

  const previewSheetRef = useRef<HTMLDivElement>(null);
  const [sourceHtml, setSourceHtml] = useState<string>('');

  // Compute dynamic filename matching exact format e.g. HRMS_Report_2026-11-12.pdf
  const dynamicFilename = getDynamicPdfFilename(activeTab);

  // Extract source HTML on modal open
  useEffect(() => {
    if (!isOpen) return;

    // Check custom ID or active module view or modal document
    const targetId = sourceElementId || 'active-module-view';
    const targetElem = document.getElementById(targetId) ||
      document.getElementById('printable-university-document') ||
      document.querySelector('main > div');

    if (targetElem) {
      // Clone element and remove interactive buttons/controls for preview
      const clone = targetElem.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('button:not(.pdf-preserve), .print-hide, .no-print, input[type="text"], input[type="search"]')
        .forEach((el) => el.remove());
      setSourceHtml(clone.innerHTML);
    } else {
      setSourceHtml('<p class="p-8 text-center text-slate-400">Content preview unavailable.</p>');
    }
  }, [isOpen, sourceElementId, activeTab]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof SectionToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadPdf = async () => {
    if (!previewSheetRef.current) return;
    setIsGenerating(true);
    setStatusMessage('Compiling PDF with html2pdf...');

    try {
      const success = await exportElementToPdf(previewSheetRef.current, {
        filename: dynamicFilename,
        moduleKey: activeTab,
        moduleName: moduleTitle,
        campusName,
        generatedBy: `${userName} (${userRole})`,
        landscape: isLandscape,
        sectionToggles: toggles,
      });

      if (success) {
        setStatusMessage(`Successfully generated ${dynamicFilename}`);
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1800);
      } else {
        setStatusMessage('Generation failed. Please try direct print.');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Export error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectPrint = () => {
    if (!previewSheetRef.current) return;
    setStatusMessage('Opening print dialog...');
    printElement(previewSheetRef.current.id, {
      title: `${moduleTitle} - Official Report`,
      landscape: isLandscape,
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DD2A2A] text-white flex items-center justify-center shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Print & PDF Export Preview</h3>
                <span className="font-mono text-[11px] font-bold text-[#DD2A2A] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {dynamicFilename}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Configure sections, adjust layout orientation, and verify formatting before PDF compilation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {statusMessage && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{statusMessage}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Workspace: Left Settings & Right Live Paper Canvas */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100/70">
          {/* Left Panel: Section Toggles & Configuration */}
          <div className="w-full md:w-80 border-r border-slate-200 bg-white p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
            <div className="space-y-5">
              {/* Orientation Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
                  <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" />
                  <span>Document Orientation</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLandscape(false)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      !isLandscape
                        ? 'border-[#DD2A2A] bg-red-50 text-[#DD2A2A] font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Portrait (A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLandscape(true)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${
                      isLandscape
                        ? 'border-[#DD2A2A] bg-red-50 text-[#DD2A2A] font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Landscape (A4)</span>
                  </button>
                </div>
              </div>

              {/* Section Visibility Switches */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Toggle Document Sections</span>
                </label>
                <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                  {[
                    { key: 'showHeader', label: 'University Letterhead & Crest' },
                    { key: 'showMetrics', label: 'Executive KPI Metric Cards' },
                    { key: 'showCharts', label: 'Analytics & Trend Charts' },
                    { key: 'showTable', label: 'Data Tables & Record Registers' },
                    { key: 'showApprovals', label: 'Workflow & Approval History' },
                    { key: 'showSignatures', label: 'Signatures & Clearance Block' },
                  ].map((item) => {
                    const isChecked = Boolean(toggles[item.key as keyof SectionToggles]);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleToggle(item.key as keyof SectionToggles)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors text-left"
                      >
                        <span className="font-medium text-slate-800">{item.label}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#DD2A2A] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Zoom Controls */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Preview Magnification
                  </span>
                  <span className="font-mono font-bold text-slate-700">{zoomLevel}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="120"
                  step="5"
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="w-full accent-[#DD2A2A] cursor-pointer"
                />
              </div>

              {/* Document Metadata Summary */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Target Module:</span>
                  <strong className="text-slate-800">{moduleTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Campus:</span>
                  <span className="text-slate-700 truncate max-w-[140px]">{campusName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paper Standard:</span>
                  <span className="font-mono text-slate-700">ISO 216 A4 (210×297mm)</span>
                </div>
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-mono text-[#DD2A2A] font-bold">html2pdf.js + Canvas</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Panel */}
            <div className="pt-4 border-t border-slate-200 space-y-2 mt-4">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Download {dynamicFilename}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectPrint}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Direct Print Preview</span>
              </button>
            </div>
          </div>

          {/* Right Panel: High-Fidelity A4 Paper Preview Container */}
          <div className="flex-1 p-6 overflow-auto flex justify-center items-start">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                width: isLandscape ? '1120px' : '794px',
                transition: 'width 0.2s ease, transform 0.1s ease',
              }}
              className="bg-white rounded-lg shadow-xl border border-slate-200 p-8 text-slate-800 text-xs shrink-0 mb-12"
            >
              {/* Paper Canvas */}
              <div id="print-preview-paper-sheet" ref={previewSheetRef} className="printable-document-root space-y-6">
                {/* 1. University Header (if toggled) */}
                {toggles.showHeader && (
                  <div className="border-b-2 border-[#DD2A2A] pb-4 mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#DD2A2A] text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
                        CU
                      </div>
                      <div>
                        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                          NATIONAL CAPITAL UNIVERSITY
                        </h1>
                        <p className="text-[11px] text-slate-500">
                          Higher Education Governance & Campus Management ERP v4.8
                        </p>
                        <p className="text-[10px] text-[#DD2A2A] font-bold uppercase tracking-wider mt-0.5">
                          {moduleTitle} · Official Institutional Ledger
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <p className="font-bold text-slate-800">Doc: {dynamicFilename}</p>
                      <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                      <p>Campus: {campusName}</p>
                    </div>
                  </div>
                )}

                {/* 2. Dynamically Filtered Content View */}
                <div
                  className={`space-y-6 ${!toggles.showMetrics ? 'hide-metrics' : ''} ${
                    !toggles.showCharts ? 'hide-charts' : ''
                  } ${!toggles.showTable ? 'hide-tables' : ''}`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: sourceHtml }}
                    className={`preview-cloned-content space-y-6 [&_.metric-card]:${
                      toggles.showMetrics ? 'block' : 'hidden!'
                    } [&_.recharts-responsive-container]:${
                      toggles.showCharts ? 'block' : 'hidden!'
                    } [&_table]:${toggles.showTable ? 'table' : 'hidden!'}`}
                  />
                </div>

                {/* 3. Official Signatures Block (if toggled) */}
                {toggles.showSignatures && (
                  <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-500 mt-8">
                    <div>
                      <div className="border-b border-slate-400 pb-8 mb-1"></div>
                      <p className="font-bold text-slate-800">Prepared & Reconciled By</p>
                      <p>{userName} ({userRole})</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 pb-8 mb-1"></div>
                      <p className="font-bold text-slate-800">Departmental Head Clearance</p>
                      <p>Dean / Director of Faculty</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 pb-8 mb-1"></div>
                      <p className="font-bold text-slate-800">Registrar & Executive Seal</p>
                      <p>Controller of Examinations & Accounts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
