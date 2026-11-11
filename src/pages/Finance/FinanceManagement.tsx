/**
 * Enterprise Campus Management System (Campus ERP)
 * Finance Management, Student Fee Challans & General Ledger
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Coins,
  FileText,
  Printer,
  CheckCircle,
  Plus,
  X,
  Building2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FeeChallan, JournalVoucher } from '../../types';

export const FinanceManagement: React.FC = () => {
  const { currentCampus, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'challans' | 'vouchers'>('challans');
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPrintChallanOpen, setIsPrintChallanOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);

  // Form for Payment
  const [paymentData, setPaymentData] = useState({
    amount: 120000,
    bankBranch: 'HBL University Branch, Islamabad',
  });

  const canEditFinance = hasPermission('finance', 'edit') || hasPermission('finance', 'create');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [chRes, vchRes] = await Promise.all([
      api.getFeeChallans(campusId),
      api.getVouchers(campusId),
    ]);

    if (chRes.success) setChallans(chRes.data);
    if (vchRes.success) setVouchers(vchRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallan) return;
    await api.recordChallanPayment(selectedChallan.id, Number(paymentData.amount), paymentData.bankBranch);
    setIsPaymentOpen(false);
    await loadData();
  };

  const challanColumns: Column<FeeChallan>[] = [
    {
      key: 'challanNo',
      header: 'Challan No',
      sortable: true,
      width: '130px',
      render: (c) => <span className="font-mono font-bold text-[#DD2A2A]">{c.challanNo}</span>,
    },
    {
      key: 'studentName',
      header: 'Student & Program',
      sortable: true,
      render: (c) => (
        <div>
          <span className="font-bold text-slate-900 block">{c.studentName}</span>
          <span className="text-[11px] text-slate-400">
            {c.rollNo} · {c.programName} (Sem {c.semester})
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (c) => <span className="font-mono text-slate-600 tabular-nums">{c.dueDate}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Payable Amount',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          PKR {c.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'paidAmount',
      header: 'Paid Amount',
      sortable: true,
      align: 'right',
      render: (c) => (
        <span className="font-mono font-bold text-emerald-700 tabular-nums">
          PKR {c.paidAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      sortable: true,
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {c.status !== 'Paid' && canEditFinance && (
            <button
              onClick={() => {
                setSelectedChallan(c);
                setPaymentData({
                  amount: c.totalAmount - c.paidAmount,
                  bankBranch: 'HBL University Branch, Islamabad',
                });
                setIsPaymentOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
            >
              Collect →
            </button>
          )}
          <button
            onClick={() => {
              setSelectedChallan(c);
              setIsPrintChallanOpen(true);
            }}
            className="p-1 text-slate-500 hover:text-[#DD2A2A] rounded transition-colors"
            title="Print Challan (3-Copy Bank Slip)"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const voucherColumns: Column<JournalVoucher>[] = [
    {
      key: 'voucherNo',
      header: 'Voucher Ref',
      sortable: true,
      width: '140px',
      render: (v) => <span className="font-mono font-bold text-[#DD2A2A]">{v.voucherNo}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (v) => <span className="font-mono text-slate-600 tabular-nums">{v.date}</span>,
    },
    {
      key: 'voucherType',
      header: 'Type',
      sortable: true,
      render: (v) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
          {v.voucherType}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Narrative / Particulars',
      render: (v) => <span className="text-slate-800 line-clamp-1">{v.description}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      align: 'right',
      render: (v) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          PKR {v.totalAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (v) => <StatusBadge status={v.status} />,
    },
  ];

  const totalCollected = challans.reduce((a, c) => a + c.paidAmount, 0);
  const totalOutstanding = challans.reduce((a, c) => a + (c.totalAmount - c.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            University Finance, Student Accounts & Treasury
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student fee challans, bank collection reconciliation, journal vouchers, and ledger accounts
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('challans')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'challans'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fee Challans ({challans.length})
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'vouchers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            General Ledger Vouchers ({vouchers.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">Reconciled Collections</span>
            <h4 className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              PKR {totalCollected.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Cleared via banking network</p>
          </div>
          <ArrowDownLeft className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">Outstanding Student Dues</span>
            <h4 className="text-xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
              PKR {totalOutstanding.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Pending installment collection</p>
          </div>
          <ArrowUpRight className="w-8 h-8 text-rose-600 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">Active Financial Year</span>
            <h4 className="text-xl font-bold font-mono text-slate-900 mt-1">FY 2025-2026</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Standard HEC Chart of Accounts</p>
          </div>
          <Coins className="w-8 h-8 text-[#DD2A2A] opacity-80" />
        </div>
      </div>

      {activeTab === 'challans' ? (
        <ERPTable
          data={challans}
          columns={challanColumns}
          searchPlaceholder="Search challans by student name, roll no, ref..."
          searchKeys={['challanNo', 'studentName', 'rollNo', 'programName']}
          title="Student Semester Fee Challans"
          subtitle="Real-time collection status, scholarship discounts, and bank branch reconciliations"
          filename="fee_challans"
        />
      ) : (
        <ERPTable
          data={vouchers}
          columns={voucherColumns}
          searchPlaceholder="Search journal vouchers..."
          searchKeys={['voucherNo', 'description', 'voucherType']}
          title="University General Ledger & Vouchers"
          subtitle="Double-entry journal vouchers, cash receipts, and approved capital payments"
          filename="journal_vouchers"
        />
      )}

      {/* Record Fee Payment Modal */}
      {isPaymentOpen && selectedChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Record Fee Challan Collection</h3>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{selectedChallan.studentName}</span>
                <p className="text-slate-500 font-mono text-[11px]">
                  Roll No: {selectedChallan.rollNo} · Ref: {selectedChallan.challanNo}
                </p>
                <p className="text-slate-700 font-mono">
                  Remaining Dues: PKR {(selectedChallan.totalAmount - selectedChallan.paidAmount).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Collection Amount (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bank Branch / Channel
                </label>
                <select
                  value={paymentData.bankBranch}
                  onChange={(e) => setPaymentData({ ...paymentData, bankBranch: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                >
                  <option value="HBL University Branch, Islamabad">HBL University Branch, Islamabad</option>
                  <option value="Meezan Bank Blue Area, Islamabad">Meezan Bank Blue Area, Islamabad</option>
                  <option value="Online 1Link Digital Transfer">Online 1Link Digital Transfer</option>
                  <option value="Campus Treasury Cash Counter">Campus Treasury Cash Counter</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Challan Modal */}
      <PrintDocumentModal
        isOpen={isPrintChallanOpen}
        onClose={() => setIsPrintChallanOpen(false)}
        docType="challan"
        title="Student Semester Fee Challan (3-Copy Bank Receipt)"
        data={selectedChallan}
      />
    </div>
  );
};
