/**
 * Enterprise Campus Management System (Campus ERP)
 * System Audit Trail, Activity Logs & Compliance Inspection
 */

import React, { useState, useEffect } from 'react';
import { History, Shield, Filter, Search, Download, Calendar } from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { api } from '../../services/api';
import { AuditLogEntry, ERPModule } from '../../types';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const loadData = async () => {
    const res = await api.getAuditLogs();
    if (res.success) {
      let list = res.data;
      if (moduleFilter !== 'all') {
        list = list.filter((l) => l.module === moduleFilter);
      }
      setLogs(list);
    }
  };

  useEffect(() => {
    loadData();
  }, [moduleFilter]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      width: '160px',
      render: (l) => <span className="font-mono text-slate-700 tabular-nums">{l.timestamp}</span>,
    },
    {
      key: 'userName',
      header: 'Actor & Role',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-bold text-slate-900 block">{l.userName}</span>
          <span className="text-[11px] font-mono text-slate-400">
            {l.userRole} · IP: {l.ipAddress}
          </span>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module & Action',
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-mono font-bold text-[#DD2A2A] uppercase text-[11px] block">
            {l.module}
          </span>
          <span className="text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
            {l.action}
          </span>
        </div>
      ),
    },
    {
      key: 'resource',
      header: 'Affected Resource',
      sortable: true,
      render: (l) => <span className="font-semibold text-slate-800">{l.resource}</span>,
    },
    {
      key: 'details',
      header: 'Event Details & Payload',
      render: (l) => <span className="text-slate-600 font-mono text-[11px]">{l.details}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            System Activity Audit Trail & Compliance Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking of user authentication, RBAC policy mutations, marks submissions, and financial transactions
          </p>
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
        >
          <option value="all">All Modules</option>
          <option value="rbac">RBAC & Authentication</option>
          <option value="hrms">HRMS & Employees</option>
          <option value="tms">TMS & Attendance</option>
          <option value="academics">Academics & Grading</option>
          <option value="admissions">Admissions & Merit</option>
          <option value="finance">Finance & Vouchers</option>
          <option value="payroll">Payroll Runs</option>
          <option value="inventory">Inventory & Requisitions</option>
        </select>
      </div>

      <ERPTable
        data={logs}
        columns={columns}
        searchPlaceholder="Search audit events by user, action, resource..."
        searchKeys={['userName', 'userRole', 'module', 'action', 'resource', 'details']}
        title="University System Audit Ledger"
        subtitle="HEC Regulatory Compliance, ISO 27001 Security Audit Log, and Digital Forensics"
        filename="system_audit_logs"
      />
    </div>
  );
};
