/** Shared auth field validation for signup and API routes. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FULL_NAME_RE = /^[a-zA-Z\s]+$/;

export function validateFullName(value: string): string | null {
  const name = value.trim();
  if (!name) return 'Full name is required';
  if (name.length < 2) return 'Full name must be at least 2 characters';
  if (name.length > 100) return 'Full name must be less than 100 characters';
  if (!FULL_NAME_RE.test(name)) return 'Full name can only contain letters and spaces';
  return null;
}

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address';
  if (email.length > 100) return 'Email must be less than 100 characters';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 50) return 'Password must be less than 50 characters';
  if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character (@$!%*?&)';
  return null;
}

/** Server-side password rules (subset aligned with register API). */
export function validatePasswordForApi(value: string): string | null {
  if (!value) return 'Password is required.';
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

export function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  return strength;
}

export const PASSWORD_CHECKLIST: { label: string; test: (p: string) => boolean }[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[@$!%*?&]/.test(p) },
];

export function strengthLabel(strength: number): string {
  if (strength <= 2) return 'Weak';
  if (strength <= 4) return 'Medium';
  return 'Strong';
}

export function strengthBarClass(strength: number): string {
  if (strength <= 2) return 'bg-red-500';
  if (strength <= 4) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function strengthTextClass(strength: number): string {
  if (strength <= 2) return 'text-red-500';
  if (strength <= 4) return 'text-yellow-500';
  return 'text-green-500';
}

export interface SignupFields {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateSignupForm(fields: SignupFields): Record<string, string> {
  const errors: Record<string, string> = {};
  const fullNameErr = validateFullName(fields.fullName);
  const emailErr = validateEmail(fields.email);
  const passwordErr = validatePassword(fields.password);
  const confirmErr = validateConfirmPassword(fields.password, fields.confirmPassword);

  if (fullNameErr) errors.fullName = fullNameErr;
  if (emailErr) errors.email = emailErr;
  if (passwordErr) errors.password = passwordErr;
  if (confirmErr) errors.confirmPassword = confirmErr;

  return errors;
}
