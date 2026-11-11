/**
 * Enterprise Campus Management System (Campus ERP)
 * Official University Print Document Generator & Modal
 */

import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, FileText, FileDown, Loader2 } from 'lucide-react';
import { printElement, downloadDocumentAsHtml } from '../../utils/printHelper';
import { exportElementToPdf } from '../../utils/pdfExport';

export type DocumentType = 'challan' | 'payslip' | 'transcript' | 'offerLetter' | 'requisition';

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  docType: DocumentType;
  title: string;
  data: any;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  isOpen,
  onClose,
  docType,
  title,
  data,
}) => {
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  if (!isOpen || !data) return null;

  const documentCanvasId = 'printable-university-document';

  const handlePrint = () => {
    setPrintStatus('Opening printer...');
    printElement(documentCanvasId, { title });
    setTimeout(() => {
      setPrintStatus('Print dialog sent');
      setTimeout(() => setPrintStatus(null), 3000);
    }, 500);
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPrintStatus('Rendering PDF with html2pdf...');
    try {
      const filename = `${docType}_${data.referenceNo || data.challanNo || data.rollNo || data.empNo || 'document'}`;
      const success = await exportElementToPdf(documentCanvasId, {
        filename,
        title,
        landscape: false,
      });
      if (success) {
        setPrintStatus('PDF Downloaded!');
      } else {
        setPrintStatus('Fallback: Downloading HTML');
        downloadDocumentAsHtml(documentCanvasId, filename, title);
      }
    } catch (err) {
      console.error('PDF Export error:', err);
      setPrintStatus('Error generating PDF');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setPrintStatus(null), 3500);
    }
  };

  const handleDownload = () => {
    const filename = `${docType}_${data.referenceNo || data.challanNo || data.rollNo || data.empNo || 'document'}`;
    downloadDocumentAsHtml(documentCanvasId, filename, title);
    setPrintStatus('File downloaded');
    setTimeout(() => setPrintStatus(null), 3000);
  };


  // Safe data extraction with robust fallbacks
  const refNo = data.referenceNo || data.challanNo || data.empNo || data.regNo || data.appNo || 'OFF-DOC-2026';
  const studentName = data.studentName || data.fullName || data.employeeName || 'Student Name';
  const idNumber = data.rollNo || data.regNo || data.appNo || data.empNo || 'REG-2026-001';
  const programName = data.programName || data.programPreference1 || 'Bachelor of Science in Computer Science';
  const semester = data.semester || 1;
  const dueDate = data.dueDate || '2026-08-30';
  const totalAmount = Number(data.totalAmount || data.tuitionFee || 135000);
  const tuitionFee = Number(data.tuitionFee || Math.round(totalAmount * 0.8));
  const examFee = Number(data.examFee || 10000);
  const libraryFee = Number(data.libraryFee || 5000);
  const labFee = Number(data.labFee || 5000);
  const discount = Number(data.discount || 0);

  // Payslip safe values
  const basicSalary = Number(data.basicSalary || 120000);
  const houseRentAllowance = Number(data.houseRentAllowance || Math.round(basicSalary * 0.3));
  const medicalAllowance = Number(data.medicalAllowance || Math.round(basicSalary * 0.1));
  const overtimePay = Number(data.overtimePay || 0);
  const grossSalary = Number(data.grossSalary || (basicSalary + houseRentAllowance + medicalAllowance + overtimePay));
  const taxDeduction = Number(data.taxDeduction || Math.round(grossSalary * 0.08));
  const providentFund = Number(data.providentFund || Math.round(basicSalary * 0.08));
  const netSalary = Number(data.netSalary || (grossSalary - taxDeduction - providentFund));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Control Bar (Hidden during printing) */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between print-hide shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#DD2A2A]" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DD2A2A] block leading-none">
                Official University Document
              </span>
              <h3 className="text-xs font-bold text-slate-900 mt-0.5">{title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {printStatus && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {printStatus}
              </span>
            )}

            {/* Export as PDF via html2pdf.js */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] active:bg-[#991b1b] rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Export document to PDF using html2pdf.js"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isExportingPdf ? 'Generating PDF...' : 'Export as PDF'}</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Print document directly to printer or browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Download Standalone HTML Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer hidden md:flex"
              title="Download standalone printable HTML document"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>HTML</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* Printable Paper Canvas Container */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
          <div
            id={documentCanvasId}
            className="printable-document-root bg-white border border-slate-200 p-6 sm:p-8 w-full max-w-3xl shadow-sm rounded-lg text-slate-800 font-sans text-xs"
          >
            {/* University Letterhead */}
            <div className="border-b-2 border-[#DD2A2A] pb-4 mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded bg-[#DD2A2A] flex items-center justify-center text-white font-extrabold text-xl tracking-tighter shrink-0">
                    CU
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                      NATIONAL CAPITAL UNIVERSITY
                    </h1>
                    <p className="text-[11px] text-slate-500">
                      Chartered Higher Education Institution · Sector H-12, Islamabad
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Higher Education Commission (HEC) Recognized & Accredited
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                <p className="font-bold text-slate-700">Ref: {refNo}</p>
                <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
                <p className="text-[10px] text-slate-400">Campus ERP v4.8</p>
              </div>
            </div>

            {/* ================= DOCUMENT BODY: FEE CHALLAN ================= */}
            {docType === 'challan' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Official Student Fee Challan
                  </h2>
                  <p className="text-slate-500 text-[11px]">
                    Payable at all authorized Habib Bank Limited (HBL) & Meezan Bank branches
                  </p>
                </div>

                {/* Student & Semester Details Card */}
                <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded border border-slate-200 mb-6">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Student Name</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{studentName}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">
                      Registration / Roll No
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{idNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Degree Program</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{programName}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">
                      Semester & Due Date
                    </span>
                    <p className="font-bold text-rose-700 text-xs mt-0.5">
                      Semester {semester} · Due: {dueDate}
                    </p>
                  </div>
                </div>

                {/* Itemized Fee Table */}
                <table className="w-full border-collapse mb-6 text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="py-2 px-3 text-left">Fee Head Description</th>
                      <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3">Tuition Fee (Semester {semester})</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{tuitionFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Examination & Continuous Evaluation Fee</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{examFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Digital Library & Computing Resources</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{libraryFee.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Laboratory & Technical Facility Charges</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{labFee.toLocaleString()}</td>
                    </tr>
                    {discount > 0 && (
                      <tr className="text-emerald-700 font-semibold">
                        <td className="py-2 px-3">Merit Scholarship Concession</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">- {discount.toLocaleString()}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td className="py-2.5 px-3 font-bold">Total Payable Within Due Date</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm font-bold text-slate-900">
                        PKR {totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Authentic 3-Part Counterfoil Badges */}
                <div className="grid grid-cols-3 gap-2 border border-slate-200 rounded p-2.5 bg-slate-50 text-[10px] text-center mb-6 font-mono text-slate-600">
                  <div className="border-r border-slate-200 pr-2">
                    <span className="font-bold text-slate-800 block uppercase">[Copy 1: Bank Copy]</span>
                    <span>To be retained by receiving bank</span>
                  </div>
                  <div className="border-r border-slate-200 px-2">
                    <span className="font-bold text-slate-800 block uppercase">[Copy 2: University Copy]</span>
                    <span>To be submitted to Accounts Office</span>
                  </div>
                  <div className="pl-2">
                    <span className="font-bold text-slate-800 block uppercase">[Copy 3: Student Copy]</span>
                    <span>Retained by student as deposit proof</span>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50 text-[11px] text-slate-600 mb-8">
                  <strong>Important Instructions:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Late fee surcharge of PKR 2,000 applies automatically after the due date.</li>
                    <li>Payment status is synced into the Campus ERP Ledger within 24 hours of bank clearance.</li>
                    <li>Deposited fee is non-refundable and governed by National University financial bylaws.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ================= DOCUMENT BODY: ADMISSION OFFER LETTER ================= */}
            {docType === 'offerLetter' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Provisional Admission Offer Letter
                  </h2>
                  <p className="text-slate-500 text-[11px]">Academic Session Fall 2026</p>
                </div>

                <div className="space-y-3.5 leading-relaxed text-slate-700 mb-6">
                  <p>
                    Dear <strong>{studentName}</strong> (Application No: <span className="font-mono font-bold text-slate-900">{idNumber}</span>),
                  </p>
                  <p>
                    Congratulations! We are pleased to inform you that based on your academic credentials and merit entrance test score, you have been provisionally selected for admission to:
                  </p>

                  <div className="p-4 bg-red-50/70 border border-red-200 rounded-lg my-2">
                    <span className="text-[10px] uppercase font-bold text-[#DD2A2A] block">Offered Academic Program</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{programName}</h3>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Faculty of Computing & Information Technology · 4-Year Honors Undergraduate Program
                    </p>
                  </div>

                  <p>
                    To secure and confirm your seat in this intake, you are requested to deposit the semester admission fee challan before the stipulated deadline of <strong>{dueDate}</strong>.
                  </p>

                  <table className="w-full border-collapse my-4 text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="py-2 px-3 text-left">Fee Head</th>
                        <th className="py-2 px-3 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2 px-3">Admission Registration & Enrolment Fee</td>
                        <td className="py-2 px-3 text-right font-mono">25,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">Tuition Fee (Semester 1)</td>
                        <td className="py-2 px-3 text-right font-mono">115,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">University Security Deposit (Refundable)</td>
                        <td className="py-2 px-3 text-right font-mono">15,000</td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="py-2.5 px-3 font-bold">Total Admission Dues</td>
                        <td className="py-2.5 px-3 text-right font-mono text-sm font-bold text-slate-900">
                          PKR {totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= DOCUMENT BODY: SALARY PAYSLIP ================= */}
            {docType === 'payslip' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Employee Monthly Salary Slip
                  </h2>
                  <p className="text-slate-500 text-[11px]">Payroll Month: {data.payrollMonth || 'October 2026'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded border border-slate-200 mb-6">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Employee Name</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{data.employeeName || studentName}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">Designation</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{data.designation || 'Faculty Lecturer'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Department / Unit</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{data.departmentName || 'Computer Science'}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">Payment Status</span>
                    <p className="font-bold text-emerald-700 text-xs mt-0.5">
                      {data.paymentMethod || 'Bank Transfer'} (Disbursed)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Earnings */}
                  <div className="p-3 border border-slate-200 rounded">
                    <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">Earnings</h3>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>Basic Pay:</span>
                        <span className="tabular-nums">PKR {basicSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>House Rent Allowance:</span>
                        <span className="tabular-nums">PKR {houseRentAllowance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Medical Allowance:</span>
                        <span className="tabular-nums">PKR {medicalAllowance.toLocaleString()}</span>
                      </div>
                      {overtimePay > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Overtime Pay:</span>
                          <span className="tabular-nums">PKR {overtimePay.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-1.5 text-slate-900">
                        <span>Gross Salary:</span>
                        <span className="tabular-nums">PKR {grossSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="p-3 border border-slate-200 rounded">
                    <h3 className="font-bold text-slate-900 border-b pb-1 mb-2">Deductions</h3>
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span>Income Tax:</span>
                        <span className="tabular-nums">PKR {taxDeduction.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Provident Fund (8%):</span>
                        <span className="tabular-nums">PKR {providentFund.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1.5 text-rose-700">
                        <span>Total Deductions:</span>
                        <span className="tabular-nums">PKR {(taxDeduction + providentFund).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-center mb-8">
                  <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                    Net Take-Home Salary
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 mt-1 tabular-nums">
                    PKR {netSalary.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* ================= DOCUMENT BODY: TRANSCRIPT ================= */}
            {docType === 'transcript' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Official Academic Grade Report / Transcript
                  </h2>
                  <p className="text-slate-500 text-[11px]">Office of the Controller of Examinations</p>
                </div>

                <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded border border-slate-200 mb-6">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Student Name</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{studentName}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">
                      Registration Number
                    </span>
                    <p className="font-mono font-bold text-slate-900 text-xs mt-0.5">{idNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Degree Program</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{programName}</p>
                    <span className="text-slate-500 text-[10px] uppercase font-bold mt-2 block">
                      Cumulative GPA (CGPA)
                    </span>
                    <p className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                      {data.cgpa || '3.78'} / 4.00 (First Division Honors)
                    </p>
                  </div>
                </div>

                <table className="w-full border-collapse mb-8 text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                      <th className="py-2 px-3 text-left">Course Code & Title</th>
                      <th className="py-2 px-2 text-center">Cr. Hrs</th>
                      <th className="py-2 px-2 text-center">Marks (100)</th>
                      <th className="py-2 px-2 text-center">Grade</th>
                      <th className="py-2 px-2 text-right">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3">CS-101 Programming Fundamentals</td>
                      <td className="py-2 px-2 text-center font-mono">4</td>
                      <td className="py-2 px-2 text-center font-mono">92</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">A</td>
                      <td className="py-2 px-2 text-right font-mono">4.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">CS-201 Data Structures and Algorithms</td>
                      <td className="py-2 px-2 text-center font-mono">4</td>
                      <td className="py-2 px-2 text-center font-mono">90</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">A</td>
                      <td className="py-2 px-2 text-right font-mono">4.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">CS-301 Database Management Systems</td>
                      <td className="py-2 px-2 text-center font-mono">4</td>
                      <td className="py-2 px-2 text-center font-mono">87</td>
                      <td className="py-2 px-2 text-center font-bold text-emerald-700">A-</td>
                      <td className="py-2 px-2 text-right font-mono">3.7</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">MATH-202 Linear Algebra & Differential Equations</td>
                      <td className="py-2 px-2 text-center font-mono">3</td>
                      <td className="py-2 px-2 text-center font-mono">84</td>
                      <td className="py-2 px-2 text-center font-bold text-indigo-700">B+</td>
                      <td className="py-2 px-2 text-right font-mono">3.3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= DOCUMENT BODY: REQUISITION / GENERIC ================= */}
            {docType === 'requisition' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
                    Official Central Store Purchase Requisition
                  </h2>
                  <p className="text-slate-500 text-[11px]">Inventory & Logistics Directorate</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 mb-6">
                  <p>
                    <strong>Requested By:</strong> {data.requestedBy || 'Department Officer'}
                  </p>
                  <p className="mt-1">
                    <strong>Justification:</strong> {data.justification || 'Departmental procurement for academic laboratory.'}
                  </p>
                  <p className="mt-1">
                    <strong>Total Estimated Budget:</strong> PKR {totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Official Signatures Zone */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-[11px] text-slate-500 mt-6">
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1"></div>
                <p className="font-bold text-slate-800">Prepared By</p>
                <p>Academic / Finance Clerk</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1"></div>
                <p className="font-bold text-slate-800">Verified By</p>
                <p>Head of Department / Officer</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-8 mb-1"></div>
                <p className="font-bold text-slate-800">Authorized Signatory</p>
                <p>Registrar / Controller</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
