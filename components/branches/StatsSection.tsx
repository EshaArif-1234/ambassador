'use client';

import { useEffect, useState } from 'react';

interface StatsSectionProps {
  className?: string;
}

const StatsSection = ({ className = "" }: StatsSectionProps) => {
  const [counters, setCounters] = useState({
    branches: 0,
    years: 0,
    projects: 0,
    products: 0
  });

  const targetValues = {
    branches: 4,
    years: 15,
    projects: 500,
    products: 1000
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const interval = setInterval(() => {
      setCounters(prev => {
        const newCounters = { ...prev };
        let allComplete = true;

        Object.keys(newCounters).forEach(key => {
          const target = targetValues[key as keyof typeof targetValues];
          if (newCounters[key as keyof typeof newCounters] < target) {
            const increment = Math.ceil(target / steps);
            newCounters[key as keyof typeof newCounters] = Math.min(
              newCounters[key as keyof typeof newCounters] + increment,
              target
            );
            allComplete = false;
          }
        });

        if (allComplete) {
          clearInterval(interval);
        }

        return newCounters;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`py-20 bg-[#ff6900] ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Branches */}
            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {counters.branches}+
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Branches
                </p>
              </div>
            </div>

            {/* Years Experience */}
            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {counters.years}+
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Years Experience
                </p>
              </div>
            </div>

            {/* Projects Completed */}
            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {counters.projects}+
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Projects Completed
                </p>
              </div>
            </div>

            {/* Products Installed */}
            <div className="text-center group">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m0 6l8 4 8-4m-8-6v6m0 0V7m0 6l-8-4-8 4m8 6l8-4m-8 6v-6" />
                  </svg>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {counters.products}+
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  Products Installed
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
