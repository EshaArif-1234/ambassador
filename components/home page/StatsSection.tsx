'use client';

import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const stats: StatItem[] = [
  { value: 25,   suffix: '+', label: 'Years Experience',  description: 'Serving commercial kitchens since 1999' },
  { value: 500,  suffix: '+', label: 'Products',          description: 'Comprehensive range for every need' },
  { value: 1000, suffix: '+', label: 'Happy Clients',     description: 'Hotels, restaurants & institutions' },
  { value: 13,   suffix: '',  label: 'Industry Sectors',  description: 'From fast food to hospital kitchens' },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return count;
}

const StatCard = ({ stat, active }: { stat: StatItem; active: boolean }) => {
  const count = useCountUp(stat.value, 1800, active);
  return (
    <div className="text-center px-4">
      <p className="text-4xl md:text-5xl font-black text-[#E36630] mb-1">
        {active ? count : 0}
        {stat.suffix}
      </p>
      <p className="text-base font-bold text-[#0F4C69] mb-1">{stat.label}</p>
      <p className="text-sm text-gray-500">{stat.description}</p>
    </div>
  );
};

const StatsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#FAFAFA] py-32">
      <div className="container mx-auto px-4">

        {/* Top label */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest">
            <span className="w-6 h-px bg-[#0F4C69]" />
            Our Track Record
            <span className="w-6 h-px bg-[#0F4C69]" />
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} active={active} />
          ))}
        </div>

        {/* Bottom trust badges */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 flex-wrap">
          {[
            'ISO Certified Manufacturing',
            'Nationwide Delivery & Installation',
            '1-Year Warranty on All Products',
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
              <svg className="w-4 h-4 text-[#0F4C69] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
