// EJEMPLO
// Adaptalo a tu AuthContext real.
// No lo importes literal si tus nombres/paths difieren.

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useAridosAuthAdapter() {
  const { user, profile } = useAuth();

  return useMemo(() => {
    const email =
      user?.email ||
      profile?.email ||
      '';

    return {
      currentUserEmail: String(email || '').trim().toLowerCase(),
      authLoading: Boolean(!user && !profile),
      rawUser: user,
      rawProfile: profile,
    };
  }, [user, profile]);
}
