# Enterprise Campus Management System (Campus ERP)

A unified, multi-campus, enterprise-grade Campus Resource Planning (ERP) platform designed for universities and higher-education institutions. The system integrates academic lifecycle management, human resources, time and attendance, student admissions, university finance, inventory/assets, payroll, and a multi-level approval workflow engine under a granular Role-Based Access Control (RBAC) security model.

---

> [!IMPORTANT]
> **User Review & Critical Decisions**
> 
> - **Confirmed Persistence Architecture**: Embedded persistent document database with full RESTful MERN-compatible endpoints, indexed collections, transaction simulation, and seed data for multi-campus operation.
> - **Default Active Persona**: System launches in **Super Admin** persona with unrestricted multi-campus visibility, accompanied by an instant persona/role switcher in the top bar to test role-specific workflows (e.g., Dean, HR Manager, Finance Officer, Lecturer, Student).
> - **Module Availability**: All primary ERP modules (HRMS, TMS, Academics, Admissions, Inventory, Finance, Payroll, Reports & Analytics, Audit Logs, Settings) are populated with rich relational sample data and interactive management interfaces.
> - **Color & Visual Tokens**: Strict enterprise branding following prompt specifications: Primary Crimson `#DD2A2A`, Background Canvas `#F0F3FB`, Body Navy `#484C72`, Crisp White `#FFFFFF` structural surfaces, and subtle hairline borders (`#E2E8F0`).

---

## 1. Overview & Core Concept

### What It Does
The Campus Management System orchestrates the entire operational lifecycle of modern higher-education institutions:
- **Centralized Administration & RBAC**: Multi-campus hierarchy (Main Campus, City Campus, Health Sciences, Tech Park) with multi-role assignment and 10-point granular permissions (View, Create, Edit, Delete, Approve, Reject, Submit, Revert, Export, Print).
- **Academic Lifecycle**: Program structures, degree ledgers, semester course offerings, class schedules, attendance logs, marks entry, grading scales, GPA/CGPA calculations, transcripts, and gazettes.
- **Student Admissions**: Multi-session intake portals, merit list calculation formulas, quota seat allocations, admission fee challan generation, and auto-enrollment into academic cohorts.
- **Human Resources (HRMS) & Time Tracking (TMS)**: Faculty and staff directory, onboarding, promotions, leave applications with balance ledgers, shift assignments, biometric daily attendance check-ins, overtime, and time regularization.
- **University Finance & Student Accounts**: Chart of accounts, fee structure management, automated fee challan generation with installment schedules, voucher entry (Journal, Payment, Receipt), student ledgers, and trial balances.
- **Payroll Management**: Configurable salary structures (basic, allowances, tax slabs, deductions), attendance-linked monthly payroll processing, payslip generator, and disbursement tracking.
- **Inventory & Asset Management**: Central store & departmental stock locations, purchase requisitions, POs, Goods Receipt Notes (GRN), asset allocation, and stock adjustment logs.
- **Multi-Level Approval Engine**: Reusable state machine managing draft $\rightarrow$ submitted $\rightarrow$ pending review $\rightarrow$ approved/rejected/reverted states across all administrative domains.

### Target Audience & Personas
- **Super Admin / Campus Admin**: Complete governance, system audit trails, role permission matrices, campus provisioning.
- **Faculty Dean & Department Chairs (HOD)**: Course allocation, faculty workload, exam award approvals, student promotion.
- **Lecturers / Faculty**: Course roster, attendance recording, midterm/final marks entry.
- **HR & Payroll Officers**: Employee files, shift rotas, leave sanctions, monthly payroll run.
- **Finance Officers**: Fee collection reconciliation, voucher approvals, student dues management.
- **Admissions Team**: Application verification, merit quota compilation, offer letter dispatch.
- **Students**: Academic record overview, timetable, fee challans, attendance status.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Color System (60-30-10 Rule)**:
  - `60% Neutral Canvas`: `#F0F3FB` (soft slate-tinted canvas).
  - `30% Structural Surfaces`: `#FFFFFF` (crisp white cards, clean hairline borders `#E2E8F0`, headers, and tables).
  - `10% Primary Accent`: `#DD2A2A` (Crimson ERP primary, focused hover states `#B91C1C`, active menu highlights).
  - `Text Hierarchy`: Primary `#484C72` (deep slate navy), Secondary `#6B7280` (muted labels), Headings `#1E293B`.
  - `Semantic Accents`: Success `#16A34A` (Approved/Paid), Warning `#D97706` (Pending/Review), Crimson `#DC2626` (Rejected/Overdue), Info `#2563EB` (Submitted).
- **Typography**: Clean, high-legibility sans-serif (`Plus Jakarta Sans` / `Roboto`) paired with tabular monospace numerals (`tabular-nums font-mono`) for all financial totals, student IDs, course credits, and timestamps.
- **Zero-Pill Discipline**: Statuses and metadata use clean, unboxed typographic markers (`·`, `/`) with semantic colored text instead of cluttered bubble badges. Filter controls use clean segmented button tabs.

### Layout Structure & Navigation
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR: [University Brand]  ·  [Campus Selector]  ·  [Global Search]  ·  [Persona Switch] │
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT VIEWPORT                                                   │
│ • Dashboard  │  BREADCRUMB: Campus ERP / Academics / Course Offerings                  │
│ • HRMS       │ ┌─────────────────────────────────────────────────────────────────────┐ │
│ • TMS        │ │ KPI METRICS ROW (4 Cards: Active Courses, Enrollments, GPA, Pending)│ │
│ • Academics  │ └─────────────────────────────────────────────────────────────────────┘ │
│ • Admissions │ ┌─────────────────────────────────────────────────────────────────────┐ │
│ • Finance    │ │ FILTER TOOLBAR: Search, Department Filter, Semester, Export Actions  │ │
│ • Payroll    │ ├─────────────────────────────────────────────────────────────────────┤ │
│ • Inventory  │ │ HIGH-DENSITY DATA TABLE (Tabular figures, action menu, status)      │ │
│ • Approvals  │ ├─────────────────────────────────────────────────────────────────────┤ │
│ • Reports    │ │ PAGINATION & RECORD COUNT BAR                                       │ │
│ • Settings   │ └─────────────────────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

- **Top Bar Contract**: Brand wordmark + campus context dropdown + global quick-search + persona switcher + notification drawer trigger + user profile.
- **Dynamic Sidebar Navigation**: Automatically pruned based on the current active role's assigned permissions; collapsible for maximum screen real estate.
- **Unified ERP Data Tables**: Search filters, column sorting, pagination controls, Excel/PDF export triggers, batch actions, and drawer-based detail/edit view.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Persistence Architecture (Embedded MERN-Compatible Document Store)
- **Chosen Approach**: High-fidelity in-memory/browser-persistent document store backed by full RESTful Express-compatible service endpoints with MongoDB schema definitions, indexing, aggregation queries, and real seed data.
- **Why**: Allows instant, zero-friction execution in the AI Studio environment without requiring external database provisioning or credentials, while preserving 100% MERN stack architectural parity and schema validation.
- **Alternatives Considered**: External MongoDB Atlas (requires external network egress and credentials from the user).

### Decision 2: Approval Workflow State Machine
- **Chosen Approach**: Centralized, domain-agnostic workflow engine (`ApprovalService`) supporting 8 lifecycle states (`Draft`, `Submitted`, `Pending Approval`, `Approved`, `Rejected`, `Reverted`, `Cancelled`, `Finalized`), audit trail tracking, approver notes, and automatic state transitions.
- **Why**: Eliminates duplicated approval logic across Admissions, Finance (Fee Vouchers), HR (Leaves/Promotions), Academics (Marks Verification), Inventory (Purchase Orders), and Payroll.

### Decision 3: Dynamic Role Switcher for Interactive Demonstration
- **Chosen Approach**: Built-in executive Persona Switcher in the top navigation allowing evaluators to seamlessly toggle between Super Admin, Dean, HR Manager, Finance Officer, Lecturer, and Student to experience live RBAC menu pruning and authorization rules in real time.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                         │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │   Redux Store / Auth │  │    RBAC Route Guard  │  │ Dynamic Nav Engine  │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬──────────┘ │
│             │                         │                         │            │
│  ┌──────────▼─────────────────────────▼─────────────────────────▼──────────┐ │
│  │ Module Views: HRMS · TMS · Academics · Admissions · Finance · Payroll    │ │
│  │ Reusable UI: ERPTable · ApprovalModal · VoucherDrawer · MetricCard      │ │
│  └────────────────────────────────────┬────────────────────────────────────┘ │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │ REST API Calls (Axios / Bearer JWT)
┌───────────────────────────────────────▼──────────────────────────────────────┐
│                           BACKEND & SERVICE LAYER                            │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐ │
│  │ Auth & RBAC Guard    │  │ Approval Engine      │  │ Audit Logger        │ │
│  └──────────┬───────────┘  └──────────┬───────────┘  └──────────┬──────────┘ │
│             │                         │                         │            │
│  ┌──────────▼─────────────────────────▼─────────────────────────▼──────────┐ │
│  │ Controllers & Services:                                                 │ │
│  │ • AcademicService (Courses, Marks, Timetables, Transcripts)             │ │
│  │ • HRMSService (Employees, Departments, Leaves, Clearances)              │ │
│  │ • TMSService (Shifts, Biometric Logs, Overtime, Commits)               │ │
│  │ • AdmissionService (Applicants, Merit Lists, Seat Allocation)           │ │
│  │ • FinanceService (Fee Challans, General Ledger, Vouchers)               │ │
│  │ • PayrollService (Salary Structures, Monthly Generation, Payslips)      │ │
│  │ • InventoryService (Items, Requisitions, GRN, Stock Moves)              │ │
│  └────────────────────────────────────┬────────────────────────────────────┘ │
│                                       │ Query / Mutation Pipelines           │
│  ┌────────────────────────────────────▼────────────────────────────────────┐ │
│  │ DOCUMENT DATABASE & STORE (Mongoose-aligned Schemas & Validations)      │ │
│  │ Indexed Collections · Soft Deletes · Auto-increment Reference Numbers  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Core Entities & Database Collections
1. `Campuses`: `_id`, `name`, `code`, `city`, `address`, `status`, `deanId`.
2. `Departments`: `_id`, `campusId`, `facultyId`, `name`, `code`, `headOfDeptId`.
3. `Users & Roles`: `_id`, `employeeId`/`studentId`, `email`, `passwordHash`, `roles[]`, `campusAccess[]`, `departmentAccess[]`, `status`.
4. `Permissions`: `module`, `resource`, `actions: ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print']`.
5. `Employees`: `_id`, `empNo`, `firstName`, `lastName`, `designation`, `departmentId`, `campusId`, `salaryStructureId`, `employmentType`, `joinDate`, `status`.
6. `Students`: `_id`, `rollNo`, `regNo`, `name`, `programId`, `currentSemester`, `cgpa`, `campusId`, `admissionSessionId`, `feeStatus`.
7. `Courses & Enrollments`: `_id`, `courseCode`, `title`, `creditHours`, `departmentId`, `prerequisites[]`, `semester`.
8. `Marks & Grading`: `_id`, `courseOfferingId`, `studentId`, `quizzes`, `assignments`, `midterm`, `terminalExam`, `totalMarks`, `grade`, `gpa`, `approvalStatus`.
9. `Applications & Merit`: `_id`, `applicantNo`, `name`, `programPreferences[]`, `matricScore`, `fscScore`, `testScore`, `aggregateMerit`, `allocatedQuota`, `status`, `challanNo`.
10. `Attendance & Shifts`: `_id`, `employeeId`/`studentId`, `date`, `checkIn`, `checkOut`, `lateMinutes`, `overtimeMinutes`, `status` (`Present`, `Late`, `HalfDay`, `Absent`, `OnLeave`).
11. `FeeTransactions & Challans`: `_id`, `challanNo`, `studentId`, `semester`, `heads: [{headName, amount}]`, `dueDate`, `totalAmount`, `discountAmount`, `paidAmount`, `paymentStatus`.
12. `JournalVouchers`: `_id`, `voucherNo`, `date`, `voucherType` (`JV`, `CPV`, `CRV`, `BPV`, `BRV`), `entries: [{accountCode, debit, credit, narrative}]`, `status`.
13. `Payrolls & Payslips`: `_id`, `monthYear`, `employeeId`, `basicSalary`, `allowances[]`, `deductions[]`, `grossSalary`, `netSalary`, `paymentStatus`.
14. `InventoryItems & Requisitions`: `_id`, `itemCode`, `name`, `category`, `uom`, `currentStock`, `reorderLevel`, `storeLocation`.
15. `ApprovalRequests`: `_id`, `entityType`, `entityId`, `currentStep`, `status`, `history: [{action, performedBy, role, timestamp, comments}]`.
16. `AuditLogs`: `_id`, `userId`, `action`, `resource`, `ipAddress`, `timestamp`, `details`.

---

## 5. Phased Implementation Roadmap

- **Phase 1: Foundation, RBAC, Layout & Dynamic Navigation**
  - Application shell, Tailwind v4 styling with `#DD2A2A` theme and `#F0F3FB` canvas.
  - Role-based permissions matrix, multi-campus selector, and live persona switcher.
  - Centralized Approval Engine and Audit Log service.
- **Phase 2: HRMS & TMS (Time Management System)**
  - Employee directory, registration, designation setup, and leave balance tracker.
  - Shift planner, daily attendance grid, manual adjustment requests, and month-end commit.
- **Phase 3: Academics & Student Admissions**
  - Programs, courses, timetable schedules, exam marks entry, and transcript/gazette generator.
  - Admission intake manager, merit calculation formula, quota seat allocator, and challan issue.
- **Phase 4: University Finance & Central Inventory**
  - Student fee challans, installment plans, voucher generator (JV/Payment/Receipt), and chart of accounts.
  - Store items, purchase requisitions, PO approval, and stock movement ledger.
- **Phase 5: Payroll & Integration Services**
  - Attendance-linked payroll computation, tax deductions, allowances, payslip PDF/print view.
- **Phase 6: Central Executive Analytics & Reporting**
  - University KPI cards, enrollment trends, fee collection vs. receivables charts, attendance stats.
