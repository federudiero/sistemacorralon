import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aridos_cuenta_context';
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

function readStoredCuenta() {
  if (typeof window === 'undefined') return { cuentaId: '', cuentaNombre: '' };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cuentaId: '', cuentaNombre: '' };
    const parsed = JSON.parse(raw);
    return {
      cuentaId: normalizeCuentaId(parsed?.cuentaId),
      cuentaNombre: String(parsed?.cuentaNombre || '').trim(),
    };
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

  const value = useMemo(() => ({
    cuentaId: state.cuentaId,
    cuentaNombre: state.cuentaNombre,
    setCuenta: ({ cuentaId, cuentaNombre = '' }) => {
      const normalizedId = normalizeCuentaId(cuentaId);
      setState({
        cuentaId: normalizedId,
        cuentaNombre: String(cuentaNombre || '').trim(),
      });
    },
    setCuentaId: (cuentaId) => {
      setState((prev) => ({ ...prev, cuentaId: normalizeCuentaId(cuentaId) }));
    },
    setCuentaNombre: (cuentaNombre) => {
      setState((prev) => ({ ...prev, cuentaNombre: String(cuentaNombre || '').trim() }));
    },
    clearCuenta: () => setState({ cuentaId: '', cuentaNombre: '' }),
    hasCuenta: Boolean(state.cuentaId),
  }), [state]);

  return <CuentaContext.Provider value={value}>{children}</CuentaContext.Provider>;
}

export function useCuenta() {
  const ctx = useContext(CuentaContext);
  if (!ctx) throw new Error('useCuenta debe usarse dentro de CuentaProvider');
  return ctx;
}
