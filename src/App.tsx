/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { ERPModule } from './types';

// Module Pages
import { MainDashboard } from './pages/Dashboard/MainDashboard';
import { EmployeeManagement } from './pages/HRMS/EmployeeManagement';
import { AttendanceManagement } from './pages/TMS/AttendanceManagement';
import { AcademicsManagement } from './pages/Academics/AcademicsManagement';
import { AdmissionsManagement } from './pages/Admissions/AdmissionsManagement';
import { FinanceManagement } from './pages/Finance/FinanceManagement';
import { PayrollManagement } from './pages/Payroll/PayrollManagement';
import { InventoryManagement } from './pages/Inventory/InventoryManagement';
import { ApprovalsQueue } from './pages/Approvals/ApprovalsQueue';
import { UserRoleManagement } from './pages/RBAC/UserRoleManagement';
import { AuditLogViewer } from './pages/Audit/AuditLogViewer';
import { AuthPage } from './pages/Auth/AuthPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { canAccessModule, currentUser, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage onSuccess={() => setActiveTab('dashboard')} />;
  }

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const renderActiveModule = () => {
    // Permission check fallback
    const workflowModules: ERPModule[] = ['hrms', 'academics', 'admissions', 'finance', 'payroll', 'inventory'];
    const canAccessApprovals = workflowModules.some((module) => canAccessModule(module));
    const canAccessActiveTab =
      activeTab === 'approvals' ? canAccessApprovals : canAccessModule(activeTab as ERPModule);
    if (activeTab !== 'dashboard' && currentUser.primaryRole !== 'Super Admin' && !canAccessActiveTab) {
      return (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 max-w-lg mx-auto my-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#DD2A2A] mx-auto flex items-center justify-center font-bold text-lg">
            !
          </div>
          <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-500">
            Your currently active role (<strong>{currentUser.primaryRole}</strong>) does not have authorization to view the <strong>{activeTab.toUpperCase()}</strong> module.
          </p>
          <p className="text-[11px] text-slate-400">
            Use the Persona Switcher in the top bar to switch to <strong>Super Admin</strong> or the designated department head to test this module.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <MainDashboard onNavigateTab={handleNavigateTab} />;
      case 'hrms':
        return <EmployeeManagement />;
      case 'tms':
        return <AttendanceManagement onNavigateTab={handleNavigateTab} />;
      case 'academics':
        return <AcademicsManagement />;
      case 'admissions':
        return <AdmissionsManagement />;
      case 'finance':
        return <FinanceManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'approvals':
        return <ApprovalsQueue />;
      case 'rbac':
        return <UserRoleManagement />;
      case 'audit':
        return <AuditLogViewer />;
      default:
        return <MainDashboard onNavigateTab={handleNavigateTab} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F0F3FB] text-[#484C72]">
      {/* Dynamic Role-Filtered Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header with Campus & Persona Switchers & Global Search */}
        <Header
          activeTab={activeTab}
          onNavigateTab={handleNavigateTab}
          onToggleSidebar={() => setIsMobileSidebarOpen((open) => !open)}
        />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div id="active-module-view" className="max-w-7xl mx-auto space-y-6">
            {renderActiveModule()}
          </div>
        </main>

      </div>

      {/* Slide-over Notifications Drawer */}
      <NotificationDrawer onNavigateTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
