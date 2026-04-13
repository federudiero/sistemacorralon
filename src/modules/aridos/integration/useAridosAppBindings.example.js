// EJEMPLO
// Junta AuthContext + CuentaContext y deja un binding unico para el modulo.

import { useMemo } from 'react';
import { useAridosAuthAdapter } from './auth.adapter.example';
import { useAridosCuentaAdapter } from './provincia.adapter.example';

export function useAridosAppBindings() {
  const auth = useAridosAuthAdapter();
  const cuenta = useAridosCuentaAdapter();

  return useMemo(() => {
    const loading = auth.authLoading || cuenta.cuentaLoading;
    const cuentaId = cuenta.cuentaId;
    const currentUserEmail = auth.currentUserEmail;

    return {
      loading,
      cuentaId,
      currentUserEmail,
      ready: Boolean(!loading && cuentaId && currentUserEmail),
      rawAuth: auth,
      rawCuenta: cuenta,
    };
  }, [auth, cuenta]);
}
