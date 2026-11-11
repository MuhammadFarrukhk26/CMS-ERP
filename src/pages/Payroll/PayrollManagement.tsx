/**
 * Enterprise Campus Management System (Campus ERP)
 * Payroll Management, Salary Registers & Payslips
 */

import React, { useState, useEffect } from 'react';
import {
  Banknote,
  DollarSign,
  Printer,
  CheckCircle,
  Play,
  FileText,
  Calendar,
  Building2,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PayrollRecord } from '../../types';

export const PayrollManagement: React.FC = () => {
  const { currentCampus, hasPermission } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const canRunPayroll = hasPermission('payroll', 'create') || hasPermission('payroll', 'approve');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const res = await api.getPayrollRecords(campusId);
    if (res.success) setPayrolls(res.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id]);

  const handleGeneratePayroll = async () => {
    if (!confirm('Execute monthly payroll generation for active staff for March 2026?')) return;
    setIsGenerating(true);
    try {
      await api.generateMonthlyPayroll('March 2026');
      await loadData();
    } finally {
      setIsGenerating(false);
    }
  };

  const payrollColumns: Column<PayrollRecord>[] = [
    {
      key: 'employeeName',
      header: 'Staff Member',
      sortable: true,
      render: (p) => (
        <div>
          <span className="font-bold text-slate-900 block">{p.employeeName}</span>
          <span className="text-[11px] text-slate-400">{p.designation}</span>
        </div>
      ),
    },
    {
      key: 'payrollMonth',
      header: 'Payroll Period',
      sortable: true,
      render: (p) => <span className="font-mono text-slate-700">{p.payrollMonth}</span>,
    },
    {
      key: 'basicSalary',
      header: 'Basic Pay',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono text-slate-700 tabular-nums">
          PKR {p.basicSalary.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'grossSalary',
      header: 'Gross Pay',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          PKR {p.grossSalary.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'taxDeduction',
      header: 'Tax & Deductions',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono text-rose-600 font-semibold tabular-nums">
          -PKR {(p.taxDeduction + p.providentFund).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'netSalary',
      header: 'Net Take-Home',
      sortable: true,
      align: 'right',
      render: (p) => (
        <span className="font-mono font-extrabold text-emerald-700 tabular-nums text-sm">
          PKR {p.netSalary.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Disbursement',
      sortable: true,
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'actions',
      header: 'Payslip',
      align: 'right',
      render: (p) => (
        <button
          onClick={() => {
            setSelectedPayroll(p);
            setIsPayslipOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Payslip</span>
        </button>
      ),
    },
  ];

  const totalGrossDisbursed = payrolls.reduce((a, p) => a + p.grossSalary, 0);
  const totalNetDisbursed = payrolls.reduce((a, p) => a + p.netSalary, 0);
  const totalTaxWithheld = payrolls.reduce((a, p) => a + p.taxDeduction, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Payroll Processing, Allowances & Tax Compliance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Attendance-linked salary calculations, statutory deductions, bank transfer advice, and payslips
          </p>
        </div>

        {canRunPayroll && (
          <button
            onClick={handleGeneratePayroll}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isGenerating ? 'Computing...' : 'Run Monthly Payroll'}</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">Gross Payroll Expense</span>
            <h4 className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              PKR {totalGrossDisbursed.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Basic pay + standard allowances</p>
          </div>
          <Banknote className="w-8 h-8 text-[#DD2A2A] opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">Net Disbursed Salaries</span>
            <h4 className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
              PKR {totalNetDisbursed.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Direct bank transfer via 1Link</p>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-600 opacity-80" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-semibold uppercase">FBR Income Tax Withheld</span>
            <h4 className="text-xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
              PKR {totalTaxWithheld.toLocaleString()}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Statutory withholding remittance</p>
          </div>
          <DollarSign className="w-8 h-8 text-blue-600 opacity-80" />
        </div>
      </div>

      <ERPTable
        data={payrolls}
        columns={payrollColumns}
        searchPlaceholder="Search payroll by employee name, month..."
        searchKeys={['employeeName', 'designation', 'payrollMonth']}
        title="Faculty & Staff Monthly Payroll Register"
        subtitle="Itemized breakdown of basic pay, house rent, medical, overtime, and tax deductions"
        filename="monthly_payroll_register"
      />

      {/* Official Payslip Modal */}
      <PrintDocumentModal
        isOpen={isPayslipOpen}
        onClose={() => setIsPayslipOpen(false)}
        docType="payslip"
        title="Employee Monthly Salary Slip & Deductions Statement"
        data={selectedPayroll}
      />
    </div>
  );
};
