'use client';

import React from 'react';
import Image from 'next/image';

interface AuthHeaderProps {
  title: string;
  description: string;
}

export default function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="text-center mb-6">
      <div className="mb-4">
        <Image
          src="/Images/home/logo.webp"
          alt="Ambassadors Logo"
          width={120}
          height={40}
          className="h-10 w-auto mx-auto"
        />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
