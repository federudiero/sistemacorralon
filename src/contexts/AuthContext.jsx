import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aridos_auth_user';
const AuthContext = createContext(null);

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user?.email),
    login: ({ email, name }) => {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!normalizedEmail) throw new Error('Ingresá un email válido.');
      setUser({ email: normalizedEmail, name: String(name || '').trim() || normalizedEmail });
    },
    logout: () => setUser(null),
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
