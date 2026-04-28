'use client';

import React from 'react';

interface ProjectHighlightsProps {
  items: { value: string; label: string }[];
}

const ProjectHighlights: React.FC<ProjectHighlightsProps> = ({ items }) => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Project <span className="text-[#E36630]">highlights</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">Key numbers from this installation</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50/90 p-5 text-center shadow-sm"
            >
              <div className="mb-2 text-2xl font-bold text-[#E36630] md:text-3xl">{item.value}</div>
              <p className="text-sm font-medium leading-snug text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectHighlights;
