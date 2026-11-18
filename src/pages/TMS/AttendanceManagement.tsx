/**
 * Enterprise Campus Management System (Campus ERP)
 * Time Management System (TMS) & Biometric Attendance
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord, Shift, Employee } from '../../types';

interface AttendanceManagementProps {
  onNavigateTab: (tab: string) => void;
}

const getLocalDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ onNavigateTab }) => {
  const { currentCampus, currentUser, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'shifts' | 'biometric'>('attendance');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [isProcessing, setIsProcessing] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canOpenPayroll =
    (hasPermission('tms', 'approve') || currentUser.primaryRole === 'Super Admin') &&
    hasPermission('payroll', 'view');
  const punchEmployee =
    employees.find((employee) => employee.id === currentUser.employeeId) ||
    employees.find((employee) => employee.fullName.toLowerCase() === currentUser.fullName.toLowerCase()) ||
    employees[0];

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [attRes, shiftRes, empRes] = await Promise.all([
      api.getAttendance(campusId, selectedDate),
      api.getShifts(),
      api.getEmployees(campusId),
    ]);

    if (attRes.success) setAttendance(attRes.data);
    if (shiftRes.success) setShifts(shiftRes.data);
    if (empRes.success) setEmployees(empRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id, selectedDate]);

  const handlePunch = async (type: 'checkIn' | 'checkOut') => {
    if (!punchEmployee) {
      setPunchFeedback({ type: 'error', message: 'No employee record is available for this attendance punch.' });
      return;
    }
    setIsProcessing(true);
    setPunchFeedback(null);
    try {
      const res = await api.recordWebPunch(punchEmployee.id, type);
      if (res.success) {
        setPunchFeedback({
          type: 'success',
          message: res.message || `${type === 'checkIn' ? 'Check-in' : 'Check-out'} recorded`,
        });
        await loadData();
      } else {
        setPunchFeedback({ type: 'error', message: res.message || 'Failed to record attendance.' });
      }
    } catch (err) {
      setPunchFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to record attendance.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const attendanceColumns: Column<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      width: '110px',
      render: (a) => <span className="font-mono text-slate-800 tabular-nums">{a.date}</span>,
    },
    {
      key: 'employeeName',
      header: 'Employee Name',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.employeeName}</span>
          <span className="text-[11px] text-slate-400">Source: {a.source}</span>
        </div>
      ),
    },
    {
      key: 'checkIn',
      header: 'Check In',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-semibold text-emerald-700 tabular-nums">
          {a.checkIn || '—'}
        </span>
      ),
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      sortable: true,
      render: (a) => (
        <span className="font-mono font-semibold text-slate-700 tabular-nums">
          {a.checkOut || '—'}
        </span>
      ),
    },
    {
      key: 'workHours',
      header: 'Work Hours',
      sortable: true,
      align: 'right',
      render: (a) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">
          {a.workHours.toFixed(1)} hrs
        </span>
      ),
    },
    {
      key: 'lateMinutes',
      header: 'Late Grace',
      sortable: true,
      align: 'right',
      render: (a) =>
        a.lateMinutes > 0 ? (
          <span className="font-mono text-amber-600 font-bold tabular-nums">
            +{a.lateMinutes} mins
          </span>
        ) : (
          <span className="text-slate-400 font-mono">0</span>
        ),
    },
    {
      key: 'status',
      header: 'Attendance Status',
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
  ];

  const shiftColumns: Column<Shift>[] = [
    {
      key: 'code',
      header: 'Shift Code',
      sortable: true,
      width: '120px',
      render: (s) => <span className="font-mono font-bold text-[#DD2A2A]">{s.code}</span>,
    },
    {
      key: 'name',
      header: 'Shift Title & Schedule',
      sortable: true,
      render: (s) => (
        <div>
          <span className="font-bold text-slate-900 block">{s.name}</span>
          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
            {s.startTime} - {s.endTime} (8.0 hrs standard)
          </span>
        </div>
      ),
    },
    {
      key: 'graceMinutes',
      header: 'Grace Time',
      sortable: true,
      render: (s) => <span className="font-mono text-slate-700">{s.graceMinutes} Minutes</span>,
    },
    {
      key: 'halfDayThresholdHours',
      header: 'Half-Day Cutoff',
      sortable: true,
      render: (s) => (
        <span className="font-mono text-slate-700">&lt; {s.halfDayThresholdHours} Hours</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (s) => <StatusBadge status={s.isActive ? 'Active' : 'Inactive'} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Web Punch In/Out Terminal */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#DD2A2A]">
            TMS · Biometric & Web Time Tracking Engine
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Daily Employee Attendance & Shift Scheduler
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Staff web punches and attendance logs for the selected campus and date.
          </p>
        </div>

        {/* Web punch terminal */}
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-right pr-2 border-r border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Staff</span>
            <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
              {punchEmployee?.fullName || 'No employee record'}
            </span>
          </div>

          <button
            onClick={() => handlePunch('checkIn')}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            title="Record Web Check-In"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Web Check-In</span>
          </button>

          <button
            onClick={() => handlePunch('checkOut')}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            title="Record Web Check-Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Web Check-Out</span>
          </button>
        </div>
      </div>

      {punchFeedback && (
        <div className={`p-3 border rounded-lg text-xs font-semibold flex items-center justify-between ${
          punchFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {punchFeedback.type === 'success'
              ? <CheckCircle className="w-4 h-4 text-emerald-600" />
              : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{punchFeedback.message}</span>
          </div>
          <button onClick={() => setPunchFeedback(null)} aria-label="Dismiss attendance message" className="font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'attendance'
                ? 'bg-[#DD2A2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Attendance Logs ({attendance.length})
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'shifts'
                ? 'bg-[#DD2A2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Shift Configurations ({shifts.length})
          </button>
          <button
            onClick={() => setActiveTab('biometric')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'biometric'
                ? 'bg-[#DD2A2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Biometric Hardware Gateway
          </button>
        </div>

        {canOpenPayroll && (
          <button
            onClick={() => onNavigateTab('payroll')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Review Payroll</span>
          </button>
        )}
      </div>

      {activeTab === 'attendance' && (
        <>
          <label className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            Attendance date
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
            />
          </label>
          <ERPTable
            data={attendance}
            columns={attendanceColumns}
            searchPlaceholder="Search attendance by employee name..."
            searchKeys={['employeeName', 'source', 'status']}
            title="Daily Employee Attendance Registry"
            subtitle={`Web punches and attendance records for ${selectedDate}`}
            filename="attendance_records"
          />
        </>
      )}

      {activeTab === 'shifts' && (
        <ERPTable
          data={shifts}
          columns={shiftColumns}
          searchPlaceholder="Search shifts..."
          searchKeys={['code', 'name']}
          title="Campus Shift Roster & Policies"
          subtitle="Standard timings, grace period thresholds, and half-day rules"
          filename="campus_shifts"
        />
      )}

      {activeTab === 'biometric' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Biometric Attendance Device Network & Gateway
              </h3>
              <p className="text-xs text-slate-500">
                Sample terminal inventory only. A live biometric gateway is not connected in this demo.
              </p>
            </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Demo data · Not connected</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Terminal 01 - Main Academic Gate</span>
                <StatusBadge status="Demo" />
              </div>
              <p className="font-mono text-slate-500">IP: 192.168.10.201 · Port 4370</p>
              <p className="text-[11px] text-slate-400">Model: ZKTeco SilkBio-101TC</p>
              <div className="pt-2 border-t border-slate-200 text-slate-600 flex justify-between">
                <span>Punches today:</span>
                <span className="font-mono font-bold">428 logs</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Terminal 02 - Admin & Faculty Block</span>
                <StatusBadge status="Demo" />
              </div>
              <p className="font-mono text-slate-500">IP: 192.168.10.202 · Port 4370</p>
              <p className="text-[11px] text-slate-400">Model: ZKTeco ProCapture-A</p>
              <div className="pt-2 border-t border-slate-200 text-slate-600 flex justify-between">
                <span>Punches today:</span>
                <span className="font-mono font-bold">186 logs</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">Terminal 03 - Library & Computing</span>
                <StatusBadge status="Demo" />
              </div>
              <p className="font-mono text-slate-500">IP: 192.168.10.203 · Port 4370</p>
              <p className="text-[11px] text-slate-400">Model: Hikvision DS-K1T671</p>
              <div className="pt-2 border-t border-slate-200 text-slate-600 flex justify-between">
                <span>Punches today:</span>
                <span className="font-mono font-bold">312 logs</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
