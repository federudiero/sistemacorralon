// EJEMPLO
// Adaptalo a tu CuentaContext real.
// No lo importes literal si tus nombres/paths difieren.

import { useMemo } from 'react';
import { useCuenta } from '@/contexts/CuentaContext';

export function useAridosCuentaAdapter() {
  const { cuentaActual, cuentaId, loading } = useCuenta();

  return useMemo(() => {
    const resolvedCuentaId =
      cuentaId ||
      cuentaActual?.id ||
      cuentaActual?.codigo ||
      '';

    return {
      cuentaId: String(resolvedCuentaId || '').trim(),
      cuentaLoading: Boolean(loading),
      rawCuenta: cuentaActual,
    };
  }, [cuentaActual, cuentaId, loading]);
}
