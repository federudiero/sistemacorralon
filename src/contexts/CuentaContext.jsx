import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aridos_cuenta_context';
const AUTH_STORAGE_KEY = 'aridos_auth_user';
const CuentaContext = createContext(null);

function normalizeCuentaId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildCuentaState(source) {
  return {
    cuentaId: normalizeCuentaId(source?.cuentaId),
    cuentaNombre: String(source?.cuentaNombre || '').trim(),
  };
}

function readStoredCuenta() {
  if (typeof window === 'undefined') return { cuentaId: '', cuentaNombre: '' };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return buildCuentaState(JSON.parse(raw));

    const authRaw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (authRaw) return buildCuentaState(JSON.parse(authRaw));

    return { cuentaId: '', cuentaNombre: '' };
  } catch {
    return { cuentaId: '', cuentaNombre: '' };
  }
}

export function CuentaProvider({ children }) {
  const [state, setState] = useState(readStoredCuenta);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    function handleAuthUserChanged(event) {
      const nextUser = event.detail;

      if (!nextUser) {
        setState({ cuentaId: '', cuentaNombre: '' });
        return;
      }

      setState(buildCuentaState(nextUser));
    }

    window.addEventListener('aridos-auth-user-changed', handleAuthUserChanged);
    return () => {
      window.removeEventListener('aridos-auth-user-changed', handleAuthUserChanged);
    };
  }, []);

  const value = useMemo(
    () => ({
      cuentaId: state.cuentaId,
      cuentaNombre: state.cuentaNombre,
      setCuenta: ({ cuentaId, cuentaNombre = '' }) => {
        setState(buildCuentaState({ cuentaId, cuentaNombre }));
      },
      setCuentaId: (cuentaId) => {
        setState((prev) => ({ ...prev, cuentaId: normalizeCuentaId(cuentaId) }));
      },
      setCuentaNombre: (cuentaNombre) => {
        setState((prev) => ({ ...prev, cuentaNombre: String(cuentaNombre || '').trim() }));
      },
      clearCuenta: () => setState({ cuentaId: '', cuentaNombre: '' }),
      hasCuenta: Boolean(state.cuentaId),
    }),
    [state],
  );

  return <CuentaContext.Provider value={value}>{children}</CuentaContext.Provider>;
}

export function useCuenta() {
  const ctx = useContext(CuentaContext);
  if (!ctx) throw new Error('useCuenta debe usarse dentro de CuentaProvider');
  return ctx;
}
