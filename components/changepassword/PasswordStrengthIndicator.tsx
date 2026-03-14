'use client';

import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    if (strength === 0) return { text: '', color: '' };
    if (strength <= 2) return { text: 'Weak', color: 'text-red-500' };
    if (strength <= 3) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!passwordStrength.text) return null;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Password strength:</span>
        <span className={`text-xs font-medium ${passwordStrength.color}`}>
          {passwordStrength.text}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            passwordStrength.color === 'text-red-500' ? 'bg-red-500' :
            passwordStrength.color === 'text-yellow-500' ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{
            width: passwordStrength.text === 'Weak' ? '33%' :
                   passwordStrength.text === 'Medium' ? '66%' : '100%'
          }}
        />
      </div>
    </div>
  );
}
