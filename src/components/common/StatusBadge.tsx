/**
 * Enterprise Campus Management System (Campus ERP)
 * Zero-Pill Semantic Status Indicator
 */

import React from 'react';
import { WorkflowStatus } from '../../types';

interface StatusBadgeProps {
  status: WorkflowStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  // Semantic color and indicator mapping (Strict Anti-Slop Zero-Pill discipline: unboxed clean typography)
  let textColor = 'text-slate-600';
  let indicatorColor = 'bg-slate-400';

  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Paid':
    case 'Present':
    case 'Enrolled':
    case 'Completed':
    case 'Offered':
      textColor = 'text-emerald-700';
      indicatorColor = 'bg-emerald-600';
      break;

    case 'Pending Approval':
    case 'Pending':
    case 'Submitted':
    case 'Merit Listed':
    case 'Verified':
    case 'Partial':
    case 'Late':
    case 'Open':
      textColor = 'text-amber-700';
      indicatorColor = 'bg-amber-500';
      break;

    case 'Rejected':
    case 'Terminated':
    case 'Suspended':
    case 'Overdue':
    case 'Absent':
      textColor = 'text-rose-700';
      indicatorColor = 'bg-rose-600';
      break;

    case 'Draft':
    case 'Reverted':
    case 'Cancelled':
    case 'On Leave':
    case 'Half Day':
      textColor = 'text-indigo-700';
      indicatorColor = 'bg-indigo-500';
      break;

    default:
      textColor = 'text-slate-600';
      indicatorColor = 'bg-slate-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${indicatorColor}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
