'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';

type CategoryItem = { title: string; slug?: string; image?: string };

const Header = () => {
  const router = useRouter();
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (selectedCategoryTitle) params.set('category', selectedCategoryTitle);
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
            <div className="flex min-h-[44px] min-w-0 flex-1 rounded-l-full border border-r-0 border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
              <label htmlFor="header-search" className="sr-only">
                Search for products
              </label>
              <input
                id="header-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-l-full border-0 bg-transparent py-2.5 pl-4 pr-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:py-3 sm:pl-5 sm:text-[15px]"
              />
              <div className="hidden h-auto w-px shrink-0 bg-gray-200 sm:my-2.5 sm:block" aria-hidden />
              <div className="relative flex shrink-0 border-l border-gray-200/80 sm:border-l-0" ref={categoriesRef}>
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
                      onClick={() => {
                        setSelectedCategoryTitle(null);
                        setIsCategoryOpen(false);
                      }}
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
                            onClick={() => {
                              setSelectedCategoryTitle(cat.title);
                              setIsCategoryOpen(false);
                            }}
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
                              <p className="text-xs text-gray-600">Qty: {item.quantity} | ₹{item.price.toLocaleString()}</p>
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
                          ₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
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
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#E36630] flex items-center justify-center text-white text-sm font-semibold">
                      {user.initials}
                    </div>
                  )}
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7 9" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {/* Show Dashboard link for admin users */}
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-[#E36630] hover:bg-[#E36630]/5 transition-colors font-medium"
                        >
                          📊 Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
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