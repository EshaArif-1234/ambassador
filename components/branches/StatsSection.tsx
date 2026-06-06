'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: ReactNode;
}

const stats: StatItem[] = [
  {
    value: 4,
    suffix: '',
    label: 'Branches',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  {
    value: 25,
    suffix: '+',
    label: 'Years Experience',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    value: 500,
    suffix: '+',
    label: 'Projects Completed',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    value: 1000,
    suffix: '+',
    label: 'Products Installed',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
  },
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
    <div className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-[#E36630]/30 hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)] transition-all duration-300">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E36630]/10 text-[#E36630] group-hover:bg-[#E36630] group-hover:text-white transition-colors duration-300">
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {stat.icon}
        </svg>
      </div>
      <p className="text-3xl md:text-4xl font-black text-[#E36630] leading-none mb-2 tabular-nums">
        {active ? count : 0}
        {stat.suffix}
      </p>
      <p className="text-sm md:text-base font-bold text-[#0F4C69] leading-snug">{stat.label}</p>
    </div>
  );
};

interface StatsSectionProps {
  className?: string;
}

const StatsSection = ({ className = '' }: StatsSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={`bg-white py-12 md:py-16 border-t border-gray-100 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-3">
            <span className="w-6 h-px bg-[#0F4C69]" />
            Our Impact
            <span className="w-6 h-px bg-[#0F4C69]" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Trusted Across <span className="text-[#E36630]">Pakistan</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
