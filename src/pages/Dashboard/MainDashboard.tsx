/**
 * Enterprise Campus Management System (Campus ERP)
 * Central Executive Dashboard & Analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalModal } from '../../components/common/ApprovalModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ApprovalRequest } from '../../types';

interface MainDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigateTab }) => {
  const { currentCampus } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalRequest[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const campusId = currentCampus?.id;
    const [statsRes, apprRes] = await Promise.all([
      api.getDashboardStats(campusId),
      api.getApprovals(campusId),
    ]);

    if (statsRes.success) setStats(statsRes.data);
    if (apprRes.success) {
      setPendingApprovals(apprRes.data.filter((a) => a.status === 'Pending Approval'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#DD2A2A]">
            Campus Executive Overview · Academic Session 2026-2027
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">
            {currentCampus ? currentCampus.name : 'University Headquarters'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized ERP control panel for admissions, academics, staff attendance, payroll, and university accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('academics')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Course Offerings
          </button>
          <button
            onClick={() => onNavigateTab('admissions')}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Merit Lists
          </button>
          <button
            onClick={() => onNavigateTab('approvals')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
          >
            Pending Workflows ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Enrolled Students"
          value={stats ? stats.totalStudents : 6970}
          subtitle="Across all campus degree programs"
          icon={GraduationCap}
          trend={{ value: '8.4% YoY', isPositive: true }}
          accentColor="#DD2A2A"
        />

        <MetricCard
          title="Total Faculty & Staff"
          value={stats ? stats.totalEmployees : 585}
          subtitle="Permanent & Visiting Faculty"
          icon={Users}
          trend={{ value: '4.2% YoY', isPositive: true }}
          accentColor="#2563EB"
        />

        <MetricCard
          title="Daily Staff Attendance"
          value={stats ? `${stats.attendanceRate}%` : '96%'}
          subtitle="TMS biometric verified check-ins"
          icon={Clock}
          trend={{ value: '1.2% this week', isPositive: true }}
          accentColor="#059669"
        />

        <MetricCard
          title="Tuition Fee Collection"
          value={stats ? `PKR ${(stats.totalFeeCollected / 1000).toLocaleString()}k` : 'PKR 120,000k'}
          subtitle={`PKR ${(stats?.totalFeeOutstanding || 0).toLocaleString()} outstanding`}
          icon={Coins}
          trend={{ value: '92% reconciled', isPositive: true }}
          accentColor="#D97706"
        />
      </div>

      {/* Middle Row: Analytics Visualizations & Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Interactive Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue vs Admissions Analytics Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Admissions Intake & Fee Realization Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly applicants vs fee challans cleared (2025-2026)
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Source: Central Admissions & Treasury
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-60 w-full flex items-end gap-6 pt-4 px-2">
              {[
                { month: 'Oct', applicants: 450, fees: 82 },
                { month: 'Nov', applicants: 620, fees: 88 },
                { month: 'Dec', applicants: 850, fees: 94 },
                { month: 'Jan', applicants: 1100, fees: 91 },
                { month: 'Feb', applicants: 1420, fees: 96 },
                { month: 'Mar', applicants: 1680, fees: 98 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Applicants bar */}
                    <div
                      style={{ height: `${(item.applicants / 1700) * 100}%` }}
                      className="w-1/2 bg-red-100 hover:bg-[#DD2A2A] rounded-t transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none transition-all tabular-nums whitespace-nowrap">
                        {item.applicants} Applicants
                      </div>
                    </div>
                    {/* Fee % bar */}
                    <div
                      style={{ height: `${item.fees}%` }}
                      className="w-1/2 bg-emerald-200 hover:bg-emerald-600 rounded-t transition-all group relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none transition-all tabular-nums whitespace-nowrap">
                        {item.fees}% Collected
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600 mt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#DD2A2A]" />
                <span>Undergraduate Applicants Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>Challan Collection Rate (%)</span>
              </div>
            </div>
          </div>

          {/* Departmental Metrics Distribution */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Academic Faculty & Departmental Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Student-faculty ratio and course distribution across academic faculties
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Faculty of Computing</span>
                  <span className="text-xs font-mono font-bold text-[#DD2A2A]">62%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#DD2A2A] h-full" style={{ width: '62%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>CS, SE & Data Science</span>
                  <span className="tabular-nums">2,450 Students</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Faculty of Engineering</span>
                  <span className="text-xs font-mono font-bold text-blue-600">22%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: '22%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>Electrical & Mechanical</span>
                  <span className="tabular-nums">840 Students</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">Management Sciences</span>
                  <span className="text-xs font-mono font-bold text-amber-600">16%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full" style={{ width: '16%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>BBA & MBA Executive</span>
                  <span className="tabular-nums">620 Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 col: Pending Approvals Queue */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#DD2A2A]" />
                <h3 className="text-sm font-bold text-slate-900">Pending Approvals</h3>
              </div>
              <span className="text-xs font-bold text-[#DD2A2A] font-mono tabular-nums">
                {pendingApprovals.length} Awaiting
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Items requiring sanction from authorized academic or administrative signatories.
            </p>

            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px]">
              {pendingApprovals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                  <p>All administrative requests are up to date.</p>
                </div>
              ) : (
                pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-[#DD2A2A]">
                          {req.referenceNo}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {req.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        Submitted by: {req.submittedBy}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 tabular-nums">{req.submittedAt}</span>
                      <button
                        onClick={() => {
                          setSelectedApproval(req);
                          setIsApprovalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
                      >
                        Review Action →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-3">
              <button
                onClick={() => onNavigateTab('approvals')}
                className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open All Workflow Queues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Action Modal */}
      <ApprovalModal
        request={selectedApproval}
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false);
          setSelectedApproval(null);
        }}
        onActionComplete={loadData}
        onProcessAction={api.processApprovalAction.bind(api)}
      />
    </div>
  );
};
