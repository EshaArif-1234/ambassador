'use client';

import Link from 'next/link';
import { PRODUCTS_PATH } from '@/lib/siteRoutes';
import { COMPLAINT_PORTAL_URL } from '@/lib/siteLinks';

/** Public routes — keep in sync with main site navigation */
const SERVICE_LINKS = [
  { label: 'Products', href: PRODUCTS_PATH },
  { label: 'Custom kitchen', href: '/custom-kitchen' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About', href: '/about' },
  { label: 'Contact us', href: '/contact-us' },
  { label: 'Our branches', href: '/branches' },
  { label: 'Orders', href: '/orders' },
  { label: 'Complaint', href: COMPLAINT_PORTAL_URL, external: true },
] as const;

const COMPLAINT_LINKS = [
  { label: 'Support center', href: COMPLAINT_PORTAL_URL },
  { label: 'Open a new ticket', href: COMPLAINT_PORTAL_URL },
  { label: 'Check ticket status', href: COMPLAINT_PORTAL_URL },
] as const;

const linkClass =
  'text-xs text-white/60 transition-colors hover:text-[#E36630] sm:text-sm';

const headingClass = 'mb-3 text-base font-semibold sm:mb-4 sm:text-lg';

const columnClass = 'min-w-0 text-left';

const socialBtnClass =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-[#E36630] sm:h-10 sm:w-10';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0F4C69] text-white">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-12 lg:items-start lg:gap-x-6 xl:gap-x-8">
          {/* Our Services */}
          <div className={`${columnClass} lg:col-span-2`}>
            <h3 className={headingClass}>Our Services</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {SERVICE_LINKS.map(({ label, href, ...rest }) => (
                <li key={href}>
                  {'external' in rest && rest.external ? (
                    <a href={href} className={linkClass}>
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className={linkClass}>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Complaint */}
          <div className={`${columnClass} lg:col-span-2`}>
            <h3 className={headingClass}>Complaint</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {COMPLAINT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-white/50 sm:text-sm">
              Report an issue or share feedback through our official complaint portal.
            </p>
          </div>

          {/* Contact Information */}
          <div className={`${columnClass} lg:col-span-3`}>
            <h3 className={headingClass}>Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#E36630] sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="break-words text-xs leading-snug text-white/60 sm:text-sm">
                  5-A Fazal Elahi Road, Rehman Pura Link Ferozpur Road, Lahore, Pakistan.
                </p>
              </div>

              <div className="flex items-start gap-2.5 sm:gap-3">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#E36630] sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p className="text-white/60">
                    <span className="text-white/45">Pak: </span>
                    <a
                      href="tel:+923314937412"
                      className="text-white/70 transition-colors hover:text-[#E36630]"
                    >
                      +92 331 4937412
                    </a>
                  </p>
                  <p className="text-white/60">
                    <span className="text-white/45">UAN: </span>
                    <a
                      href="tel:+9242111313106"
                      className="text-white/70 transition-colors hover:text-[#E36630]"
                    >
                      042-111-313-106
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <svg
                  className="h-4 w-4 shrink-0 text-[#E36630] sm:h-5 sm:w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@ambassador.pk"
                  className="text-xs text-white/60 transition-colors hover:text-[#E36630] sm:text-sm"
                >
                  info@ambassador.pk
                </a>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className={`${columnClass} lg:col-span-2`}>
            <h3 className={headingClass}>Legal</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/privacy-policy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className={linkClass}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social + Newsletter */}
          <div className={`${columnClass} sm:col-span-2 lg:col-span-3`}>
            <h3 className={headingClass}>Follow Us</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href="https://www.facebook.com/AmbassadorcommercialKitchen/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnClass}
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/ambassador_acke/"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnClass}
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/checkpoint/challengesV2/AQFsRpoj65pv0AAAAZzB2Vk_yS9l4P9OarYCPhOE7bnkKg0ub2AFoyQ3gOV_1D-0mk75E5-DLXHHD1bcC2id-LxBMl7mBe0uOg?ut=0dmDCDF5t8RY81"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnClass}
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>

              <a
                href="https://www.youtube.com/@ambassador.official"
                target="_blank"
                rel="noopener noreferrer"
                className={socialBtnClass}
                aria-label="YouTube"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            <div className="mt-5 sm:mt-6">
              <h4 className="mb-1.5 text-xs font-semibold sm:mb-2 sm:text-sm">Newsletter</h4>
              <p className="mb-2.5 text-xs text-white/60 sm:mb-3 sm:text-sm">
                Subscribe to get updates on new products
              </p>
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#E36630] focus:outline-none sm:rounded-r-none sm:text-sm"
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg bg-[#E36630] px-4 py-2 text-xs text-white transition-colors hover:bg-[#cc5a2a] sm:rounded-l-none sm:text-sm"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/20 pt-6 sm:mt-8 sm:pt-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs text-white/60 sm:text-sm">
              © 2024 Ambassador Commercial Kitchen Equipment. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
