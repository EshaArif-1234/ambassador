'use client';

const benefits = [
  {
    title: 'Collaborative Teams',
    description: 'Work with experienced sales, service, and operations professionals who share knowledge and support your success.',
  },
  {
    title: 'Support & Leave',
    description: 'Medical support, paid time off, and public holidays.',
  },
  {
    title: 'Growth & Training',
    description: 'Skill development and clear paths across teams and showrooms.',
  },
  {
    title: 'Trusted Brand',
    description: 'Work with a nationwide leader in commercial kitchen equipment.',
  },
];

const BenefitsSection = () => {
  return (
    <section className="bg-white py-10 md:py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F4C69]">Why Join Us</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
            A workplace built on{' '}
            <span className="text-[#E36630]">expertise & integrity</span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="group rounded-2xl border border-gray-100 bg-[#FAFAFA] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0F4C69]/15 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F4C69] text-sm font-bold text-white">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-base font-bold text-gray-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
