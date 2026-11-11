/**
 * Enterprise Campus Management System (Campus ERP)
 * Role-Based Access Control (RBAC) & User Management
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, Check, X, Plus, Save, AlertCircle, Building2, Key } from 'lucide-react';
import { ERPTable, Column } from '../../components/common/ERPTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Role, User, ERPModule, ActionType, UserRoleName } from '../../types';

const ALL_MODULES: { key: ERPModule; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard & Analytics' },
  { key: 'rbac', label: 'Roles & User Security' },
  { key: 'hrms', label: 'HRMS (Employees & Leaves)' },
  { key: 'tms', label: 'TMS (Time & Shifts)' },
  { key: 'academics', label: 'Academics & Exams' },
  { key: 'admissions', label: 'Admissions & Merit' },
  { key: 'finance', label: 'Finance & Accounts' },
  { key: 'payroll', label: 'Payroll & Salaries' },
  { key: 'inventory', label: 'Inventory & Store' },
  { key: 'reports', label: 'Reports & Analytics' },
  { key: 'audit', label: 'Audit Trail & Compliance' },
];

const ALL_ACTIONS: { key: ActionType; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'reject', label: 'Reject' },
  { key: 'submit', label: 'Submit' },
  { key: 'revert', label: 'Revert' },
  { key: 'export', label: 'Export' },
  { key: 'print', label: 'Print' },
];

export const UserRoleManagement: React.FC = () => {
  const { currentUser, allCampuses, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'matrix' | 'users'>('matrix');
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsState, setPermissionsState] = useState<Record<ERPModule, ActionType[]>>({} as any);
  const [users, setUsers] = useState<User[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    fullName: '',
    email: '',
    primaryRole: 'Lecturer' as UserRoleName,
    campusId: 'camp-main',
    status: 'Active' as const,
  });

  const canEditRBAC = hasPermission('rbac', 'edit');

  const loadData = async () => {
    const [rolesRes, usersRes] = await Promise.all([api.getRoles(), api.getUsers()]);
    if (rolesRes.success) {
      setRoles(rolesRes.data);
      if (!selectedRole && rolesRes.data.length > 0) {
        setSelectedRole(rolesRes.data[0]);
        setPermissionsState(rolesRes.data[0].permissions);
      }
    }
    if (usersRes.success) {
      setUsers(usersRes.data);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setPermissionsState(role.permissions);
    setFeedbackMsg(null);
  };

  const handleTogglePermission = (mod: ERPModule, act: ActionType) => {
    if (!canEditRBAC) return;
    const currentActions = permissionsState[mod] || [];
    let updated: ActionType[];
    if (currentActions.includes(act)) {
      updated = currentActions.filter((a) => a !== act);
    } else {
      updated = [...currentActions, act];
    }
    setPermissionsState({
      ...permissionsState,
      [mod]: updated,
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole || !canEditRBAC) return;
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const res = await api.updateRolePermissions(selectedRole.id, permissionsState);
      if (res.success) {
        setFeedbackMsg(`Permissions for "${selectedRole.name}" successfully updated!`);
        await loadData();
      }
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.fullName || !newUserData.email) return;
    await api.createUser({
      ...newUserData,
      assignedRoles: [newUserData.primaryRole],
    });
    setIsAddUserOpen(false);
    setNewUserData({
      username: '',
      fullName: '',
      email: '',
      primaryRole: 'Lecturer',
      campusId: 'camp-main',
      status: 'Active',
    });
    await loadData();
  };

  const userColumns: Column<User>[] = [
    {
      key: 'fullName',
      header: 'Full Name & Username',
      sortable: true,
      render: (u) => (
        <div>
          <span className="font-bold text-slate-900 block">{u.fullName}</span>
          <span className="text-[11px] font-mono text-slate-400">@{u.username} · {u.email}</span>
        </div>
      ),
    },
    {
      key: 'primaryRole',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => (
        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-[#DD2A2A]" />
          <span>{u.primaryRole}</span>
        </span>
      ),
    },
    {
      key: 'campusId',
      header: 'Campus Jurisdiction',
      sortable: true,
      render: (u) => {
        const camp = allCampuses.find((c) => c.id === u.campusId);
        return (
          <span className="text-slate-600 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{camp?.name || 'All Campuses'}</span>
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      sortable: true,
      align: 'right',
      render: (u) => <span className="font-mono text-slate-500 tabular-nums">{u.lastLogin || 'Never'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Role-Based Access Control & User Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure 10-point granular permissions (View, Create, Edit, Delete, Approve, Reject, Submit, Revert, Export, Print)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permission Matrix
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              System Users ({users.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Configurable Roles ({roles.length})
            </h3>
            <div className="space-y-1">
              {roles.map((r) => {
                const isSelected = selectedRole?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRole(r)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-50 text-[#DD2A2A] font-bold border border-red-200'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {r.userCount} users
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Permission Matrix Table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Permissions for: {selectedRole?.name}
                  </h3>
                  {selectedRole?.isSystemRole && (
                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      System Role
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRole?.description}</p>
              </div>

              {canEditRBAC && (
                <button
                  onClick={handleSavePermissions}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
                </button>
              )}
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-64">ERP Functional Module</th>
                    {ALL_ACTIONS.map((act) => (
                      <th key={act.key} className="px-2 py-3 text-center w-16">
                        {act.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALL_MODULES.map((mod) => {
                    const permitted = permissionsState[mod.key] || [];
                    return (
                      <tr key={mod.key} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{mod.label}</td>
                        {ALL_ACTIONS.map((act) => {
                          const isChecked = permitted.includes(act.key);
                          return (
                            <td key={act.key} className="px-2 py-3 text-center">
                              <button
                                type="button"
                                disabled={!canEditRBAC}
                                onClick={() => handleTogglePermission(mod.key, act.key)}
                                className={`w-5 h-5 rounded border inline-flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-[#DD2A2A] border-[#DD2A2A] text-white'
                                    : 'border-slate-300 hover:border-slate-400 bg-white'
                                } ${!canEditRBAC ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Changes take effect immediately across all active user sessions for this role.</span>
              <span className="font-mono text-slate-400">10-Point Granular Matrix Enforced</span>
            </div>
          </div>
        </div>
      ) : (
        /* Users Table View */
        <ERPTable
          data={users}
          columns={userColumns}
          searchPlaceholder="Search users by name, username, email..."
          searchKeys={['fullName', 'username', 'email', 'primaryRole']}
          title="Campus ERP User Accounts"
          subtitle="Directory of authenticated university administrators, faculty, and student portals"
          filename="university_users"
        />
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Provision New User Account</h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Asad Ullah"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="e.g. asad.ullah"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  University Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. asad@campus.edu"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Role
                  </label>
                  <select
                    value={newUserData.primaryRole}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, primaryRole: e.target.value as UserRoleName })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Campus Jurisdiction
                  </label>
                  <select
                    value={newUserData.campusId}
                    onChange={(e) => setNewUserData({ ...newUserData, campusId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  >
                    {allCampuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg shadow-xs"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
