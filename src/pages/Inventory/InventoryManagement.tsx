/**
 * Enterprise Campus Management System (Campus ERP)
 * Central Store, Inventory & Procurement Requisitions
 */

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  ShoppingCart,
  AlertTriangle,
  Building2,
  CheckCircle,
  Plus,
  X,
  FileText,
  Boxes,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalModal } from '../../components/common/ApprovalModal';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem, PurchaseRequisition } from '../../types';
import { validateName, validateAmount } from '../../utils/validators';

export const InventoryManagement: React.FC = () => {
  const { currentCampus, hasPermission, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'items' | 'requisitions'>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);

  // Modals
  const [selectedReqForApproval, setSelectedReqForApproval] = useState<any>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [selectedReqForPrint, setSelectedReqForPrint] = useState<any>(null);
  const [isPrintReqOpen, setIsPrintReqOpen] = useState(false);
  const [isCreateReqOpen, setIsCreateReqOpen] = useState(false);

  // Form
  const [newReq, setNewReq] = useState({
    itemName: '',
    category: 'IT Hardware',
    quantity: 5,
    estimatedUnitCost: 25000,
    urgency: 'Normal' as 'Normal' | 'High' | 'Emergency',
    justification: '',
  });
  const [reqErrors, setReqErrors] = useState<Record<string, string>>({});

  const canSubmitReq = hasPermission('inventory', 'create') || hasPermission('inventory', 'submit');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [invRes, reqRes] = await Promise.all([
      api.getInventory(campusId),
      api.getPurchaseRequisitions(campusId),
    ]);

    if (invRes.success) setItems(invRes.data);
    if (reqRes.success) setRequisitions(reqRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id]);

  const handleCreateRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const nameErr = validateName(newReq.itemName, 'Item description', 3).error;
    if (nameErr) errors.itemName = nameErr;
    if (newReq.quantity < 1) errors.quantity = 'Quantity must be at least 1 unit.';
    const costErr = validateAmount(newReq.estimatedUnitCost, 100, 10000000, 'Estimated unit cost').error;
    if (costErr) errors.estimatedUnitCost = costErr;
    if (!newReq.justification || newReq.justification.trim().length < 8) {
      errors.justification = 'Please provide a clear justification (minimum 8 characters).';
    }

    setReqErrors(errors);
    if (Object.keys(errors).length > 0) return;

    await api.createPurchaseRequisition({
      requestedBy: currentUser.fullName,
      departmentId: 'dept-cs',
      campusId: currentCampus?.id || 'camp-main',
      urgency: newReq.urgency,
      items: [
        {
          name: newReq.itemName,
          quantity: Number(newReq.quantity),
          estimatedCost: Number(newReq.estimatedUnitCost) * Number(newReq.quantity),
        },
      ],
      totalEstimatedCost: Number(newReq.estimatedUnitCost) * Number(newReq.quantity),
      justification: newReq.justification,
    });

    setIsCreateReqOpen(false);
    setReqErrors({});
    setNewReq({
      itemName: '',
      category: 'IT Hardware',
      quantity: 5,
      estimatedUnitCost: 25000,
      urgency: 'Normal',
      justification: '',
    });
    await loadData();
  };

  const itemColumns: Column<InventoryItem>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      sortable: true,
      width: '130px',
      render: (i) => <span className="font-mono font-bold text-[#DD2A2A]">{i.itemCode}</span>,
    },
    {
      key: 'name',
      header: 'Item Specification',
      sortable: true,
      render: (i) => (
        <div>
          <span className="font-bold text-slate-900 block">{i.name}</span>
          <span className="text-[11px] text-slate-400">
            Category: {i.category} · Vendor: {i.vendorName}
          </span>
        </div>
      ),
    },
    {
      key: 'storeLocation',
      header: 'Store Location',
      sortable: true,
      render: (i) => <span className="text-slate-700">{i.storeLocation}</span>,
    },
    {
      key: 'unitCost',
      header: 'Unit Cost',
      sortable: true,
      align: 'right',
      render: (i) => (
        <span className="font-mono text-slate-700 tabular-nums">
          PKR {i.unitCost.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'currentStock',
      header: 'In Stock',
      sortable: true,
      align: 'right',
      render: (i) => {
        const isLow = i.currentStock <= i.reorderLevel;
        return (
          <div className="font-mono tabular-nums">
            <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
              {i.currentStock} {i.uom}
            </span>
            {isLow && (
              <span className="text-[10px] text-rose-500 block">
                Reorder Alert (&le; {i.reorderLevel})
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const requisitionColumns: Column<PurchaseRequisition>[] = [
    {
      key: 'reqNo',
      header: 'Requisition Ref',
      sortable: true,
      width: '130px',
      render: (r) => <span className="font-mono font-bold text-[#DD2A2A]">{r.reqNo}</span>,
    },
    {
      key: 'requestedBy',
      header: 'Requested By',
      sortable: true,
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.requestedBy}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1 italic">"{r.justification}"</span>
        </div>
      ),
    },
    {
      key: 'requestDate',
      header: 'Date',
      sortable: true,
      render: (r) => <span className="font-mono text-slate-600 tabular-nums">{r.requestDate}</span>,
    },
    {
      key: 'totalEstimatedCost',
      header: 'Est. Cost',
      sortable: true,
      align: 'right',
      render: (r) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          PKR {r.totalEstimatedCost.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Workflow State',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedReqForPrint({
                referenceNo: r.reqNo,
                requestedBy: r.requestedBy,
                justification: r.justification,
                totalAmount: r.totalEstimatedCost,
                status: r.status,
              });
              setIsPrintReqOpen(true);
            }}
            className="p-1 text-slate-500 hover:text-[#DD2A2A] rounded transition-colors"
            title="Print Store Purchase Requisition"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedReqForApproval({
                id: r.id,
                entityType: 'Requisition',
                entityId: r.id,
                referenceNo: r.reqNo,
                title: `Purchase Requisition - PKR ${r.totalEstimatedCost.toLocaleString()}`,
                submittedBy: r.requestedBy,
                departmentName: 'Department',
                campusId: r.campusId,
                status: r.status,
                submittedAt: r.requestDate,
                history: r.approvalHistory,
              });
              setIsApprovalOpen(true);
            }}
            className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
          >
            Review →
          </button>
        </div>
      ),
    },
  ];


  const lowStockCount = items.filter((i) => i.currentStock <= i.reorderLevel).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Central University Store, Asset Inventory & Procurement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Stock ledger, reorder thresholds, equipment allocation, and multi-tier purchase requisitions
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'items'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Master ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('requisitions')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'requisitions'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Requisitions ({requisitions.length})
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Reorder Alert:</strong> {lowStockCount} inventory items have reached minimum buffer levels. Generate replenishment purchase orders.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('requisitions')}
            className="font-bold underline text-amber-900"
          >
            View Requisitions
          </button>
        </div>
      )}

      {activeTab === 'items' ? (
        <ERPTable
          data={items}
          columns={itemColumns}
          searchPlaceholder="Search inventory by item code, name, category..."
          searchKeys={['itemCode', 'name', 'category', 'vendorName']}
          title="Central Store Inventory Master"
          subtitle="Real-time stock on hand, storage locations, unit costs, and reorder levels"
          filename="inventory_master"
        />
      ) : (
        <ERPTable
          data={requisitions}
          columns={requisitionColumns}
          searchPlaceholder="Search requisitions..."
          searchKeys={['reqNo', 'requestedBy', 'justification']}
          title="Procurement & Purchase Requisitions"
          subtitle="Departmental requisition approvals, justification reviews, and purchase order issue"
          filename="purchase_requisitions"
          actions={
            canSubmitReq ? (
              <button
                onClick={() => {
                  setIsCreateReqOpen(true);
                  setReqErrors({});
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Requisition</span>
              </button>
            ) : undefined
          }
        />
      )}

      {/* Create Purchase Requisition Modal */}
      {isCreateReqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Initiate Purchase Requisition</h3>
              <button
                onClick={() => {
                  setIsCreateReqOpen(false);
                  setReqErrors({});
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="p-5 space-y-3.5 text-xs">
              {Object.keys(reqErrors).length > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Please resolve all field errors highlighted below.</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Description & Specification *
                </label>
                <input
                  type="text"
                  required
                  value={newReq.itemName}
                  onChange={(e) => setNewReq({ ...newReq, itemName: e.target.value })}
                  placeholder="e.g. Core i7 Desktop Workstations with 32GB RAM"
                  className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                    reqErrors.itemName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                  }`}
                />
                {reqErrors.itemName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{reqErrors.itemName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Store Category
                  </label>
                  <select
                    value={newReq.category}
                    onChange={(e) => setNewReq({ ...newReq, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="IT Hardware">IT Hardware & Networking</option>
                    <option value="Lab Equipment">Lab Equipment & Instruments</option>
                    <option value="Stationery">Stationery & Office Supplies</option>
                    <option value="Furniture">Campus Furniture & Fixtures</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={newReq.urgency}
                    onChange={(e) => setNewReq({ ...newReq, urgency: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="Normal">Normal Institutional Review</option>
                    <option value="High">High (Semester Commencement)</option>
                    <option value="Emergency">Emergency (Immediate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity Required *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newReq.quantity}
                    onChange={(e) => setNewReq({ ...newReq, quantity: Number(e.target.value) })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 font-mono focus:outline-none transition-colors ${
                      reqErrors.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {reqErrors.quantity && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{reqErrors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Est. Unit Cost (PKR) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newReq.estimatedUnitCost}
                    onChange={(e) => setNewReq({ ...newReq, estimatedUnitCost: Number(e.target.value) })}
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 font-mono focus:outline-none transition-colors ${
                      reqErrors.estimatedUnitCost ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {reqErrors.estimatedUnitCost && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{reqErrors.estimatedUnitCost}</p>
                  )}
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between font-bold text-slate-800">
                <span>Total Estimated Sanction:</span>
                <span className="font-mono text-base text-[#DD2A2A] tabular-nums">
                  PKR {(Number(newReq.quantity) * Number(newReq.estimatedUnitCost)).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Departmental Justification & Academic Purpose *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newReq.justification}
                  onChange={(e) => setNewReq({ ...newReq, justification: e.target.value })}
                  placeholder="Explain why this procurement is necessary and which laboratories/programs it benefits..."
                  className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                    reqErrors.justification ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                  }`}
                />
                {reqErrors.justification && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{reqErrors.justification}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateReqOpen(false);
                    setReqErrors({});
                  }}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Submit to Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        request={selectedReqForApproval}
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false);
          setSelectedReqForApproval(null);
        }}
        onActionComplete={loadData}
        onProcessAction={api.processApprovalAction.bind(api)}
      />

      {/* Printable Purchase Requisition Document */}
      <PrintDocumentModal
        isOpen={isPrintReqOpen}
        onClose={() => {
          setIsPrintReqOpen(false);
          setSelectedReqForPrint(null);
        }}
        docType="requisition"
        title="Official Central Store Purchase Requisition"
        data={selectedReqForPrint}
      />
    </div>
  );
};

