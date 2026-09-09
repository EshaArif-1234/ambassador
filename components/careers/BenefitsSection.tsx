'use client';

const benefits = [
  'Competitive salary packages',
  'Medical support & wellness',
  'Paid time off & public holidays',
  'Performance bonuses',
  'Training & skill development',
  'Career growth opportunities',
  'Showroom & field team support',
  'Employee referral rewards',
  'Safe working environment',
  'Team events & recognition',
  'Equipment industry exposure',
  'Nationwide brand reputation',
];

const BenefitsSection = () => {
  return (
    <section className="bg-[#E3E6E6] py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
            <span className="h-px w-8 bg-[#0F4C69]" />
            Why Join Us
            <span className="h-px w-8 bg-[#0F4C69]" />
          </span>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Reap the Rewards of Our{' '}
            <span className="text-[#E36630]">Benefits Package</span>
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
          <p className="mt-6 text-base leading-relaxed text-gray-600">
            We believe in supporting our people with meaningful benefits, learning opportunities, and a
            culture that values hard work and customer excellence.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F4C69] text-white">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm font-medium text-gray-800 md:text-base">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
