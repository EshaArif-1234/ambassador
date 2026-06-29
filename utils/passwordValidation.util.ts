export type PasswordValidationErrors = {
  newPassword?: string;
  confirmPassword?: string;
  oldPassword?: string;
};

/** Matches /api/auth/change-password server rules. */
export function validateNewPassword(
  newPassword: string,
  options?: { oldPassword?: string }
): string | undefined {
  if (!newPassword) return 'New password is required.';
  if (newPassword.length < 8) return 'Password must be at least 8 characters.';
  if (newPassword.length > 128) return 'Password must be less than 128 characters.';
  if (!/[a-z]/.test(newPassword)) return 'Password must contain at least one lowercase letter.';
  if (!/[A-Z]/.test(newPassword)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(newPassword)) return 'Password must contain at least one number.';
  if (options?.oldPassword && options.oldPassword === newPassword) {
    return 'New password must be different from the current password.';
  }
  return undefined;
}

export function validatePasswordChange(input: {
  oldPassword?: string;
  newPassword: string;
  confirmPassword: string;
  requireOldPassword?: boolean;
}): PasswordValidationErrors {
  const errors: PasswordValidationErrors = {};

  if (input.requireOldPassword && !input.oldPassword?.trim()) {
    errors.oldPassword = 'Current password is required.';
  }

  const newPasswordError = validateNewPassword(input.newPassword, {
    oldPassword: input.oldPassword,
  });
  if (newPasswordError) errors.newPassword = newPasswordError;

  if (!input.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (input.newPassword !== input.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
