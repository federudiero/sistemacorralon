
import React, { createContext, useContext, useMemo } from 'react';
import { useAridosSecurity } from '../hooks/useAridosSecurity';

const AridosSecurityContext = createContext(null);

export function AridosSecurityProvider({ cuentaId, currentUserEmail, children }) {
  const security = useAridosSecurity(cuentaId, currentUserEmail);
  const value = useMemo(() => security, [security]);
  return <AridosSecurityContext.Provider value={value}>{children}</AridosSecurityContext.Provider>;
}

export function useAridosSecurityContext() {
  const ctx = useContext(AridosSecurityContext);
  if (!ctx) throw new Error('useAridosSecurityContext debe usarse dentro de AridosSecurityProvider');
  return ctx;
}
