/**
 * Enterprise Campus Management System (Campus ERP)
 * Core Domain TypeScript Type Definitions
 */

export type ActionType = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'submit' 
  | 'revert' 
  | 'export' 
  | 'print';

export type ERPModule = 
  | 'dashboard'
  | 'rbac'
  | 'hrms'
  | 'tms'
  | 'academics'
  | 'admissions'
  | 'finance'
  | 'payroll'
  | 'inventory'
  | 'reports'
  | 'audit';

export type UserRoleName =
  | 'Super Admin'
  | 'System Administrator'
  | 'Campus Administrator'
  | 'HR Manager'
  | 'HR Officer'
  | 'Faculty Dean'
  | 'HOD'
  | 'Lecturer'
  | 'Admission Officer'
  | 'Finance Manager'
  | 'Finance Officer'
  | 'Payroll Officer'
  | 'Inventory Manager'
  | 'Store Keeper'
  | 'Employee'
  | 'Student';

export type WorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Reverted'
  | 'Cancelled'
  | 'Finalized';

export interface Campus {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  deanId?: string;
  totalStudents: number;
  totalEmployees: number;
}

export interface Department {
  id: string;
  campusId: string;
  code: string;
  name: string;
  facultyName: string;
  headOfDept: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface Permission {
  id: string;
  module: ERPModule;
  resource: string;
  actions: ActionType[];
}

export interface Role {
  id: string;
  name: UserRoleName;
  description: string;
  isSystemRole: boolean;
  permissions: Record<ERPModule, ActionType[]>;
  userCount: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  primaryRole: UserRoleName;
  assignedRoles: UserRoleName[];
  campusId: string;
  departmentId?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin?: string;
  employeeId?: string;
  studentId?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
  campusId?: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  cnic?: string;
  password: string;
  confirmPassword?: string;
  role: 'Student' | 'Employee' | 'Lecturer' | 'Admission Officer' | 'HR Officer';
  campusId: string;
  departmentId?: string;
  programId?: string;
  registrationNumber?: string;
}

export interface UserProfileUpdateData {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  campusId?: string;
  departmentId?: string;
}

export interface PasswordResetRequest {
  emailOrUsername: string;
  newPassword?: string;
  resetCode?: string;
}


// ----------------- HRMS -----------------
export interface Employee {
  id: string;
  empNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  cnic: string;
  designation: string;
  departmentId: string;
  campusId: string;
  reportingTo?: string;
  employmentType: 'Permanent' | 'Contract' | 'Visiting' | 'Probationary';
  joinDate: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  education: string;
  experienceYears: number;
}

export interface LeaveBalance {
  employeeId: string;
  annual: { total: number; used: number };
  casual: { total: number; used: number };
  sick: { total: number; used: number };
  maternity?: { total: number; used: number };
}

export interface LeaveApplication {
  id: string;
  leaveNo: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  campusId: string;
  leaveType: 'Annual' | 'Casual' | 'Sick' | 'Official Duty';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: WorkflowStatus;
  appliedDate: string;
  approverRemarks?: string;
  approvedBy?: string;
  approvalHistory: ApprovalHistoryItem[];
}

// ----------------- TMS (Time Management) -----------------
export interface Shift {
  id: string;
  code: string;
  name: string;
  startTime: string; // "08:30"
  endTime: string;   // "16:30"
  graceMinutes: number;
  halfDayThresholdHours: number;
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  campusId: string;
  shiftId: string;
  checkIn?: string;
  checkOut?: string;
  workHours: number;
  lateMinutes: number;
  overtimeMinutes: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Official Duty';
  source: 'Biometric' | 'Web Portal' | 'Manual Adjustment';
  adjustmentStatus?: WorkflowStatus;
}

// ----------------- Academics -----------------
export interface Program {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  degreeLevel: 'Undergraduate' | 'Graduate' | 'Postgraduate' | 'Doctoral';
  totalSemesters: number;
  totalCreditHours: number;
  feePerSemester: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  theoryCredits: number;
  labCredits: number;
  departmentId: string;
  prerequisites: string[];
}

export interface CourseOffering {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  programId: string;
  campusId: string;
  semester: number;
  academicYear: string;
  section: string;
  lecturerId: string;
  lecturerName: string;
  room: string;
  timeSlot: string;
  totalEnrolled: number;
  status: 'Active' | 'Completed' | 'Graded';
}

export interface Student {
  id: string;
  regNo: string;
  rollNo: string;
  fullName: string;
  email: string;
  phone: string;
  programId: string;
  campusId: string;
  departmentId: string;
  currentSemester: number;
  cgpa: number;
  admissionYear: string;
  status: 'Enrolled' | 'Graduated' | 'Suspended' | 'Probation';
  feeStatus: 'Paid' | 'Partial' | 'Pending';
}

export interface MarksEntry {
  id: string;
  offeringId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  assignments: number; // Max 15
  quizzes: number;     // Max 15
  midterm: number;     // Max 30
  finalExam: number;   // Max 40
  total: number;       // Max 100
  grade: string;
  gpa: number;
  status: WorkflowStatus;
}

// ----------------- Admissions -----------------
export interface AdmissionSession {
  id: string;
  sessionCode: string;
  title: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  status: 'Open' | 'Closed' | 'Merit Published' | 'Completed';
}

export interface Applicant {
  id: string;
  applicationNo: string;
  fullName: string;
  fatherName: string;
  email: string;
  phone: string;
  cnic: string;
  programPreference1: string;
  programPreference2: string;
  campusId: string;
  matricPercent: number;
  fscPercent: number;
  testScore: number;
  aggregateMerit: number;
  category: 'Open Merit' | 'Quota' | 'Overseas' | 'Sports';
  status: 'Submitted' | 'Verified' | 'Merit Listed' | 'Offered' | 'Enrolled' | 'Rejected';
  challanPaid: boolean;
  appliedDate: string;
}

export interface MeritList {
  id: string;
  sessionTitle: string;
  programId: string;
  programName: string;
  listNumber: '1st Merit List' | '2nd Merit List' | '3rd Merit List';
  cutoffMerit: number;
  totalSelected: number;
  publishedDate: string;
  status: WorkflowStatus;
}

// ----------------- Finance -----------------
export interface FeeChallan {
  id: string;
  challanNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  programName: string;
  semester: number;
  campusId: string;
  issueDate: string;
  dueDate: string;
  tuitionFee: number;
  examFee: number;
  libraryFee: number;
  labFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Paid' | 'Partial' | 'Overdue';
  paymentDate?: string;
  bankBranch?: string;
}

export interface JournalVoucher {
  id: string;
  voucherNo: string;
  date: string;
  voucherType: 'JV' | 'CPV' | 'CRV' | 'BPV' | 'BRV';
  description: string;
  campusId: string;
  totalAmount: number;
  status: WorkflowStatus;
  entries: {
    accountCode: string;
    accountTitle: string;
    debit: number;
    credit: number;
  }[];
  createdBy: string;
  approvedBy?: string;
}

// ----------------- Payroll -----------------
export interface PayrollRecord {
  id: string;
  payrollMonth: string; // e.g. "March 2026"
  employeeId: string;
  employeeName: string;
  designation: string;
  departmentName: string;
  campusId: string;
  basicSalary: number;
  medicalAllowance: number;
  houseRentAllowance: number;
  overtimePay: number;
  taxDeduction: number;
  providentFund: number;
  grossSalary: number;
  netSalary: number;
  presentDays: number;
  leavesTaken: number;
  status: WorkflowStatus;
  paymentMethod: 'Bank Transfer' | 'Cheque';
  disbursementDate?: string;
}

// ----------------- Inventory -----------------
export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'IT Equipment' | 'Lab Supplies' | 'Stationery' | 'Furniture' | 'Electrical';
  uom: 'Units' | 'Boxes' | 'Packs' | 'Meters' | 'Sets';
  unitCost: number;
  currentStock: number;
  reorderLevel: number;
  campusId: string;
  storeLocation: string;
  vendorName: string;
}

export interface PurchaseRequisition {
  id: string;
  reqNo: string;
  requestedBy: string;
  departmentId: string;
  campusId: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
  justification: string;
  status: WorkflowStatus;
  requestDate: string;
  approvedBy?: string;
  approvalHistory: ApprovalHistoryItem[];
}

// ----------------- Common Workflow & Audit -----------------
export interface ApprovalHistoryItem {
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Reverted';
  actorName: string;
  actorRole: UserRoleName;
  timestamp: string;
  remarks?: string;
}

export interface ApprovalRequest {
  id: string;
  entityType: 'Leave' | 'Marks' | 'Requisition' | 'MeritList' | 'Payroll' | 'Voucher';
  entityId: string;
  referenceNo: string;
  title: string;
  submittedBy: string;
  departmentName: string;
  campusId: string;
  status: WorkflowStatus;
  submittedAt: string;
  history: ApprovalHistoryItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRoleName;
  module: ERPModule;
  action: ActionType | 'login' | 'logout' | 'workflow';
  resource: string;
  ipAddress: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  module: ERPModule;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  type: 'info' | 'warning' | 'success' | 'alert';
}
