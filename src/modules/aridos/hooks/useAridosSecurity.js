
import { useEffect, useState } from 'react';
import { subscribeAridosSecurity } from '../services/security.service';
import { buildDefaultAridosPermissions } from '../utils/permissions';

const INITIAL_STATE = {
  loading: true,
  role: 'sin_acceso',
  permissions: buildDefaultAridosPermissions('sin_acceso'),
  isAdminFull: false,
  isAdmin: false,
  isReadOnly: false,
  hasAccess: false,
  usuariosConfig: {},
  permisosConfig: {},
  email: '',
};

export function useAridosSecurity(cuentaId, currentUserEmail) {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!cuentaId) {
      setState({ ...INITIAL_STATE, loading: false });
      return undefined;
    }

    const unsubscribe = subscribeAridosSecurity(cuentaId, currentUserEmail, (snapshot) => {
      setState({ ...snapshot, loading: false });
    });

    return unsubscribe;
  }, [cuentaId, currentUserEmail]);

  return state;
}
