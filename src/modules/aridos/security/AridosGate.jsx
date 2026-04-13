import React, { cloneElement, isValidElement } from 'react';
import AccessDeniedState from '../components/shared/AccessDeniedState';
import { useAridosSecurity } from '../hooks/useAridosSecurity';
import { ARIDOS_ACTIONS, canAccessSection } from '../utils/permissions';

export default function AridosGate({ cuentaId, currentUserEmail, section, action = ARIDOS_ACTIONS.READ, children, loadingFallback = null }) {
  const security = useAridosSecurity(cuentaId, currentUserEmail);

  if (security.loading) {
    return loadingFallback || (
      <div className="min-h-[180px] grid place-items-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!security.hasAccess) {
    return <AccessDeniedState title="Sin acceso al módulo" message="Tu usuario no figura en la configuración de áridos para esta cuenta." />;
  }

  if (!canAccessSection(security.permissions, section, action)) {
    return <AccessDeniedState title="Acceso denegado" message="Tu rol actual no tiene permisos para esta sección o acción." />;
  }

  if (typeof children === 'function') {
    return children(security);
  }

  if (isValidElement(children)) {
    return cloneElement(children, { security });
  }

  return children;
}
