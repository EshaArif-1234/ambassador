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
  <section className="relative overflow-hidden bg-gradient-to-br from-[#0F4C69] via-[#0d3f59] to-[#082f42] text-white border-t border-white/10">
    <div
      className="pointer-events-none absolute -right-32 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-[#E36630]/10 blur-3xl"
      aria-hidden
    />
    <div className="container relative mx-auto px-4 py-12 md:py-20 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] min-h-[240px] overflow-hidden rounded-2xl shadow-2xl shadow-black/30 ring-1 ring-white/10 lg:aspect-auto lg:h-[min(380px,50vh)] lg:min-h-[280px]">
            <Image
              src="/Images/custom-kitchen-dark.jpg"
              alt="Custom commercial kitchen design and installation"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={false}
            />
          </div>
          <div className="absolute -bottom-3 -left-2 rounded-xl bg-[#E36630] px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-lg md:-bottom-4 md:left-4 md:px-5 md:text-sm">
            Design · Fabricate · Install
          </div>
        </div>

        <div className="order-1 space-y-6 lg:order-2">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[#E36630]/90">
              <span className="h-px w-8 bg-[#E36630]" />
              Flagship service
              <span className="h-px w-8 bg-[#E36630]" />
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl lg:text-[2.65rem]">
              Turnkey{' '}
              <span className="text-[#E36630]">Custom Kitchens</span>
              <span className="block text-white/90 mt-1 text-2xl md:text-3xl font-semibold">
                from first call to completion
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">
 Restaurants and food businesses partner with Ambassador to design commercial kitchens tailored to operations — measured on-site, visualised in 2D &amp; 3D, approved by you, then installed by our own specialists with customised equipment.
            </p>
          </div>

          <ul className="space-y-3.5 border-l-2 border-[#E36630]/50 pl-4 md:space-y-4 md:pl-5">
            {highlights.map((item) => (
              <li key={item.title}>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-sm text-white/65 leading-snug">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/custom-kitchen"
              className="inline-flex justify-center rounded-lg bg-[#E36630] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-950/40 transition-colors hover:bg-[#cc5a2a] md:text-base"
            >
              See how custom kitchen works
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center rounded-lg border-2 border-white/35 bg-white/5 px-7 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/60 hover:bg-white/10 md:text-base"
            >
              Request a consultation
            </Link>
          </div>
          <p className="text-xs text-white/45 md:text-sm">
            Same journey and portfolio detail on our{' '}
            <Link href="/custom-kitchen" className="font-medium text-[#E36630]/90 underline underline-offset-2 hover:text-[#ffa066]">
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
