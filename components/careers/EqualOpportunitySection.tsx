'use client';

import { useState } from 'react';

const EqualOpportunitySection = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const items = [
    {
      id: 'diversity',
      title: 'Diversity & Inclusion Statement',
      body:
        'Ambassador is committed to providing equal employment opportunities to all individuals regardless of race, color, religion, gender, national origin, age, disability, or marital status. We value diverse perspectives and strive to maintain an inclusive workplace where every team member can contribute and grow.',
    },
    {
      id: 'posters',
      title: 'Recruitment & Workplace Policies',
      body:
        'Our recruitment practices follow applicable labor laws in Pakistan. Job offers are based on qualifications, experience, and role requirements. For questions about workplace policies or recruitment standards, please contact info@ambassador.pk.',
    },
  ];

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#0F4C69]/10 text-[#0F4C69]">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Equal Opportunity Employer</h2>
        <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
          Ambassador provides equal employment opportunities to all employees and applicants without
          regard to legally protected characteristics. We are committed to a fair, respectful, and
          professional work environment across all our showrooms and offices.
        </p>

        <div className="mt-8 space-y-2 text-left">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-[#0F4C69] hover:bg-gray-50"
                >
                  {item.title}
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen ? (
                  <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                    {item.body}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EqualOpportunitySection;
