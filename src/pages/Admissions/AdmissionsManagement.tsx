/**
 * Enterprise Campus Management System (Campus ERP)
 * Admissions Intake, Merit List Calculator & Quota Allocation
 */

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  UserPlus,
  Calculator,
  ListOrdered,
  Award,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Applicant, MeritList, AdmissionSession } from '../../types';
import {
  validateCnic,
  validateEmail,
  validatePhone,
  validateName,
  validatePercentage,
} from '../../utils/validators';

export const AdmissionsManagement: React.FC = () => {
  const { currentCampus, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'applicants' | 'meritLists'>('applicants');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [meritLists, setMeritLists] = useState<MeritList[]>([]);
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isOfferLetterOpen, setIsOfferLetterOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Form
  const [newApplicant, setNewApplicant] = useState({
    fullName: '',
    fatherName: '',
    email: '',
    phone: '',
    cnic: '',
    programPreference1: 'BS Computer Science',
    programPreference2: 'BS Software Engineering',
    campusId: currentCampus?.id || 'camp-main',
    matricPercent: 88.0,
    fscPercent: 85.0,
    testScore: 82.0,
    category: 'Open Merit' as const,
    challanPaid: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const canRegister = hasPermission('admissions', 'create');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [appRes, meritRes, sessRes] = await Promise.all([
      api.getApplicants(campusId),
      api.getMeritLists(),
      api.getAdmissionSessions(),
    ]);

    if (appRes.success) setApplicants(appRes.data);
    if (meritRes.success) setMeritLists(meritRes.data);
    if (sessRes.success) setSessions(sessRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id]);

  // Live aggregate calculation preview
  const liveAggregate = Number(
    (newApplicant.matricPercent * 0.1 + newApplicant.fscPercent * 0.4 + newApplicant.testScore * 0.5).toFixed(2)
  );

  const validateField = (field: string, value: any) => {
    let err: string | undefined;
    switch (field) {
      case 'fullName':
        err = validateName(value, 'Candidate full name').error;
        break;
      case 'fatherName':
        err = validateName(value, "Father's name").error;
        break;
      case 'email':
        err = validateEmail(value).error;
        break;
      case 'phone':
        err = validatePhone(value).error;
        break;
      case 'cnic':
        err = validateCnic(value).error;
        break;
      case 'matricPercent':
        err = validatePercentage(value, 'Matric score', 40, 100).error;
        break;
      case 'fscPercent':
        err = validatePercentage(value, 'F.Sc score', 40, 100).error;
        break;
      case 'testScore':
        err = validatePercentage(value, 'Entrance test score', 0, 100).error;
        break;
    }
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (err) updated[field] = err;
      else delete updated[field];
      return updated;
    });
  };

  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};
    const fn = validateName(newApplicant.fullName, 'Candidate full name').error;
    if (fn) errors.fullName = fn;
    const fa = validateName(newApplicant.fatherName, "Father's name").error;
    if (fa) errors.fatherName = fa;
    const em = validateEmail(newApplicant.email).error;
    if (em) errors.email = em;
    const ph = validatePhone(newApplicant.phone).error;
    if (ph) errors.phone = ph;
    const cn = validateCnic(newApplicant.cnic).error;
    if (cn) errors.cnic = cn;
    const mat = validatePercentage(newApplicant.matricPercent, 'Matric score', 40, 100).error;
    if (mat) errors.matricPercent = mat;
    const fsc = validatePercentage(newApplicant.fscPercent, 'F.Sc score', 40, 100).error;
    if (fsc) errors.fscPercent = fsc;
    const tst = validatePercentage(newApplicant.testScore, 'Entrance test score', 0, 100).error;
    if (tst) errors.testScore = tst;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterApplicant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;
    await api.registerApplicant({
      ...newApplicant,
      campusId: currentCampus?.id || 'camp-main',
    });
    setIsRegisterOpen(false);
    setFormErrors({});
    setNewApplicant({
      fullName: '',
      fatherName: '',
      email: '',
      phone: '',
      cnic: '',
      programPreference1: 'BS Computer Science',
      programPreference2: 'BS Software Engineering',
      campusId: currentCampus?.id || 'camp-main',
      matricPercent: 85.0,
      fscPercent: 82.0,
      testScore: 80.0,
      category: 'Open Merit' as const,
      challanPaid: false,
    });
    await loadData();
  };

  const applicantColumns: Column<Applicant>[] = [
    {
      key: 'applicationNo',
      header: 'App No',
      sortable: true,
      width: '130px',
      render: (a) => <span className="font-mono font-bold text-[#DD2A2A]">{a.applicationNo}</span>,
    },
    {
      key: 'fullName',
      header: 'Candidate Name',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-bold text-slate-900 block">{a.fullName}</span>
          <span className="text-[11px] text-slate-400">S/D/O {a.fatherName} · {a.email}</span>
        </div>
      ),
    },
    {
      key: 'programPreference1',
      header: 'Program Preference',
      sortable: true,
      render: (a) => (
        <div>
          <span className="font-semibold text-slate-800 block">{a.programPreference1}</span>
          <span className="text-[11px] text-slate-400">Pref 2: {a.programPreference2}</span>
        </div>
      ),
    },
    {
      key: 'aggregateMerit',
      header: 'Merit Aggregate',
      sortable: true,
      align: 'right',
      render: (a) => (
        <span className="font-mono font-extrabold text-[#DD2A2A] text-sm tabular-nums">
          {a.aggregateMerit.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Seat Quota',
      sortable: true,
      render: (a) => <span className="font-medium text-slate-700">{a.category}</span>,
    },
    {
      key: 'status',
      header: 'Admission Status',
      sortable: true,
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (a) => (
        <button
          onClick={() => {
            setSelectedApplicant({
              studentName: a.fullName,
              rollNo: a.applicationNo,
              programName: a.programPreference1,
              semester: 1,
              dueDate: '2026-08-30',
              tuitionFee: 135000,
              examFee: 10000,
              libraryFee: 5000,
              labFee: 5000,
              discount: 0,
              totalAmount: 155000,
            });
            setIsOfferLetterOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
        >
          Offer Challan →
        </button>
      ),
    },
  ];

  const meritColumns: Column<MeritList>[] = [
    {
      key: 'listNumber',
      header: 'Merit List Sequence',
      sortable: true,
      render: (m) => <span className="font-bold text-slate-900">{m.listNumber}</span>,
    },
    {
      key: 'programName',
      header: 'Degree Program',
      sortable: true,
      render: (m) => <span className="font-semibold text-slate-800">{m.programName}</span>,
    },
    {
      key: 'cutoffMerit',
      header: 'Closing Cutoff Merit',
      sortable: true,
      align: 'right',
      render: (m) => (
        <span className="font-mono font-bold text-[#DD2A2A] text-sm tabular-nums">
          {m.cutoffMerit.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'totalSelected',
      header: 'Allocated Seats',
      sortable: true,
      align: 'right',
      render: (m) => (
        <span className="font-mono text-slate-700 tabular-nums">
          {m.totalSelected} Candidates
        </span>
      ),
    },
    {
      key: 'publishedDate',
      header: 'Publication Date',
      sortable: true,
      render: (m) => <span className="font-mono text-slate-500 tabular-nums">{m.publishedDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Admissions Management & National Merit Calculation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Applicant registrations, multi-criteria weightages, quota seats, and merit list publication
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('applicants')}
              className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
                activeTab === 'applicants'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applicants ({applicants.length})
            </button>
            <button
              onClick={() => setActiveTab('meritLists')}
              className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
                activeTab === 'meritLists'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published Merit Lists ({meritLists.length})
            </button>
          </div>

          {canRegister && (
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Candidate</span>
            </button>
          )}
        </div>
      </div>

      {/* Merit Formula Explainer */}
      <div className="p-3 bg-red-50/60 border border-red-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-800">
          <Calculator className="w-4 h-4 text-[#DD2A2A] shrink-0" />
          <span>
            <strong>National University Aggregate Formula:</strong> Matriculation (10%) + F.Sc / A-Level (40%) + University Entrance Test (50%)
          </span>
        </div>
        <span className="font-mono text-[#DD2A2A] font-bold text-[11px] shrink-0">
          Automated Instant Calculation
        </span>
      </div>

      {activeTab === 'applicants' ? (
        <ERPTable
          data={applicants}
          columns={applicantColumns}
          searchPlaceholder="Search candidates by name, app no, CNIC..."
          searchKeys={['applicationNo', 'fullName', 'cnic', 'programPreference1']}
          title="Fall 2026 Candidate Registry"
          subtitle="Processed application files, calculated aggregates, and offer statuses"
          filename="admission_applicants"
        />
      ) : (
        <ERPTable
          data={meritLists}
          columns={meritColumns}
          searchPlaceholder="Search merit lists..."
          searchKeys={['listNumber', 'programName']}
          title="Official Published Merit Lists"
          subtitle="Cutoff percentage thresholds, selected quotas, and syndicate approved lists"
          filename="published_merit_lists"
        />
      )}

      {/* Candidate Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Register Admission Applicant</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterApplicant} className="p-5 space-y-3.5 text-xs">
              {Object.keys(formErrors).length > 0 && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Please resolve all field errors highlighted below before proceeding.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicant.fullName}
                    onChange={(e) => {
                      setNewApplicant({ ...newApplicant, fullName: e.target.value });
                      validateField('fullName', e.target.value);
                    }}
                    onBlur={(e) => validateField('fullName', e.target.value)}
                    placeholder="e.g. Daniyal Khan"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      formErrors.fullName
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.fullName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicant.fatherName}
                    onChange={(e) => {
                      setNewApplicant({ ...newApplicant, fatherName: e.target.value });
                      validateField('fatherName', e.target.value);
                    }}
                    onBlur={(e) => validateField('fatherName', e.target.value)}
                    placeholder="e.g. Tariq Khan"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      formErrors.fatherName
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {formErrors.fatherName && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.fatherName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newApplicant.email}
                    onChange={(e) => {
                      setNewApplicant({ ...newApplicant, email: e.target.value });
                      validateField('email', e.target.value);
                    }}
                    onBlur={(e) => validateField('email', e.target.value)}
                    placeholder="daniyal@example.com"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      formErrors.email
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.email}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicant.phone}
                    onChange={(e) => {
                      setNewApplicant({ ...newApplicant, phone: e.target.value });
                      validateField('phone', e.target.value);
                    }}
                    onBlur={(e) => validateField('phone', e.target.value)}
                    placeholder="0300-1234567"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      formErrors.phone
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    CNIC / B-Form No (13 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newApplicant.cnic}
                    onChange={(e) => {
                      setNewApplicant({ ...newApplicant, cnic: e.target.value });
                      validateField('cnic', e.target.value);
                    }}
                    onBlur={(e) => validateField('cnic', e.target.value)}
                    placeholder="61101-1234567-1"
                    className={`w-full p-2 bg-slate-50 border rounded-lg text-slate-800 focus:outline-none transition-colors ${
                      formErrors.cnic
                        ? 'border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-1 focus:ring-[#DD2A2A]'
                    }`}
                  />
                  {formErrors.cnic && (
                    <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.cnic}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seat Quota Category
                  </label>
                  <select
                    value={newApplicant.category}
                    onChange={(e) => setNewApplicant({ ...newApplicant, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="Open Merit">Open Merit</option>
                    <option value="Quota">Provincial Quota</option>
                    <option value="Overseas">Overseas Pakistani</option>
                    <option value="Sports">Sports Quota</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Program Preference
                  </label>
                  <select
                    value={newApplicant.programPreference1}
                    onChange={(e) => setNewApplicant({ ...newApplicant, programPreference1: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BBA (Hons)">BBA (Hons)</option>
                    <option value="MS Data Science">MS Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Second Program Preference
                  </label>
                  <select
                    value={newApplicant.programPreference2}
                    onChange={(e) => setNewApplicant({ ...newApplicant, programPreference2: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    <option value="BS Software Engineering">BS Software Engineering</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BBA (Hons)">BBA (Hons)</option>
                    <option value="MS Data Science">MS Data Science</option>
                  </select>
                </div>
              </div>

              {/* Academic Scores Grid */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider block">
                  Academic Marks & Entry Test
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Matric (10%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="100"
                      required
                      value={newApplicant.matricPercent}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewApplicant({ ...newApplicant, matricPercent: val });
                        validateField('matricPercent', val);
                      }}
                      className={`w-full p-1.5 bg-white border rounded text-center font-mono ${
                        formErrors.matricPercent ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.matricPercent && (
                      <p className="text-[10px] text-rose-600 mt-0.5 text-center">{formErrors.matricPercent}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">F.Sc (40%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="40"
                      max="100"
                      required
                      value={newApplicant.fscPercent}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewApplicant({ ...newApplicant, fscPercent: val });
                        validateField('fscPercent', val);
                      }}
                      className={`w-full p-1.5 bg-white border rounded text-center font-mono ${
                        formErrors.fscPercent ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.fscPercent && (
                      <p className="text-[10px] text-rose-600 mt-0.5 text-center">{formErrors.fscPercent}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-0.5">Test Score (50%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      value={newApplicant.testScore}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewApplicant({ ...newApplicant, testScore: val });
                        validateField('testScore', val);
                      }}
                      className={`w-full p-1.5 bg-white border rounded text-center font-mono ${
                        formErrors.testScore ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {formErrors.testScore && (
                      <p className="text-[10px] text-rose-600 mt-0.5 text-center">{formErrors.testScore}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-800">
                  <span>Calculated Aggregate:</span>
                  <span className="font-mono text-base text-[#DD2A2A] tabular-nums">
                    {liveAggregate}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterOpen(false);
                    setFormErrors({});
                  }}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Confirm Candidate File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admission Offer Challan Modal */}
      <PrintDocumentModal
        isOpen={isOfferLetterOpen}
        onClose={() => setIsOfferLetterOpen(false)}
        docType="offerLetter"
        title="Admission Fee Challan & Offer Confirmation"
        data={selectedApplicant}
      />
    </div>
  );
};
