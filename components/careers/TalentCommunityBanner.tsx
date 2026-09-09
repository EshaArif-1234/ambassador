'use client';

const TalentCommunityBanner = () => {
  return (
    <section className="bg-[#E3E6E6] py-12 md:py-14">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
          Don&apos;t see a job that&apos;s right for you?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
          Join our talent community by sending your CV. We&apos;ll keep you in mind for future openings
          across sales, service, operations, and corporate roles.
        </p>
        <a
          href="mailto:info@ambassador.pk?subject=Join%20Talent%20Community"
          className="mt-6 inline-flex rounded-xl bg-[#0F4C69] px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0d4259]"
        >
          Join Now
        </a>
      </div>
    </section>
  );
};

export default TalentCommunityBanner;
