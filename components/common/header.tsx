'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';

type CategoryItem = { title: string; slug?: string; image?: string };

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const { cartItems, removeFromCart, cartCount } = useCart();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch('/api/categories');
        const json = await res.json();
        if (!cancelled && json?.success && Array.isArray(json.data)) {
          setCategories(json.data as CategoryItem[]);
        }
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Keep header search UI in sync when viewing /products (search OR category, not both) */
  useEffect(() => {
    if (pathname !== '/products') return;
    const urlQ = urlSearchParams.get('search') ?? '';
    const urlCat = urlSearchParams.get('category');
    if (urlQ.trim()) {
      setSearchQuery(urlQ);
      setSelectedCategoryTitle(null);
    } else {
      setSearchQuery('');
      setSelectedCategoryTitle(urlCat || null);
    }
  }, [pathname, urlSearchParams]);

  const buildProductsHref = (params: URLSearchParams) => {
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  /** Drop ?search= from URL and show all products (keeps category if set). */
  const clearSearchFromUrl = () => {
    const params = new URLSearchParams();
    const cat = urlSearchParams.get('category');
    if (cat) params.set('category', cat);
    router.replace(buildProductsHref(params));
  };

  /** Product name search — all categories, case-insensitive on the server */
  const runProductSearch = (query: string) => {
    const q = query.trim();
    setSearchQuery(q);
    setSelectedCategoryTitle(null);
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    router.push(buildProductsHref(params));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clearing the field must clear ?search= from the URL (not only local state)
    if (
      pathname === '/products' &&
      !value.trim() &&
      urlSearchParams.get('search')?.trim()
    ) {
      clearSearchFromUrl();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (pathname === '/products' && urlSearchParams.get('search')?.trim()) {
      clearSearchFromUrl();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runProductSearch(searchQuery);
  };

  /** Category browse — no text search filter applied */
  const selectCategory = (title: string | null) => {
    setSelectedCategoryTitle(title);
    setSearchQuery('');
    setIsCategoryOpen(false);
    const params = new URLSearchParams();
    if (title) params.set('category', title);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2 sm:flex-nowrap sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/Images/home/logo.webp"
              alt="Logo"
              width={120}
              height={40}
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* Search + category + submit (combined control) */}
          <form
            onSubmit={handleSearch}
            className="order-3 flex w-full min-w-0 max-w-4xl flex-1 basis-full items-stretch sm:order-none sm:basis-auto sm:px-2 md:mx-2 lg:mx-4 xl:max-w-5xl xl:mx-6"
          >
            <div className="flex min-h-[44px] min-w-0 flex-1 items-center rounded-l-full border border-r-0 border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              <label htmlFor="header-search" className="sr-only">
                Search for products
              </label>
              <input
                id="header-search"
                type="text"
                role="searchbox"
                enterKeyHint="search"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search for products"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-l-full border-0 bg-transparent py-2.5 pl-4 pr-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:py-3 sm:pl-5 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="mr-1 flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
              <div className="hidden h-auto w-px shrink-0 bg-gray-200 sm:my-2.5 sm:block" aria-hidden />
              <div
                className="relative flex shrink-0 self-stretch border-l border-gray-200/80 sm:border-l-0"
                ref={categoriesRef}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen((v) => !v)}
                  aria-expanded={isCategoryOpen}
                  aria-haspopup="listbox"
                  className="flex h-full max-w-[9.5rem] items-center gap-1.5 border-0 bg-transparent py-2 pl-2 pr-3 text-left text-xs font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50/80 focus-visible:ring-2 focus-visible:ring-[#E36630]/30 sm:max-w-[12rem] sm:gap-2 sm:px-3.5 sm:text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {selectedCategoryTitle ?? 'All Categories'}
                  </span>
                  <svg
                    className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform sm:h-4 sm:w-4 ${isCategoryOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoryOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1.5 w-[min(calc(100vw-2rem),18rem)] max-h-[min(22rem,70vh)] overflow-y-auto rounded-xl border border-gray-200/90 bg-white py-1 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] sm:w-72"
                    role="listbox"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedCategoryTitle === null}
                      onClick={() => selectCategory(null)}
                      className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedCategoryTitle === null
                          ? 'bg-[#0F4C69] font-medium text-white'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categoriesLoading ? (
                      <div className="space-y-2 px-3 py-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-9 animate-pulse rounded-lg bg-gray-100" />
                        ))}
                      </div>
                    ) : (
                      categories.map((cat) => {
                        const active = selectedCategoryTitle === cat.title;
                        return (
                          <button
                            key={cat.slug || cat.title}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => selectCategory(cat.title)}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                              active
                                ? 'bg-[#0F4C69] font-medium text-white'
                                : 'text-gray-800 hover:bg-gray-50'
                            }`}
                          >
                            {cat.title}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="flex h-auto min-w-[48px] shrink-0 items-center justify-center rounded-r-full border border-gray-200/90 border-l-0 bg-[#E36630] px-5 text-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:bg-[#cc5a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E36630]/45 focus-visible:ring-offset-2"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Right Section - Cart and Auth */}
          <div className="flex items-center space-x-4">
            {/* Cart with Dropdown */}
            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 text-gray-700 hover:text-[#E36630] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-[#E36630] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200">
                  <div className="p-4">
                    <h3 className="text-lg text-[#000000] font-semibold mb-3">Shopping Cart</h3>
                    
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-600">Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 relative">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 text-sm truncate">{item.title}</h4>
                              <p className="text-xs text-gray-600">Qty: {item.quantity} | PKR {item.price.toLocaleString()}</p>
                            </div>
                            
                            <button
                              onClick={() => removeFromCart(index)}
                              className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-[#000000]">Total:</span>
                        <span className="font-bold text-[#000000] text-lg">
                          PKR {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                        </span>
                      </div>
                      <button 
                        onClick={handleCheckout}
                        className="w-full bg-[#E36630] text-white py-2 px-4 rounded-lg hover:bg-[#cc5a2a] transition-colors"
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Auth Buttons */}
            {user ? (
              <div className="relative" ref={profileRef}>
                {/* Avatar trigger */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  {user.profileImage ? (
                    <Image src={user.profileImage} alt="Profile" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#E36630]/30" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#E36630] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#E36630]/20 select-none">
                      {user.initials}
                    </div>
                  )}
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown — admin gets a simple panel, regular users get the full menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-[#0F4C69]/5 to-[#E36630]/5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'admin' ? (
                      /* Admin — just dashboard + logout */
                      <div className="py-1">
                        <Link href="/admin" onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#E36630] font-medium hover:bg-[#E36630]/5 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          Dashboard
                        </Link>
                        <button onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      /* Regular user — full menu */
                      <div className="py-1">
                        {[
                          {
                            label: 'Manage My Account', href: '/profile',
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />,
                          },
                          {
                            label: 'My Orders', href: '/orders',
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
                          },
                          {
                            label: 'My Wishlist & Followed Stores', href: '/wishlist',
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                          },
                          {
                            label: 'My Reviews', href: '/my-reviews',
                            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
                          },
                          {
                            label: 'My Cancellations', href: '/returns',
                            icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></>,
                          },
                        ].map(({ label, href, icon }) => (
                          <Link key={href} href={href} onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#E36630] transition-colors group">
                            <svg className="w-[22px] h-[22px] shrink-0 text-gray-400 group-hover:text-[#E36630] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {icon}
                            </svg>
                            <span className="truncate">{label}</span>
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { logout(); setIsProfileOpen(false); }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors group">
                            <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-[#E36630] transition-colors font-medium">
                  Login
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-[#E36630] text-white rounded-lg hover:bg-[#cc5a2a] transition-colors font-medium">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;