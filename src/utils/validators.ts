/**
 * Enterprise Campus Management System (Campus ERP)
 * Unified Field Validation Suite
 * Enforces institutional data integrity across admissions, payroll, HRMS, and finance
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates Pakistani National Identity Card (CNIC / B-Form)
 * Standard pattern: XXXXX-XXXXXXX-X (13 numeric digits total)
 */
export const validateCnic = (cnic: string): ValidationResult => {
  if (!cnic || !cnic.trim()) {
    return { isValid: false, error: 'CNIC / National ID is required.' };
  }
  const clean = cnic.replace(/[^0-9]/g, '');
  if (clean.length !== 13) {
    return {
      isValid: false,
      error: 'CNIC must contain exactly 13 digits (format: 12345-1234567-1).',
    };
  }
  return { isValid: true };
};

/**
 * Validates standard institutional email addresses
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., name@campus.edu).' };
  }
  return { isValid: true };
};

/**
 * Validates contact mobile numbers
 * Accepts Pakistani mobile (+92 / 03xx) and international formats
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Contact phone number is required.' };
  }
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  // Format check: 10 to 14 digits with optional leading +
  const phoneRegex = /^(\+?\d{10,14})$/;
  if (!phoneRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Enter a valid phone number (e.g. 0300-1234567 or +923001234567).',
    };
  }
  return { isValid: true };
};

/**
 * Validates human names (Full Name, Father's Name)
 */
export const validateName = (name: string, fieldLabel = 'Name', minLen = 3): ValidationResult => {
  if (!name || !name.trim()) {
    return { isValid: false, error: `${fieldLabel} is required.` };
  }
  const trimmed = name.trim();
  if (trimmed.length < minLen) {
    return { isValid: false, error: `${fieldLabel} must be at least ${minLen} characters long.` };
  }
  // Check that it contains at least some alphabetic letters
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: `${fieldLabel} must contain alphabetic characters.` };
  }
  return { isValid: true };
};

/**
 * Validates monetary amounts in Pakistani Rupees (PKR)
 */
export const validateAmount = (
  amount: number | string,
  min = 1,
  max = 100000000,
  fieldLabel = 'Amount'
): ValidationResult => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid number.` };
  }
  if (num < min) {
    return { isValid: false, error: `${fieldLabel} must be at least PKR ${min.toLocaleString()}.` };
  }
  if (num > max) {
    return { isValid: false, error: `${fieldLabel} cannot exceed PKR ${max.toLocaleString()}.` };
  }
  return { isValid: true };
};

/**
 * Validates academic percentages (0 to 100)
 */
export const validatePercentage = (
  percent: number | string,
  fieldLabel = 'Percentage',
  min = 0,
  max = 100
): ValidationResult => {
  const num = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldLabel} must be a valid number.` };
  }
  if (num < min || num > max) {
    return { isValid: false, error: `${fieldLabel} must be between ${min}% and ${max}%.` };
  }
  return { isValid: true };
};

/**
 * Validates date ranges (e.g., leave start and end dates)
 */
export const validateDateRange = (
  startDate: string,
  endDate: string,
  startLabel = 'Start Date',
  endLabel = 'End Date'
): ValidationResult => {
  if (!startDate) return { isValid: false, error: `${startLabel} is required.` };
  if (!endDate) return { isValid: false, error: `${endLabel} is required.` };

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end)) {
    return { isValid: false, error: 'Invalid date format selected.' };
  }
  if (end < start) {
    return { isValid: false, error: `${endLabel} cannot be earlier than ${startLabel}.` };
  }
  return { isValid: true };
};

/**
 * Validates usernames (alphanumeric, lowercase, dots, hyphens, 3-25 chars)
 */
export const validateUsername = (username: string): ValidationResult => {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'Username is required.' };
  }
  const clean = username.trim();
  const usernameRegex = /^[a-zA-Z0-9._-]{3,25}$/;
  if (!usernameRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Username must be 3-25 characters (letters, numbers, dots, dashes only).',
    };
  }
  return { isValid: true };
};

/**
 * Validates institutional password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
};
