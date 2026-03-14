'use client';

import { useState, useEffect, useRef } from 'react';

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function OtpInput({
  length,
  value,
  onChange,
  disabled = false,
  placeholder = '',
  className = ''
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) return;
    
    const newValue = [...value];
    newValue[index] = inputValue;
    onChange(newValue);

    // Auto-advance to next input
    if (inputValue && index < (length || 6) - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length || 6);
    const newValue = pastedData.split('').map((char, index) => 
      index < (length || 6) ? char : value[index]
    );
    onChange(newValue);
    
    // Focus next empty input
    const nextEmptyIndex = newValue.findIndex(val => val === '');
    if (nextEmptyIndex !== -1 && nextEmptyIndex < (length || 6)) {
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  return (
    <div className={`flex justify-center space-x-2 ${className}`}>
      {Array.from({ length: length || 6 }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) {
              inputRefs.current[index] = el;
            }
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          placeholder={index === 0 ? placeholder : ''}
          className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black placeholder:text-gray-400 ${
            disabled 
              ? 'border-gray-200 bg-gray-50 text-gray-400' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        />
      ))} 
    </div>
  );
}
