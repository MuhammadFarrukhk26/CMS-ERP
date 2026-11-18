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
  Calendar,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PayrollRecord } from '../../types';

const getCurrentPayrollMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const PayrollManagement: React.FC = () => {
  const { currentCampus, hasPermission } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [payrollMonth, setPayrollMonth] = useState(getCurrentPayrollMonth);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationFeedback, setGenerationFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
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
    if (!payrollMonth) {
      setGenerationFeedback({ type: 'error', message: 'Select a payroll month before running payroll.' });
      return;
    }
    const [year, month] = payrollMonth.split('-').map(Number);
    const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    if (!confirm(`Generate payroll for ${monthLabel} at ${currentCampus?.name || 'all campuses'}?`)) return;
    setIsGenerating(true);
    setGenerationFeedback(null);
    try {
      const result = await api.generateMonthlyPayroll(monthLabel, currentCampus?.id);
      await loadData();
      setGenerationFeedback({
        type: result.data.length > 0 ? 'success' : 'info',
        message: result.message || `Payroll for ${monthLabel} processed.`,
      });
    } catch (error) {
      setGenerationFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Payroll could not be generated.',
      });
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              Payroll month
              <input
                type="month"
                value={payrollMonth}
                onChange={(event) => setPayrollMonth(event.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
              />
            </label>
            <button
              onClick={handleGeneratePayroll}
              disabled={isGenerating || !payrollMonth}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isGenerating ? 'Computing...' : 'Run Monthly Payroll'}</span>
            </button>
          </div>
        )}
      </div>

      {generationFeedback && (
        <div className={`p-3 rounded-lg border text-xs font-semibold flex items-center justify-between ${
          generationFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : generationFeedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <span>{generationFeedback.message}</span>
          <button
            type="button"
            aria-label="Dismiss payroll message"
            onClick={() => setGenerationFeedback(null)}
            className="px-1 font-bold"
          >
            ×
          </button>
        </div>
      )}

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
