'use client';

import React from 'react';

const StepsSection: React.FC = () => {
  const steps = [
    { step: 1, title: 'Consultation', desc: 'Understanding your requirements' },
    { step: 2, title: 'Design', desc: 'Creating detailed AutoCAD layouts' },
    { step: 3, title: 'Manufacturing', desc: 'Building custom equipment' },
    { step: 4, title: 'Installation', desc: 'Professional setup & testing' }
  ];

  return (
    <div className="container mx-auto px-6 py-16 bg-white">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Our Process
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item) => (
          <div key={item.step} className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-orange-600">{item.step}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsSection;
