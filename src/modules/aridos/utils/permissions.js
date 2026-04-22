export const ARIDOS_SECTIONS = {
  DASHBOARD: 'dashboard',
  PRODUCTOS: 'productos',
  BATEAS: 'bateas',
  PROVEEDORES: 'proveedores',
  CLIENTES: 'clientes',
  INGRESOS: 'ingresos',
  VENTAS: 'ventas',
  MOVIMIENTOS: 'movimientos',
  AJUSTES: 'ajustes',
  REMITOS: 'remitos',
  REPORTES: 'reportes',
  CIERRE_CAJA: 'cierre_caja',
  CONFIG: 'config',
};

export const ARIDOS_ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  ADJUST: 'adjust',
  ANNUL: 'annul',
  ADMIN: 'admin',
};

const FULL_SECTION_KEYS = Object.values(ARIDOS_SECTIONS);
const EMPTY_PERMISSION = { read: false, write: false, adjust: false, annul: false, admin: false };

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizeArray(values) {
  return Array.isArray(values)
    ? values.map((v) => normalizeEmail(v)).filter(Boolean)
    : [];
}

export function buildUserRoleMap(configUsuarios = {}) {
  return {
    adminFull: normalizeArray(configUsuarios.adminFull || configUsuarios.admins),
    admins: normalizeArray(configUsuarios.admins),
    operadores: normalizeArray(configUsuarios.operadores),
    vendedores: normalizeArray(configUsuarios.vendedores),
    soloLectura: normalizeArray(configUsuarios.soloLectura),
  };
}

export function resolveAridosRole(email, configUsuarios = {}) {
  const userEmail = normalizeEmail(email);
  const roles = buildUserRoleMap(configUsuarios);

  if (roles.adminFull.includes(userEmail)) return 'admin_full';
  if (roles.admins.includes(userEmail)) return 'admin';
  if (roles.operadores.includes(userEmail)) return 'operador';
  if (roles.vendedores.includes(userEmail)) return 'vendedor';
  if (roles.soloLectura.includes(userEmail)) return 'solo_lectura';
  return 'sin_acceso';
}

export function buildDefaultAridosPermissions(role) {
  const full = FULL_SECTION_KEYS.reduce((acc, section) => {
    acc[section] = { read: true, write: true, adjust: true, annul: true, admin: true };
    return acc;
  }, {});

  if (role === 'admin_full') return full;

  if (role === 'admin') {
    return {
      ...full,
      config: { read: true, write: false, adjust: false, annul: false, admin: false },
    };
  }

  if (role === 'operador') {
    return {
      dashboard: { read: true, write: false, adjust: false, annul: false, admin: false },
      productos: { read: true, write: true, adjust: false, annul: false, admin: false },
      bateas: { read: true, write: true, adjust: false, annul: false, admin: false },
      proveedores: { read: true, write: true, adjust: false, annul: false, admin: false },
      clientes: { read: true, write: true, adjust: false, annul: false, admin: false },
      ingresos: { read: true, write: true, adjust: false, annul: false, admin: false },
      ventas: { read: true, write: true, adjust: false, annul: true, admin: false },
      movimientos: { read: true, write: false, adjust: false, annul: false, admin: false },
      ajustes: { read: true, write: false, adjust: true, annul: true, admin: false },
      remitos: { read: true, write: true, adjust: false, annul: false, admin: false },
      reportes: { read: true, write: false, adjust: false, annul: false, admin: false },
      cierre_caja: { read: true, write: true, adjust: false, annul: false, admin: false },
      config: { read: false, write: false, adjust: false, annul: false, admin: false },
    };
  }

  if (role === 'vendedor') {
    return {
      dashboard: { read: true, write: false, adjust: false, annul: false, admin: false },
      productos: { read: true, write: false, adjust: false, annul: false, admin: false },
      bateas: { read: true, write: false, adjust: false, annul: false, admin: false },
      proveedores: { read: true, write: false, adjust: false, annul: false, admin: false },
      clientes: { read: true, write: true, adjust: false, annul: false, admin: false },
      ingresos: { read: false, write: false, adjust: false, annul: false, admin: false },
      ventas: { read: true, write: true, adjust: false, annul: false, admin: false },
      movimientos: { read: false, write: false, adjust: false, annul: false, admin: false },
      ajustes: { read: false, write: false, adjust: false, annul: false, admin: false },
      remitos: { read: true, write: false, adjust: false, annul: false, admin: false },
      reportes: { read: false, write: false, adjust: false, annul: false, admin: false },
      cierre_caja: { read: false, write: false, adjust: false, annul: false, admin: false },
      config: { read: false, write: false, adjust: false, annul: false, admin: false },
    };
  }

  if (role === 'solo_lectura') {
    return FULL_SECTION_KEYS.reduce((acc, section) => {
      acc[section] = { read: section !== 'config', write: false, adjust: false, annul: false, admin: false };
      return acc;
    }, {});
  }

  return FULL_SECTION_KEYS.reduce((acc, section) => {
    acc[section] = { ...EMPTY_PERMISSION };
    return acc;
  }, {});
}

function normalizePermissionsDoc(doc = {}) {
  const out = {};
  Object.keys(doc || {}).forEach((key) => {
    const source = doc[key] || {};
    out[key] = {
      read: Boolean(source.read),
      write: Boolean(source.write),
      adjust: Boolean(source.adjust),
      annul: Boolean(source.annul),
      admin: Boolean(source.admin),
    };
  });
  return out;
}

export function mergeAridosPermissions(role, rawDoc = {}) {
  const basePermissions = buildDefaultAridosPermissions(role);
  const docPermissions = normalizePermissionsDoc(rawDoc);
  return {
    ...basePermissions,
    ...docPermissions,
  };
}

export function getSectionPermissions(permissions, section) {
  return permissions?.[section] || EMPTY_PERMISSION;
}

export function canAccessSection(permissions, section, action = ARIDOS_ACTIONS.READ) {
  return Boolean(getSectionPermissions(permissions, section)?.[action]);
}

export function canReadSection(permissions, section) {
  return canAccessSection(permissions, section, ARIDOS_ACTIONS.READ);
}

export function canWriteSection(permissions, section) {
  return canAccessSection(permissions, section, ARIDOS_ACTIONS.WRITE);
}

export function canAdjustSection(permissions, section) {
  return canAccessSection(permissions, section, ARIDOS_ACTIONS.ADJUST);
}

export function canAnnulSection(permissions, section) {
  return canAccessSection(permissions, section, ARIDOS_ACTIONS.ANNUL);
}

export function canAdminSection(permissions, section) {
  return canAccessSection(permissions, section, ARIDOS_ACTIONS.ADMIN);
}

export function getDeniedSections(permissions) {
  return FULL_SECTION_KEYS.filter((section) => !canReadSection(permissions, section));
}
