/**
 * Enterprise Campus Management System (Campus ERP)
 * Academics Management, Timetables, Grading & Transcripts
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Award,
  CheckCircle,
  Printer,
  Edit3,
  Save,
  Users,
  Clock,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PrintDocumentModal } from '../../components/common/PrintDocumentModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Program, CourseOffering, MarksEntry, Student } from '../../types';

export const AcademicsManagement: React.FC = () => {
  const { currentCampus, hasPermission, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'offerings' | 'marks' | 'programs' | 'students'>('offerings');
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<MarksEntry[]>([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState<string>('off-cs201-s26');

  // Print Transcript Modal
  const [isPrintTranscriptOpen, setIsPrintTranscriptOpen] = useState(false);
  const [selectedStudentForTranscript, setSelectedStudentForTranscript] = useState<any>(null);

  // Inline Marks Edit state
  const [editingMarksId, setEditingMarksId] = useState<string | null>(null);
  const [marksForm, setMarksForm] = useState({
    assignments: 14,
    quizzes: 13,
    midterm: 27,
    finalExam: 36,
  });

  const [marksError, setMarksError] = useState<string | null>(null);

  const canEditMarks = hasPermission('academics', 'edit');

  const loadData = async () => {
    const campusId = currentCampus?.id;
    const [progRes, offRes, stuRes, mrkRes] = await Promise.all([
      api.getPrograms(),
      api.getOfferings(campusId),
      api.getStudents(campusId),
      api.getMarks(selectedOfferingId),
    ]);

    if (progRes.success) setPrograms(progRes.data);
    if (offRes.success) {
      setOfferings(offRes.data);
      if (!selectedOfferingId && offRes.data.length > 0) {
        setSelectedOfferingId(offRes.data[0].id);
      }
    }
    if (stuRes.success) setStudents(stuRes.data);
    if (mrkRes.success) setMarks(mrkRes.data);
  };

  useEffect(() => {
    loadData();
  }, [currentCampus?.id, selectedOfferingId]);

  const handleStartEdit = (entry: MarksEntry) => {
    setMarksError(null);
    setEditingMarksId(entry.id);
    setMarksForm({
      assignments: entry.assignments,
      quizzes: entry.quizzes,
      midterm: entry.midterm,
      finalExam: entry.finalExam,
    });
  };

  const handleSaveMarks = async (marksId: string) => {
    setMarksError(null);
    if (marksForm.assignments < 0 || marksForm.assignments > 15) {
      setMarksError('Assignment marks must be between 0 and 15.');
      return;
    }
    if (marksForm.quizzes < 0 || marksForm.quizzes > 15) {
      setMarksError('Quiz marks must be between 0 and 15.');
      return;
    }
    if (marksForm.midterm < 0 || marksForm.midterm > 30) {
      setMarksError('Midterm exam marks must be between 0 and 30.');
      return;
    }
    if (marksForm.finalExam < 0 || marksForm.finalExam > 40) {
      setMarksError('Final exam marks must be between 0 and 40.');
      return;
    }

    await api.updateStudentMarks(marksId, marksForm);
    setEditingMarksId(null);
    setMarksError(null);
    await loadData();
  };

  const offeringColumns: Column<CourseOffering>[] = [
    {
      key: 'courseCode',
      header: 'Course Code',
      sortable: true,
      width: '120px',
      render: (o) => <span className="font-mono font-bold text-[#DD2A2A]">{o.courseCode}</span>,
    },
    {
      key: 'courseTitle',
      header: 'Course Title & Section',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-bold text-slate-900 block">{o.courseTitle}</span>
          <span className="text-[11px] text-slate-500">
            Section: {o.section} · {o.creditHours} Credit Hours
          </span>
        </div>
      ),
    },
    {
      key: 'lecturerName',
      header: 'Assigned Instructor',
      sortable: true,
      render: (o) => <span className="font-semibold text-slate-800">{o.lecturerName}</span>,
    },
    {
      key: 'timeSlot',
      header: 'Timetable Slot & Room',
      sortable: true,
      render: (o) => (
        <div>
          <span className="font-mono text-slate-700 block">{o.timeSlot}</span>
          <span className="text-[11px] text-slate-400">{o.room}</span>
        </div>
      ),
    },
    {
      key: 'totalEnrolled',
      header: 'Enrolled',
      sortable: true,
      align: 'right',
      render: (o) => (
        <span className="font-mono font-bold text-slate-800 tabular-nums">
          {o.totalEnrolled} Students
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (o) => (
        <button
          onClick={() => {
            setSelectedOfferingId(o.id);
            setActiveTab('marks');
          }}
          className="px-2.5 py-1 text-xs font-bold text-[#DD2A2A] hover:bg-red-50 rounded transition-colors"
        >
          View Marks →
        </button>
      ),
    },
  ];

  const marksColumns: Column<MarksEntry>[] = [
    {
      key: 'rollNo',
      header: 'Roll No',
      sortable: true,
      width: '120px',
      render: (m) => <span className="font-mono font-bold text-slate-900">{m.rollNo}</span>,
    },
    {
      key: 'studentName',
      header: 'Student Name',
      sortable: true,
      render: (m) => <span className="font-semibold text-slate-900">{m.studentName}</span>,
    },
    {
      key: 'assignments',
      header: 'Assign (15)',
      sortable: true,
      align: 'center',
      render: (m) =>
        editingMarksId === m.id ? (
          <input
            type="number"
            min="0"
            max="15"
            value={marksForm.assignments}
            onChange={(e) => setMarksForm({ ...marksForm, assignments: Number(e.target.value) })}
            className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-mono"
          />
        ) : (
          <span className="font-mono tabular-nums">{m.assignments}</span>
        ),
    },
    {
      key: 'quizzes',
      header: 'Quiz (15)',
      sortable: true,
      align: 'center',
      render: (m) =>
        editingMarksId === m.id ? (
          <input
            type="number"
            min="0"
            max="15"
            value={marksForm.quizzes}
            onChange={(e) => setMarksForm({ ...marksForm, quizzes: Number(e.target.value) })}
            className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-mono"
          />
        ) : (
          <span className="font-mono tabular-nums">{m.quizzes}</span>
        ),
    },
    {
      key: 'midterm',
      header: 'Midterm (30)',
      sortable: true,
      align: 'center',
      render: (m) =>
        editingMarksId === m.id ? (
          <input
            type="number"
            min="0"
            max="30"
            value={marksForm.midterm}
            onChange={(e) => setMarksForm({ ...marksForm, midterm: Number(e.target.value) })}
            className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-mono"
          />
        ) : (
          <span className="font-mono tabular-nums">{m.midterm}</span>
        ),
    },
    {
      key: 'finalExam',
      header: 'Final (40)',
      sortable: true,
      align: 'center',
      render: (m) =>
        editingMarksId === m.id ? (
          <input
            type="number"
            min="0"
            max="40"
            value={marksForm.finalExam}
            onChange={(e) => setMarksForm({ ...marksForm, finalExam: Number(e.target.value) })}
            className="w-14 text-center p-1 bg-white border border-slate-300 rounded font-mono"
          />
        ) : (
          <span className="font-mono tabular-nums">{m.finalExam}</span>
        ),
    },
    {
      key: 'total',
      header: 'Total (100)',
      sortable: true,
      align: 'center',
      render: (m) => (
        <span className="font-mono font-bold text-slate-900 tabular-nums">{m.total}</span>
      ),
    },
    {
      key: 'grade',
      header: 'Grade & GPA',
      sortable: true,
      align: 'center',
      render: (m) => (
        <div className="font-mono">
          <span className="font-bold text-emerald-700">{m.grade}</span>
          <span className="text-[11px] text-slate-400 ml-1">({m.gpa.toFixed(1)})</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end gap-1.5">
          {canEditMarks && (
            editingMarksId === m.id ? (
              <button
                onClick={() => handleSaveMarks(m.id)}
                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                title="Save Marks"
              >
                <Save className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleStartEdit(m)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                title="Edit Marks"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )
          )}
          <button
            onClick={() => {
              setSelectedStudentForTranscript({
                studentName: m.studentName,
                rollNo: m.rollNo,
                cgpa: 3.82,
              });
              setIsPrintTranscriptOpen(true);
            }}
            className="p-1 text-[#DD2A2A] hover:bg-red-50 rounded"
            title="Generate Official Transcript"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Academics, Examination & Degree Ledgers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Semester course offerings, section timetables, continuous assessment, and official transcripts
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('offerings')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'offerings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Course Offerings ({offerings.length})
          </button>
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'marks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Marks Award Sheet ({marks.length})
          </button>
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3 py-1.5 font-bold rounded-md transition-colors ${
              activeTab === 'programs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Degree Programs ({programs.length})
          </button>
        </div>
      </div>

      {activeTab === 'offerings' && (
        <ERPTable
          data={offerings}
          columns={offeringColumns}
          searchPlaceholder="Search offerings by course title, code, instructor..."
          searchKeys={['courseCode', 'courseTitle', 'lecturerName', 'section']}
          title="Active Semester Course Offerings"
          subtitle="Spring 2026 Academic Offerings, Lecturers, Class Timetables and Room Assignments"
          filename="course_offerings"
        />
      )}

      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Offering Selector Banner */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Active Course Section:</span>
              <select
                value={selectedOfferingId}
                onChange={(e) => setSelectedOfferingId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
              >
                {offerings.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.courseCode} {o.courseTitle} ({o.section})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              Weights: Assignments 15% · Quizzes 15% · Midterm 30% · Final Exam 40%
            </span>
          </div>

          {marksError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{marksError}</span>
              </div>
              <button
                onClick={() => setMarksError(null)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800"
              >
                Dismiss
              </button>
            </div>
          )}

          <ERPTable
            data={marks}
            columns={marksColumns}
            searchPlaceholder="Search students in this section..."
            searchKeys={['rollNo', 'studentName', 'grade']}
            title="Official Marks & Examination Award Sheet"
            subtitle="Continuous assessment components, relative grading, and Controller of Examinations lock"
            filename="marks_award_sheet"
          />
        </div>
      )}

      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <span className="text-xs font-mono font-bold text-[#DD2A2A]">{prog.code}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{prog.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{prog.degreeLevel} Degree</p>
              </div>

              <div className="space-y-1 text-xs pt-3 border-t border-slate-100 font-mono text-slate-600">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-bold text-slate-900">{prog.totalSemesters} Semesters</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Credits:</span>
                  <span className="font-bold text-slate-900">{prog.totalCreditHours} Cr. Hrs</span>
                </div>
                <div className="flex justify-between">
                  <span>Semester Fee:</span>
                  <span className="font-bold text-emerald-700">
                    PKR {prog.feePerSemester.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Printable Transcript Modal */}
      <PrintDocumentModal
        isOpen={isPrintTranscriptOpen}
        onClose={() => setIsPrintTranscriptOpen(false)}
        docType="transcript"
        title="Student Academic Transcript & Marksheet"
        data={selectedStudentForTranscript}
      />
    </div>
  );
};
