'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { COLLECTION_PATH, isProductsNavActive } from '@/lib/siteRoutes';

const menuItems = [
  { name: 'Home',           href: '/' },
  { name: 'Products',       href: COLLECTION_PATH },
  { name: 'About',          href: '/about' },
  { name: 'Custom Kitchen', href: '/custom-kitchen' },
  { name: 'Gallery',        href: '/gallery' },
  { name: 'Our Branches',   href: '/branches' },
  { name: 'Contact Us',     href: '/contact-us' },
 
];

const NavigationHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === COLLECTION_PATH
      ? isProductsNavActive(pathname)
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="bg-[#0F4C69] text-white shadow-md sticky top-16 z-40">
      <div className="container mx-auto px-4">

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-12">
          <ul className="flex h-full">
            {menuItems.map((item) => (
              <li key={item.name} className="h-full">
                <Link
                  href={item.href}
                  className={`
                    relative h-full flex items-center px-4 text-sm font-medium transition-colors
                    ${isActive(item.href)
                      ? 'text-[#E36630] border-b-2 border-[#E36630]'
                      : 'text-white hover:text-[#E36630] border-b-2 border-transparent hover:border-[#E36630]/40'
                    }
                  `}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact info — highlighted */}
          <div className="flex items-center shrink-0 divide-x divide-white/20">
            <a
              href="tel:+923314937412"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 transition-colors hover:text-[#E36630]"
            >
              <svg className="w-4 h-4 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white text-sm">+92 331 4937412</span>
            </a>
            <a
              href="tel:+923331166925"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 transition-colors hover:text-[#E36630]"
            >
              <svg className="w-4 h-4 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white text-sm">0333-1166925</span>
            </a>
            <a
              href="tel:042111313106"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 transition-colors hover:text-[#E36630]"
            >
              <svg className="w-4 h-4 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white text-sm">UAN: 042-111-313-106</span>
            </a>
            <a
              href="mailto:info@ambassador.pk"
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 transition-colors hover:text-[#E36630]"
            >
              <svg className="w-4 h-4 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-white text-sm">info@ambassador.pk</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-12">
            {/* Show current page name on mobile */}
            <span className="text-sm font-semibold text-[#E36630]">
              {menuItems.find((item) => isActive(item.href))?.name ?? 'Menu'}
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#E36630] focus:outline-none transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 bg-[#0F4C69] border-t border-white/10 shadow-xl z-50">
              <div className="container mx-auto px-4 py-2">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors
                          ${isActive(item.href)
                            ? 'text-[#E36630] bg-white/10'
                            : 'text-white/80 hover:text-[#E36630] hover:bg-white/5'
                          }
                        `}
                      >
                        {isActive(item.href) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E36630] flex-shrink-0" />
                        )}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Contact info in mobile menu */}
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 pb-2">
                  <a href="tel:+923314937412" className="flex items-center gap-2 px-3 py-2 bg-[#E36630] rounded-lg text-xs font-semibold text-white">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    PAK: +92 331 4937412
                  </a>
                  <a href="tel:+923331166925" className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-xs font-semibold text-white border border-white/20">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    0333-1166925
                  </a>
                  <a href="tel:042111313106" className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-xs font-semibold text-white border border-white/20">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    UAN: 042-111-313-106
                  </a>
                  <a href="mailto:info@ambassador.pk" className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-xs font-semibold text-white border border-white/20">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@ambassador.pk
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default NavigationHeader;
