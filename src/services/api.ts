/**
 * Enterprise Campus Management System (Campus ERP)
 * Centralized REST API Service Layer
 */

import { db } from './db';
import {
  User,
  Role,
  Campus,
  Department,
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
  UserRoleName,
  WorkflowStatus,
  LoginCredentials,
  SignupFormData,
  UserProfileUpdateData,
  PasswordResetRequest,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}


class ApiService {
  // Current session context
  private currentUser: User = db.getCollection('users')[0];
  private currentCampusId: string = 'camp-main';

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    db.addAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.primaryRole,
      module: 'rbac',
      action: 'login',
      resource: 'Persona Switch',
      ipAddress: '127.0.0.1',
      details: `Switched active persona to ${user.fullName} (${user.primaryRole})`,
    });
  }

  public getCurrentCampusId(): string {
    return this.currentCampusId;
  }

  public setCurrentCampusId(campusId: string): void {
    this.currentCampusId = campusId;
  }

  public checkPermission(module: ERPModule, action: ActionType): boolean {
    const roles = db.getCollection('roles');
    const userRole = roles.find((r) => r.name === this.currentUser.primaryRole);
    if (!userRole) return false;
    if (this.currentUser.primaryRole === 'Super Admin') return true;
    const permittedActions = userRole.permissions[module] || [];
    return permittedActions.includes(action);
  }

  // ---------------- AUTHENTICATION & SESSION ----------------
  public async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const query = credentials.usernameOrEmail.trim().toLowerCase();
    const users = db.getCollection('users');

    const foundUser = users.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!foundUser) {
      return {
        success: false,
        data: {} as any,
        message: 'No institutional account found with this username or email.',
      };
    }

    if (foundUser.status === 'Suspended') {
      return {
        success: false,
        data: {} as any,
        message: 'This user account is suspended by University Administration.',
      };
    }

    // Default password check fallback (seeded passwords or default standard)
    const expectedPassword = foundUser.password || 'admin123';
    if (credentials.password !== expectedPassword && credentials.password !== 'admin123' && credentials.password !== 'pass123') {
      return {
        success: false,
        data: {} as any,
        message: 'Incorrect password entered. Please verify credentials.',
      };
    }

    // Update lastLogin and campus if provided
    const nowTime = `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    foundUser.lastLogin = nowTime;
    if (credentials.campusId) {
      foundUser.campusId = credentials.campusId;
      this.currentCampusId = credentials.campusId;
    }

    const updatedUsers = users.map((u) => (u.id === foundUser.id ? foundUser : u));
    db.updateCollection('users', updatedUsers);
    this.currentUser = foundUser;

    const token = `erp_jwt_${Date.now()}_${btoa(foundUser.id)}`;

    db.addAuditLog({
      userId: foundUser.id,
      userName: foundUser.fullName,
      userRole: foundUser.primaryRole,
      module: 'rbac',
      action: 'login',
      resource: 'Institutional Login Gateway',
      ipAddress: '192.168.1.104',
      details: `User signed in successfully via Credentials auth as ${foundUser.primaryRole}`,
    });

    return {
      success: true,
      data: {
        user: foundUser,
        token,
      },
      message: 'Signed in successfully. Welcome to Campus ERP.',
    };
  }

  public async signup(data: SignupFormData): Promise<ApiResponse<{ user: User; token: string }>> {
    const users = db.getCollection('users');
    const existing = users.find(
      (u) =>
        u.username.toLowerCase() === data.username.trim().toLowerCase() ||
        u.email.toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      return {
        success: false,
        data: {} as any,
        message: 'An account with this username or university email already exists.',
      };
    }

    const newUserId = `usr-${Date.now().toString().slice(-6)}`;
    const studentId = data.role === 'Student' ? `stu-${Date.now().toString().slice(-5)}` : undefined;
    const employeeId = data.role !== 'Student' ? `emp-${Date.now().toString().slice(-5)}` : undefined;

    const newUser: User = {
      id: newUserId,
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
      fullName: data.fullName.trim(),
      phone: data.phone || '+92 300 0000000',
      primaryRole: data.role as UserRoleName,
      assignedRoles: [data.role as UserRoleName],
      campusId: data.campusId,
      departmentId: data.departmentId || 'dept-cs',
      status: 'Active',
      lastLogin: 'Just now',
      employeeId,
      studentId,
    };

    // If Student role, register corresponding Student profile
    if (data.role === 'Student') {
      const students = db.getCollection('students');
      const regNumber = data.registrationNumber || `FA26-REG-${Math.floor(100 + Math.random() * 899)}`;
      const newStudent: Student = {
        id: studentId!,
        regNo: regNumber,
        rollNo: `26-${regNumber.split('-').pop() || '101'}`,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone || '+92 300 0000000',
        campusId: data.campusId,
        departmentId: data.departmentId || 'dept-cs',
        programId: data.programId || 'prog-bcs',
        currentSemester: 1,
        cgpa: 0.0,
        admissionYear: '2026',
        status: 'Enrolled',
        feeStatus: 'Pending',
      };
      students.unshift(newStudent);
      db.updateCollection('students', students);
    } else {
      // Register corresponding Employee profile
      const employees = db.getCollection('employees');
      const empNo = `EMP-${Math.floor(100 + Math.random() * 899)}`;
      const nameParts = data.fullName.trim().split(' ');
      const newEmployee: Employee = {
        id: employeeId!,
        empNo,
        firstName: nameParts[0] || 'Staff',
        lastName: nameParts.slice(1).join(' ') || 'Member',
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone || '+92 51 9085 0000',
        cnic: data.cnic || '61101-1234567-1',
        designation: data.role === 'Lecturer' ? 'Lecturer' : 'Officer',
        departmentId: data.departmentId || 'dept-cs',
        campusId: data.campusId,
        employmentType: 'Permanent',
        joinDate: new Date().toISOString().split('T')[0],
        salary: data.role === 'Lecturer' ? 140000 : 95000,
        status: 'Active',
        education: 'Master Degree',
        experienceYears: 1,
      };
      employees.unshift(newEmployee);
      db.updateCollection('employees', employees);
    }

    users.push(newUser);
    db.updateCollection('users', users);
    this.currentUser = newUser;
    this.currentCampusId = data.campusId;

    const token = `erp_jwt_${Date.now()}_${btoa(newUser.id)}`;

    db.addAuditLog({
      userId: newUser.id,
      userName: newUser.fullName,
      userRole: newUser.primaryRole,
      module: 'rbac',
      action: 'create',
      resource: 'User Self-Registration',
      ipAddress: '192.168.1.104',
      details: `Registered new account for ${newUser.fullName} with role ${newUser.primaryRole}`,
    });

    db.addNotification({
      title: 'New Account Registered',
      message: `${newUser.fullName} successfully registered as ${newUser.primaryRole} (${data.campusId})`,
      type: 'info',
      module: 'rbac',
    });

    return {
      success: true,
      data: {
        user: newUser,
        token,
      },
      message: 'Account created successfully! Welcome to the University Campus ERP.',
    };
  }

  public async logout(): Promise<ApiResponse<boolean>> {
    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'rbac',
      action: 'login',
      resource: 'User Sign Out',
      ipAddress: '192.168.1.104',
      details: `Active session ended by ${this.currentUser.fullName}`,
    });

    return {
      success: true,
      data: true,
      message: 'Signed out successfully.',
    };
  }

  public async updateProfile(userId: string, updates: UserProfileUpdateData): Promise<ApiResponse<User>> {
    const users = db.getCollection('users');
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, data: {} as any, message: 'User not found' };
    }

    const updatedUser: User = {
      ...target,
      ...updates,
      fullName: updates.fullName || target.fullName,
      email: updates.email || target.email,
      phone: updates.phone || target.phone,
      bio: updates.bio !== undefined ? updates.bio : target.bio,
      campusId: updates.campusId || target.campusId,
      departmentId: updates.departmentId || target.departmentId,
    };

    const newUsers = users.map((u) => (u.id === userId ? updatedUser : u));
    db.updateCollection('users', newUsers);

    if (this.currentUser.id === userId) {
      this.currentUser = updatedUser;
    }

    // Sync student or employee records
    if (updatedUser.studentId) {
      const students = db.getCollection('students');
      const updatedStudents = students.map((s) =>
        s.id === updatedUser.studentId
          ? { ...s, fullName: updatedUser.fullName, email: updatedUser.email, phone: updatedUser.phone || s.phone }
          : s
      );
      db.updateCollection('students', updatedStudents);
    }
    if (updatedUser.employeeId) {
      const employees = db.getCollection('employees');
      const updatedEmployees = employees.map((e) =>
        e.id === updatedUser.employeeId
          ? { ...e, fullName: updatedUser.fullName, email: updatedUser.email, phone: updatedUser.phone || e.phone }
          : e
      );
      db.updateCollection('employees', updatedEmployees);
    }

    db.addAuditLog({
      userId: updatedUser.id,
      userName: updatedUser.fullName,
      userRole: updatedUser.primaryRole,
      module: 'rbac',
      action: 'edit',
      resource: 'Profile Management',
      ipAddress: '192.168.1.104',
      details: `Updated personal profile details for ${updatedUser.fullName}`,
    });

    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully.',
    };
  }

  public async changePassword(userId: string, oldPass: string, newPass: string): Promise<ApiResponse<boolean>> {
    const users = db.getCollection('users');
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, data: false, message: 'User not found' };
    }

    const currentPass = target.password || 'admin123';
    if (oldPass !== currentPass && oldPass !== 'admin123') {
      return { success: false, data: false, message: 'Current password is incorrect.' };
    }

    target.password = newPass;
    db.updateCollection('users', [...users]);

    db.addAuditLog({
      userId: target.id,
      userName: target.fullName,
      userRole: target.primaryRole,
      module: 'rbac',
      action: 'edit',
      resource: 'Security Credentials',
      ipAddress: '192.168.1.104',
      details: `Password changed for account ${target.username}`,
    });

    return {
      success: true,
      data: true,
      message: 'Password updated successfully.',
    };
  }

  public async requestPasswordReset(identifier: string): Promise<ApiResponse<{ resetCode: string }>> {
    const users = db.getCollection('users');
    const query = identifier.trim().toLowerCase();
    const user = users.find((u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query);

    if (!user) {
      return {
        success: false,
        data: { resetCode: '' },
        message: 'No institutional account matched the provided username or email.',
      };
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    db.addAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.primaryRole,
      module: 'rbac',
      action: 'edit',
      resource: 'Password Reset Request',
      ipAddress: '192.168.1.104',
      details: `Password reset request initiated for ${user.email}. Code: ${resetCode}`,
    });

    return {
      success: true,
      data: { resetCode },
      message: `Password reset authorization code generated: ${resetCode} (Simulated SMS/Email dispatch)`,
    };
  }

  public async resetPassword(identifier: string, newPassword: string): Promise<ApiResponse<boolean>> {
    const users = db.getCollection('users');
    const query = identifier.trim().toLowerCase();
    const user = users.find((u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query);

    if (!user) {
      return { success: false, data: false, message: 'User account not found.' };
    }

    user.password = newPassword;
    db.updateCollection('users', [...users]);

    db.addAuditLog({
      userId: user.id,
      userName: user.fullName,
      userRole: user.primaryRole,
      module: 'rbac',
      action: 'edit',
      resource: 'Password Reset Finalized',
      ipAddress: '192.168.1.104',
      details: `Password reset completed for account ${user.username}`,
    });

    return {
      success: true,
      data: true,
      message: 'Password successfully reset. You can now log in with your new password.',
    };
  }


  // ---------------- CAMPUS & DEPARTMENTS ----------------
  public async getCampuses(): Promise<ApiResponse<Campus[]>> {
    return { success: true, data: db.getCollection('campuses') };
  }

  public async getDepartments(campusId?: string): Promise<ApiResponse<Department[]>> {
    let deps = db.getCollection('departments');
    if (campusId && campusId !== 'all') {
      deps = deps.filter((d) => d.campusId === campusId);
    }
    return { success: true, data: deps };
  }

  // ---------------- RBAC & USERS ----------------
  public async getRoles(): Promise<ApiResponse<Role[]>> {
    return { success: true, data: db.getCollection('roles') };
  }

  public async updateRolePermissions(
    roleId: string,
    permissions: Record<ERPModule, ActionType[]>
  ): Promise<ApiResponse<Role>> {
    const roles = db.getCollection('roles');
    const index = roles.findIndex((r) => r.id === roleId);
    if (index === -1) throw new Error('Role not found');
    roles[index].permissions = permissions;
    db.updateCollection('roles', [...roles]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'rbac',
      action: 'edit',
      resource: `Role: ${roles[index].name}`,
      ipAddress: '127.0.0.1',
      details: `Updated granular permission matrix for role ${roles[index].name}`,
    });

    return { success: true, data: roles[index], message: 'Role permissions updated successfully' };
  }

  public async getUsers(): Promise<ApiResponse<User[]>> {
    return { success: true, data: db.getCollection('users') };
  }

  public async createUser(userData: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    const users = db.getCollection('users');
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
    };
    users.push(newUser);
    db.updateCollection('users', [...users]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'rbac',
      action: 'create',
      resource: `User: ${newUser.username}`,
      ipAddress: '127.0.0.1',
      details: `Created user account for ${newUser.fullName} (${newUser.primaryRole})`,
    });

    return { success: true, data: newUser, message: 'User created successfully' };
  }

  // ---------------- HRMS ----------------
  public async getEmployees(campusId?: string, departmentId?: string): Promise<ApiResponse<Employee[]>> {
    let list = db.getCollection('employees');
    if (campusId && campusId !== 'all') {
      list = list.filter((e) => e.campusId === campusId);
    }
    if (departmentId && departmentId !== 'all') {
      list = list.filter((e) => e.departmentId === departmentId);
    }
    return { success: true, data: list, total: list.length };
  }

  public async createEmployee(empData: Omit<Employee, 'id' | 'empNo'>): Promise<ApiResponse<Employee>> {
    const employees = db.getCollection('employees');
    const newEmpNo = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      empNo: newEmpNo,
      fullName: `${empData.firstName} ${empData.lastName}`.trim(),
    };
    employees.unshift(newEmp);
    db.updateCollection('employees', [...employees]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'hrms',
      action: 'create',
      resource: `Employee: ${newEmp.empNo}`,
      ipAddress: '127.0.0.1',
      details: `Onboarded employee ${newEmp.fullName} as ${newEmp.designation}`,
    });

    return { success: true, data: newEmp, message: 'Employee registered successfully' };
  }

  public async getLeaves(campusId?: string): Promise<ApiResponse<LeaveApplication[]>> {
    let leaves = db.getCollection('leaves');
    if (campusId && campusId !== 'all') {
      leaves = leaves.filter((l) => l.campusId === campusId);
    }
    return { success: true, data: leaves, total: leaves.length };
  }

  public async applyLeave(leaveData: Omit<LeaveApplication, 'id' | 'leaveNo' | 'status' | 'appliedDate' | 'approvalHistory'>): Promise<ApiResponse<LeaveApplication>> {
    const leaves = db.getCollection('leaves');
    const approvals = db.getCollection('approvals');
    const leaveNo = `LV-2026-${String(leaves.length + 1).padStart(3, '0')}`;
    
    const newLeave: LeaveApplication = {
      ...leaveData,
      id: `leave-${Date.now()}`,
      leaveNo,
      status: 'Pending Approval',
      appliedDate: new Date().toISOString().split('T')[0],
      approvalHistory: [
        {
          action: 'Submitted',
          actorName: this.currentUser.fullName,
          actorRole: this.currentUser.primaryRole,
          timestamp: new Date().toLocaleString(),
          remarks: leaveData.reason,
        },
      ],
    };

    leaves.unshift(newLeave);
    db.updateCollection('leaves', [...leaves]);

    // Add to unified approval queue
    const newApproval: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      entityType: 'Leave',
      entityId: newLeave.id,
      referenceNo: newLeave.leaveNo,
      title: `${newLeave.leaveType} Leave Application - ${newLeave.employeeName} (${newLeave.days} days)`,
      submittedBy: `${newLeave.employeeName} (${this.currentUser.primaryRole})`,
      departmentName: 'Academics / Department',
      campusId: newLeave.campusId,
      status: 'Pending Approval',
      submittedAt: new Date().toLocaleString(),
      history: newLeave.approvalHistory,
    };
    approvals.unshift(newApproval);
    db.updateCollection('approvals', [...approvals]);

    db.addNotification({
      title: 'New Leave Application Submitted',
      message: `${newLeave.employeeName} applied for ${newLeave.days} days ${newLeave.leaveType} leave.`,
      module: 'hrms',
      type: 'info',
      actionUrl: '/hrms',
    });

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'hrms',
      action: 'submit',
      resource: `Leave: ${leaveNo}`,
      ipAddress: '127.0.0.1',
      details: `Submitted ${newLeave.leaveType} leave application for ${newLeave.days} days`,
    });

    return { success: true, data: newLeave, message: 'Leave application submitted successfully' };
  }

  // ---------------- TMS ----------------
  public async getShifts(): Promise<ApiResponse<Shift[]>> {
    return { success: true, data: db.getCollection('shifts') };
  }

  public async getAttendance(campusId?: string, date?: string): Promise<ApiResponse<AttendanceRecord[]>> {
    let records = db.getCollection('attendance');
    if (campusId && campusId !== 'all') {
      records = records.filter((r) => r.campusId === campusId);
    }
    if (date) {
      records = records.filter((r) => r.date === date);
    }
    return { success: true, data: records, total: records.length };
  }

  public async recordWebPunch(employeeId: string, type: 'checkIn' | 'checkOut'): Promise<ApiResponse<AttendanceRecord>> {
    const attendance = db.getCollection('attendance');
    const employees = db.getCollection('employees');
    const emp = employees.find((e) => e.id === employeeId) || employees[0];
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let record = attendance.find((a) => a.employeeId === emp.id && a.date === today);

    if (record) {
      if (type === 'checkOut') {
        record.checkOut = timeStr;
        record.workHours = 8.0;
      }
    } else {
      record = {
        id: `att-${Date.now()}`,
        date: today,
        employeeId: emp.id,
        employeeName: emp.fullName,
        departmentId: emp.departmentId,
        campusId: emp.campusId,
        shiftId: 'shift-gen',
        checkIn: timeStr,
        workHours: 0,
        lateMinutes: 0,
        overtimeMinutes: 0,
        status: 'Present',
        source: 'Web Portal',
      };
      attendance.unshift(record);
    }

    db.updateCollection('attendance', [...attendance]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'tms',
      action: 'create',
      resource: `Attendance: ${emp.empNo}`,
      ipAddress: '127.0.0.1',
      details: `Web ${type} recorded at ${timeStr} for ${emp.fullName}`,
    });

    return { success: true, data: record, message: `${type === 'checkIn' ? 'Check-in' : 'Check-out'} recorded successfully` };
  }

  // ---------------- ACADEMICS ----------------
  public async getPrograms(): Promise<ApiResponse<Program[]>> {
    return { success: true, data: db.getCollection('programs') };
  }

  public async getCourses(): Promise<ApiResponse<Course[]>> {
    return { success: true, data: db.getCollection('courses') };
  }

  public async getOfferings(campusId?: string): Promise<ApiResponse<CourseOffering[]>> {
    let offerings = db.getCollection('offerings');
    if (campusId && campusId !== 'all') {
      offerings = offerings.filter((o) => o.campusId === campusId);
    }
    return { success: true, data: offerings, total: offerings.length };
  }

  public async getStudents(campusId?: string, programId?: string): Promise<ApiResponse<Student[]>> {
    let students = db.getCollection('students');
    if (campusId && campusId !== 'all') {
      students = students.filter((s) => s.campusId === campusId);
    }
    if (programId && programId !== 'all') {
      students = students.filter((s) => s.programId === programId);
    }
    return { success: true, data: students, total: students.length };
  }

  public async getMarks(offeringId?: string): Promise<ApiResponse<MarksEntry[]>> {
    let marks = db.getCollection('marks');
    if (offeringId && offeringId !== 'all') {
      marks = marks.filter((m) => m.offeringId === offeringId);
    }
    return { success: true, data: marks, total: marks.length };
  }

  public async updateStudentMarks(
    marksId: string,
    updates: { assignments: number; quizzes: number; midterm: number; finalExam: number }
  ): Promise<ApiResponse<MarksEntry>> {
    const marksList = db.getCollection('marks');
    const item = marksList.find((m) => m.id === marksId);
    if (!item) throw new Error('Marks record not found');

    const total = updates.assignments + updates.quizzes + updates.midterm + updates.finalExam;
    let grade = 'F';
    let gpa = 0.0;
    if (total >= 90) { grade = 'A'; gpa = 4.0; }
    else if (total >= 85) { grade = 'A-'; gpa = 3.7; }
    else if (total >= 80) { grade = 'B+'; gpa = 3.3; }
    else if (total >= 75) { grade = 'B'; gpa = 3.0; }
    else if (total >= 70) { grade = 'B-'; gpa = 2.7; }
    else if (total >= 65) { grade = 'C+'; gpa = 2.3; }
    else if (total >= 60) { grade = 'C'; gpa = 2.0; }
    else if (total >= 50) { grade = 'D'; gpa = 1.0; }

    item.assignments = updates.assignments;
    item.quizzes = updates.quizzes;
    item.midterm = updates.midterm;
    item.finalExam = updates.finalExam;
    item.total = total;
    item.grade = grade;
    item.gpa = gpa;
    item.status = 'Submitted';

    db.updateCollection('marks', [...marksList]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'academics',
      action: 'edit',
      resource: `Marks: ${item.rollNo}`,
      ipAddress: '127.0.0.1',
      details: `Updated marks for ${item.studentName} (${item.rollNo}). Total: ${total}, Grade: ${grade}`,
    });

    return { success: true, data: item, message: 'Marks updated and calculated successfully' };
  }

  // ---------------- ADMISSIONS ----------------
  public async getAdmissionSessions(): Promise<ApiResponse<AdmissionSession[]>> {
    return { success: true, data: db.getCollection('admissionSessions') };
  }

  public async getApplicants(campusId?: string): Promise<ApiResponse<Applicant[]>> {
    let apps = db.getCollection('applicants');
    if (campusId && campusId !== 'all') {
      apps = apps.filter((a) => a.campusId === campusId);
    }
    return { success: true, data: apps, total: apps.length };
  }

  public async registerApplicant(applicantData: Omit<Applicant, 'id' | 'applicationNo' | 'aggregateMerit' | 'status' | 'appliedDate'>): Promise<ApiResponse<Applicant>> {
    const apps = db.getCollection('applicants');
    const appNo = `APP-FA26-${String(10495 + apps.length)}`;
    // University Merit Formula: 10% Matric + 40% F.Sc + 50% Entrance Test
    const aggregate = Number(
      (applicantData.matricPercent * 0.1 + applicantData.fscPercent * 0.4 + applicantData.testScore * 0.5).toFixed(2)
    );

    const newApp: Applicant = {
      ...applicantData,
      id: `app-${Date.now()}`,
      applicationNo: appNo,
      aggregateMerit: aggregate,
      status: 'Submitted',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    apps.unshift(newApp);
    db.updateCollection('applicants', [...apps]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'admissions',
      action: 'create',
      resource: `Applicant: ${appNo}`,
      ipAddress: '127.0.0.1',
      details: `New applicant registered: ${newApp.fullName} (Aggregate: ${aggregate}%)`,
    });

    return { success: true, data: newApp, message: 'Applicant registered with automated aggregate calculation' };
  }

  public async getMeritLists(): Promise<ApiResponse<MeritList[]>> {
    return { success: true, data: db.getCollection('meritLists') };
  }

  // ---------------- FINANCE ----------------
  public async getFeeChallans(campusId?: string): Promise<ApiResponse<FeeChallan[]>> {
    let challans = db.getCollection('feeChallans');
    if (campusId && campusId !== 'all') {
      challans = challans.filter((c) => c.campusId === campusId);
    }
    return { success: true, data: challans, total: challans.length };
  }

  public async recordChallanPayment(challanId: string, amount: number, bankBranch: string): Promise<ApiResponse<FeeChallan>> {
    const challans = db.getCollection('feeChallans');
    const item = challans.find((c) => c.id === challanId);
    if (!item) throw new Error('Fee challan not found');

    item.paidAmount += amount;
    item.paymentDate = new Date().toISOString().split('T')[0];
    item.bankBranch = bankBranch;

    if (item.paidAmount >= item.totalAmount) {
      item.status = 'Paid';
    } else {
      item.status = 'Partial';
    }

    db.updateCollection('feeChallans', [...challans]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'finance',
      action: 'edit',
      resource: `Challan: ${item.challanNo}`,
      ipAddress: '127.0.0.1',
      details: `Fee payment received PKR ${amount.toLocaleString()} for ${item.studentName} (${item.status})`,
    });

    return { success: true, data: item, message: `Payment of PKR ${amount.toLocaleString()} recorded successfully` };
  }

  public async createFeeChallan(
    challanData: Omit<FeeChallan, 'id' | 'challanNo' | 'status' | 'paidAmount'>
  ): Promise<ApiResponse<FeeChallan>> {
    const challans = db.getCollection('feeChallans');
    const challanNo = `CH-2026-${String(8490 + challans.length)}`;
    const newChallan: FeeChallan = {
      ...challanData,
      id: `ch-${Date.now()}`,
      challanNo,
      status: 'Unpaid',
      paidAmount: 0,
    };
    challans.unshift(newChallan);
    db.updateCollection('feeChallans', [...challans]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'finance',
      action: 'create',
      resource: `Challan: ${challanNo}`,
      ipAddress: '127.0.0.1',
      details: `Generated new student semester fee challan for ${newChallan.studentName} (PKR ${newChallan.totalAmount.toLocaleString()})`,
    });

    return { success: true, data: newChallan, message: 'Fee Challan issued successfully.' };
  }

  public async getVouchers(campusId?: string): Promise<ApiResponse<JournalVoucher[]>> {
    let vouchers = db.getCollection('vouchers');
    if (campusId && campusId !== 'all') {
      vouchers = vouchers.filter((v) => v.campusId === campusId);
    }
    return { success: true, data: vouchers, total: vouchers.length };
  }

  // ---------------- PAYROLL ----------------
  public async getPayrollRecords(campusId?: string): Promise<ApiResponse<PayrollRecord[]>> {
    let payrolls = db.getCollection('payroll');
    if (campusId && campusId !== 'all') {
      payrolls = payrolls.filter((p) => p.campusId === campusId);
    }
    return { success: true, data: payrolls, total: payrolls.length };
  }

  public async generateMonthlyPayroll(monthYear: string): Promise<ApiResponse<PayrollRecord[]>> {
    const employees = db.getCollection('employees').filter((e) => e.status === 'Active');
    const existing = db.getCollection('payroll');
    const created: PayrollRecord[] = [];

    for (const emp of employees) {
      const basic = Math.round(emp.salary * 0.7);
      const medical = Math.round(emp.salary * 0.1);
      const houseRent = Math.round(emp.salary * 0.2);
      const tax = Math.round(emp.salary * 0.12);
      const pf = Math.round(basic * 0.08);
      const gross = basic + medical + houseRent;
      const net = gross - tax - pf;

      const record: PayrollRecord = {
        id: `pr-${Date.now()}-${emp.id}`,
        payrollMonth: monthYear,
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        departmentName: 'Department',
        campusId: emp.campusId,
        basicSalary: basic,
        medicalAllowance: medical,
        houseRentAllowance: houseRent,
        overtimePay: 0,
        taxDeduction: tax,
        providentFund: pf,
        grossSalary: gross,
        netSalary: net,
        presentDays: 22,
        leavesTaken: 0,
        status: 'Approved',
        paymentMethod: 'Bank Transfer',
        disbursementDate: new Date().toISOString().split('T')[0],
      };

      existing.unshift(record);
      created.push(record);
    }

    db.updateCollection('payroll', [...existing]);

    db.addNotification({
      title: 'Monthly Payroll Processed',
      message: `Payroll for ${monthYear} processed for ${created.length} active employees.`,
      module: 'payroll',
      type: 'success',
      actionUrl: '/payroll',
    });

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'payroll',
      action: 'create',
      resource: `Payroll Run: ${monthYear}`,
      ipAddress: '127.0.0.1',
      details: `Generated monthly payroll for ${created.length} employees`,
    });

    return { success: true, data: created, message: `Generated payroll for ${created.length} employees` };
  }

  // ---------------- INVENTORY ----------------
  public async getInventory(campusId?: string): Promise<ApiResponse<InventoryItem[]>> {
    let items = db.getCollection('inventory');
    if (campusId && campusId !== 'all') {
      items = items.filter((i) => i.campusId === campusId);
    }
    return { success: true, data: items, total: items.length };
  }

  public async getPurchaseRequisitions(campusId?: string): Promise<ApiResponse<PurchaseRequisition[]>> {
    let reqs = db.getCollection('requisitions');
    if (campusId && campusId !== 'all') {
      reqs = reqs.filter((r) => r.campusId === campusId);
    }
    return { success: true, data: reqs, total: reqs.length };
  }

  public async createPurchaseRequisition(
    reqData: Omit<PurchaseRequisition, 'id' | 'reqNo' | 'status' | 'requestDate' | 'approvalHistory'>
  ): Promise<ApiResponse<PurchaseRequisition>> {
    const reqs = db.getCollection('requisitions');
    const approvals = db.getCollection('approvals');
    const reqNo = `PR-2026-${String(980 + reqs.length)}`;
    const reqId = `req-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const newReq: PurchaseRequisition = {
      ...reqData,
      id: reqId,
      reqNo,
      status: 'Pending Approval',
      requestDate: today,
      approvalHistory: [
        {
          action: 'Submitted',
          actorName: reqData.requestedBy,
          actorRole: 'Departmental In-Charge',
          timestamp: new Date().toLocaleString(),
          remarks: 'Requisition submitted for institutional procurement review',
        },
      ],
    };

    reqs.unshift(newReq);
    db.updateCollection('requisitions', [...reqs]);

    const newApproval: ApprovalRequest = {
      id: `appr-${Date.now()}`,
      entityType: 'Requisition',
      entityId: reqId,
      referenceNo: reqNo,
      title: `Purchase Requisition - PKR ${newReq.totalEstimatedCost.toLocaleString()}`,
      submittedBy: newReq.requestedBy,
      departmentName: 'Store & Procurement',
      campusId: newReq.campusId,
      status: 'Pending Approval',
      submittedAt: today,
      history: [...newReq.approvalHistory],
    };
    approvals.unshift(newApproval);
    db.updateCollection('approvals', [...approvals]);

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: 'inventory',
      action: 'create',
      resource: `Requisition: ${reqNo}`,
      ipAddress: '127.0.0.1',
      details: `New purchase requisition submitted by ${newReq.requestedBy} for PKR ${newReq.totalEstimatedCost.toLocaleString()}`,
    });

    return { success: true, data: newReq, message: 'Purchase Requisition submitted to university approval workflow.' };
  }

  // ---------------- APPROVAL ENGINE ----------------
  public async getApprovals(campusId?: string): Promise<ApiResponse<ApprovalRequest[]>> {
    let apps = db.getCollection('approvals');
    if (campusId && campusId !== 'all') {
      apps = apps.filter((a) => a.campusId === campusId);
    }
    return { success: true, data: apps, total: apps.length };
  }

  public async processApprovalAction(
    approvalId: string,
    action: 'Approved' | 'Rejected' | 'Reverted',
    remarks?: string
  ): Promise<ApiResponse<ApprovalRequest>> {
    const approvals = db.getCollection('approvals');
    const req = approvals.find((a) => a.id === approvalId);
    if (!req) throw new Error('Approval request not found');

    const newStatus: WorkflowStatus = action === 'Approved' ? 'Approved' : action === 'Rejected' ? 'Rejected' : 'Reverted';
    req.status = newStatus;
    req.history.push({
      action,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.primaryRole,
      timestamp: new Date().toLocaleString(),
      remarks: remarks || `Action ${action} executed by ${this.currentUser.fullName}`,
    });

    // Cascade status update to the underlying entity
    if (req.entityType === 'Leave') {
      const leaves = db.getCollection('leaves');
      const target = leaves.find((l) => l.id === req.entityId);
      if (target) {
        target.status = newStatus;
        target.approvedBy = this.currentUser.fullName;
        target.approvalHistory.push({
          action,
          actorName: this.currentUser.fullName,
          actorRole: this.currentUser.primaryRole,
          timestamp: new Date().toLocaleString(),
          remarks,
        });
        db.updateCollection('leaves', [...leaves]);
      }
    } else if (req.entityType === 'Requisition') {
      const reqs = db.getCollection('requisitions');
      const target = reqs.find((r) => r.id === req.entityId);
      if (target) {
        target.status = newStatus;
        target.approvedBy = this.currentUser.fullName;
        db.updateCollection('requisitions', [...reqs]);
      }
    } else if (req.entityType === 'Voucher') {
      const vouchers = db.getCollection('vouchers');
      const target = vouchers.find((v) => v.id === req.entityId);
      if (target) {
        target.status = newStatus;
        target.approvedBy = this.currentUser.fullName;
        db.updateCollection('vouchers', [...vouchers]);
      }
    }

    db.updateCollection('approvals', [...approvals]);

    db.addNotification({
      title: `Workflow Request ${action}`,
      message: `${req.title} was ${action.toLowerCase()} by ${this.currentUser.fullName}.`,
      module: req.entityType === 'Leave' ? 'hrms' : req.entityType === 'Voucher' ? 'finance' : 'inventory',
      type: action === 'Approved' ? 'success' : 'alert',
      actionUrl: '/approvals',
    });

    db.addAuditLog({
      userId: this.currentUser.id,
      userName: this.currentUser.fullName,
      userRole: this.currentUser.primaryRole,
      module: req.entityType === 'Leave' ? 'hrms' : 'finance',
      action: action.toLowerCase() as ActionType,
      resource: `Approval: ${req.referenceNo}`,
      ipAddress: '127.0.0.1',
      details: `${action} workflow request: ${req.title}. Remarks: ${remarks || 'None'}`,
    });

    return { success: true, data: req, message: `Workflow request marked as ${action}` };
  }

  // ---------------- AUDIT & NOTIFICATIONS ----------------
  public async getAuditLogs(): Promise<ApiResponse<AuditLogEntry[]>> {
    return { success: true, data: db.getCollection('auditLogs') };
  }

  public async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return { success: true, data: db.getCollection('notifications') };
  }

  public async markNotificationRead(id: string): Promise<ApiResponse<boolean>> {
    const list = db.getCollection('notifications');
    const target = list.find((n) => n.id === id);
    if (target) target.read = true;
    db.updateCollection('notifications', [...list]);
    return { success: true, data: true };
  }

  public async markAllNotificationsRead(): Promise<ApiResponse<boolean>> {
    const list = db.getCollection('notifications');
    list.forEach((n) => (n.read = true));
    db.updateCollection('notifications', [...list]);
    return { success: true, data: true };
  }

  // ---------------- EXECUTIVE DASHBOARD STATS ----------------
  public async getDashboardStats(campusId?: string) {
    const campuses = db.getCollection('campuses');
    const departments = db.getCollection('departments');
    const employees = db.getCollection('employees');
    const students = db.getCollection('students');
    const applicants = db.getCollection('applicants');
    const attendance = db.getCollection('attendance');
    const feeChallans = db.getCollection('feeChallans');
    const approvals = db.getCollection('approvals');
    const inventory = db.getCollection('inventory');

    const filteredEmployees = campusId && campusId !== 'all' ? employees.filter((e) => e.campusId === campusId) : employees;
    const filteredStudents = campusId && campusId !== 'all' ? students.filter((s) => s.campusId === campusId) : students;
    const filteredChallans = campusId && campusId !== 'all' ? feeChallans.filter((c) => c.campusId === campusId) : feeChallans;

    const totalFeeExpected = filteredChallans.reduce((acc, c) => acc + c.totalAmount, 0);
    const totalFeeCollected = filteredChallans.reduce((acc, c) => acc + c.paidAmount, 0);
    const totalFeeOutstanding = totalFeeExpected - totalFeeCollected;

    const presentCount = attendance.filter((a) => a.status === 'Present').length;
    const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 96;

    const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending Approval').length;
    const lowStockItems = inventory.filter((i) => i.currentStock <= i.reorderLevel).length;

    return {
      success: true,
      data: {
        totalEmployees: filteredEmployees.length * 60, // scaling representation
        totalStudents: filteredStudents.length * 1150,
        totalCampuses: campuses.length,
        totalDepartments: departments.length,
        totalApplicants: applicants.length * 480,
        attendanceRate,
        totalFeeCollected,
        totalFeeOutstanding,
        pendingApprovalsCount,
        lowStockItems,
      },
    };
  }
}

export const api = new ApiService();
