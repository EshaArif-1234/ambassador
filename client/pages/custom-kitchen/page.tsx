'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPublishedCaseStudies } from '@/client/data/customKitchenCases';

const projects = getPublishedCaseStudies().map((c) => ({
  image: c.cardImage,
  alt: c.cardAlt,
  title: c.cardTitle,
  description: c.cardDescription,
  href: `/custom-kitchen/${c.slug}`,
}));

const steps = [
  {
    step: '01',
    title: 'Consultation',
    description: 'Understand your brief, menus, throughput, and budget — restaurants call us to start the conversation.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Site visit & surveys',
    description: 'We visit your site, assess workflow lines, drainage, ventilation, services, and take accurate measurements.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: '2D & 3D design',
    description: 'Engineers lay out workflows in CAD and produce visuals in 3D so you see the kitchen before fabrication.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Your approval',
    description: 'Designs & equipment lists move to production only after you approve — revisions until you confirm.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Fabrication',
    description: 'Custom stainless steel benches, cupboards, ducts, hoods — built to drawings and Pakistani site conditions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    step: '06',
    title: 'Installation & handover',
    description: 'Our own installation teams fit equipment, commission services, test performance, and hand over with training.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const CustomKitchenPage = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Banner ───────────────────────────────────── */}
      <div className="relative h-96 md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
        <Image
          src="/Images/custom-kitchen-dark.jpg"
          alt="Custom Kitchen Solutions"
          fill
          className="object-cover"
          priority
          style={{ objectPosition: 'center center' }}
        />
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Custom Kitchen Solutions
            </h1>
            <p className="text-xl md:text-2xl text-white/80 drop-shadow-lg max-w-2xl mx-auto">
              Site surveys, 2D &amp; 3D design with your sign-off, fabrication, and turnkey installation by Ambassador experts.
            </p>
          </div>
        </div>
      </div>

      {/* ── Projects Section ─────────────────────────── */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              Our Portfolio
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Custom Kitchen{' '}
              <span className="text-[#E36630]">Projects</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our portfolio of custom kitchen installations — from planning and design to complete turnkey solutions.
            </p>
            <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.href}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-[#E36630] hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#E36630] transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E36630] hover:text-[#cc5a2a] transition-colors"
                  >
                    View Project Detail
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Design Process ───────────────────────────── */}
      <section className="bg-[#FAFAFA] py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">

          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F4C69] uppercase tracking-widest mb-4">
              <span className="w-8 h-px bg-[#0F4C69]" />
              How It Works
              <span className="w-8 h-px bg-[#0F4C69]" />
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Our Kitchen{' '}
              <span className="text-[#E36630]">Design Process</span>
            </h2>
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              From enquiry to commissioning — consultations, onsite surveys, 2D/3D approvals, fabrication, installation, and commissioning by Ambassador teams.
            </p>
            <div className="mt-5 w-16 h-1 bg-[#E36630] mx-auto rounded-full" />
          </div>

          {/* Steps */}
          <div className="relative mb-10">
            {/* Connector line */}
            <div className="absolute top-7 left-0 right-0 hidden md:block">
              <div className="mx-auto max-w-4xl px-16">
                <div className="h-0.5 bg-gradient-to-r from-[#E36630]/20 via-[#E36630] to-[#E36630]/20" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto relative z-10">
              {[
                {
                  step: '01',
                  title: 'Consultation',
                  desc: 'Menu analysis, budget review & site briefing',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Site Survey',
                  desc: 'On-site measurements & space planning',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: '2D/3D Approval',
                  desc: 'Design presentation & client sign-off',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: '04',
                  title: 'Install & Delivered',
                  desc: 'Fabrication, installation & handover',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center gap-3">
                  {/* Circle */}
                  <div className="relative w-14 h-14 rounded-full bg-[#0F4C69] text-white flex items-center justify-center shadow-lg border-4 border-white ring-2 ring-[#E36630]">
                    {item.icon}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E36630] rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug max-w-[120px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process image */}
          <div className="w-full flex justify-center items-center">
            <Image src="/Images/v1.png" alt="Custom Kitchen Design Process" width={1400} height={1000} className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="bg-[#0F4C69] py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
            <span className="w-8 h-px bg-white/30" />
            Get Started
            <span className="w-8 h-px bg-white/30" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Build Your{' '}
            <span className="text-[#E36630]">Custom Kitchen?</span>
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Contact us today for a free consultation and let our experts design the perfect kitchen solution for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#E36630] text-white font-semibold rounded-lg hover:bg-[#cc5a2a] transition-colors"
            >
              Get Free Consultation
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white hover:text-[#0F4C69] transition-colors"
            >
              View Our Products
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CustomKitchenPage;
