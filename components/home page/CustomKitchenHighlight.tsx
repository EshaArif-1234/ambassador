'use client';

import Image from 'next/image';
import Link from 'next/link';

const highlights = [
  {
    title: 'Site survey & measurements',
    text: 'We visit your venue, assess workflow, and take accurate measurements for a layout that fits your space.',
  },
  {
    title: '2D & 3D kitchen design',
    text: 'Engineers translate your requirements into precise plans and visual models using professional design tools.',
  },
  {
    title: 'Approval before fabrication',
    text: 'Nothing is manufactured until you sign off — so the build matches exactly what you agreed to.',
  },
  {
    title: 'Installation by our team',
    text: 'Trained installers fit your kitchen with Ambassador equipment and supervise quality through handover.',
  },
];

/** Home-page spotlight for flagship Custom Kitchen — copy stays aligned with `/custom-kitchen`. */
const CustomKitchenHighlight = () => (
  <section className="relative overflow-hidden border-t border-white/10 bg-[#0F4C69] text-white">
    <div
      className="pointer-events-none absolute -right-20 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#E36630]/10 blur-3xl sm:-right-24 sm:h-64 sm:w-64 md:-right-32 md:h-[480px] md:w-[480px]"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 py-10 sm:py-12 md:py-20 lg:py-24">
      <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] min-h-[220px] overflow-hidden rounded-xl shadow-2xl shadow-black/30 ring-1 ring-white/10 sm:min-h-[260px] sm:rounded-2xl md:min-h-[300px] md:aspect-[5/4] lg:aspect-auto lg:h-[min(460px,55vh)] lg:min-h-[340px]">
            <Image
              src="/Images/Nestle-For-Web.webp"
              alt="Custom commercial kitchen design and installation"
              fill
              className="object-cover object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
              priority={false}
            />
          </div>
          <div className="absolute -bottom-2.5 left-0 max-w-[calc(100%-1rem)] rounded-lg bg-[#E36630] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide shadow-lg sm:-bottom-3 sm:left-0 sm:max-w-none sm:rounded-xl sm:px-4 sm:py-2 sm:text-xs md:-bottom-4 md:left-4 md:px-5 md:text-sm">
            Design · Fabricate · Install
          </div>
        </div>

        <div className="order-1 space-y-5 sm:space-y-6 lg:order-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E36630]/90 sm:gap-2 sm:text-sm sm:tracking-widest">
              <span className="h-px w-5 bg-[#E36630] sm:w-8" />
              Flagship service
              <span className="h-px w-5 bg-[#E36630] sm:w-8" />
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.65rem]">
              Turnkey{' '}
              <span className="text-[#E36630]">Custom Kitchens</span>
              <span className="mt-1 block text-lg font-semibold text-white/90 sm:text-2xl md:text-3xl">
                from first call to completion
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75 sm:mt-4 sm:text-base md:text-lg">
              Restaurants and food businesses partner with Ambassador to design commercial kitchens tailored to
              operations — measured on-site, visualised in 2D &amp; 3D, approved by you, then installed by our own
              specialists with customised equipment.
            </p>
          </div>

          <ul className="space-y-3 border-l-2 border-[#E36630]/50 pl-3.5 sm:space-y-3.5 sm:pl-4 md:space-y-4 md:pl-5">
            {highlights.map((item) => (
              <li key={item.title}>
                <p className="text-sm font-semibold text-white sm:text-base">{item.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-white/65 sm:text-sm">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-2">
            <Link
              href="/custom-kitchen"
              className="inline-flex w-full justify-center rounded-lg bg-[#E36630] px-5 py-3 text-center text-xs font-semibold text-white shadow-lg shadow-orange-950/40 transition-colors hover:bg-[#cc5a2a] sm:w-auto sm:px-7 sm:py-3.5 sm:text-sm md:text-base"
            >
              See how custom kitchen works
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex w-full justify-center rounded-lg border-2 border-white/35 bg-white/5 px-5 py-3 text-center text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10 sm:w-auto sm:px-7 sm:py-3.5 sm:text-sm md:text-base"
            >
              Request a consultation
            </Link>
          </div>
          <p className="text-[11px] leading-relaxed text-white/45 sm:text-xs md:text-sm">
            Same journey and portfolio detail on our{' '}
            <Link
              href="/custom-kitchen"
              className="font-medium text-[#E36630]/90 underline underline-offset-2 hover:text-[#ffa066]"
            >
              Custom Kitchen Services
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default CustomKitchenHighlight;
