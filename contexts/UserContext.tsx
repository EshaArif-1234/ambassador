'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type ApiUser } from '@/utils/auth.api';

export interface User {
  id: string;
  /** Display-friendly name. Same value as fullName — kept for backward compatibility. */
  name: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
  initials: string;
  role: 'admin' | 'user';
  isVerified: boolean;
}

/** Map the raw backend user object to the frontend User shape. */
export function mapApiUser(raw: ApiUser): User {
  const fullName = raw.fullName || raw.email.split('@')[0];
  return {
    id: raw._id,
    name: fullName,
    fullName,
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    address: raw.address,
    initials: fullName.substring(0, 2).toUpperCase(),
    role: raw.role ?? 'user',
    isVerified: raw.isVerified,
  };
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  /** Pass the raw ApiUser object returned from the backend. */
  login: (rawApiUser: ApiUser) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (ctx === undefined) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore session from httpOnly cookie via /api/auth/me
  useEffect(() => {
    authApi
      .getMe()
      .then((res) => {
        if (res.data?.user) setUser(mapApiUser(res.data.user));
      })
      .catch(() => {
        // Cookie absent or expired — user stays null
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = (rawApiUser: ApiUser) => {
    setUser(mapApiUser(rawApiUser));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Always clear local state even if API call fails
    }
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
