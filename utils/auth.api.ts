/**
 * Centralized auth API client.
 * All calls go to /api/auth/* (Next.js route handlers).
 * Cookies are sent automatically by the browser (credentials: 'include').
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiUser {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`/api/auth${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send httpOnly cookie automatically
    ...options,
  });

  const data: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export const authApi = {
  register: (body: RegisterPayload) =>
    request<{ otp: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyOtp: (body: VerifyOtpPayload) =>
    request<{ token: string; user: ApiUser }>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: LoginPayload) =>
    request<{ token: string; user: ApiUser }>('/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<null>('/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: ApiUser }>('/me'),

  forgotPassword: (body: ForgotPasswordPayload) =>
    request<null>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: ResetPasswordPayload) =>
    request<null>('/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
