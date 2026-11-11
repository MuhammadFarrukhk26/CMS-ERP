/**
 * Enterprise Campus Management System (Campus ERP)
 * Unified Approval Action & Workflow History Modal
 */

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, RotateCcw, Clock, UserCheck, ShieldAlert } from 'lucide-react';
import { ApprovalRequest } from '../../types';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete: () => void;
  onProcessAction: (
    approvalId: string,
    action: 'Approved' | 'Rejected' | 'Reverted',
    remarks?: string
  ) => Promise<any>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  isOpen,
  onClose,
  onActionComplete,
  onProcessAction,
}) => {
  const { hasPermission, currentUser } = useAuth();
  const [remarks, setRemarks] = useState('');
  const [selectedAction, setSelectedAction] = useState<'Approved' | 'Rejected' | 'Reverted'>('Approved');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const canApprove = hasPermission(
    request.entityType === 'Leave' ? 'hrms' : request.entityType === 'Voucher' ? 'finance' : 'inventory',
    'approve'
  );

  const handleSubmit = async () => {
    if (selectedAction === 'Rejected' && !remarks.trim()) {
      setError('A rejection justification is mandatory.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onProcessAction(request.id, selectedAction, remarks.trim());
      onActionComplete();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to process workflow action');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#DD2A2A]">
                {request.referenceNo}
              </span>
              <span className="text-slate-300">·</span>
              <StatusBadge status={request.status} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{request.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg text-xs border border-slate-200">
            <div>
              <span className="text-slate-500">Submitted By:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{request.submittedBy}</p>
            </div>
            <div>
              <span className="text-slate-500">Department / Unit:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{request.departmentName}</p>
            </div>
            <div>
              <span className="text-slate-500">Submission Date:</span>
              <p className="font-semibold text-slate-800 mt-0.5 tabular-nums">{request.submittedAt}</p>
            </div>
            <div>
              <span className="text-slate-500">Entity Category:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{request.entityType} Request</p>
            </div>
          </div>

          {/* Workflow Audit Trail History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Approval Audit History</span>
            </h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
              {request.history && request.history.length > 0 ? (
                request.history.map((h, i) => (
                  <div key={i} className="p-2.5 flex items-start justify-between gap-3 bg-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{h.actorName}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({h.actorRole})</span>
                      </div>
                      {h.remarks && <p className="text-slate-600 italic">"{h.remarks}"</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={h.action} />
                      <p className="text-[11px] text-slate-400 mt-0.5 tabular-nums">{h.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-400">No previous history entries</div>
              )}
            </div>
          </div>

          {/* Authorization Check */}
          {!canApprove ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Your current role (<strong>{currentUser.primaryRole}</strong>) is not granted approval authorization for this module. Switch persona to <strong>Super Admin</strong>, <strong>Faculty Dean</strong>, or <strong>HR/Finance Manager</strong> in the top bar to approve or reject.
              </span>
            </div>
          ) : request.status === 'Approved' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This request has already been finalized and approved.</span>
            </div>
          ) : (
            /* Action Controls */
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Decide Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAction('Approved')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      selectedAction === 'Approved'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAction('Rejected')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      selectedAction === 'Rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAction('Reverted')}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                      selectedAction === 'Reverted'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revert</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Comments & Remarks {selectedAction === 'Rejected' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    selectedAction === 'Rejected'
                      ? 'State the reason for rejection (required)...'
                      : 'Add administrative remarks, instructions, or conditions...'
                  }
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A] focus:border-[#DD2A2A]"
                />
              </div>

              {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          {canApprove && request.status !== 'Approved' && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : `Confirm ${selectedAction}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
