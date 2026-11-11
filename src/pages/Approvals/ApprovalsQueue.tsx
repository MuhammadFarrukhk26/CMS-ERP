/**
 * Enterprise Campus Management System (Campus ERP)
 * Unified Multi-Level Approval & Workflow Queue
 */

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Building2,
  Filter,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalModal } from '../../components/common/ApprovalModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ApprovalRequest, WorkflowStatus } from '../../types';

export const ApprovalsQueue: React.FC = () => {
  const { currentCampus } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const res = await api.getApprovals(campusId);
    if (res.success) {
      let list = res.data;
      if (statusFilter !== 'all') {
        list = list.filter((a) => a.status === statusFilter);
      }
      if (typeFilter !== 'all') {
        list = list.filter((a) => a.entityType === typeFilter);
      }
      setApprovals(list);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id, statusFilter, typeFilter]);

  const columns: Column<ApprovalRequest>[] = [
    {
      key: 'referenceNo',
      header: 'Reference Ref',
      sortable: true,
      width: '130px',
      render: (a) => <span className="font-mono font-bold text-[#DD2A2A]">{a.referenceNo}</span>,
    },
    {
      key: 'title',
      header: 'Workflow Item & Details',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.title}</span>
          <span className="text-[11px] text-slate-400">
            Category: {a.entityType} · Dept: {a.departmentName}
          </span>
        </div>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Originator / Staff',
      sortable: true,
      render: (a) => <span className="font-semibold text-slate-800">{a.submittedBy}</span>,
    },
    {
      key: 'submittedAt',
      header: 'Submitted Date',
      sortable: true,
      render: (a) => <span className="font-mono text-slate-600 tabular-nums">{a.submittedAt}</span>,
    },
    {
      key: 'status',
      header: 'Current Workflow State',
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (a) => (
        <button
          onClick={() => {
            setSelectedRequest(a);
            setIsModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
        >
          Review &amp; Act →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Unified University Approval & Workflow Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized state machine governing draft, submission, multi-tier sanction, rejection, and reversal
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
          >
            <option value="all">All Entity Types</option>
            <option value="Leave">Leave Requests</option>
            <option value="Requisition">Purchase Requisitions</option>
            <option value="Voucher">Financial Vouchers</option>
            <option value="Marks">Academic Marks</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
          >
            <option value="all">All Statuses</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Reverted">Reverted</option>
          </select>
        </div>
      </div>

      <ERPTable
        data={approvals}
        columns={columns}
        searchPlaceholder="Search approval requests..."
        searchKeys={['referenceNo', 'title', 'submittedBy', 'entityType']}
        title="Central Workflow Sanction Queue"
        subtitle="Multi-level authorization requests across Admissions, Finance, HRMS, Academics & Inventory"
        filename="approval_requests"
      />

      <ApprovalModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
        }}
        onActionComplete={loadData}
        onProcessAction={api.processApprovalAction.bind(api)}
      />
    </div>
  );
};
