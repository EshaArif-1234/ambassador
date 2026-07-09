'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { authApi } from '@/utils/auth.api';

const SESSION_CHECK_INTERVAL_MS = 60_000;

/** Force admin logout and redirect to login when the 2-hour session ends. */
export function useAdminSessionTimeout(enabled: boolean) {
  const { logout } = useUser();
  const router = useRouter();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const clearLogoutTimer = () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };

    const expireSession = async () => {
      clearLogoutTimer();
      try {
        await logout();
      } catch {
        /* local state cleared in logout() */
      }
      router.replace('/login?reason=session_expired');
    };

    const scheduleExpiry = (expiresAt: number) => {
      clearLogoutTimer();
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        void expireSession();
        return;
      }
      logoutTimerRef.current = setTimeout(() => {
        void expireSession();
      }, remaining);
    };

    const syncSession = async () => {
      try {
        const res = await authApi.getMe();
        const expiresAt = res.data?.sessionExpiresAt;
        if (!expiresAt || expiresAt <= Date.now()) {
          await expireSession();
          return;
        }
        scheduleExpiry(expiresAt);
      } catch {
        await expireSession();
      }
    };

    void syncSession();

    const interval = setInterval(() => {
      void syncSession();
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      clearLogoutTimer();
      clearInterval(interval);
    };
  }, [enabled, logout, router]);
}
