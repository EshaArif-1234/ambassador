'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';
import {
  catalogueHref,
  COLLECTION_PATH,
  collectionCategoryPath,
  isCatalogueListingPath,
  productDetailPath,
  primaryCategorySlug,
  slugFromCollectionPath,
} from '@/lib/siteRoutes';
import { useStorefrontCategories } from '@/hooks/useStorefrontCategories';

type SearchSuggestion = {
  _id: string;
  name: string;
  images: string[];
  categories?: Array<{ title?: string; slug?: string } | string>;
};

const SEARCH_SUGGESTION_LIMIT = 8;
const SEARCH_MIN_CHARS = 2;
const SEARCH_DEBOUNCE_MS = 280;
const DEFAULT_PRODUCT_IMAGE = '/Images/home/stainless-steal.webp';

function suggestionCategoryTitle(categories: SearchSuggestion['categories']): string {
  if (!categories?.length) return '';
  const first = categories[0];
  return typeof first === 'string' ? first : first?.title ?? '';
}


const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { categories, loading: categoriesLoading } = useStorefrontCategories();
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const cartRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUser();
  const { cartItems, removeFromCart, cartCount } = useCart();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      const categoryTarget = event.target as Node;
      const insideCategoryTrigger = categoriesRef.current?.contains(categoryTarget);
      const insideCategoryMenu = categoryDropdownRef.current?.contains(categoryTarget);
      if (!insideCategoryTrigger && !insideCategoryMenu) {
        setIsCategoryOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Live product suggestions while typing */
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < SEARCH_MIN_CHARS) {
      setSearchSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: q,
          limit: String(SEARCH_SUGGESTION_LIMIT),
          sort: 'name_asc',
        });
        const res = await fetch(`/api/products?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && Array.isArray(json.data)) {
          setSearchSuggestions(json.data as SearchSuggestion[]);
          setSuggestionsOpen(true);
          setActiveSuggestionIndex(-1);
        } else {
          setSearchSuggestions([]);
          setSuggestionsOpen(true);
        }
      } catch {
        if (!cancelled) {
          setSearchSuggestions([]);
          setSuggestionsOpen(true);
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  /** Keep header search UI in sync when viewing the collection (search OR category, not both) */
  useEffect(() => {
    if (!isCatalogueListingPath(pathname)) return;
    const urlQ = urlSearchParams.get('search') ?? '';
    if (urlQ.trim()) {
      setSearchQuery(urlQ);
      setSelectedCategoryTitle(null);
      return;
    }

    setSearchQuery('');

    const slugFromPath = slugFromCollectionPath(pathname);
    if (slugFromPath) {
      const match = categories.find((c) => c.slug === slugFromPath);
      setSelectedCategoryTitle(match?.title ?? null);
      return;
    }

    setSelectedCategoryTitle(urlSearchParams.get('category') || null);
  }, [pathname, urlSearchParams, categories]);

  const buildProductsHref = (params: URLSearchParams) => catalogueHref(params);

  /** Drop ?search= from URL and show all products (keeps category if set). */
  const clearSearchFromUrl = () => {
    const params = new URLSearchParams();
    const cat = urlSearchParams.get('category');
    if (cat) params.set('category', cat);
    router.replace(buildProductsHref(params));
  };

  const closeSuggestions = useCallback(() => {
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
  }, []);

  /** Product name search — all categories, case-insensitive on the server */
  const runProductSearch = (query: string) => {
    const q = query.trim();
    setSearchQuery(q);
    setSelectedCategoryTitle(null);
    closeSuggestions();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    router.push(buildProductsHref(params));
  };

  const openProduct = (productId: string, categorySlug?: string) => {
    closeSuggestions();
    router.push(productDetailPath(productId, categorySlug));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clearing the field must clear ?search= from the URL (not only local state)
    if (
      isCatalogueListingPath(pathname) &&
      !value.trim() &&
      urlSearchParams.get('search')?.trim()
    ) {
      clearSearchFromUrl();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    closeSuggestions();
    if (isCatalogueListingPath(pathname) && urlSearchParams.get('search')?.trim()) {
      clearSearchFromUrl();
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen || searchSuggestions.length === 0) {
      if (e.key === 'Escape') closeSuggestions();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.min(i + 1, searchSuggestions.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSuggestions();
      return;
    }
    if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      const picked = searchSuggestions[activeSuggestionIndex];
      if (picked) openProduct(picked._id, primaryCategorySlug(picked.categories));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSuggestionIndex >= 0 && searchSuggestions[activeSuggestionIndex]) {
      openProduct(
        searchSuggestions[activeSuggestionIndex]._id,
        primaryCategorySlug(searchSuggestions[activeSuggestionIndex].categories)
      );
      return;
    }
    runProductSearch(searchQuery);
  };

  /** Category browse — no text search filter applied */
  const selectCategory = (title: string | null) => {
    setSelectedCategoryTitle(title);
    setSearchQuery('');
    setIsCategoryOpen(false);
    closeSuggestions();
    if (!title) {
      router.push(COLLECTION_PATH);
      return;
    }
    const match = categories.find((c) => c.title === title);
    if (match?.slug) {
      router.push(collectionCategoryPath(match.slug));
      return;
    }
    router.push(catalogueHref({ category: title }));
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const categoryMenuOptions = (
    <>
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
                active ? 'bg-[#0F4C69] font-medium text-white' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              {cat.title}
            </button>
          );
        })
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-3 sm:px-4 lg:px-4">
        <div className="flex flex-col gap-2 py-2 lg:min-h-16 lg:flex-row lg:flex-nowrap lg:items-center lg:justify-between lg:gap-4 lg:py-2">
          {/* Logo + actions — stacked on mobile/tablet; lg:contents restores original desktop row */}
          <div className="flex items-center justify-between gap-2 lg:contents">
            <Link href="/" className="flex shrink-0 items-center lg:order-1">
              <Image
                src="/Images/home/logo.webp"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto sm:h-9 lg:h-10"
                priority
              />
            </Link>

            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 lg:order-3 lg:gap-0 lg:space-x-4">
              {/* Cart with Dropdown */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative rounded-lg p-1.5 text-gray-700 transition-colors hover:text-[#E36630] sm:p-2 lg:rounded-none lg:p-2"
                  aria-label="Shopping cart"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E36630] text-[10px] font-medium text-white sm:-right-1 sm:-top-1 sm:h-5 sm:w-5 sm:text-xs lg:-right-1 lg:-top-1 lg:h-5 lg:w-5 lg:text-xs">
                    {cartCount}
                  </span>
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-gray-200 bg-white shadow-lg sm:w-80 lg:w-80">
                    <div className="p-3 sm:p-4 lg:p-4">
                      <h3 className="mb-3 text-base font-semibold text-[#000000] sm:text-lg lg:text-lg">Shopping Cart</h3>

                      {cartItems.length === 0 ? (
                        <div className="py-6 text-center text-gray-500 sm:py-8 lg:py-8">
                          <svg className="mx-auto mb-3 h-12 w-12 text-gray-300 sm:mb-4 sm:h-16 sm:w-16 lg:mb-4 lg:h-16 lg:w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-sm text-gray-600 sm:text-base lg:text-base">Your cart is empty</p>
                        </div>
                      ) : (
                        <div className="max-h-56 space-y-3 overflow-y-auto sm:max-h-64 lg:max-h-64">
                          {cartItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 rounded border border-gray-200 p-2 sm:gap-3 lg:gap-3">
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100 sm:h-12 sm:w-12 lg:h-12 lg:w-12">
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-medium text-gray-800">{item.title}</h4>
                                <p className="text-xs text-gray-600">
                                  Qty: {item.quantity} | PKR {item.price.toLocaleString()}
                                </p>
                              </div>

                              <button
                                onClick={() => removeFromCart(index)}
                                className="shrink-0 text-red-500 transition-colors hover:text-red-700"
                                aria-label={`Remove ${item.title} from cart`}
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 border-t border-gray-200 pt-3 sm:mt-4 sm:pt-4 lg:mt-4 lg:pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-semibold text-[#000000]">Total:</span>
                          <span className="text-base font-bold text-[#000000] sm:text-lg lg:text-lg">
                            PKR {cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={handleCheckout}
                          className="w-full rounded-lg bg-[#E36630] px-4 py-2 text-sm text-white transition-colors hover:bg-[#cc5a2a] sm:text-base lg:text-base"
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
                    className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-gray-100 sm:gap-1.5 sm:p-1 lg:gap-1.5 lg:p-1"
                    aria-label="Account menu"
                  >
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-[#E36630]/30 sm:h-9 sm:w-9 lg:h-9 lg:w-9"
                      />
                    ) : (
                      <div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-[#E36630] text-xs font-bold text-white ring-2 ring-[#E36630]/20 sm:h-9 sm:w-9 sm:text-sm lg:h-9 lg:w-9 lg:text-sm">
                        {user.initials}
                      </div>
                    )}
                    <svg
                      className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] sm:w-64 lg:w-64">
                      <div className="border-b border-gray-100 bg-gradient-to-r from-[#0F4C69]/5 to-[#E36630]/5 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                      </div>

                      {user.role === 'admin' ? (
                        <div className="py-1">
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#E36630] transition-colors hover:bg-[#E36630]/5"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="py-1">
                          {[
                            {
                              label: 'Manage My Account',
                              href: '/profile',
                              icon: (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              ),
                            },
                            {
                              label: 'My Orders',
                              href: '/orders',
                              icon: (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                              ),
                            },
                            {
                              label: 'My Wishlist & Followed Stores',
                              href: '/wishlist',
                              icon: (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              ),
                            },
                            {
                              label: 'My Reviews',
                              href: '/my-reviews',
                              icon: (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                />
                              ),
                            },
                            {
                              label: 'My Cancellations',
                              href: '/returns',
                              icon: (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                                </>
                              ),
                            },
                          ].map(({ label, href, icon }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setIsProfileOpen(false)}
                              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#E36630]"
                            >
                              <svg
                                className="h-[22px] w-[22px] shrink-0 text-gray-400 transition-colors group-hover:text-[#E36630]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {icon}
                              </svg>
                              <span className="truncate">{label}</span>
                            </Link>
                          ))}
                          <div className="mt-1 border-t border-gray-100 pt-1">
                            <button
                              onClick={() => {
                                logout();
                                setIsProfileOpen(false);
                              }}
                              className="group flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                            >
                              <svg className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
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
                <div className="flex items-center gap-1 sm:gap-2 lg:space-x-2 lg:gap-0">
                  <Link
                    href="/login"
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:text-[#E36630] sm:px-3 sm:py-2 sm:text-sm lg:rounded-none lg:px-4 lg:py-2 lg:text-base lg:font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[#E36630] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#cc5a2a] sm:px-3 sm:py-2 sm:text-sm lg:rounded-lg lg:px-4 lg:py-2 lg:text-base lg:font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Search + category + submit */}
          <form
            onSubmit={handleSearch}
            className="max-lg:relative flex w-full min-w-0 items-stretch lg:order-2 lg:max-w-4xl lg:flex-1 lg:basis-auto lg:px-2 lg:mx-4 xl:max-w-5xl xl:mx-6"
          >
            <div
              ref={searchRef}
              className="relative flex min-h-[44px] min-w-0 flex-1 items-center rounded-l-full border border-r-0 border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
            >
              <label htmlFor="header-search" className="sr-only">
                Search for products
              </label>
              <input
                id="header-search"
                type="text"
                role="combobox"
                aria-expanded={suggestionsOpen}
                aria-controls="header-search-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={
                  activeSuggestionIndex >= 0 ? `header-search-option-${activeSuggestionIndex}` : undefined
                }
                enterKeyHint="search"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.trim().length >= SEARCH_MIN_CHARS) setSuggestionsOpen(true);
                }}
                placeholder="Search for products"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-l-full border-0 bg-transparent py-2.5 pl-3 pr-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:pl-4 sm:pr-2 lg:py-3 lg:pl-5 lg:pr-2 lg:text-[15px] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />

              {suggestionsOpen && searchQuery.trim().length >= SEARCH_MIN_CHARS && (
                <div
                  id="header-search-suggestions"
                  role="listbox"
                  className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[60] overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.2)]"
                >
                  {suggestionsLoading ? (
                    <div className="space-y-2 px-3 py-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-100" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchSuggestions.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      No products found for &quot;{searchQuery.trim()}&quot;
                    </p>
                  ) : (
                    <>
                      <ul className="max-h-[min(22rem,60vh)] overflow-y-auto py-1">
                        {searchSuggestions.map((product, index) => {
                          const active = index === activeSuggestionIndex;
                          const category = suggestionCategoryTitle(product.categories);
                          const image = product.images?.[0] || DEFAULT_PRODUCT_IMAGE;
                          return (
                            <li key={product._id}>
                              <button
                                type="button"
                                id={`header-search-option-${index}`}
                                role="option"
                                aria-selected={active}
                                onMouseEnter={() => setActiveSuggestionIndex(index)}
                                onClick={() =>
                                  openProduct(product._id, primaryCategorySlug(product.categories))
                                }
                                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                  active ? 'bg-orange-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  <Image
                                    src={image}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                                  {category ? (
                                    <p className="truncate text-xs text-gray-500">{category}</p>
                                  ) : null}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <button
                        type="button"
                        onClick={() => runProductSearch(searchQuery)}
                        className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-[#0F4C69] transition-colors hover:bg-gray-50"
                      >
                        View all results
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              )}
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
                  onClick={() => {
                    setIsCategoryOpen((v) => !v);
                    if (!isCategoryOpen) {
                      setSuggestionsOpen(false);
                      setActiveSuggestionIndex(-1);
                    }
                  }}
                  aria-expanded={isCategoryOpen}
                  aria-haspopup="listbox"
                  aria-controls="header-category-dropdown"
                  className="flex h-full max-w-[7rem] items-center gap-1 border-0 bg-transparent py-2 pl-1.5 pr-2 text-left text-[11px] font-medium text-gray-700 outline-none transition-colors hover:bg-gray-50/80 focus-visible:ring-2 focus-visible:ring-[#E36630]/30 sm:max-w-[9.5rem] sm:gap-1.5 sm:pl-2 sm:pr-3 sm:text-xs lg:max-w-[12rem] lg:gap-2 lg:px-3.5 lg:text-sm"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {selectedCategoryTitle ?? (
                      <>
                        <span className="lg:hidden">Categories</span>
                        <span className="hidden lg:inline">All Categories</span>
                      </>
                    )}
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

                {/* Desktop — original dropdown anchored to category button */}
                {isCategoryOpen && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1.5 hidden max-h-[min(22rem,70vh)] w-72 overflow-y-auto rounded-xl border border-gray-200/90 bg-white py-1 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] lg:block"
                    role="listbox"
                  >
                    {categoryMenuOptions}
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="flex h-auto min-w-[44px] shrink-0 items-center justify-center rounded-r-full border border-l-0 border-gray-200/90 bg-[#E36630] px-3.5 text-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors hover:bg-[#cc5a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E36630]/45 focus-visible:ring-offset-2 sm:min-w-[48px] sm:px-5 lg:min-w-[48px] lg:px-5"
              aria-label="Search"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {isCategoryOpen && (
              <div
                ref={categoryDropdownRef}
                id="header-category-dropdown"
                role="listbox"
                className="absolute left-0 right-11 top-[calc(100%+0.375rem)] z-[70] max-h-[min(24rem,70vh)] overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.18)] sm:right-12 lg:hidden"
              >
                <button
                  type="button"
                  onClick={() => selectCategory(null)}
                  className="sticky top-0 z-10 flex w-full items-center border-b border-[#0F4C69]/20 bg-[#0F4C69] px-4 py-2.5 text-left text-sm font-semibold text-white transition-colors hover:bg-[#0d4259]"
                >
                  All Categories
                </button>
                <div className="max-h-[min(20rem,60vh)] overflow-y-auto py-1">
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
              </div>
            )}
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;