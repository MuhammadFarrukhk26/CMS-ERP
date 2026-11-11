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
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalModal } from '../../components/common/ApprovalModal';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { InventoryItem, PurchaseRequisition } from '../../types';

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
        />
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

