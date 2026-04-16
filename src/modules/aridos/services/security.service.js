import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase';
import { configRef } from './base';
import {
  buildDefaultAridosPermissions,
  mergeAridosPermissions,
  normalizeEmail,
  resolveAridosRole,
} from '../utils/permissions';

function mapProfileRoleToSecurityRole(profileRole) {
  switch (String(profileRole || '').trim()) {
    case 'owner':
    case 'admin_full':
      return 'admin_full';
    case 'admin':
      return 'admin';
    case 'operador':
      return 'operador';
    case 'vendedor':
      return 'vendedor';
    case 'solo_lectura':
      return 'solo_lectura';
    default:
      return 'sin_acceso';
  }
}

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

async function buildProfileFallbackSnapshot(cuentaId, currentUserEmail) {
  const email = normalizeEmail(currentUserEmail);
  const uid = auth.currentUser?.uid;
  if (!uid || !cuentaId) return buildSnapshot(email, {}, {});

  const profileSnap = await getDoc(doc(db, `aridos_usuarios/${uid}`));
  if (!profileSnap.exists()) {
    return buildSnapshot(email, {}, {});
  }

  const profile = profileSnap.data() || {};
  const sameCuenta = String(profile.cuentaId || '').trim() === String(cuentaId || '').trim();
  const active = profile.active !== false;
  if (!sameCuenta || !active) {
    return buildSnapshot(email, {}, {});
  }

  const role = mapProfileRoleToSecurityRole(profile.role);
  const usuariosConfig = role === 'admin_full'
    ? { adminFull: [email], admins: [email], operadores: [], vendedores: [], soloLectura: [] }
    : role === 'admin'
      ? { adminFull: [], admins: [email], operadores: [], vendedores: [], soloLectura: [] }
      : role === 'operador'
        ? { adminFull: [], admins: [], operadores: [email], vendedores: [], soloLectura: [] }
        : role === 'vendedor'
          ? { adminFull: [], admins: [], operadores: [], vendedores: [email], soloLectura: [] }
          : role === 'solo_lectura'
            ? { adminFull: [], admins: [], operadores: [], vendedores: [], soloLectura: [email] }
            : {};

  return {
    email,
    role,
    permissions: buildDefaultAridosPermissions(role),
    usuariosConfig,
    permisosConfig: {},
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
      const snapshot = buildSnapshot(currentUserEmail, usuariosData, permisosData);

      if (snapshot.role === 'sin_acceso') {
        const fallback = await buildProfileFallbackSnapshot(cuentaId, currentUserEmail);
        if (!active) return;
        if (fallback.hasAccess) {
          callback(fallback);
          return;
        }
      }

      callback(snapshot);
    } catch (error) {
      if (!active) return;
      console.error('Error cargando seguridad de áridos:', error);

      try {
        const fallback = await buildProfileFallbackSnapshot(cuentaId, currentUserEmail);
        if (!active) return;
        callback(fallback);
      } catch (fallbackError) {
        console.error('Error cargando fallback de seguridad de áridos:', fallbackError);
        callback(buildSnapshot(currentUserEmail, {}, {}));
      }
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
