'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import AccountPageLoader from '@/components/account/AccountPageLoader';

const NAV_ITEMS = [
  {
    href: '/profile',
    label: 'Manage My Account',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    href: '/orders',
    label: 'My Orders',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    ),
  },
  {
    href: '/wishlist',
    label: 'My Wishlist',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    ),
  },
  {
    href: '/my-reviews',
    label: 'My Reviews',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    ),
  },
  {
    href: '/returns',
    label: 'My Returns & Cancellations',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    ),
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useUser();

  if (isLoading) {
    return <AccountPageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* Avatar card */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 mb-4 text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#E36630] text-2xl font-bold text-white shadow-md select-none">
                {user?.initials ?? '?'}
              </div>
              <p className="font-semibold text-gray-900 text-base truncate">{user?.name ?? 'Guest'}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email ?? ''}</p>
              {user?.isVerified && (
                <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {/* Nav */}
            <nav className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
              {NAV_ITEMS.map(({ href, label, icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium border-b border-gray-50 last:border-0 transition-all ${
                      active
                        ? 'bg-[#E36630]/8 text-[#E36630] border-l-4 border-l-[#E36630]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#E36630] border-l-4 border-l-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 border-l-4 border-l-transparent transition-all"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
