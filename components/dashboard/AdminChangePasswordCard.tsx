'use client';

import { useState } from 'react';
import ChangePasswordForm from '@/components/changepassword/ChangePasswordForm';
import { authApi, AuthApiError } from '@/utils/auth.api';
import { validatePasswordChange } from '@/utils/passwordValidation.util';
import { useUser } from '@/contexts/UserContext';
import { isManager } from '@/utils/dashboardRoles';

const AdminChangePasswordCard = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFormChange = (field: 'oldPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, submit: undefined }));
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    const validationErrors = validatePasswordChange({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
      requireOldPassword: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
      setSuccessMessage('Your password has been updated successfully.');
    } catch (error) {
      if (error instanceof AuthApiError && error.errors) {
        setErrors({ ...error.errors, submit: error.message });
      } else {
        setErrors({
          submit: error instanceof Error ? error.message : 'Could not update password. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isManager(user?.role)) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Change admin password</h3>
        <p className="mt-2 text-sm text-gray-600">
          Manager accounts cannot change their password here. Contact a full administrator to reset it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Change admin password</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your dashboard login password. Use at least 8 characters with uppercase, lowercase, and a number.
        </p>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      ) : null}

      <ChangePasswordForm
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        onFormChange={handleFormChange}
        onTogglePassword={() => setShowPassword((v) => !v)}
        onToggleConfirmPassword={() => setShowConfirmPassword((v) => !v)}
        onSubmit={handleSubmit}
        showOldPasswordField
        showOldPassword={showOldPassword}
        onToggleOldPassword={() => setShowOldPassword((v) => !v)}
      />
    </div>
  );
};

export default AdminChangePasswordCard;
