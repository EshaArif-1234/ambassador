'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const menuItems = [
  { name: 'Products',       href: '/products' },
  { name: 'About',          href: '/about' },
  { name: 'Custom Kitchen', href: '/custom-kitchen' },
  { name: 'Gallery',        href: '/gallery' },
  { name: 'Contact Us',     href: '/contact-us' },
  { name: 'Orders',         href: '/orders' },
  { name: 'Our Branches',   href: '/branches' },
];

const NavigationHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="bg-[#0F4C69] text-white shadow-md sticky top-16 z-40">
      <div className="container mx-auto px-4">

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-start h-12">
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
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default NavigationHeader;
