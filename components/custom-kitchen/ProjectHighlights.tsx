'use client';

import React from 'react';

const ProjectHighlights: React.FC = () => {
  const highlights = [
    { value: '900', label: 'sq ft Kitchen Area' },
    { value: '15+', label: 'Equipment Installed' },
    { value: '30', label: 'Days Completion' },
    { value: '✓', label: 'Custom Stainless Steel' }
  ];

  return (
    <div className="container mx-auto px-6 py-16 bg-white">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Project Highlights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {highlights.map((item, index) => (
          <div key={index} className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{item.value}</div>
            <p className="text-gray-700 font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectHighlights;
