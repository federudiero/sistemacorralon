import { getDoc } from 'firebase/firestore';
import { configRef } from './base';
import {
  buildDefaultAridosPermissions,
  mergeAridosPermissions,
  normalizeEmail,
  resolveAridosRole,
} from '../utils/permissions';

function buildSnapshot(currentUserEmail, usuariosData = {}, permisosData = {}) {
  const email = normalizeEmail(currentUserEmail);
  const role = resolveAridosRole(email, usuariosData);
  const permissions = mergeAridosPermissions(role, permisosData);

  return {
    email,
    role,
    permissions,
    usuariosConfig: usuariosData,
    permisosConfig: permisosData,
    isAdminFull: role === 'admin_full',
    isAdmin: role === 'admin' || role === 'admin_full',
    isReadOnly: role === 'solo_lectura',
    hasAccess: role !== 'sin_acceso',
  };
}

export function subscribeAridosSecurity(cuentaId, currentUserEmail, callback) {
  let active = true;

  async function load() {
    try {
      const [usuariosSnap, permisosSnap] = await Promise.all([
        getDoc(configRef(cuentaId, 'usuarios')),
        getDoc(configRef(cuentaId, 'permisosAridos')),
      ]);

      if (!active) return;

      const usuariosData = usuariosSnap.exists() ? (usuariosSnap.data() || {}) : {};
      const permisosData = permisosSnap.exists() ? (permisosSnap.data() || {}) : {};

      callback(buildSnapshot(currentUserEmail, usuariosData, permisosData));
    } catch (error) {
      if (!active) return;
      console.error('Error cargando seguridad de áridos:', error);
      callback(buildSnapshot(currentUserEmail, {}, {}));
    }
  }

  load();

  return () => {
    active = false;
  };
}

export function getDefaultSecuritySnapshot(currentUserEmail, configUsuarios = {}) {
  const email = normalizeEmail(currentUserEmail);
  const role = resolveAridosRole(email, configUsuarios);
  return {
    email,
    role,
    permissions: buildDefaultAridosPermissions(role),
    usuariosConfig: configUsuarios,
    permisosConfig: {},
    isAdminFull: role === 'admin_full',
    isAdmin: role === 'admin' || role === 'admin_full',
    isReadOnly: role === 'solo_lectura',
    hasAccess: role !== 'sin_acceso',
  };
}
