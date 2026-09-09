'use client';

import Image from 'next/image';
import Link from 'next/link';

const SectionLabel = ({ children }: { children: string }) => (
  <span className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#0F4C69]">
    <span className="h-px w-8 bg-[#0F4C69]" />
    {children}
    <span className="h-px w-8 bg-[#0F4C69]" />
  </span>
);

const CultureSections = () => {
  return (
    <>
      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <SectionLabel>Our Heritage</SectionLabel>
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            A Legacy of <span className="text-[#E36630]">Quality</span>
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
          <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-gray-600 md:text-lg">
            For over 15 years, Ambassador has supplied commercial kitchens across Pakistan with
            world-class equipment, expert consultation, and dependable after-sales support. When you
            join our team, you become part of that trusted legacy.
          </p>
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-16 md:py-20">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/Images/home/installed-kitchen.png"
              alt="Commercial kitchen installation by Ambassador"
              width={640}
              height={480}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E36630]" />
          </div>
          <div>
            <SectionLabel>What We Do</SectionLabel>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              World-Class{' '}
              <span className="text-[#E36630]">Kitchen Solutions</span>
            </h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
            <p className="mt-6 text-base leading-relaxed text-gray-600">
              From restaurants and hotels to bakeries and institutional kitchens, our teams design,
              supply, install, and service professional equipment nationwide. You&apos;ll work alongside
              experts who understand the food service industry inside and out.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex rounded-xl bg-[#0F4C69] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d4259]"
            >
              Learn About Ambassador
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SectionLabel>Our People</SectionLabel>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              15+ Years of Excellence{' '}
              <span className="text-[#E36630]">and Counting</span>
            </h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-[#E36630]" />
            <p className="mt-6 text-base leading-relaxed text-gray-600">
              Our showrooms in Lahore and Rawalpindi, skilled service teams, and dedicated sales
              professionals have earned the trust of 1,200+ clients. We invest in training, fair
              growth opportunities, and a workplace built on integrity.
            </p>
            <Link
              href="/branches"
              className="mt-6 inline-flex rounded-xl border-2 border-[#0F4C69] px-6 py-2.5 text-sm font-semibold text-[#0F4C69] transition-colors hover:bg-[#0F4C69] hover:text-white"
            >
              Visit Our Branches
            </Link>
          </div>
          <div className="relative order-1 overflow-hidden rounded-2xl shadow-xl lg:order-2">
            <Image
              src="/Images/about/chef.jpg"
              alt="Ambassador team and commercial kitchen professionals"
              width={640}
              height={480}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E36630]" />
          </div>
        </div>
      </section>
    </>
  );
};

export default CultureSections;
