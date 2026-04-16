import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';

const USERS_COLLECTION = 'aridos_usuarios';
const CUENTAS_COLLECTION = 'cuentas';

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeCuentaId(value) {
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

function userProfileRef(uid) {
  return doc(db, USERS_COLLECTION, uid);
}

function cuentaRef(cuentaId) {
  return doc(db, CUENTAS_COLLECTION, cuentaId);
}

function cuentaUsuarioRef(cuentaId, uid) {
  return doc(db, `${CUENTAS_COLLECTION}/${cuentaId}/usuarios/${uid}`);
}

function cuentaConfigRef(cuentaId, docId) {
  return doc(db, `${CUENTAS_COLLECTION}/${cuentaId}/config/${docId}`);
}

function mergeUniqueEmails(values, email) {
  const normalized = normalizeEmail(email);
  const set = new Set(
    Array.isArray(values)
      ? values.map((item) => normalizeEmail(item)).filter(Boolean)
      : [],
  );

  if (normalized) set.add(normalized);
  return Array.from(set);
}

function buildProfile({ uid, email, name, cuentaId, cuentaNombre = '', role = 'owner', active = true }) {
  return {
    uid,
    email: normalizeEmail(email),
    name: String(name || '').trim() || normalizeEmail(email),
    cuentaId: normalizeCuentaId(cuentaId),
    cuentaNombre: String(cuentaNombre || '').trim(),
    role: String(role || 'owner').trim() || 'owner',
    active: Boolean(active),
  };
}

export async function fetchUserProfile(uid) {
  const snapshot = await getDoc(userProfileRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function fetchCuenta(cuentaId) {
  const normalizedCuentaId = normalizeCuentaId(cuentaId);
  if (!normalizedCuentaId) return null;
  const snapshot = await getDoc(cuentaRef(normalizedCuentaId));
  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
}

export async function findCuentaByOwnerEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const snapshot = await getDocs(
    query(collection(db, CUENTAS_COLLECTION), where('ownerEmail', '==', normalizedEmail), limit(1)),
  );

  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

export async function findMembershipByUid(uid) {
  if (!uid) return null;

  const snapshot = await getDocs(
    query(collectionGroup(db, 'usuarios'), where('uid', '==', uid), limit(1)),
  );

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  const cuentaId = docSnap.ref.parent?.parent?.id || '';
  return {
    cuentaId,
    id: docSnap.id,
    ...docSnap.data(),
  };
}

export async function validateCuentaRegistration({ cuentaId, email }) {
  const normalizedCuentaId = normalizeCuentaId(cuentaId);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedCuentaId) throw new Error('Ingresá el ID del corralón o cuenta.');
  if (!normalizedEmail) throw new Error('Ingresá un email válido.');

  const cuenta = await fetchCuenta(normalizedCuentaId);
  if (!cuenta) return { mode: 'create', cuentaId: normalizedCuentaId };

  const ownerEmail = normalizeEmail(cuenta.ownerEmail);
  const ownerUid = String(cuenta.ownerUid || '').trim();

  if (ownerUid && ownerEmail && ownerEmail !== normalizedEmail) {
    throw new Error('Esa cuenta ya existe y pertenece a otro owner. Ingresá con tu usuario o pedí acceso.');
  }

  if (ownerUid && ownerEmail === normalizedEmail) {
    throw new Error('Esa cuenta ya tiene owner registrado. Ingresá desde login.');
  }

  if (ownerEmail && ownerEmail !== normalizedEmail) {
    throw new Error('Esa cuenta ya existe con otro email owner. Verificá el ID o pedí acceso.');
  }

  return {
    mode: 'adopt',
    cuentaId: normalizedCuentaId,
    cuenta,
  };
}

export async function ensureAccountAccess({
  uid,
  email,
  name,
  cuentaId,
  cuentaNombre = '',
  role = 'owner',
}) {
  const profile = buildProfile({ uid, email, name, cuentaId, cuentaNombre, role, active: true });
  const normalizedCuentaId = profile.cuentaId;
  const normalizedEmail = profile.email;

  if (!uid) throw new Error('No se pudo resolver el UID del usuario.');
  if (!normalizedCuentaId) throw new Error('Falta el ID de la cuenta.');

  const [cuentaSnapshot, usuariosConfigSnap] = await Promise.all([
    getDoc(cuentaRef(normalizedCuentaId)),
    getDoc(cuentaConfigRef(normalizedCuentaId, 'usuarios')),
  ]);

  const existingCuenta = cuentaSnapshot.exists() ? cuentaSnapshot.data() || {} : {};
  const ownerUid = String(existingCuenta.ownerUid || '').trim();
  const ownerEmail = normalizeEmail(existingCuenta.ownerEmail);
  const isOwnerRole = profile.role === 'owner' || profile.role === 'admin_full';

  if (ownerUid && ownerUid !== uid && ownerEmail && ownerEmail !== normalizedEmail) {
    throw new Error('La cuenta ya está vinculada a otro owner.');
  }

  const usuariosConfig = usuariosConfigSnap.exists() ? usuariosConfigSnap.data() || {} : {};
  const cuentaNombreFinal =
    String(profile.cuentaNombre || '').trim() ||
    String(existingCuenta.nombre || '').trim() ||
    normalizedCuentaId;

  const nextOwnerUid = isOwnerRole ? uid : existingCuenta.ownerUid || '';
  const nextOwnerEmail = isOwnerRole ? normalizedEmail : ownerEmail || normalizedEmail;
  const shouldBootstrapRootFirst = !cuentaSnapshot.exists() || (!ownerUid && ownerEmail === normalizedEmail);

  if (shouldBootstrapRootFirst) {
    await setDoc(
      cuentaRef(normalizedCuentaId),
      {
        cuentaId: normalizedCuentaId,
        nombre: cuentaNombreFinal,
        ownerUid: nextOwnerUid,
        ownerEmail: nextOwnerEmail,
        activo: existingCuenta.activo !== false,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  const batch = writeBatch(db);

  batch.set(
    userProfileRef(uid),
    {
      ...profile,
      cuentaNombre: cuentaNombreFinal,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(
    cuentaUsuarioRef(normalizedCuentaId, uid),
    {
      uid,
      email: normalizedEmail,
      name: profile.name,
      cuentaId: normalizedCuentaId,
      cuentaNombre: cuentaNombreFinal,
      role: profile.role,
      active: true,
      owner: isOwnerRole,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(
    cuentaConfigRef(normalizedCuentaId, 'app'),
    {
      cuentaId: normalizedCuentaId,
      nombreCorralon: cuentaNombreFinal,
      ownerUid: nextOwnerUid,
      ownerEmail: nextOwnerEmail,
      activo: true,
      moneda: 'ARS',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(
    cuentaConfigRef(normalizedCuentaId, 'usuarios'),
    {
      ...usuariosConfig,
      adminFull: mergeUniqueEmails(usuariosConfig.adminFull || usuariosConfig.admins, normalizedEmail),
      admins: mergeUniqueEmails(usuariosConfig.admins, normalizedEmail),
      operadores: Array.isArray(usuariosConfig.operadores) ? usuariosConfig.operadores : [],
      vendedores: Array.isArray(usuariosConfig.vendedores) ? usuariosConfig.vendedores : [],
      soloLectura: Array.isArray(usuariosConfig.soloLectura) ? usuariosConfig.soloLectura : [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(
    cuentaConfigRef(normalizedCuentaId, 'permisosAridos'),
    {
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  return {
    ...profile,
    cuentaNombre: cuentaNombreFinal,
  };
}

export async function resolveProfileFromFirestore({ uid, email, displayName = '' }) {
  const normalizedEmail = normalizeEmail(email);
  if (!uid || !normalizedEmail) return null;

  const directProfile = await fetchUserProfile(uid);
  if (directProfile) {
    const fixedProfile = buildProfile({
      uid,
      email: directProfile.email || normalizedEmail,
      name: directProfile.name || displayName || normalizedEmail,
      cuentaId: directProfile.cuentaId,
      cuentaNombre: directProfile.cuentaNombre,
      role: directProfile.role || 'owner',
      active: directProfile.active !== false,
    });

    await ensureAccountAccess(fixedProfile);
    return fixedProfile;
  }

  const membership = await findMembershipByUid(uid);
  if (membership?.cuentaId) {
    const membershipProfile = buildProfile({
      uid,
      email: membership.email || normalizedEmail,
      name: membership.name || displayName || normalizedEmail,
      cuentaId: membership.cuentaId,
      cuentaNombre: membership.cuentaNombre,
      role: membership.role || 'admin',
      active: membership.active !== false,
    });

    await ensureAccountAccess(membershipProfile);
    return membershipProfile;
  }

  const ownerCuenta = await findCuentaByOwnerEmail(normalizedEmail);
  if (ownerCuenta?.id) {
    const ownerProfile = buildProfile({
      uid,
      email: normalizedEmail,
      name: displayName || normalizedEmail,
      cuentaId: ownerCuenta.id,
      cuentaNombre: ownerCuenta.nombre || ownerCuenta.cuentaId || ownerCuenta.id,
      role: 'owner',
      active: ownerCuenta.activo !== false,
    });

    await ensureAccountAccess(ownerProfile);
    return ownerProfile;
  }

  return null;
}
