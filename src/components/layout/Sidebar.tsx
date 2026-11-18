/**
 * Enterprise Campus Management System (Campus ERP)
 * Dynamic Role-Filtered Sidebar Navigation
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  GraduationCap,
  FileCheck,
  CreditCard,
  Banknote,
  PackageCheck,
  ShieldCheck,
  History,
  CheckSquare,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ERPModule } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: string;
  name: string;
  module: ERPModule;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', module: 'dashboard', icon: LayoutDashboard },
  { id: 'hrms', name: 'HRMS (Employees)', module: 'hrms', icon: Users },
  { id: 'tms', name: 'TMS (Time & Shifts)', module: 'tms', icon: Clock },
  { id: 'academics', name: 'Academics', module: 'academics', icon: GraduationCap },
  { id: 'admissions', name: 'Admissions & Merit', module: 'admissions', icon: FileCheck },
  { id: 'finance', name: 'Finance & Accounts', module: 'finance', icon: CreditCard },
  { id: 'payroll', name: 'Payroll & Salaries', module: 'payroll', icon: Banknote },
  { id: 'inventory', name: 'Inventory & Store', module: 'inventory', icon: PackageCheck },
  { id: 'approvals', name: 'Approval Workflows', module: 'dashboard', icon: CheckSquare },
  { id: 'rbac', name: 'Roles & RBAC', module: 'rbac', icon: ShieldCheck },
  { id: 'audit', name: 'Audit & System Logs', module: 'audit', icon: History },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { canAccessModule, currentUser, currentCampus } = useAuth();

  // Filter navigation items dynamically according to current role permissions
  const authorizedItems = NAV_ITEMS.filter((item) => {
    if (currentUser.primaryRole === 'Super Admin') return true;
    if (item.id === 'approvals') {
      return ['hrms', 'academics', 'admissions', 'finance', 'payroll', 'inventory'].some((module) =>
        canAccessModule(module as ERPModule)
      );
    }
    return canAccessModule(item.module);
  });

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0 select-none md:static md:z-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-64 md:w-20' : 'w-64'}`}
      >
      {/* Brand & Crest */}
      <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[#DD2A2A] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
            CU
          </div>
          {!isCollapsed && (
            <div className="leading-tight truncate">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block truncate">
                CAMPUS ERP
              </span>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                Enterprise University Suite
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!isCollapsed && (
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Modules
          </p>
        )}

        {authorizedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? item.name : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#DD2A2A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Campus Context Info Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Building2 className="w-4 h-4 text-[#DD2A2A] shrink-0" />
            <div className="truncate">
              <p className="font-bold text-slate-800 truncate">{currentCampus?.name || 'University Campus'}</p>
              <p className="text-[10px] text-slate-400 truncate">Academic Year 2026-2027</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-slate-400" title="University Campus">
            <Building2 className="w-4 h-4 text-[#DD2A2A]" />
          </div>
        )}
      </div>
      </aside>
    </>
  );
};
