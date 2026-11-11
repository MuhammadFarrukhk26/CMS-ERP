/**
 * Enterprise Campus Management System (Campus ERP)
 * Authentication, Session & Granular RBAC Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Campus,
  ERPModule,
  ActionType,
  UserRoleName,
  LoginCredentials,
  SignupFormData,
  UserProfileUpdateData,
} from '../types';
import { api } from '../services/api';
import { db } from '../services/db';

const TOKEN_KEY = 'campus_erp_auth_token';
const USER_ID_KEY = 'campus_erp_auth_user_id';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: User;
  currentCampus: Campus | null;
  allCampuses: Campus[];
  availableUsers: User[];
  setCurrentUser: (user: User) => void;
  setCurrentCampusId: (campusId: string) => void;
  hasPermission: (module: ERPModule, action: ActionType) => boolean;
  canAccessModule: (module: ERPModule) => boolean;
  switchPersona: (roleName: UserRoleName) => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  signup: (data: SignupFormData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdateData) => Promise<{ success: boolean; message?: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; resetCode?: string; message?: string }>;
  resetPassword: (identifier: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCampuses, setAllCampuses] = useState<Campus[]>(db.getCollection('campuses'));
  const [availableUsers, setAvailableUsers] = useState<User[]>(db.getCollection('users'));

  // Session state
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUserId = localStorage.getItem(USER_ID_KEY);
    const users = db.getCollection('users');
    if (savedUserId) {
      const match = users.find((u) => u.id === savedUserId);
      if (match) return match;
    }
    return users[0] || api.getCurrentUser();
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // If explicit token exists, true. If never set (first load), initialize as logged-in Super Admin for seamless preview
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const wasLoggedOut = localStorage.getItem('campus_erp_auth_logged_out');
    if (wasLoggedOut === 'true') return false;
    if (savedToken) return true;
    // Default initial session: start as authenticated with Super Admin, but user can freely log out to test login/signup
    const initialToken = `erp_jwt_init_${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, initialToken);
    localStorage.setItem(USER_ID_KEY, 'usr-admin');
    return true;
  });

  const [currentCampusId, setCurrentCampusIdState] = useState<string>(() => {
    return currentUser.campusId || api.getCurrentCampusId();
  });

  useEffect(() => {
    setAllCampuses(db.getCollection('campuses'));
    setAvailableUsers(db.getCollection('users'));
  }, [currentUser]);

  const handleSetCurrentUser = (user: User) => {
    api.setCurrentUser(user);
    setCurrentUserState({ ...user });
    localStorage.setItem(USER_ID_KEY, user.id);
  };

  const handleSetCampusId = (campusId: string) => {
    api.setCurrentCampusId(campusId);
    setCurrentCampusIdState(campusId);
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await api.login(credentials);
    if (res.success && res.data.user) {
      handleSetCurrentUser(res.data.user);
      setToken(res.data.token);
      setIsAuthenticated(true);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_ID_KEY, res.data.user.id);
      localStorage.removeItem('campus_erp_auth_logged_out');
      if (res.data.user.campusId) {
        handleSetCampusId(res.data.user.campusId);
      }
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const signup = async (data: SignupFormData) => {
    const res = await api.signup(data);
    if (res.success && res.data.user) {
      handleSetCurrentUser(res.data.user);
      setToken(res.data.token);
      setIsAuthenticated(true);
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_ID_KEY, res.data.user.id);
      localStorage.removeItem('campus_erp_auth_logged_out');
      if (res.data.user.campusId) {
        handleSetCampusId(res.data.user.campusId);
      }
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.setItem('campus_erp_auth_logged_out', 'true');
  };

  const updateProfile = async (updates: UserProfileUpdateData) => {
    const res = await api.updateProfile(currentUser.id, updates);
    if (res.success && res.data) {
      handleSetCurrentUser(res.data);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Failed to update profile' };
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    const res = await api.changePassword(currentUser.id, oldPass, newPass);
    return { success: res.success, message: res.message };
  };

  const requestPasswordReset = async (identifier: string) => {
    const res = await api.requestPasswordReset(identifier);
    return {
      success: res.success,
      resetCode: res.data?.resetCode,
      message: res.message,
    };
  };

  const resetPassword = async (identifier: string, newPass: string) => {
    const res = await api.resetPassword(identifier, newPass);
    return { success: res.success, message: res.message };
  };

  const hasPermission = (module: ERPModule, action: ActionType): boolean => {
    if (currentUser.primaryRole === 'Super Admin') return true;
    const roles = db.getCollection('roles');
    const role = roles.find((r) => r.name === currentUser.primaryRole);
    if (!role) return false;
    const actions = role.permissions[module] || [];
    return actions.includes(action);
  };

  const canAccessModule = (module: ERPModule): boolean => {
    if (currentUser.primaryRole === 'Super Admin') return true;
    return hasPermission(module, 'view');
  };

  const switchPersona = (roleName: UserRoleName) => {
    const users = db.getCollection('users');
    let match = users.find((u) => u.primaryRole === roleName);
    if (!match) {
      match = {
        id: `usr-${roleName.toLowerCase().replace(/\s+/g, '-')}`,
        username: roleName.toLowerCase().replace(/\s+/g, '.'),
        email: `${roleName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
        fullName: `${roleName} Demo User`,
        primaryRole: roleName,
        assignedRoles: [roleName],
        campusId: 'camp-main',
        status: 'Active',
      };
      users.push(match);
      db.updateCollection('users', [...users]);
    }
    handleSetCurrentUser(match);
    setIsAuthenticated(true);
    const mockToken = `erp_jwt_${Date.now()}_${match.id}`;
    setToken(mockToken);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_ID_KEY, match.id);
    localStorage.removeItem('campus_erp_auth_logged_out');
  };

  const currentCampus = allCampuses.find((c) => c.id === currentCampusId) || allCampuses[0] || null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        currentUser,
        currentCampus,
        allCampuses,
        availableUsers,
        setCurrentUser: handleSetCurrentUser,
        setCurrentCampusId: handleSetCampusId,
        hasPermission,
        canAccessModule,
        switchPersona,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
