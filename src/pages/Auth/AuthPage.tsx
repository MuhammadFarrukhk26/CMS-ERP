/**
 * Enterprise Campus Management System (Campus ERP)
 * Institutional Authentication Portal (Sign In, Sign Up, Quick Personas & Password Recovery)
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  Briefcase,
  Coins,
  BookOpen,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  KeyRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRoleName } from '../../types';

interface AuthPageProps {
  onSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, signup, switchPersona, allCampuses, requestPasswordReset, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('superadmin');
  const [signInPassword, setSignInPassword] = useState('admin123');
  const [signInCampus, setSignInCampus] = useState('camp-main');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpCnic, setSignUpCnic] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpRole, setSignUpRole] = useState<'Student' | 'Lecturer' | 'Employee'>('Student');
  const [signUpCampus, setSignUpCampus] = useState('camp-main');
  const [agreeHonorCode, setAgreeHonorCode] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [inputResetCode, setInputResetCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Quick Demo Personas
  const demoPersonas: {
    role: UserRoleName;
    title: string;
    username: string;
    pass: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      role: 'Super Admin',
      title: 'Dr. Zulfiqar Haider',
      username: 'superadmin',
      pass: 'admin123',
      icon: Shield,
      desc: 'Unrestricted university-wide governance & RBAC',
    },
    {
      role: 'Faculty Dean',
      title: 'Prof. Mansoor Alam',
      username: 'dean.computing',
      pass: 'dean123',
      icon: GraduationCap,
      desc: 'Dean of Computing, exam approvals & curriculum',
    },
    {
      role: 'HR Manager',
      title: 'Sarah Jenkins',
      username: 'hrmanager',
      pass: 'hr123',
      icon: Briefcase,
      desc: 'Staff onboardings, biometric TMS & leaves',
    },
    {
      role: 'Finance Manager',
      title: 'Kamran Ashraf, FCA',
      username: 'financemanager',
      pass: 'finance123',
      icon: Coins,
      desc: 'Student fees, journal vouchers & payroll',
    },
    {
      role: 'Lecturer',
      title: 'Hamza Ali, MSCS',
      username: 'lecturer.hamza',
      pass: 'lecturer123',
      icon: BookOpen,
      desc: 'Class timetables, student attendance & marks',
    },
    {
      role: 'Student',
      title: 'Zain Ul Abideen',
      username: 'student.zain',
      pass: 'student123',
      icon: UserCheck,
      desc: 'Degree ledger, transcripts & fee challans',
    },
  ];

  const handleQuickLogin = async (persona: typeof demoPersonas[0]) => {
    setSignInIdentifier(persona.username);
    setSignInPassword(persona.pass);
    setSignInLoading(true);
    setSignInError(null);

    // Call persona switcher directly for instantaneous 100% reliable entry
    setTimeout(() => {
      switchPersona(persona.role);
      setSignInLoading(false);
      if (onSuccess) onSuccess();
    }, 250);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setSignInError(null);

    try {
      const res = await login({
        usernameOrEmail: signInIdentifier,
        password: signInPassword,
        campusId: signInCampus,
        rememberMe,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setSignInError(res.message || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setSignInError('Unable to connect to Authentication service.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpSuccess(null);

    if (!agreeHonorCode) {
      setSignUpError('You must agree to the Institutional Code of Academic Integrity.');
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError('Password must contain at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Password confirmation does not match.');
      return;
    }

    setSignUpLoading(true);

    try {
      const res = await signup({
        fullName: signUpFullName,
        username: signUpUsername,
        email: signUpEmail,
        phone: signUpPhone,
        cnic: signUpCnic,
        password: signUpPassword,
        role: signUpRole,
        campusId: signUpCampus,
      });

      if (res.success) {
        setSignUpSuccess('Account successfully registered! Redirecting to your Campus Portal...');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 800);
      } else {
        setSignUpError(res.message || 'Registration failed. Check inputs.');
      }
    } catch {
      setSignUpError('An unexpected server error occurred during registration.');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await requestPasswordReset(forgotIdentifier);
      if (res.success && res.resetCode) {
        setGeneratedResetCode(res.resetCode);
        setInputResetCode(res.resetCode); // Convenient auto-fill for testing
        setForgotStep('verify');
        setForgotMessage({
          type: 'success',
          text: `Verification code generated: ${res.resetCode}. Proceed to set your new password.`,
        });
      } else {
        setForgotMessage({ type: 'error', text: res.message || 'No account found with this identifier.' });
      }
    } catch {
      setForgotMessage({ type: 'error', text: 'Error contacting identity server.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFinalizeReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage(null);

    if (inputResetCode !== generatedResetCode) {
      setForgotMessage({ type: 'error', text: 'Invalid verification security code.' });
      setForgotLoading(false);
      return;
    }

    if (forgotNewPassword.length < 6) {
      setForgotMessage({ type: 'error', text: 'New password must have at least 6 characters.' });
      setForgotLoading(false);
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotMessage({ type: 'error', text: 'New passwords do not match.' });
      setForgotLoading(false);
      return;
    }

    try {
      const res = await resetPassword(forgotIdentifier, forgotNewPassword);
      if (res.success) {
        setForgotMessage({ type: 'success', text: 'Password reset successful! You can now log in.' });
        setSignInIdentifier(forgotIdentifier);
        setSignInPassword(forgotNewPassword);
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setForgotStep('request');
          setForgotIdentifier('');
          setForgotNewPassword('');
          setForgotConfirmPassword('');
        }, 1200);
      } else {
        setForgotMessage({ type: 'error', text: res.message || 'Failed to update password.' });
      }
    } catch {
      setForgotMessage({ type: 'error', text: 'Failed to reset password.' });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F0F3FB] text-[#484C72] flex flex-col justify-between overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Top Institutional Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-12 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DD2A2A] flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">CAMPUS ERP</span>
              <span className="text-[10px] font-mono uppercase bg-red-100 text-[#DD2A2A] font-bold px-1.5 py-0.5 rounded">
                v4.8 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400">National University Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="hidden md:inline-flex items-center gap-1.5 text-slate-500">
            <Building2 className="w-3.5 h-3.5 text-[#DD2A2A]" />
            Multi-Campus: Islamabad • Lahore • Karachi
          </span>
          <button
            onClick={() => handleQuickLogin(demoPersonas[0])}
            className="px-3 py-1.5 bg-red-50 text-[#DD2A2A] hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-xs font-bold"
          >
            Direct Super Admin Demo
          </button>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
          {/* Left Column: Institutional Info & 1-Click Persona Quick Logins */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#DD2A2A] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">
                Unified Higher Education Suite
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Institutional Access & Identity Gateway
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized authentication for Academic Governors, Faculty Deans, Department Heads, Finance Officers, and Students.
              </p>
            </div>

            {/* Quick Demo Personas Strip */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#DD2A2A]" />
                  <span>Instant 1-Click Role Logins</span>
                </div>
                <span className="text-[10px] text-slate-400">Pre-seeded accounts</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Click any role card below to instantly sign in and explore that role's customized RBAC permissions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {demoPersonas.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.role}
                      onClick={() => handleQuickLogin(p)}
                      disabled={signInLoading}
                      className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#DD2A2A] hover:bg-red-50/40 transition-all group flex items-start gap-2.5 relative"
                    >
                      <div className="w-7 h-7 rounded-md bg-slate-100 group-hover:bg-[#DD2A2A] group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 group-hover:text-[#DD2A2A] transition-colors truncate">
                          {p.role}
                        </span>
                        <span className="block text-[10px] text-slate-500 truncate">{p.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* University Standards Footer Details */}
            <div className="p-4 bg-slate-100/60 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enterprise Security & Compliance</span>
              </div>
              <p>
                Strict RBAC enforcement across 10 modules. All login and access attempts are timestamped and recorded in the university compliance audit register.
              </p>
            </div>
          </div>

          {/* Right Column: Authentication Card (Sign In / Sign Up) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
              <button
                onClick={() => {
                  setMode('signin');
                  setSignInError(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 ${
                  mode === 'signin'
                    ? 'bg-white text-[#DD2A2A] border-t-2 border-t-[#DD2A2A]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In to Account
              </button>
              <button
                onClick={() => {
                  setMode('signup');
                  setSignUpError(null);
                  setSignUpSuccess(null);
                }}
                className={`flex-1 py-3.5 text-center transition-colors flex items-center justify-center gap-2 ${
                  mode === 'signup'
                    ? 'bg-white text-[#DD2A2A] border-t-2 border-t-[#DD2A2A]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Create New Account / Register
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {/* ================= SIGN IN TAB ================= */}
              {mode === 'signin' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Institutional Sign In</h2>
                    <p className="text-xs text-slate-500">
                      Enter your university credentials or select one of the 1-click demo personas on the left.
                    </p>
                  </div>

                  {signInError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Username or University Email
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        placeholder="e.g. superadmin, dean.computing, student.zain"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotIdentifier(signInIdentifier);
                          setIsForgotModalOpen(true);
                          setForgotMessage(null);
                        }}
                        className="text-[11px] text-[#DD2A2A] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSignInPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
                      <select
                        value={signInCampus}
                        onChange={(e) => setSignInCampus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      >
                        {allCampuses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center sm:pt-6">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-[#DD2A2A] focus:ring-[#DD2A2A] w-3.5 h-3.5"
                        />
                        <span>Remember this device</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {signInLoading ? (
                      <span>Verifying Institutional Credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Campus ERP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Protected by Dual-Layer RBAC</span>
                    <span>Need help? Contact IT Registrar</span>
                  </div>
                </form>
              )}

              {/* ================= SIGN UP TAB ================= */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Register Institutional Account</h2>
                    <p className="text-xs text-slate-500">
                      Create a self-service account as a Student, Faculty Lecturer, or University Staff.
                    </p>
                  </div>

                  {signUpError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{signUpError}</span>
                    </div>
                  )}

                  {signUpSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{signUpSuccess}</span>
                    </div>
                  )}

                  {/* Role Selection Segmented Control */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Registration Category
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Student', label: 'Student Portal', icon: GraduationCap },
                        { key: 'Lecturer', label: 'Faculty / Instructor', icon: BookOpen },
                        { key: 'Employee', label: 'Admin Staff', icon: Briefcase },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = signUpRole === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSignUpRole(item.key as any)}
                            className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-red-50/70 border-[#DD2A2A] text-[#DD2A2A] shadow-2xs font-bold'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        value={signUpFullName}
                        onChange={(e) => setSignUpFullName(e.target.value)}
                        placeholder="e.g. Ayesha Siddiqui"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Desired Username</label>
                      <input
                        type="text"
                        required
                        value={signUpUsername}
                        onChange={(e) => setSignUpUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="e.g. ayesha.siddiqui"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="student@campus.edu or personal email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={signUpPhone}
                        onChange={(e) => setSignUpPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">National ID / CNIC</label>
                      <input
                        type="text"
                        value={signUpCnic}
                        onChange={(e) => setSignUpCnic(e.target.value)}
                        placeholder="61101-1234567-1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Campus</label>
                      <select
                        value={signUpCampus}
                        onChange={(e) => setSignUpCampus(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      >
                        {allCampuses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                      <div className="relative">
                        <input
                          type={showSignUpPassword ? 'text' : 'password'}
                          required
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={agreeHonorCode}
                        onChange={(e) => setAgreeHonorCode(e.target.checked)}
                        className="mt-0.5 rounded text-[#DD2A2A] focus:ring-[#DD2A2A] w-3.5 h-3.5 shrink-0"
                      />
                      <span>
                        I acknowledge and agree to abide by the University Honor Code, Data Security Standards, and Campus ERP Terms of Governance.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={signUpLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#DD2A2A] hover:bg-[#b91c1c] rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {signUpLoading ? (
                      <span>Registering Account & Provisions...</span>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#DD2A2A]" />
                <h3 className="text-xs font-bold text-slate-900">Institutional Password Recovery</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 text-xs space-y-4">
              {forgotMessage && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    forgotMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {forgotMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{forgotMessage.text}</span>
                </div>
              )}

              {forgotStep === 'request' ? (
                <form onSubmit={handleRequestReset} className="space-y-3">
                  <p className="text-slate-500">
                    Enter your university username or registered email. We will generate an authorization verification code.
                  </p>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Username or Email</label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="e.g. superadmin, hrmanager, or email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-1.5 bg-[#DD2A2A] hover:bg-[#b91c1c] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {forgotLoading ? 'Searching...' : 'Send Recovery Code'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalizeReset} className="space-y-3">
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-slate-700">
                    <span className="block font-semibold text-[#DD2A2A] mb-0.5">Authorization Code:</span>
                    <span className="font-mono font-bold tracking-widest text-sm text-slate-900">
                      {generatedResetCode}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Verification Code</label>
                    <input
                      type="text"
                      required
                      value={inputResetCode}
                      onChange={(e) => setInputResetCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono tracking-wider text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#DD2A2A]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-1.5 bg-[#DD2A2A] hover:bg-[#b91c1c] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 sm:px-12 flex items-center justify-between text-[11px] text-slate-400">
        <div>© 2026 National University Campus ERP • All Rights Reserved</div>
        <div className="flex items-center gap-4">
          <span>Higher Education Commission Certified</span>
          <span>Privacy & Security</span>
          <span>Campus IT Helpdesk</span>
        </div>
      </footer>
    </div>
  );
};
