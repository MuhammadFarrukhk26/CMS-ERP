/**
 * Enterprise Campus Management System (Campus ERP)
 * User Profile & Account Security Management Modal
 */

import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Building,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ERPModule, ActionType } from '../../types';
import { db } from '../../services/db';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { currentUser, currentCampus, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+92 51 9085 0000');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await updateProfile({
        fullName,
        email,
        phone,
        bio,
      });
      if (res.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
      } else {
        setProfileMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSavingSecurity(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSecurityMessage({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityMessage({ type: 'error', text: res.message || 'Current password incorrect.' });
      }
    } catch {
      setSecurityMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  // Get active role permissions
  const roles = db.getCollection('roles');
  const roleRecord = roles.find((r) => r.name === currentUser.primaryRole);
  const rolePermissions: Record<ERPModule, ActionType[]> = roleRecord?.permissions || ({} as any);

  const modulesList: { key: ERPModule; name: string }[] = [
    { key: 'dashboard', name: 'Executive Dashboard' },
    { key: 'hrms', name: 'Human Resource (HRMS)' },
    { key: 'tms', name: 'Time & Attendance (TMS)' },
    { key: 'academics', name: 'Academics & Exams' },
    { key: 'admissions', name: 'Student Admissions' },
    { key: 'finance', name: 'Accounts & Fee Ledger' },
    { key: 'payroll', name: 'Payroll & Disbursal' },
    { key: 'inventory', name: 'Inventory & Assets' },
    { key: 'rbac', name: 'RBAC User Governance' },
    { key: 'audit', name: 'Audit & Compliance' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DD2A2A] text-white font-bold text-sm flex items-center justify-center shadow-xs">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">{currentUser.fullName}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#DD2A2A]">{currentUser.primaryRole}</span>
                <span>•</span>
                <span>{currentCampus?.name || 'Islamabad Main Campus'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#DD2A2A] text-[#DD2A2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-[#DD2A2A] text-[#DD2A2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-[#DD2A2A] text-[#DD2A2A]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            My RBAC Permissions
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Username (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Primary Institutional Role</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.primaryRole}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Campus ID / Code</label>
                  <input
                    type="text"
                    disabled
                    value={`${currentCampus?.code || 'ISB'} - ${currentCampus?.name || 'Main Campus'}`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Bio / Academic Designation</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Academic credentials, specializations, office hours..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last active: <strong className="text-slate-700">{currentUser.lastLogin || 'Today'}</strong></span>
                </div>
                <div>
                  {currentUser.employeeId && (
                    <span className="font-mono bg-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      EMP: {currentUser.employeeId}
                    </span>
                  )}
                  {currentUser.studentId && (
                    <span className="font-mono bg-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      STU: {currentUser.studentId}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Credentials */}
          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="space-y-4 max-w-md mx-auto">
              {securityMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    securityMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {securityMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{securityMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default demo password for seeded accounts is typically role-based (e.g. admin123, pass123).</p>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  Institutional Security Policy:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                  <li>Minimum 6 alphanumeric characters</li>
                  <li>Do not reuse previous semester credentials</li>
                  <li>Password changes are logged in the Compliance Audit Trail</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSecurity}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isSavingSecurity ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Permissions Matrix for Current Role */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Configured Role Permissions</p>
                  <p className="text-[11px] text-slate-500">
                    Active Role: <span className="font-semibold text-[#DD2A2A]">{currentUser.primaryRole}</span>
                  </p>
                </div>
                {currentUser.primaryRole === 'Super Admin' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#DD2A2A] px-2 py-0.5 rounded">
                    Universal Wildcard Access
                  </span>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 font-bold">Module</th>
                      <th className="p-2.5 font-bold">Authorized Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modulesList.map((m) => {
                      const actions =
                        currentUser.primaryRole === 'Super Admin'
                          ? ['view', 'create', 'edit', 'delete', 'approve', 'reject', 'submit', 'revert', 'export', 'print']
                          : rolePermissions[m.key] || [];

                      return (
                        <tr key={m.key} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-semibold text-slate-800">{m.name}</td>
                          <td className="p-2.5">
                            {actions.length === 0 ? (
                              <span className="text-slate-400 italic text-[11px]">No access granted</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {actions.map((act) => (
                                  <span
                                    key={act}
                                    className="font-mono text-[10px] uppercase font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                                  >
                                    {act}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="px-3 py-1.5 text-rose-700 hover:text-rose-800 hover:bg-rose-100/70 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out of Account
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
