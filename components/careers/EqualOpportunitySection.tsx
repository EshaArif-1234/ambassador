'use client';

const EqualOpportunitySection = () => {
  return (
    <section className="bg-[#FAFAFA] py-8 md:py-10">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">Equal Opportunity Employer</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Ambassador provides equal employment opportunities to all applicants and employees without regard
          to legally protected characteristics. Hiring decisions are based on qualifications, experience,
          and role requirements. For questions, contact{' '}
          <a href="mailto:info@ambassador.pk" className="font-medium text-[#0F4C69] hover:underline">
            info@ambassador.pk
          </a>
          .
        </p>
      </div>
    </section>
  );
};

export default EqualOpportunitySection;
