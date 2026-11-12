/**
 * Enterprise Campus Management System (Campus ERP)
 * Top Navigation Bar with Campus Selector, Persona Switcher & Notifications
 */

import React, { useState } from 'react';
import {
  Bell,
  Building2,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Shield,
  GraduationCap,
  Briefcase,
  Coins,
  BookOpen,
  LogOut,
  User,
  Key,
  FileDown,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRoleName } from '../../types';
import { db } from '../../services/db';
import { GlobalSearch } from '../common/GlobalSearch';
import { UserProfileModal } from '../common/UserProfileModal';
import { PrintPreviewModal } from '../common/PrintPreviewModal';
import { exportCurrentViewToPdf } from '../../utils/pdfExport';

interface HeaderProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigateTab }) => {
  const {
    currentUser,
    currentCampus,
    allCampuses,
    setCurrentCampusId,
    switchPersona,
    logout,
  } = useAuth();
  const { unreadCount, toggleDrawer } = useNotifications();

  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isCampusMenuOpen, setIsCampusMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExportStatus, setPdfExportStatus] = useState<string | null>(null);


  const handleExportCurrentView = async () => {
    setIsExportingPdf(true);
    setPdfExportStatus('Exporting PDF...');
    try {
      const moduleTitle = getBreadcrumb();
      const success = await exportCurrentViewToPdf({
        title: moduleTitle,
        moduleName: moduleTitle,
        campusName: currentCampus?.name,
        generatedBy: `${currentUser.fullName} (${currentUser.primaryRole})`,
        filename: `campus_erp_${activeTab}_report`,
        landscape: true,
      });
      if (success) {
        setPdfExportStatus('PDF Exported!');
      } else {
        setPdfExportStatus('Export failed');
      }
    } catch (err) {
      console.error('Failed to export view as PDF:', err);
      setPdfExportStatus('Export error');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setPdfExportStatus(null), 3500);
    }
  };


  const personas: { role: UserRoleName; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'Super Admin', label: 'Super Admin (Full Governance)', icon: Shield },
    { role: 'Faculty Dean', label: 'Faculty Dean (Academic Approvals)', icon: GraduationCap },
    { role: 'HR Manager', label: 'HR Manager (Staff & Leaves)', icon: Briefcase },
    { role: 'Finance Manager', label: 'Finance Manager (Fee & Vouchers)', icon: Coins },
    { role: 'Lecturer', label: 'Lecturer (Marks & Attendance)', icon: BookOpen },
    { role: 'Student', label: 'Student (Self-Service Portal)', icon: GraduationCap },
  ];

  const handleResetData = () => {
    if (confirm('Reset entire ERP database to fresh demo seed data? All custom entries will be restored to initial state.')) {
      db.resetToFactoryDefaults();
      window.location.reload();
    }
  };

  const getBreadcrumb = () => {
    const map: Record<string, string> = {
      dashboard: 'Central Executive Dashboard',
      hrms: 'Human Resource Management System (HRMS)',
      tms: 'Time Management & Biometric Attendance (TMS)',
      academics: 'Academics & Examination Ledger',
      admissions: 'Student Admissions & Merit Calculations',
      finance: 'University Accounts & Fee Management',
      payroll: 'Faculty & Staff Payroll Engine',
      inventory: 'Central Store & Asset Management',
      approvals: 'Unified Approval & Workflow Engine',
      rbac: 'Roles & Granular Permissions Matrix',
      audit: 'System Activity & Compliance Audit Logs',
    };
    return map[activeTab] || 'Campus ERP';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs shrink-0">
        <span className="font-semibold text-slate-400">Campus ERP</span>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-900 text-sm tracking-tight">{getBreadcrumb()}</span>
      </div>

      {/* Center: Global Cross-Module Search */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <GlobalSearch onNavigateTab={onNavigateTab} />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Global Search icon trigger fallback */}
        <div className="sm:hidden">
          <GlobalSearch onNavigateTab={onNavigateTab} />
        </div>
        {/* Campus Context Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCampusMenuOpen(!isCampusMenuOpen);
              setIsPersonaMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-[#DD2A2A]" />
            <span className="max-w-[130px] truncate">{currentCampus?.name || 'All Campuses'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isCampusMenuOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 text-xs">
              <div className="px-3 py-1.5 font-bold uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-100">
                Select Active Campus
              </div>
              {allCampuses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCurrentCampusId(c.id);
                    setIsCampusMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                    currentCampus?.id === c.id ? 'bg-red-50/50 text-[#DD2A2A] font-bold' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsPersonaMenuOpen(!isPersonaMenuOpen);
              setIsCampusMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#DD2A2A] bg-red-50/70 hover:bg-red-100/70 border border-red-200 rounded-lg transition-colors shadow-2xs"
            title="Switch User Role to test RBAC"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Role: {currentUser.primaryRole}</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {isPersonaMenuOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                <p className="font-bold text-slate-900">Switch Active Persona</p>
                <p className="text-[11px] text-slate-500">
                  Instant RBAC testing: switch view & permissions
                </p>
              </div>

              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = currentUser.primaryRole === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => {
                      switchPersona(p.role);
                      setIsPersonaMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-red-50/60 text-[#DD2A2A] font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Export Current View as PDF & Print Preview Button */}
        <button
          onClick={() => setIsPrintPreviewOpen(true)}
          disabled={isExportingPdf}
          title="Open Print Preview & Export as PDF (Toggle sections & A4 layout)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#DD2A2A] hover:bg-red-50/70 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <FileDown className="w-3.5 h-3.5 text-[#DD2A2A]" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>


        {/* Reset Database Button */}
        <button
          onClick={handleResetData}
          title="Reset database to initial seed data"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={toggleDrawer}
          title="Open Notifications"
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >

          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#DD2A2A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Interactive Capsule */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsPersonaMenuOpen(false);
              setIsCampusMenuOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
            title="User Profile & Account Settings"
          >
            <div className="w-8 h-8 rounded-full bg-[#DD2A2A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="hidden lg:block leading-tight">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px]">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser.email}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs animate-in fade-in">
              <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                <span className="font-bold text-slate-900 block truncate">{currentUser.fullName}</span>
                <span className="text-[11px] text-[#DD2A2A] font-semibold block">{currentUser.primaryRole}</span>
                <span className="text-[10px] text-slate-400 block truncate font-mono mt-0.5">{currentUser.email}</span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Profile Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security & Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsPrintPreviewOpen(true);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#DD2A2A]" />
                  <span>Export Active View to PDF</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out of Campus ERP</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile & Account Security Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={logout}
      />

      {/* Print Preview & PDF Export Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        activeTab={activeTab}
        moduleTitle={getBreadcrumb()}
        campusName={currentCampus?.name}
        userName={currentUser.fullName}
        userRole={currentUser.primaryRole}
      />
    </header>
  );
};

