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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

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
          {/* Admissions & Fee Realization Trends (Recharts BarChart) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Admissions Intake & Fee Realization Trends
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly undergraduate applicants volume vs fee challans cleared rate (2025-2026)
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Source: Central Admissions & Treasury
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { month: 'Oct', applicants: 450, collectionRate: 82 },
                    { month: 'Nov', applicants: 620, collectionRate: 88 },
                    { month: 'Dec', applicants: 850, collectionRate: 94 },
                    { month: 'Jan', applicants: 1100, collectionRate: 91 },
                    { month: 'Feb', applicants: 1420, collectionRate: 96 },
                    { month: 'Mar', applicants: 1680, collectionRate: 98 },
                  ]}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'collectionRate' ? `${val}%` : `${val} Applicants`,
                      name === 'collectionRate' ? 'Challan Collection' : 'Applicants Volume',
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="applicants"
                    name="Applicants Volume"
                    fill="#DD2A2A"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="collectionRate"
                    name="Challan Collection Rate (%)"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Biometric & Classroom Attendance Trends (Recharts LineChart) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Campus Attendance Percentages
                </h3>
                <p className="text-xs text-slate-500">
                  TMS biometric faculty/staff check-ins vs LMS student session attendance
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 font-mono">
                Average Rate: 94.6%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { period: 'Week 1', staff: 95.8, students: 91.2 },
                    { period: 'Week 2', staff: 96.2, students: 92.5 },
                    { period: 'Week 3', staff: 94.5, students: 89.4 },
                    { period: 'Week 4', staff: 97.1, students: 93.8 },
                    { period: 'Week 5', staff: 96.4, students: 94.2 },
                    { period: 'Week 6', staff: 97.8, students: 95.1 },
                  ]}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="period"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[80, 100]}
                    unit="%"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(val: any) => [`${val}%`]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="plainline"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="staff"
                    name="Faculty & Staff Attendance %"
                    stroke="#DD2A2A"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#DD2A2A' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    name="Student Session Attendance %"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563EB' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Departmental Enrollment Distribution (Recharts PieChart & Breakdown) */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Enrollment by Academic Faculty
                </h3>
                <p className="text-xs text-slate-500">
                  Total headcount allocation and degree program capacity
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 font-mono">
                Total Enrolled: 4,730
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Faculty of Computing', value: 2450, color: '#DD2A2A' },
                        { name: 'Faculty of Engineering', value: 840, color: '#2563EB' },
                        { name: 'Management Sciences', value: 620, color: '#D97706' },
                        { name: 'Allied Health Sciences', value: 820, color: '#059669' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {[
                        { name: 'Faculty of Computing', value: 2450, color: '#DD2A2A' },
                        { name: 'Faculty of Engineering', value: 840, color: '#2563EB' },
                        { name: 'Management Sciences', value: 620, color: '#D97706' },
                        { name: 'Allied Health Sciences', value: 820, color: '#059669' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.5rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(val: any, name: any) => [`${val.toLocaleString()} Students`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DD2A2A]" />
                    <span className="font-semibold text-slate-800">Faculty of Computing</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">2,450 (52%)</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                    <span className="font-semibold text-slate-800">Faculty of Engineering</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">840 (18%)</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                    <span className="font-semibold text-slate-800">Management Sciences</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">620 (13%)</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                    <span className="font-semibold text-slate-800">Allied Health Sciences</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">820 (17%)</span>
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
