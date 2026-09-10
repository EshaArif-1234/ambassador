'use client';



import Link from 'next/link';

import { useState } from 'react';

import { usePathname } from 'next/navigation';

import { CAREERS_PATH, PRODUCTS_PATH, SPARE_PARTS_PATH, isProductsNavActive } from '@/lib/siteRoutes';



const primaryMenuItems = [

  { name: 'Home',           href: '/' },

  { name: 'Products',       href: PRODUCTS_PATH },

  { name: 'Spare Parts',    href: SPARE_PARTS_PATH },

  { name: 'Custom Kitchen', href: '/custom-kitchen' },

];



const moreMenuItems = [
  { name: 'About',      href: '/about' },
  { name: 'Gallery',    href: '/gallery' },
  { name: 'Showrooms',  href: '/branches' },
  { name: 'Contact Us', href: '/contact-us' },
];



const allMenuItems = [...primaryMenuItems, ...moreMenuItems];



const CareersIcon = ({ className }: { className?: string }) => (

  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>

    <path

      strokeLinecap="round"

      strokeLinejoin="round"

      strokeWidth={2}

      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"

    />

  </svg>

);



const navLinkClass = (active: boolean) =>

  `

    relative h-full flex items-center px-4 text-sm font-medium transition-colors

    ${active

      ? 'text-[#E36630] border-b-2 border-[#E36630]'

      : 'text-white hover:text-[#E36630] border-b-2 border-transparent hover:border-[#E36630]/40'

    }

  `;



const NavigationHeader = () => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);

  const pathname = usePathname();



  const isActive = (href: string) =>

    href === PRODUCTS_PATH

      ? isProductsNavActive(pathname)

      : pathname === href || pathname.startsWith(href + '/');



  const careersActive = isActive(CAREERS_PATH);

  const moreActive = moreMenuItems.some((item) => isActive(item.href));

  const activePageName =

    careersActive

      ? 'Careers'

      : allMenuItems.find((item) => isActive(item.href))?.name ?? 'Menu';



  const closeMobileMenu = () => {

    setIsMobileMenuOpen(false);

    setIsMobileMoreOpen(false);

  };



  return (

    <nav className="bg-[#0F4C69] text-white shadow-md sticky top-16 z-40">

      <div className="container mx-auto px-4">



        {/* Desktop Navigation */}

        <div className="hidden md:flex items-center justify-between h-12">

          <ul className="flex h-full">

            {primaryMenuItems.map((item) => (

              <li key={item.name} className="h-full">

                <Link href={item.href} className={navLinkClass(isActive(item.href))}>

                  {item.name}

                </Link>

              </li>

            ))}



            <li

              className="relative h-full"

              onMouseEnter={() => setIsMoreOpen(true)}

              onMouseLeave={() => setIsMoreOpen(false)}

            >

              <button

                type="button"

                onClick={() => setIsMoreOpen((open) => !open)}

                className={navLinkClass(moreActive)}

                aria-expanded={isMoreOpen}

                aria-haspopup="true"

              >

                More

                <svg

                  className={`ml-1 h-3.5 w-3.5 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}

                  fill="none"

                  stroke="currentColor"

                  viewBox="0 0 24 24"

                  aria-hidden

                >

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                </svg>

              </button>



              {isMoreOpen && (
                <div className="absolute left-0 top-full z-50 pt-2">
                  <div className="min-w-[240px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-[0_16px_48px_rgba(15,76,105,0.18)] ring-1 ring-black/5">
                    <div className="mx-3 mb-2 border-b border-gray-100 pb-2">
                      <p className="text-xs font-bold text-gray-900">More Pages</p>
                      <p className="text-[10px] text-gray-500">Explore Ambassador</p>
                    </div>

                    {moreMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={`
                          mx-2 block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors
                          ${isActive(item.href)
                            ? 'bg-[#E36630]/10 text-[#E36630]'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-[#0F4C69]'
                          }
                        `}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </li>



            <li className="ml-2 flex items-center self-center border-l border-white/15 pl-3">

              <Link

                href={CAREERS_PATH}

                className={`

                  inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold shadow-md transition-all

                  ${careersActive

                    ? 'bg-white text-[#E36630] ring-2 ring-white/40'

                    : 'bg-[#E36630] text-white hover:bg-[#cc5a2a] hover:shadow-lg'

                  }

                `}

              >

                <CareersIcon className="h-4 w-4 shrink-0" />

                Careers

                <span

                  className={`

                    ml-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide

                    ${careersActive ? 'bg-[#E36630]/10 text-[#E36630]' : 'bg-white/20 text-white'}

                  `}

                >

                  Hiring

                </span>

              </Link>

            </li>

          </ul>



          {/* Contact info — highlighted */}

          <div className="flex items-center shrink-0 divide-x divide-white/20">

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

              href="tel:+923314937412"

              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 transition-colors hover:text-[#E36630]"

            >

              <svg className="w-4 h-4 shrink-0 text-[#E36630]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />

              </svg>

              <span className="text-white text-sm">UAN: +923363333111</span>

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

          </div>

        </div>



        {/* Mobile Navigation */}

        <div className="md:hidden">

          <div className="flex items-center justify-between h-12">

            <span className="text-sm font-semibold text-[#E36630]">{activePageName}</span>

            <button

              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}

              className="text-white hover:text-[#E36630] focus:outline-none transition-colors"

              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}

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



          {isMobileMenuOpen && (

            <div className="absolute left-0 right-0 bg-[#0F4C69] border-t border-white/10 shadow-xl z-50">

              <div className="container mx-auto px-4 py-2">

                <Link

                  href={CAREERS_PATH}

                  onClick={closeMobileMenu}

                  className={`

                    mb-3 flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-md transition-colors

                    ${careersActive

                      ? 'bg-white text-[#E36630]'

                      : 'bg-[#E36630] text-white hover:bg-[#cc5a2a]'

                    }

                  `}

                >

                  <span className="flex items-center gap-2">

                    <CareersIcon className="h-4 w-4 shrink-0" />

                    Careers — Join Our Team

                  </span>

                  <span

                    className={`

                      rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide

                      ${careersActive ? 'bg-[#E36630]/10 text-[#E36630]' : 'bg-white/20 text-white'}

                    `}

                  >

                    Hiring

                  </span>

                </Link>



                <ul className="space-y-1">

                  {primaryMenuItems.map((item) => (

                    <li key={item.name}>

                      <Link

                        href={item.href}

                        onClick={closeMobileMenu}

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



                  <li>

                    <button

                      type="button"

                      onClick={() => setIsMobileMoreOpen((open) => !open)}

                      className={`

                        flex w-full items-center justify-between gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors

                        ${moreActive

                          ? 'text-[#E36630] bg-white/10'

                          : 'text-white/80 hover:text-[#E36630] hover:bg-white/5'

                        }

                      `}

                      aria-expanded={isMobileMoreOpen}

                    >

                      <span className="flex items-center gap-2">

                        {moreActive && (

                          <span className="w-1.5 h-1.5 rounded-full bg-[#E36630] flex-shrink-0" />

                        )}

                        More

                      </span>

                      <svg

                        className={`h-4 w-4 transition-transform ${isMobileMoreOpen ? 'rotate-180' : ''}`}

                        fill="none"

                        stroke="currentColor"

                        viewBox="0 0 24 24"

                        aria-hidden

                      >

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                      </svg>

                    </button>



                    {isMobileMoreOpen && (
                      <ul className="mt-2 space-y-1 rounded-xl bg-white p-2 shadow-lg">
                        {moreMenuItems.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={closeMobileMenu}
                              className={`
                                block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                                ${isActive(item.href)
                                  ? 'bg-[#E36630]/10 text-[#E36630]'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#0F4C69]'
                                }
                              `}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                  </li>

                </ul>



                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 pb-2">

                  <a href="tel:+923314937412" className="flex items-center gap-2 px-3 py-2 bg-[#E36630] rounded-lg text-xs font-semibold text-white">

                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />

                    </svg>

                    PAK: 0333-1166925

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

