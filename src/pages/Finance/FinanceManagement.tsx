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
  AlertCircle,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FeeChallan, JournalVoucher } from '../../types';
import {
  validateName,
  validateAmount,
  validateDateRange,
} from '../../utils/validators';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const FinanceManagement: React.FC = () => {
  const { currentCampus, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'challans' | 'vouchers'>('challans');
  const [challans, setChallans] = useState<FeeChallan[]>([]);
  const [vouchers, setVouchers] = useState<JournalVoucher[]>([]);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPrintChallanOpen, setIsPrintChallanOpen] = useState(false);
  const [isIssueChallanOpen, setIsIssueChallanOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<FeeChallan | null>(null);

  // Form for Payment
  const [paymentData, setPaymentData] = useState({
    amount: 120000,
    bankBranch: 'HBL University Branch, Islamabad',
    paymentMethod: 'Bank Challan Branch' as const,
    receiptRef: '',
  });
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Form for Issuing New Challan
  const [newChallan, setNewChallan] = useState({
    studentName: '',
    rollNo: '',
    programName: 'BS Computer Science',
    semester: 1,
    dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
    tuitionFee: 125000,
    examFee: 8000,
    libraryFee: 4000,
    labFee: 5000,
    discount: 0,
    campusId: currentCampus?.id || 'camp-main',
  });
  const [challanErrors, setChallanErrors] = useState<Record<string, string>>({});

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
    setPaymentError(null);

    const remaining = selectedChallan.totalAmount - selectedChallan.paidAmount;
    if (paymentData.amount <= 0) {
      setPaymentError('Payment collection amount must be greater than PKR 0.');
      return;
    }
    if (paymentData.amount > remaining) {
      setPaymentError(`Payment amount cannot exceed remaining balance of PKR ${remaining.toLocaleString()}.`);
      return;
    }
    if (!paymentData.receiptRef || paymentData.receiptRef.trim().length < 3) {
      setPaymentError('Please enter a valid bank deposit slip or transaction reference number.');
      return;
    }

    await api.recordChallanPayment(
      selectedChallan.id,
      Number(paymentData.amount),
      `${paymentData.bankBranch} (Ref: ${paymentData.receiptRef})`
    );
    setIsPaymentOpen(false);
    setPaymentError(null);
    await loadData();
  };

  const validateChallanField = (field: string, val: any) => {
    let err: string | undefined;
    switch (field) {
      case 'studentName':
        err = validateName(val, 'Student name', 3).error;
        break;
      case 'rollNo':
        if (!val || val.trim().length < 3) err = 'Roll number is required (e.g., FA24-BCS-012).';
        break;
      case 'tuitionFee':
        err = validateAmount(val, 1000, 1000000, 'Tuition fee').error;
        break;
    }
    setChallanErrors((prev) => {
      const copy = { ...prev };
      if (err) copy[field] = err;
      else delete copy[field];
      return copy;
    });
  };

  const handleIssueChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const nameErr = validateName(newChallan.studentName, 'Student name', 3).error;
    if (nameErr) errors.studentName = nameErr;
    if (!newChallan.rollNo || newChallan.rollNo.trim().length < 3) {
      errors.rollNo = 'Valid roll number is required.';
    }
    const tuiErr = validateAmount(newChallan.tuitionFee, 1000, 1000000, 'Tuition fee').error;
    if (tuiErr) errors.tuitionFee = tuiErr;

    const totalCalculated =
      Number(newChallan.tuitionFee) +
      Number(newChallan.examFee) +
      Number(newChallan.libraryFee) +
      Number(newChallan.labFee) -
      Number(newChallan.discount);

    if (totalCalculated <= 0) {
      errors.total = 'Net payable fee after discount must be greater than PKR 0.';
    }

    setChallanErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const studentsRes = await api.getStudents(currentCampus?.id);
    const student = studentsRes.data.find(
      (candidate) => candidate.rollNo.toLowerCase() === newChallan.rollNo.trim().toLowerCase()
    );
    if (!student) {
      setChallanErrors({ rollNo: 'No student found with this roll number.' });
      return;
    }

    await api.createFeeChallan({
      ...newChallan,
      studentId: student.id,
      issueDate: new Date().toISOString().split('T')[0],
      totalAmount: totalCalculated,
      campusId: currentCampus?.id || 'camp-main',
    });

    setIsIssueChallanOpen(false);
    setChallanErrors({});
    setNewChallan({
      studentName: '',
      rollNo: '',
      programName: 'BS Computer Science',
      semester: 1,
      dueDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      tuitionFee: 125000,
      examFee: 8000,
      libraryFee: 4000,
      labFee: 5000,
      discount: 0,
      campusId: currentCampus?.id || 'camp-main',
    });
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
                setPaymentData((prev) => ({
                  ...prev,
                  amount: c.totalAmount - c.paidAmount,
                  bankBranch: 'HBL University Branch, Islamabad',
                }));
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

      {/* Visual Campus Metrics & Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trends (AreaChart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Monthly Revenue & Fee Realization Trends
              </h3>
              <p className="text-xs text-slate-500">
                Projected semester fee intake vs actual bank collections (Million PKR)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 font-mono">
              92.4% Budget Realization
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { month: 'Oct', projected: 18.5, actual: 16.2 },
                  { month: 'Nov', projected: 22.0, actual: 20.8 },
                  { month: 'Dec', projected: 28.0, actual: 26.5 },
                  { month: 'Jan', projected: 32.5, actual: 30.1 },
                  { month: 'Feb', projected: 38.0, actual: 36.8 },
                  { month: 'Mar', projected: 42.0, actual: 41.2 },
                ]}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DD2A2A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#DD2A2A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  unit="M"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(val: any) => [`PKR ${val}M`]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="Projected Budget"
                  stroke="#DD2A2A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProjected)"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actual Bank Collections"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Status Distribution (PieChart) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Collection & Recovery Status
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">Total: 100%</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Challan lifecycle status across all campus banking partners
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Reconciled & Cleared', value: 78, color: '#059669' },
                      { name: 'In Bank Clearing', value: 14, color: '#2563EB' },
                      { name: 'Outstanding Dues', value: 8, color: '#DD2A2A' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {[
                      { name: 'Reconciled & Cleared', value: 78, color: '#059669' },
                      { name: 'In Bank Clearing', value: 14, color: '#2563EB' },
                      { name: 'Outstanding Dues', value: 8, color: '#DD2A2A' },
                    ].map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}%`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Reconciled & Cleared</span>
              </div>
              <span className="font-mono font-bold text-emerald-700">78% (PKR 93.6M)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>In Bank Clearing</span>
              </div>
              <span className="font-mono font-bold text-blue-700">14% (PKR 16.8M)</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DD2A2A]" />
                <span>Outstanding Dues</span>
              </div>
              <span className="font-mono font-bold text-rose-700">8% (PKR 9.6M)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Head Breakdown BarChart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Revenue Breakdown by Fee Head Category
            </h3>
            <p className="text-xs text-slate-500">
              Distribution of realized revenue across tuition, admission, laboratory, and library fees
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono">
            Audited Ledger FY 2025-2026
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { category: 'Tuition Fee', amount: 78.5 },
                { category: 'Admission & Reg', amount: 14.2 },
                { category: 'Exam Fee', amount: 8.4 },
                { category: 'Lab & Research', amount: 6.8 },
                { category: 'Library & Online', amount: 3.6 },
                { category: 'Hostel & Transport', amount: 5.2 },
              ]}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                unit="M"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any) => [`PKR ${val}M`, 'Realized Revenue']}
              />
              <Bar
                dataKey="amount"
                name="Realized Revenue (Million PKR)"
                fill="#DD2A2A"
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              />
            </BarChart>
          </ResponsiveContainer>
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
          actions={
            canEditFinance ? (
              <button
                onClick={() => {
                  setIsIssueChallanOpen(true);
                  setChallanErrors({});
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Challan</span>
              </button>
            ) : undefined
          }
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Record Fee Challan Collection</h3>
              <button
                onClick={() => {
                  setIsPaymentOpen(false);
                  setPaymentError(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5 text-xs">
              {paymentError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{selectedChallan.studentName}</span>
                <p className="text-slate-500 font-mono text-[11px]">
                  Roll No: {selectedChallan.rollNo} · Ref: {selectedChallan.challanNo}
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-slate-700 font-mono">
                  <span>Remaining Dues:</span>
                  <span className="font-bold text-rose-700">
                    PKR {(selectedChallan.totalAmount - selectedChallan.paidAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Collection Amount (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedChallan.totalAmount - selectedChallan.paidAmount}
                  value={paymentData.amount}
                  onChange={(e) => {
                    setPaymentData({ ...paymentData, amount: Number(e.target.value) });
                    setPaymentError(null);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bank Branch / Collection Channel *
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

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bank Deposit Slip / Transaction Ref *
                </label>
                <input
                  type="text"
                  required
                  value={paymentData.receiptRef}
                  onChange={(e) => {
                    setPaymentData({ ...paymentData, receiptRef: e.target.value });
                    setPaymentError(null);
                  }}
                  placeholder="e.g. HBL-FT-948201 or Cash Receipt # 410"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentOpen(false);
                    setPaymentError(null);
                  }}
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

      {/* Issue Fee Challan Modal */}
      {isIssueChallanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Issue Student Semester Fee Challan</h3>
              <button
                onClick={() => {
                  setIsIssueChallanOpen(false);
                  setChallanErrors({});
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueChallan} className="p-5 space-y-3.5 text-xs">
              {Object.keys(challanErrors).length > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Please resolve all field errors highlighted below.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChallan.studentName}
                    onChange={(e) => {
                      setNewChallan({ ...newChallan, studentName: e.target.value });
                      validateChallanField('studentName', e.target.value);
                    }}
                    onBlur={(e) => validateChallanField('studentName', e.target.value)}
                    placeholder="e.g. Maria Iqbal"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      challanErrors.studentName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {challanErrors.studentName && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{challanErrors.studentName}</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChallan.rollNo}
                    onChange={(e) => {
                      setNewChallan({ ...newChallan, rollNo: e.target.value });
                      validateChallanField('rollNo', e.target.value);
                    }}
                    onBlur={(e) => validateChallanField('rollNo', e.target.value)}
                    placeholder="e.g. FA24-BCS-088"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 font-mono focus:outline-none transition-colors ${
                      challanErrors.rollNo ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {challanErrors.rollNo && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{challanErrors.rollNo}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Degree Program
                  </label>
                  <select
                    value={newChallan.programName}
                    onChange={(e) => setNewChallan({ ...newChallan, programName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BBA (Hons)">BBA (Hons)</option>
                    <option value="MS Data Science">MS Data Science</option>
                    <option value="BS Electrical Engineering">BS Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={newChallan.semester}
                    onChange={(e) => setNewChallan({ ...newChallan, semester: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Challan Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newChallan.dueDate}
                  onChange={(e) => setNewChallan({ ...newChallan, dueDate: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              {/* Fee Heads Breakdown */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Fee Heads Breakdown (PKR)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Tuition Fee *</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={newChallan.tuitionFee}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewChallan({ ...newChallan, tuitionFee: val });
                        validateChallanField('tuitionFee', val);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">Examination Fee</label>
                    <input
                      type="number"
                      min="0"
                      value={newChallan.examFee}
                      onChange={(e) => setNewChallan({ ...newChallan, examFee: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">Library & Online</label>
                    <input
                      type="number"
                      min="0"
                      value={newChallan.libraryFee}
                      onChange={(e) => setNewChallan({ ...newChallan, libraryFee: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">Lab / Equipment</label>
                    <input
                      type="number"
                      min="0"
                      value={newChallan.labFee}
                      onChange={(e) => setNewChallan({ ...newChallan, labFee: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-800">
                  <span>Net Payable Amount:</span>
                  <span className="font-mono text-base text-emerald-700 tabular-nums">
                    PKR{' '}
                    {(
                      Number(newChallan.tuitionFee) +
                      Number(newChallan.examFee) +
                      Number(newChallan.libraryFee) +
                      Number(newChallan.labFee) -
                      Number(newChallan.discount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsIssueChallanOpen(false);
                    setChallanErrors({});
                  }}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Issue Challan
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
