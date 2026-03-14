'use client';

import React from 'react';

interface SuccessStateProps {
  title: string;
  message: string;
  buttonText: string;
  onAction: () => void;
  icon?: 'check' | 'email';
}

export default function SuccessState({ 
  title, 
  message, 
  buttonText, 
  onAction, 
  icon = 'check' 
}: SuccessStateProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon === 'check' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          )}
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      <button
        onClick={onAction}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
}
