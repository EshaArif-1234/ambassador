export const GOOGLE_OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_auth_failed: 'Google sign-in failed. Please try again.',
  google_state_mismatch: 'Sign-in session expired. Please try again.',
  google_admin_blocked: 'Admin accounts must sign in with email and password.',
  google_email_unverified: 'Your Google email is not verified. Use another account.',
  google_not_configured: 'Google sign-in is not configured on this server.',
  account_disabled: 'Your account has been disabled. Please contact support.',
};

export function getGoogleOAuthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return GOOGLE_OAUTH_ERROR_MESSAGES[code] ?? 'Sign-in could not be completed. Please try again.';
}
