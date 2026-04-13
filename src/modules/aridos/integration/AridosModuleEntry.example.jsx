import React from 'react';
import { Outlet } from 'react-router-dom';
import AridosModuleShellExample from '../security/AridosModuleShell.example';
import AccessDeniedState from '../components/shared/AccessDeniedState';
import { useAridosAppBindings } from './useAridosAppBindings.example';

export default function AridosModuleEntryExample() {
  const { loading, ready, cuentaId, currentUserEmail } = useAridosAppBindings();

  if (loading) {
    return (
      <div className="min-h-[280px] grid place-items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!ready) {
    return (
      <AccessDeniedState
        title="Módulo no inicializado"
        message="No se pudo resolver cuenta o email del usuario desde tus contexts reales."
      />
    );
  }

  return (
    <AridosModuleShellExample cuentaId={cuentaId} currentUserEmail={currentUserEmail}>
      <Outlet />
    </AridosModuleShellExample>
  );
}
