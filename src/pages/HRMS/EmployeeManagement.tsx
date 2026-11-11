/**
 * Enterprise Campus Management System (Campus ERP)
 * Human Resource Management System (HRMS)
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Briefcase,
  GraduationCap,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Plus,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ApprovalModal } from '../../components/common/ApprovalModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Employee, LeaveApplication, Department } from '../../types';

export const EmployeeManagement: React.FC = () => {
  const { currentCampus, hasPermission, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'leaves'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [deptFilter, setDeptFilter] = useState('all');

  // Modals
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState<any>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  // Forms
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    designation: 'Assistant Professor',
    departmentId: 'dept-cs',
    campusId: currentCampus?.id || 'camp-main',
    employmentType: 'Permanent' as const,
    joinDate: new Date().toISOString().split('T')[0],
    salary: 220000,
    status: 'Active' as const,
    education: 'Ph.D. in Computer Science',
    experienceYears: 6,
  });

  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    leaveType: 'Annual' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    days: 3,
    reason: '',
  });

  const canCreateEmployee = hasPermission('hrms', 'create');
  const canApplyLeave = hasPermission('hrms', 'submit') || hasPermission('hrms', 'create');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [empRes, deptRes, leaveRes] = await Promise.all([
      api.getEmployees(campusId, deptFilter),
      api.getDepartments(campusId),
      api.getLeaves(campusId),
    ]);

    if (empRes.success) setEmployees(empRes.data);
    if (deptRes.success) setDepartments(deptRes.data);
    if (leaveRes.success) setLeaves(leaveRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id, deptFilter]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createEmployee({
      ...newEmp,
      campusId: currentCampus?.id || 'camp-main',
    } as any);
    setIsAddEmployeeOpen(false);
    await loadData();
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newLeave.employeeId) || employees[0];
    await api.applyLeave({
      employeeId: emp.id,
      employeeName: emp.fullName,
      departmentId: emp.departmentId,
      campusId: emp.campusId,
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days: Number(newLeave.days),
      reason: newLeave.reason,
    });
    setIsApplyLeaveOpen(false);
    setNewLeave({
      employeeId: '',
      leaveType: 'Annual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      days: 3,
      reason: '',
    });
    await loadData();
  };

  const employeeColumns: Column<Employee>[] = [
    {
      key: 'empNo',
      header: 'Emp No',
      sortable: true,
      width: '110px',
      render: (e) => <span className="font-mono font-bold text-[#DD2A2A]">{e.empNo}</span>,
    },
    {
      key: 'fullName',
      header: 'Employee Details',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-bold text-slate-900 block">{e.fullName}</span>
          <span className="text-[11px] text-slate-500">{e.email} · {e.phone}</span>
        </div>
      ),
    },
    {
      key: 'designation',
      header: 'Designation & Type',
      sortable: true,
      render: (e) => (
        <div>
          <span className="font-semibold text-slate-800 block">{e.designation}</span>
          <span className="text-[11px] text-slate-400">{e.employmentType} ({e.experienceYears} yrs exp)</span>
        </div>
      ),
    },
    {
      key: 'departmentId',
      header: 'Department',
      sortable: true,
      render: (e) => {
        const d = departments.find((dept) => dept.id === e.departmentId);
        return <span className="text-slate-700">{d?.name || 'Department'}</span>;
      },
    },
    {
      key: 'salary',
      header: 'Gross Salary',
      sortable: true,
      align: 'right',
      render: (e) => (
        <span className="font-mono font-bold text-slate-800 tabular-nums">
          PKR {e.salary.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => <StatusBadge status={e.status} />,
    },
  ];

  const leaveColumns: Column<LeaveApplication>[] = [
    {
      key: 'leaveNo',
      header: 'Leave Ref',
      sortable: true,
      width: '120px',
      render: (l) => <span className="font-mono font-bold text-[#DD2A2A]">{l.leaveNo}</span>,
    },
    {
      key: 'employeeName',
      header: 'Staff Member',
      sortable: true,
      render: (l) => <span className="font-bold text-slate-900">{l.employeeName}</span>,
    },
    {
      key: 'leaveType',
      header: 'Category',
      sortable: true,
      render: (l) => <span className="font-semibold text-slate-700">{l.leaveType} Leave</span>,
    },
    {
      key: 'days',
      header: 'Period & Days',
      sortable: true,
      render: (l) => (
        <span className="font-mono text-slate-600 tabular-nums">
          {l.startDate} to {l.endDate} ({l.days} days)
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (l) => <span className="text-slate-600 line-clamp-1 italic">"{l.reason}"</span>,
    },
    {
      key: 'status',
      header: 'Workflow State',
      sortable: true,
      render: (l) => <StatusBadge status={l.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (l) => (
        <button
          onClick={() => {
            setSelectedLeaveForApproval({
              id: l.id,
              entityType: 'Leave',
              entityId: l.id,
              referenceNo: l.leaveNo,
              title: `${l.leaveType} Leave - ${l.employeeName}`,
              submittedBy: l.employeeName,
              departmentName: 'Department',
              campusId: l.campusId,
              status: l.status,
              submittedAt: l.appliedDate,
              history: l.approvalHistory,
            });
            setIsApprovalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
        >
          Review →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Human Resource Management System (HRMS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty & administrative staff directory, onboarding, leave ledgers, and official clearance
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
                activeTab === 'employees'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Employees ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
                activeTab === 'leaves'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leave Management ({leaves.length})
            </button>
          </div>

          {activeTab === 'employees' && canCreateEmployee && (
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Employee</span>
            </button>
          )}

          {activeTab === 'leaves' && canApplyLeave && (
            <button
              onClick={() => setIsApplyLeaveOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply for Leave</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' ? (
        <ERPTable
          data={employees}
          columns={employeeColumns}
          searchPlaceholder="Search employees by name, designation, CNIC..."
          searchKeys={['fullName', 'empNo', 'designation', 'email', 'cnic']}
          filters={
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          }
          title="University Employee Directory"
          subtitle="Active faculty members, research associates, and administrative officers"
          filename="university_employees"
        />
      ) : (
        <div className="space-y-6">
          {/* Leave Quota Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Annual Leave Quota</span>
                <h4 className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">24 Days / Year</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Paid conference & vacation allowance</p>
              </div>
              <Calendar className="w-8 h-8 text-[#DD2A2A] opacity-80" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Casual Leave Quota</span>
                <h4 className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">10 Days / Year</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Emergency and personal leaves</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600 opacity-80" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Sick Leave Quota</span>
                <h4 className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">14 Days / Year</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Medical practitioner verified leaves</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 opacity-80" />
            </div>
          </div>

          <ERPTable
            data={leaves}
            columns={leaveColumns}
            searchPlaceholder="Search leaves by ref, employee name..."
            searchKeys={['leaveNo', 'employeeName', 'leaveType']}
            title="Leave Applications & Approval Registry"
            subtitle="Centralized leave sanction tracking and multi-tier approval status"
            filename="leave_applications"
          />
        </div>
      )}

      {/* Register Employee Modal */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Register University Employee</h3>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.firstName}
                    onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                    placeholder="e.g. Asim"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.lastName}
                    onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                    placeholder="e.g. Munir"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="e.g. asim.munir@campus.edu"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CNIC / National ID
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.cnic}
                    onChange={(e) => setNewEmp({ ...newEmp, cnic: e.target.value })}
                    placeholder="37405-1234567-9"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="e.g. Assistant Professor"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={newEmp.departmentId}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Monthly Gross Salary (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Highest Qualification & Education
                </label>
                <input
                  type="text"
                  required
                  value={newEmp.education}
                  onChange={(e) => setNewEmp({ ...newEmp, education: e.target.value })}
                  placeholder="e.g. Ph.D. in Computer Science (Stanford)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyLeaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Submit Leave Application</h3>
              <button
                onClick={() => setIsApplyLeaveOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Staff Member
                </label>
                <select
                  required
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Leave Type
                  </label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Official Duty">Official Duty</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={newLeave.days}
                    onChange={(e) => setNewLeave({ ...newLeave, days: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason & Arrangements
                </label>
                <textarea
                  rows={3}
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="State the purpose of leave and class coverage arrangements..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyLeaveOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        request={selectedLeaveForApproval}
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false);
          setSelectedLeaveForApproval(null);
        }}
        onActionComplete={loadData}
        onProcessAction={api.processApprovalAction.bind(api)}
      />
    </div>
  );
};
