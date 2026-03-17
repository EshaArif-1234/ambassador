'use client';

import Link from 'next/link';
import { useState } from 'react';

const NavigationHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Our Custom Kitchen', href: '/custom-kitchen' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Orders', href: '/orders' },
    { name: 'Our Branches', href: '/branches' },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-16 z-40">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-start h-12">
          <ul className="flex space-x-8">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-white hover:text-orange-500 transition-colors font-medium text-sm"
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
            <div className="text-sm font-medium">Navigation</div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-orange-500 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="absolute left-0 right-0 bg-gray-800 shadow-lg z-50">
              <div className="container mx-auto px-4 py-2">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block py-2 text-white hover:text-orange-500 transition-colors font-medium text-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
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
