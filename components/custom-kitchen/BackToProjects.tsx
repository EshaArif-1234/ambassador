'use client';

import React from 'react';
import Link from 'next/link';

const BackToProjects: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="text-center">
        <Link 
          href="/custom-kitchen"
          className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>
      </div>
    </div>
  );
};

export default BackToProjects;
