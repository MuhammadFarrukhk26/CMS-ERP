/**
 * Enterprise Campus Management System (Campus ERP)
 * Embedded Persistent Document Database Engine with Seed Data
 */

import {
  Campus,
  Department,
  Role,
  User,
  Employee,
  LeaveApplication,
  Shift,
  AttendanceRecord,
  Program,
  Course,
  CourseOffering,
  Student,
  MarksEntry,
  AdmissionSession,
  Applicant,
  MeritList,
  FeeChallan,
  JournalVoucher,
  PayrollRecord,
  InventoryItem,
  PurchaseRequisition,
  ApprovalRequest,
  AuditLogEntry,
  NotificationItem,
  ERPModule,
  ActionType,
} from '../types';

const STORAGE_KEY = 'campus_erp_db_v1';

// Seed Roles with granular permissions
const DEFAULT_PERMISSIONS: Record<ERPModule, ActionType[]> = {
  dashboard: ['view', 'export'],
  rbac: ['view', 'create', 'edit', 'delete', 'export'],
  hrms: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print'],
  tms: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'export', 'print'],
  academics: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print'],
  admissions: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'export', 'print'],
  finance: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print'],
  payroll: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'export', 'print'],
  inventory: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'export', 'print'],
  reports: ['view', 'export', 'print'],
  audit: ['view', 'export'],
};

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Full unconstrained university-wide administrative authority over all campuses and modules.',
    isSystemRole: true,
    userCount: 1,
    permissions: DEFAULT_PERMISSIONS,
  },
  {
    id: 'role-campus-admin',
    name: 'Campus Administrator',
    description: 'Campus-wide operational control, user oversight, and local approval authorization.',
    isSystemRole: true,
    userCount: 3,
    permissions: {
      ...DEFAULT_PERMISSIONS,
      rbac: ['view', 'create', 'edit'],
      audit: ['view'],
    },
  },
  {
    id: 'role-faculty-dean',
    name: 'Faculty Dean',
    description: 'Faculty-level academic governance, exam award sheets approval, and lecturer mapping.',
    isSystemRole: true,
    userCount: 4,
    permissions: {
      dashboard: ['view', 'export'],
      rbac: ['view'],
      hrms: ['view', 'approve', 'reject'],
      tms: ['view'],
      academics: ['view', 'create', 'edit', 'approve', 'reject', 'submit', 'export', 'print'],
      admissions: ['view', 'approve', 'reject', 'export'],
      finance: ['view'],
      payroll: ['view'],
      inventory: ['view', 'approve', 'reject'],
      reports: ['view', 'export', 'print'],
      audit: ['view'],
    },
  },
  {
    id: 'role-hod',
    name: 'HOD',
    description: 'Departmental head overseeing faculty timetables, course offerings, and marks submission.',
    isSystemRole: true,
    userCount: 8,
    permissions: {
      dashboard: ['view'],
      rbac: ['view'],
      hrms: ['view', 'approve', 'reject'],
      tms: ['view', 'approve'],
      academics: ['view', 'create', 'edit', 'submit', 'export', 'print'],
      admissions: ['view'],
      finance: ['view'],
      payroll: ['view'],
      inventory: ['view', 'create', 'submit'],
      reports: ['view', 'export', 'print'],
      audit: ['view'],
    },
  },
  {
    id: 'role-lecturer',
    name: 'Lecturer',
    description: 'Course instructor managing class rosters, student attendance, quizzes, and marks entry.',
    isSystemRole: true,
    userCount: 45,
    permissions: {
      dashboard: ['view'],
      rbac: [],
      hrms: ['view'],
      tms: ['view', 'submit'],
      academics: ['view', 'create', 'edit', 'submit', 'print'],
      admissions: [],
      finance: [],
      payroll: ['view', 'print'],
      inventory: ['view', 'submit'],
      reports: ['view'],
      audit: [],
    },
  },
  {
    id: 'role-hr-manager',
    name: 'HR Manager',
    description: 'Complete employee lifecycle management, leave approvals, shifts, and TMS attendance.',
    isSystemRole: true,
    userCount: 2,
    permissions: {
      dashboard: ['view', 'export'],
      rbac: ['view'],
      hrms: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'export', 'print'],
      tms: ['view', 'create', 'edit', 'approve', 'reject', 'submit', 'export', 'print'],
      academics: ['view'],
      admissions: [],
      finance: ['view'],
      payroll: ['view', 'create', 'approve', 'export'],
      inventory: ['view'],
      reports: ['view', 'export', 'print'],
      audit: ['view'],
    },
  },
  {
    id: 'role-finance-manager',
    name: 'Finance Manager',
    description: 'Student fee challans, journal vouchers, accounts payable/receivable, and bank ledgers.',
    isSystemRole: true,
    userCount: 2,
    permissions: {
      dashboard: ['view', 'export'],
      rbac: ['view'],
      hrms: ['view'],
      tms: ['view'],
      academics: ['view'],
      admissions: ['view', 'approve'],
      finance: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print'],
      payroll: ['view', 'approve', 'export', 'print'],
      inventory: ['view', 'approve'],
      reports: ['view', 'export', 'print'],
      audit: ['view'],
    },
  },
  {
    id: 'role-admission-officer',
    name: 'Admission Officer',
    description: 'Intake campaigns, merit calculations, document verification, and seat allocation.',
    isSystemRole: true,
    userCount: 3,
    permissions: {
      dashboard: ['view'],
      rbac: [],
      hrms: [],
      tms: [],
      academics: ['view'],
      admissions: ['view', 'create', 'edit', 'submit', 'approve', 'reject', 'export', 'print'],
      finance: ['view'],
      payroll: [],
      inventory: [],
      reports: ['view', 'export', 'print'],
      audit: ['view'],
    },
  },
  {
    id: 'role-student',
    name: 'Student',
    description: 'Student self-service portal: enrolled courses, timetable, attendance, fee challan, and marks.',
    isSystemRole: true,
    userCount: 1200,
    permissions: {
      dashboard: ['view'],
      rbac: [],
      hrms: [],
      tms: [],
      academics: ['view', 'print'],
      admissions: ['view'],
      finance: ['view', 'print'],
      payroll: [],
      inventory: [],
      reports: ['view'],
      audit: [],
    },
  },
];

export const INITIAL_CAMPUSES: Campus[] = [
  {
    id: 'camp-main',
    code: 'ISB-MAIN',
    name: 'Main Campus (Capital)',
    city: 'Islamabad',
    address: 'Sector H-12, Kashmir Highway, Islamabad',
    phone: '+92 51 9085 0000',
    email: 'info.isb@campus.edu',
    status: 'Active',
    totalStudents: 3450,
    totalEmployees: 280,
  },
  {
    id: 'camp-city',
    code: 'LHR-CITY',
    name: 'City Campus (Lahore)',
    city: 'Lahore',
    address: 'Canal Road, Gulberg III, Lahore',
    phone: '+92 42 3587 0000',
    email: 'info.lhr@campus.edu',
    status: 'Active',
    totalStudents: 2100,
    totalEmployees: 165,
  },
  {
    id: 'camp-health',
    code: 'KHI-MED',
    name: 'Health Sciences Campus',
    city: 'Karachi',
    address: 'National Stadium Road, Karachi',
    phone: '+92 21 3486 0000',
    email: 'med.khi@campus.edu',
    status: 'Active',
    totalStudents: 1420,
    totalEmployees: 140,
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs',
    campusId: 'camp-main',
    code: 'CS',
    name: 'Computer Science',
    facultyName: 'Faculty of Computing & Information Technology',
    headOfDept: 'Dr. Tariq Mahmood',
    email: 'cs@campus.edu',
    status: 'Active',
  },
  {
    id: 'dept-se',
    campusId: 'camp-main',
    code: 'SE',
    name: 'Software Engineering',
    facultyName: 'Faculty of Computing & Information Technology',
    headOfDept: 'Dr. Ayesha Malik',
    email: 'se@campus.edu',
    status: 'Active',
  },
  {
    id: 'dept-ee',
    campusId: 'camp-main',
    code: 'EE',
    name: 'Electrical Engineering',
    facultyName: 'Faculty of Engineering',
    headOfDept: 'Dr. Bilal Qureshi',
    email: 'ee@campus.edu',
    status: 'Active',
  },
  {
    id: 'dept-bba',
    campusId: 'camp-city',
    code: 'MS',
    name: 'Management Sciences',
    facultyName: 'Faculty of Business & Leadership',
    headOfDept: 'Dr. Saima Rauf',
    email: 'bba@campus.edu',
    status: 'Active',
  },
  {
    id: 'dept-mbbs',
    campusId: 'camp-health',
    code: 'MED',
    name: 'Medical & Health Sciences',
    facultyName: 'Faculty of Health Sciences',
    headOfDept: 'Prof. Dr. Irfan Siddiqui',
    email: 'med@campus.edu',
    status: 'Active',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'superadmin',
    email: 'admin@campus.edu',
    password: 'admin123',
    fullName: 'Dr. Zulfiqar Haider',
    phone: '+92 51 9085 1001',
    bio: 'Vice Chancellor & Chief Executive Officer, University Board of Governors.',
    primaryRole: 'Super Admin',
    assignedRoles: ['Super Admin'],
    campusId: 'camp-main',
    status: 'Active',
    lastLogin: 'Today, 08:30 AM',
    employeeId: 'EMP-001',
  },
  {
    id: 'usr-dean',
    username: 'dean.computing',
    email: 'dean.cs@campus.edu',
    password: 'dean123',
    fullName: 'Prof. Dr. Mansoor Alam',
    phone: '+92 51 9085 2002',
    bio: 'Dean, Faculty of Computing & Information Technology.',
    primaryRole: 'Faculty Dean',
    assignedRoles: ['Faculty Dean', 'HOD'],
    campusId: 'camp-main',
    departmentId: 'dept-cs',
    status: 'Active',
    lastLogin: 'Today, 09:12 AM',
    employeeId: 'EMP-002',
  },
  {
    id: 'usr-hr',
    username: 'hrmanager',
    email: 'hr.lead@campus.edu',
    password: 'hr123',
    fullName: 'Sarah Jenkins',
    phone: '+92 51 9085 3003',
    bio: 'Director of Human Resources & Organizational Development.',
    primaryRole: 'HR Manager',
    assignedRoles: ['HR Manager'],
    campusId: 'camp-main',
    status: 'Active',
    lastLogin: 'Today, 08:45 AM',
    employeeId: 'EMP-003',
  },
  {
    id: 'usr-finance',
    username: 'financemanager',
    email: 'finance.lead@campus.edu',
    password: 'finance123',
    fullName: 'Kamran Ashraf, FCA',
    phone: '+92 51 9085 4004',
    bio: 'Treasurer & Chief Financial Officer.',
    primaryRole: 'Finance Manager',
    assignedRoles: ['Finance Manager'],
    campusId: 'camp-main',
    status: 'Active',
    lastLogin: 'Today, 09:00 AM',
    employeeId: 'EMP-004',
  },
  {
    id: 'usr-lecturer',
    username: 'lecturer.hamza',
    email: 'hamza.ali@campus.edu',
    password: 'lecturer123',
    fullName: 'Hamza Ali, MSCS',
    phone: '+92 51 9085 5005',
    bio: 'Assistant Professor, Department of Computer Science.',
    primaryRole: 'Lecturer',
    assignedRoles: ['Lecturer'],
    campusId: 'camp-main',
    departmentId: 'dept-cs',
    status: 'Active',
    lastLogin: 'Today, 10:15 AM',
    employeeId: 'EMP-005',
  },
  {
    id: 'usr-student',
    username: 'student.zain',
    email: 'zain.abideen@student.campus.edu',
    password: 'student123',
    fullName: 'Zain Ul Abideen',
    phone: '+92 300 1234567',
    bio: 'BS Computer Science (Final Year Honors Candidate).',
    primaryRole: 'Student',
    assignedRoles: ['Student'],
    campusId: 'camp-main',
    departmentId: 'dept-cs',
    status: 'Active',
    lastLogin: 'Today, 07:50 AM',
    studentId: 'STU-001',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    empNo: 'EMP-001',
    firstName: 'Zulfiqar',
    lastName: 'Haider',
    fullName: 'Dr. Zulfiqar Haider',
    email: 'admin@campus.edu',
    phone: '+92 300 5551101',
    cnic: '37405-1234567-1',
    designation: 'Vice Chancellor & Rector',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2016-01-15',
    salary: 450000,
    status: 'Active',
    education: 'Ph.D. in Computer Engineering (Stanford)',
    experienceYears: 24,
  },
  {
    id: 'emp-002',
    empNo: 'EMP-002',
    firstName: 'Mansoor',
    lastName: 'Alam',
    fullName: 'Prof. Dr. Mansoor Alam',
    email: 'dean.cs@campus.edu',
    phone: '+92 300 5551102',
    cnic: '37405-1234567-2',
    designation: 'Dean of Computing / Professor',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2018-08-01',
    salary: 380000,
    status: 'Active',
    education: 'Ph.D. in Computer Science (NUS)',
    experienceYears: 18,
  },
  {
    id: 'emp-003',
    empNo: 'EMP-003',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    fullName: 'Sarah Jenkins',
    email: 'hr.lead@campus.edu',
    phone: '+92 300 5551103',
    cnic: '37405-1234567-3',
    designation: 'Head of Human Resources',
    departmentId: 'dept-bba',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2020-03-10',
    salary: 220000,
    status: 'Active',
    education: 'MBA in Human Resource Management',
    experienceYears: 12,
  },
  {
    id: 'emp-004',
    empNo: 'EMP-004',
    firstName: 'Kamran',
    lastName: 'Ashraf',
    fullName: 'Kamran Ashraf, FCA',
    email: 'finance.lead@campus.edu',
    phone: '+92 300 5551104',
    cnic: '37405-1234567-4',
    designation: 'Chief Financial Officer',
    departmentId: 'dept-bba',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2019-06-15',
    salary: 280000,
    status: 'Active',
    education: 'FCA, Institute of Chartered Accountants',
    experienceYears: 16,
  },
  {
    id: 'emp-005',
    empNo: 'EMP-005',
    firstName: 'Hamza',
    lastName: 'Ali',
    fullName: 'Hamza Ali',
    email: 'hamza.ali@campus.edu',
    phone: '+92 300 5551105',
    cnic: '37405-1234567-5',
    designation: 'Senior Lecturer',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2022-02-01',
    salary: 155000,
    status: 'Active',
    education: 'MS in Computer Science (NUST)',
    experienceYears: 6,
  },
  {
    id: 'emp-006',
    empNo: 'EMP-006',
    firstName: 'Nida',
    lastName: 'Fatima',
    fullName: 'Dr. Nida Fatima',
    email: 'nida.fatima@campus.edu',
    phone: '+92 300 5551106',
    cnic: '37405-1234567-6',
    designation: 'Associate Professor',
    departmentId: 'dept-se',
    campusId: 'camp-main',
    employmentType: 'Permanent',
    joinDate: '2021-09-01',
    salary: 260000,
    status: 'Active',
    education: 'Ph.D. in Software Engineering (TUM)',
    experienceYears: 11,
  },
];

export const INITIAL_LEAVES: LeaveApplication[] = [
  {
    id: 'leave-101',
    leaveNo: 'LV-2026-001',
    employeeId: 'emp-005',
    employeeName: 'Hamza Ali',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    leaveType: 'Annual',
    startDate: '2026-03-15',
    endDate: '2026-03-18',
    days: 4,
    reason: 'Attending IEEE International Conference in Dubai as co-author.',
    status: 'Pending Approval',
    appliedDate: '2026-03-01',
    approvalHistory: [
      {
        action: 'Submitted',
        actorName: 'Hamza Ali',
        actorRole: 'Lecturer',
        timestamp: '2026-03-01 10:14 AM',
        remarks: 'Conference registration and travel documents attached.',
      },
    ],
  },
  {
    id: 'leave-102',
    leaveNo: 'LV-2026-002',
    employeeId: 'emp-006',
    employeeName: 'Dr. Nida Fatima',
    departmentId: 'dept-se',
    campusId: 'camp-main',
    leaveType: 'Casual',
    startDate: '2026-03-08',
    endDate: '2026-03-09',
    days: 2,
    reason: 'Family emergency / personal matters.',
    status: 'Approved',
    appliedDate: '2026-03-05',
    approvedBy: 'Prof. Dr. Mansoor Alam',
    approvalHistory: [
      {
        action: 'Submitted',
        actorName: 'Dr. Nida Fatima',
        actorRole: 'Employee',
        timestamp: '2026-03-05 08:30 AM',
      },
      {
        action: 'Approved',
        actorName: 'Prof. Dr. Mansoor Alam',
        actorRole: 'Faculty Dean',
        timestamp: '2026-03-05 11:45 AM',
        remarks: 'Lectures rearranged with teaching assistants.',
      },
    ],
  },
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-gen',
    code: 'SH-GEN',
    name: 'General Faculty & Staff Shift',
    startTime: '08:30',
    endTime: '16:30',
    graceMinutes: 15,
    halfDayThresholdHours: 4,
    isActive: true,
  },
  {
    id: 'shift-eve',
    code: 'SH-EVE',
    name: 'Evening Executive Programs Shift',
    startTime: '13:00',
    endTime: '21:00',
    graceMinutes: 15,
    halfDayThresholdHours: 4,
    isActive: true,
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-01',
    date: '2026-03-10',
    employeeId: 'emp-001',
    employeeName: 'Dr. Zulfiqar Haider',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    shiftId: 'shift-gen',
    checkIn: '08:22 AM',
    checkOut: '17:15 PM',
    workHours: 8.8,
    lateMinutes: 0,
    overtimeMinutes: 45,
    status: 'Present',
    source: 'Biometric',
  },
  {
    id: 'att-02',
    date: '2026-03-10',
    employeeId: 'emp-002',
    employeeName: 'Prof. Dr. Mansoor Alam',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    shiftId: 'shift-gen',
    checkIn: '08:35 AM',
    checkOut: '16:30 PM',
    workHours: 7.9,
    lateMinutes: 5,
    overtimeMinutes: 0,
    status: 'Present',
    source: 'Biometric',
  },
  {
    id: 'att-03',
    date: '2026-03-10',
    employeeId: 'emp-003',
    employeeName: 'Sarah Jenkins',
    departmentId: 'dept-bba',
    campusId: 'camp-main',
    shiftId: 'shift-gen',
    checkIn: '08:28 AM',
    checkOut: '16:45 PM',
    workHours: 8.2,
    lateMinutes: 0,
    overtimeMinutes: 15,
    status: 'Present',
    source: 'Web Portal',
  },
  {
    id: 'att-04',
    date: '2026-03-10',
    employeeId: 'emp-004',
    employeeName: 'Kamran Ashraf, FCA',
    departmentId: 'dept-bba',
    campusId: 'camp-main',
    shiftId: 'shift-gen',
    checkIn: '08:48 AM',
    checkOut: '16:30 PM',
    workHours: 7.7,
    lateMinutes: 18,
    overtimeMinutes: 0,
    status: 'Late',
    source: 'Biometric',
  },
  {
    id: 'att-05',
    date: '2026-03-10',
    employeeId: 'emp-005',
    employeeName: 'Hamza Ali',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    shiftId: 'shift-gen',
    checkIn: '08:15 AM',
    checkOut: '16:30 PM',
    workHours: 8.2,
    lateMinutes: 0,
    overtimeMinutes: 0,
    status: 'Present',
    source: 'Biometric',
  },
];

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-bcs',
    code: 'BSCS',
    name: 'Bachelor of Science in Computer Science',
    departmentId: 'dept-cs',
    degreeLevel: 'Undergraduate',
    totalSemesters: 8,
    totalCreditHours: 133,
    feePerSemester: 135000,
  },
  {
    id: 'prog-bse',
    code: 'BSSE',
    name: 'Bachelor of Science in Software Engineering',
    departmentId: 'dept-se',
    degreeLevel: 'Undergraduate',
    totalSemesters: 8,
    totalCreditHours: 136,
    feePerSemester: 135000,
  },
  {
    id: 'prog-bba',
    code: 'BBA-H',
    name: 'Bachelor of Business Administration (Hons)',
    departmentId: 'dept-bba',
    degreeLevel: 'Undergraduate',
    totalSemesters: 8,
    totalCreditHours: 130,
    feePerSemester: 120000,
  },
  {
    id: 'prog-msds',
    code: 'MSDS',
    name: 'Master of Science in Data Science',
    departmentId: 'dept-cs',
    degreeLevel: 'Graduate',
    totalSemesters: 4,
    totalCreditHours: 32,
    feePerSemester: 95000,
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-cs101',
    code: 'CS-101',
    title: 'Programming Fundamentals',
    creditHours: 4,
    theoryCredits: 3,
    labCredits: 1,
    departmentId: 'dept-cs',
    prerequisites: [],
  },
  {
    id: 'crs-cs201',
    code: 'CS-201',
    title: 'Data Structures and Algorithms',
    creditHours: 4,
    theoryCredits: 3,
    labCredits: 1,
    departmentId: 'dept-cs',
    prerequisites: ['CS-101'],
  },
  {
    id: 'crs-cs301',
    code: 'CS-301',
    title: 'Database Management Systems',
    creditHours: 4,
    theoryCredits: 3,
    labCredits: 1,
    departmentId: 'dept-cs',
    prerequisites: ['CS-201'],
  },
  {
    id: 'crs-se401',
    code: 'SE-401',
    title: 'Cloud Computing & Enterprise Architecture',
    creditHours: 3,
    theoryCredits: 3,
    labCredits: 0,
    departmentId: 'dept-se',
    prerequisites: ['CS-301'],
  },
];

export const INITIAL_OFFERINGS: CourseOffering[] = [
  {
    id: 'off-cs201-s26',
    courseId: 'crs-cs201',
    courseCode: 'CS-201',
    courseTitle: 'Data Structures and Algorithms',
    creditHours: 4,
    programId: 'prog-bcs',
    campusId: 'camp-main',
    semester: 3,
    academicYear: 'Spring 2026',
    section: 'CS-3A',
    lecturerId: 'emp-005',
    lecturerName: 'Hamza Ali',
    room: 'Lab-402, CS Block',
    timeSlot: 'Mon/Wed 10:00 - 11:30',
    totalEnrolled: 42,
    status: 'Active',
  },
  {
    id: 'off-cs301-s26',
    courseId: 'crs-cs301',
    courseCode: 'CS-301',
    courseTitle: 'Database Management Systems',
    creditHours: 4,
    programId: 'prog-bcs',
    campusId: 'camp-main',
    semester: 4,
    academicYear: 'Spring 2026',
    section: 'CS-4B',
    lecturerId: 'emp-002',
    lecturerName: 'Prof. Dr. Mansoor Alam',
    room: 'Hall-B, Main Academic',
    timeSlot: 'Tue/Thu 11:30 - 13:00',
    totalEnrolled: 48,
    status: 'Active',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-001',
    regNo: 'FA23-BCS-042',
    rollNo: '23-CS-042',
    fullName: 'Zain Ul Abideen',
    email: 'zain.abideen@student.campus.edu',
    phone: '+92 312 9988771',
    programId: 'prog-bcs',
    campusId: 'camp-main',
    departmentId: 'dept-cs',
    currentSemester: 4,
    cgpa: 3.78,
    admissionYear: 'Fall 2023',
    status: 'Enrolled',
    feeStatus: 'Paid',
  },
  {
    id: 'stu-002',
    regNo: 'FA23-BCS-058',
    rollNo: '23-CS-058',
    fullName: 'Mahnoor Fatima',
    email: 'mahnoor.f@student.campus.edu',
    phone: '+92 312 9988772',
    programId: 'prog-bcs',
    campusId: 'camp-main',
    departmentId: 'dept-cs',
    currentSemester: 4,
    cgpa: 3.92,
    admissionYear: 'Fall 2023',
    status: 'Enrolled',
    feeStatus: 'Paid',
  },
  {
    id: 'stu-003',
    regNo: 'SP24-BSE-019',
    rollNo: '24-SE-019',
    fullName: 'Bilal Ahmed Khan',
    email: 'bilal.khan@student.campus.edu',
    phone: '+92 312 9988773',
    programId: 'prog-bse',
    campusId: 'camp-main',
    departmentId: 'dept-se',
    currentSemester: 3,
    cgpa: 3.45,
    admissionYear: 'Spring 2024',
    status: 'Enrolled',
    feeStatus: 'Partial',
  },
];

export const INITIAL_MARKS: MarksEntry[] = [
  {
    id: 'mrk-01',
    offeringId: 'off-cs201-s26',
    studentId: 'stu-001',
    studentName: 'Zain Ul Abideen',
    rollNo: '23-CS-042',
    assignments: 14,
    quizzes: 13,
    midterm: 27,
    finalExam: 36,
    total: 90,
    grade: 'A',
    gpa: 4.0,
    status: 'Approved',
  },
  {
    id: 'mrk-02',
    offeringId: 'off-cs201-s26',
    studentId: 'stu-002',
    studentName: 'Mahnoor Fatima',
    rollNo: '23-CS-058',
    assignments: 15,
    quizzes: 15,
    midterm: 29,
    finalExam: 38,
    total: 97,
    grade: 'A+',
    gpa: 4.0,
    status: 'Approved',
  },
  {
    id: 'mrk-03',
    offeringId: 'off-cs201-s26',
    studentId: 'stu-003',
    studentName: 'Bilal Ahmed Khan',
    rollNo: '24-SE-019',
    assignments: 12,
    quizzes: 11,
    midterm: 22,
    finalExam: 31,
    total: 76,
    grade: 'B+',
    gpa: 3.3,
    status: 'Pending Approval',
  },
];

export const INITIAL_ADMISSIONS: AdmissionSession[] = [
  {
    id: 'adm-fall26',
    sessionCode: 'ADM-FA26',
    title: 'Fall 2026 National University Intake',
    academicYear: '2026-2027',
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    totalSeats: 1500,
    status: 'Open',
  },
];

export const INITIAL_APPLICANTS: Applicant[] = [
  {
    id: 'app-001',
    applicationNo: 'APP-FA26-10492',
    fullName: 'Ahmed Raza',
    fatherName: 'Muhammad Raza',
    email: 'ahmed.raza99@gmail.com',
    phone: '+92 333 4455661',
    cnic: '61101-9876543-1',
    programPreference1: 'BS Computer Science',
    programPreference2: 'BS Software Engineering',
    campusId: 'camp-main',
    matricPercent: 92.4,
    fscPercent: 88.6,
    testScore: 84.0,
    aggregateMerit: 87.2,
    category: 'Open Merit',
    status: 'Merit Listed',
    challanPaid: true,
    appliedDate: '2026-06-12',
  },
  {
    id: 'app-002',
    applicationNo: 'APP-FA26-10493',
    fullName: 'Aiman Shahid',
    fatherName: 'Shahid Mehmood',
    email: 'aiman.shahid@gmail.com',
    phone: '+92 333 4455662',
    cnic: '61101-9876543-2',
    programPreference1: 'BS Software Engineering',
    programPreference2: 'BS Computer Science',
    campusId: 'camp-main',
    matricPercent: 95.0,
    fscPercent: 91.2,
    testScore: 88.5,
    aggregateMerit: 90.8,
    category: 'Open Merit',
    status: 'Offered',
    challanPaid: true,
    appliedDate: '2026-06-14',
  },
  {
    id: 'app-003',
    applicationNo: 'APP-FA26-10494',
    fullName: 'Usman Tariq',
    fatherName: 'Tariq Javed',
    email: 'usman.tariq@yahoo.com',
    phone: '+92 333 4455663',
    cnic: '61101-9876543-3',
    programPreference1: 'BS Computer Science',
    programPreference2: 'BBA (Hons)',
    campusId: 'camp-main',
    matricPercent: 86.0,
    fscPercent: 79.5,
    testScore: 74.0,
    aggregateMerit: 78.4,
    category: 'Open Merit',
    status: 'Verified',
    challanPaid: false,
    appliedDate: '2026-06-20',
  },
];

export const INITIAL_MERIT_LISTS: MeritList[] = [
  {
    id: 'merit-01',
    sessionTitle: 'Fall 2026 Intake',
    programId: 'prog-bcs',
    programName: 'BS Computer Science',
    listNumber: '1st Merit List',
    cutoffMerit: 84.5,
    totalSelected: 120,
    publishedDate: '2026-08-20',
    status: 'Approved',
  },
  {
    id: 'merit-02',
    sessionTitle: 'Fall 2026 Intake',
    programId: 'prog-bse',
    programName: 'BS Software Engineering',
    listNumber: '1st Merit List',
    cutoffMerit: 82.0,
    totalSelected: 110,
    publishedDate: '2026-08-20',
    status: 'Approved',
  },
];

export const INITIAL_CHALLANS: FeeChallan[] = [
  {
    id: 'ch-001',
    challanNo: 'CH-26-08491',
    studentId: 'stu-001',
    studentName: 'Zain Ul Abideen',
    rollNo: '23-CS-042',
    programName: 'BS Computer Science',
    semester: 4,
    campusId: 'camp-main',
    issueDate: '2026-01-10',
    dueDate: '2026-01-25',
    tuitionFee: 115000,
    examFee: 10000,
    libraryFee: 5000,
    labFee: 5000,
    discount: 15000, // Merit scholarship
    totalAmount: 120000,
    paidAmount: 120000,
    status: 'Paid',
    paymentDate: '2026-01-20',
    bankBranch: 'HBL NUST Branch, Islamabad',
  },
  {
    id: 'ch-002',
    challanNo: 'CH-26-08492',
    studentId: 'stu-003',
    studentName: 'Bilal Ahmed Khan',
    rollNo: '24-SE-019',
    programName: 'BS Software Engineering',
    semester: 3,
    campusId: 'camp-main',
    issueDate: '2026-01-10',
    dueDate: '2026-01-25',
    tuitionFee: 115000,
    examFee: 10000,
    libraryFee: 5000,
    labFee: 5000,
    discount: 0,
    totalAmount: 135000,
    paidAmount: 70000,
    status: 'Partial',
    paymentDate: '2026-01-24',
    bankBranch: 'Meezan Bank Blue Area, Islamabad',
  },
];

export const INITIAL_VOUCHERS: JournalVoucher[] = [
  {
    id: 'vch-001',
    voucherNo: 'JV-2026-03-014',
    date: '2026-03-05',
    voucherType: 'CRV',
    description: 'Tuition fee collection for Spring 2026 Semester Batch 23',
    campusId: 'camp-main',
    totalAmount: 2450000,
    status: 'Approved',
    entries: [
      {
        accountCode: '1010-01',
        accountTitle: 'HBL University Collection Account',
        debit: 2450000,
        credit: 0,
      },
      {
        accountCode: '4010-01',
        accountTitle: 'Tuition Fee Revenue (Spring 2026)',
        debit: 0,
        credit: 2450000,
      },
    ],
    createdBy: 'Kamran Ashraf, FCA',
    approvedBy: 'Dr. Zulfiqar Haider',
  },
  {
    id: 'vch-002',
    voucherNo: 'BPV-2026-03-028',
    date: '2026-03-08',
    voucherType: 'BPV',
    description: 'Procurement of High-Performance GPU Workstations for AI Research Lab',
    campusId: 'camp-main',
    totalAmount: 1850000,
    status: 'Pending Approval',
    entries: [
      {
        accountCode: '1520-03',
        accountTitle: 'Capital Equipment - AI Research Hardware',
        debit: 1850000,
        credit: 0,
      },
      {
        accountCode: '1010-02',
        accountTitle: 'Meezan University Operating Account',
        debit: 0,
        credit: 1850000,
      },
    ],
    createdBy: 'Kamran Ashraf, FCA',
  },
];

export const INITIAL_PAYROLL: PayrollRecord[] = [
  {
    id: 'pr-2026-02-01',
    payrollMonth: 'February 2026',
    employeeId: 'emp-001',
    employeeName: 'Dr. Zulfiqar Haider',
    designation: 'Vice Chancellor & Rector',
    departmentName: 'Computer Science',
    campusId: 'camp-main',
    basicSalary: 320000,
    medicalAllowance: 45000,
    houseRentAllowance: 85000,
    overtimePay: 0,
    taxDeduction: 55000,
    providentFund: 25000,
    grossSalary: 450000,
    netSalary: 370000,
    presentDays: 22,
    leavesTaken: 0,
    status: 'Approved',
    paymentMethod: 'Bank Transfer',
    disbursementDate: '2026-02-28',
  },
  {
    id: 'pr-2026-02-02',
    payrollMonth: 'February 2026',
    employeeId: 'emp-002',
    employeeName: 'Prof. Dr. Mansoor Alam',
    designation: 'Dean of Computing / Professor',
    departmentName: 'Computer Science',
    campusId: 'camp-main',
    basicSalary: 270000,
    medicalAllowance: 40000,
    houseRentAllowance: 70000,
    overtimePay: 0,
    taxDeduction: 42000,
    providentFund: 20000,
    grossSalary: 380000,
    netSalary: 318000,
    presentDays: 21,
    leavesTaken: 1,
    status: 'Approved',
    paymentMethod: 'Bank Transfer',
    disbursementDate: '2026-02-28',
  },
  {
    id: 'pr-2026-02-03',
    payrollMonth: 'February 2026',
    employeeId: 'emp-005',
    employeeName: 'Hamza Ali',
    designation: 'Senior Lecturer',
    departmentName: 'Computer Science',
    campusId: 'camp-main',
    basicSalary: 110000,
    medicalAllowance: 15000,
    houseRentAllowance: 30000,
    overtimePay: 8000,
    taxDeduction: 9500,
    providentFund: 10000,
    grossSalary: 163000,
    netSalary: 143500,
    presentDays: 22,
    leavesTaken: 0,
    status: 'Approved',
    paymentMethod: 'Bank Transfer',
    disbursementDate: '2026-02-28',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-01',
    itemCode: 'IT-DEV-001',
    name: 'Dell Precision 3660 AI Workstation (Core i9, 64GB, RTX 4090)',
    category: 'IT Equipment',
    uom: 'Units',
    unitCost: 750000,
    currentStock: 12,
    reorderLevel: 5,
    campusId: 'camp-main',
    storeLocation: 'Central Store Rack A-12',
    vendorName: 'Megatech Technologies Ltd.',
  },
  {
    id: 'inv-02',
    itemCode: 'LAB-OSC-014',
    name: 'Tektronix 4-Channel Digital Storage Oscilloscope 100MHz',
    category: 'Lab Supplies',
    uom: 'Units',
    unitCost: 195000,
    currentStock: 8,
    reorderLevel: 3,
    campusId: 'camp-main',
    storeLocation: 'EE Lab Storage Room 102',
    vendorName: 'Scientia Scientific Instruments',
  },
  {
    id: 'inv-03',
    itemCode: 'STN-PPR-A4',
    name: 'Double A Grade Laser Printing Paper A4 (Box of 5 Reams)',
    category: 'Stationery',
    uom: 'Boxes',
    unitCost: 6500,
    currentStock: 45,
    reorderLevel: 20,
    campusId: 'camp-main',
    storeLocation: 'Admin Basement Warehouse',
    vendorName: 'Premier Paper Mills',
  },
];

export const INITIAL_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: 'pr-req-001',
    reqNo: 'REQ-2026-081',
    requestedBy: 'Prof. Dr. Mansoor Alam',
    departmentId: 'dept-cs',
    campusId: 'camp-main',
    items: [
      {
        itemId: 'inv-01',
        itemName: 'Dell Precision 3660 AI Workstation (Core i9, 64GB, RTX 4090)',
        quantity: 4,
        estimatedCost: 3000000,
      },
    ],
    totalEstimatedCost: 3000000,
    justification: 'Required for newly funded National AI Research Grant on LLM Fine-tuning.',
    status: 'Pending Approval',
    requestDate: '2026-03-02',
    approvalHistory: [
      {
        action: 'Submitted',
        actorName: 'Prof. Dr. Mansoor Alam',
        actorRole: 'Faculty Dean',
        timestamp: '2026-03-02 11:30 AM',
      },
    ],
  },
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-01',
    entityType: 'Leave',
    entityId: 'leave-101',
    referenceNo: 'LV-2026-001',
    title: 'Annual Leave Application - Hamza Ali (4 days)',
    submittedBy: 'Hamza Ali (Lecturer)',
    departmentName: 'Computer Science',
    campusId: 'camp-main',
    status: 'Pending Approval',
    submittedAt: '2026-03-01 10:14 AM',
    history: [
      {
        action: 'Submitted',
        actorName: 'Hamza Ali',
        actorRole: 'Lecturer',
        timestamp: '2026-03-01 10:14 AM',
        remarks: 'Conference participation in Dubai.',
      },
    ],
  },
  {
    id: 'appr-02',
    entityType: 'Requisition',
    entityId: 'pr-req-001',
    referenceNo: 'REQ-2026-081',
    title: 'AI Lab GPU Workstations Requisition (PKR 3,000,000)',
    submittedBy: 'Prof. Dr. Mansoor Alam (Dean)',
    departmentName: 'Computer Science',
    campusId: 'camp-main',
    status: 'Pending Approval',
    submittedAt: '2026-03-02 11:30 AM',
    history: [
      {
        action: 'Submitted',
        actorName: 'Prof. Dr. Mansoor Alam',
        actorRole: 'Faculty Dean',
        timestamp: '2026-03-02 11:30 AM',
      },
    ],
  },
  {
    id: 'appr-03',
    entityType: 'Voucher',
    entityId: 'vch-002',
    referenceNo: 'BPV-2026-03-028',
    title: 'Bank Payment Voucher - AI Research Lab Hardware (PKR 1,850,000)',
    submittedBy: 'Kamran Ashraf (CFO)',
    departmentName: 'Management Sciences',
    campusId: 'camp-main',
    status: 'Pending Approval',
    submittedAt: '2026-03-08 14:00 PM',
    history: [
      {
        action: 'Submitted',
        actorName: 'Kamran Ashraf, FCA',
        actorRole: 'Finance Manager',
        timestamp: '2026-03-08 14:00 PM',
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-001',
    timestamp: '2026-03-10 08:30:14',
    userId: 'usr-admin',
    userName: 'Dr. Zulfiqar Haider',
    userRole: 'Super Admin',
    module: 'rbac',
    action: 'login',
    resource: 'System Authentication',
    ipAddress: '192.168.10.42',
    details: 'Authenticated via Campus Single Sign-On (SSO)',
  },
  {
    id: 'aud-002',
    timestamp: '2026-03-10 09:15:22',
    userId: 'usr-dean',
    userName: 'Prof. Dr. Mansoor Alam',
    userRole: 'Faculty Dean',
    module: 'academics',
    action: 'approve',
    resource: 'Midterm Marks Award Sheet CS-201',
    ipAddress: '192.168.10.68',
    details: 'Approved midterm results for section CS-3A (42 students)',
  },
  {
    id: 'aud-003',
    timestamp: '2026-03-10 09:44:05',
    userId: 'usr-hr',
    userName: 'Sarah Jenkins',
    userRole: 'HR Manager',
    module: 'hrms',
    action: 'create',
    resource: 'Employee Registration',
    ipAddress: '192.168.10.19',
    details: 'Onboarded Visiting Faculty Dr. Tariq Niaz (Department of EE)',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-01',
    title: 'New Leave Request Awaiting Approval',
    message: 'Hamza Ali (Lecturer, CS) submitted an Annual Leave application for 4 days.',
    module: 'hrms',
    timestamp: '15 mins ago',
    read: false,
    type: 'warning',
    actionUrl: '/hrms',
  },
  {
    id: 'notif-02',
    title: 'Merit List Approved for Fall 2026 Intake',
    message: '1st Merit List for BS Computer Science (120 seats) has been published.',
    module: 'admissions',
    timestamp: '1 hour ago',
    read: false,
    type: 'success',
    actionUrl: '/admissions',
  },
  {
    id: 'notif-03',
    title: 'Payment Voucher Pending Authorization',
    message: 'Voucher BPV-2026-03-028 for PKR 1,850,000 requires Rector sanction.',
    module: 'finance',
    timestamp: '2 hours ago',
    read: false,
    type: 'info',
    actionUrl: '/finance',
  },
];

export interface ERPDatabaseState {
  campuses: Campus[];
  departments: Department[];
  roles: Role[];
  users: User[];
  employees: Employee[];
  leaves: LeaveApplication[];
  shifts: Shift[];
  attendance: AttendanceRecord[];
  programs: Program[];
  courses: Course[];
  offerings: CourseOffering[];
  students: Student[];
  marks: MarksEntry[];
  admissionSessions: AdmissionSession[];
  applicants: Applicant[];
  meritLists: MeritList[];
  feeChallans: FeeChallan[];
  vouchers: JournalVoucher[];
  payroll: PayrollRecord[];
  inventory: InventoryItem[];
  requisitions: PurchaseRequisition[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLogEntry[];
  notifications: NotificationItem[];
}

export class ERPDatabase {
  private static instance: ERPDatabase;
  private state: ERPDatabaseState;

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): ERPDatabase {
    if (!ERPDatabase.instance) {
      ERPDatabase.instance = new ERPDatabase();
    }
    return ERPDatabase.instance;
  }

  private loadState(): ERPDatabaseState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ERPDatabaseState = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u) => ({
            ...u,
            password: u.password || (u.username.includes('admin') ? 'admin123' : `${u.username.split('.')[0]}123`),
          }));
        }
        return parsed;
      }
    } catch {
      // Fallback if localStorage corrupt or restricted
    }
    return this.getInitialState();
  }

  public saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('Failed to save ERP state to localStorage:', err);
    }
  }

  public resetToFactoryDefaults(): void {
    this.state = this.getInitialState();
    this.saveState();
  }

  private getInitialState(): ERPDatabaseState {
    return {
      campuses: INITIAL_CAMPUSES,
      departments: INITIAL_DEPARTMENTS,
      roles: INITIAL_ROLES,
      users: INITIAL_USERS,
      employees: INITIAL_EMPLOYEES,
      leaves: INITIAL_LEAVES,
      shifts: INITIAL_SHIFTS,
      attendance: INITIAL_ATTENDANCE,
      programs: INITIAL_PROGRAMS,
      courses: INITIAL_COURSES,
      offerings: INITIAL_OFFERINGS,
      students: INITIAL_STUDENTS,
      marks: INITIAL_MARKS,
      admissionSessions: INITIAL_ADMISSIONS,
      applicants: INITIAL_APPLICANTS,
      meritLists: INITIAL_MERIT_LISTS,
      feeChallans: INITIAL_CHALLANS,
      vouchers: INITIAL_VOUCHERS,
      payroll: INITIAL_PAYROLL,
      inventory: INITIAL_INVENTORY,
      requisitions: INITIAL_REQUISITIONS,
      approvals: INITIAL_APPROVALS,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
    };
  }

  public getState(): ERPDatabaseState {
    return this.state;
  }

  // Generic collection operations
  public getCollection<K extends keyof ERPDatabaseState>(key: K): ERPDatabaseState[K] {
    return this.state[key];
  }

  public updateCollection<K extends keyof ERPDatabaseState>(key: K, data: ERPDatabaseState[K]): void {
    this.state[key] = data;
    this.saveState();
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    this.state.auditLogs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.state.auditLogs.length > 500) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 500);
    }
    this.saveState();
  }

  public addNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
  }
}

export const db = ERPDatabase.getInstance();
