import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import * as logger from 'firebase-functions/logger';

setGlobalOptions({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30,
  maxInstances: 10,
});

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();
const USERS_COLLECTION = 'aridos_usuarios';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCuentaId(value) {
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

function sanitizeName(value) {
  return String(value || '').trim();
}

function normalizeArray(values) {
  return Array.isArray(values)
    ? values.filter((item) => typeof item === 'string' && item.trim())
    : [];
}

function mergeUniqueEmails(values, email) {
  const merged = new Set(
    normalizeArray(values)
      .map((item) => normalizeEmail(item))
      .filter(Boolean),
  );

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) merged.add(normalizedEmail);

  return Array.from(merged);
}

function assertAuthenticated(request) {
  const uid = request.auth?.uid;
  const email = normalizeEmail(request.auth?.token?.email);

  if (!uid || !email) {
    throw new HttpsError(
      'unauthenticated',
      'Tenés que iniciar sesión para completar esta operación.',
    );
  }

  return { uid, email };
}

async function upsertAccountAccess({ uid, email, cuentaId, cuentaNombre, name }) {
  const normalizedCuentaId = normalizeCuentaId(cuentaId);
  const normalizedEmail = normalizeEmail(email);
  const safeName = sanitizeName(name) || normalizedEmail;

  if (!normalizedCuentaId) {
    throw new HttpsError('invalid-argument', 'Falta el ID del corralón o cuenta.');
  }

  const cuentaRef = db.doc(`cuentas/${normalizedCuentaId}`);
  const profileRef = db.doc(`${USERS_COLLECTION}/${uid}`);
  const memberRef = db.doc(`cuentas/${normalizedCuentaId}/usuarios/${uid}`);
  const appConfigRef = db.doc(`cuentas/${normalizedCuentaId}/config/app`);
  const usersConfigRef = db.doc(`cuentas/${normalizedCuentaId}/config/usuarios`);
  const permisosRef = db.doc(`cuentas/${normalizedCuentaId}/config/permisosAridos`);

  const [cuentaSnap, usersConfigSnap] = await Promise.all([
    cuentaRef.get(),
    usersConfigRef.get(),
  ]);

  const cuentaData = cuentaSnap.exists ? (cuentaSnap.data() || {}) : {};
  const usersConfigData = usersConfigSnap.exists ? (usersConfigSnap.data() || {}) : {};

  const existingOwnerUid = sanitizeName(cuentaData.ownerUid);
  const existingOwnerEmail = normalizeEmail(cuentaData.ownerEmail);

  if (
    existingOwnerUid &&
    existingOwnerUid !== uid &&
    existingOwnerEmail &&
    existingOwnerEmail !== normalizedEmail
  ) {
    throw new HttpsError(
      'already-exists',
      'Esta cuenta ya tiene un owner vinculado a otro usuario.',
    );
  }

  if (!existingOwnerUid && existingOwnerEmail && existingOwnerEmail !== normalizedEmail) {
    throw new HttpsError(
      'permission-denied',
      'Esta cuenta ya está reservada para otro email owner.',
    );
  }

  const finalCuentaNombre =
    sanitizeName(cuentaNombre) ||
    sanitizeName(cuentaData.nombre) ||
    normalizedCuentaId;

  const now = FieldValue.serverTimestamp();
  const batch = db.batch();

  batch.set(
    cuentaRef,
    {
      cuentaId: normalizedCuentaId,
      nombre: finalCuentaNombre,
      ownerUid: uid,
      ownerEmail: normalizedEmail,
      activo: cuentaData.activo !== false,
      createdAt: cuentaData.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    profileRef,
    {
      uid,
      email: normalizedEmail,
      name: safeName,
      cuentaId: normalizedCuentaId,
      cuentaNombre: finalCuentaNombre,
      role: 'owner',
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    memberRef,
    {
      uid,
      email: normalizedEmail,
      name: safeName,
      cuentaId: normalizedCuentaId,
      cuentaNombre: finalCuentaNombre,
      role: 'owner',
      owner: true,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    appConfigRef,
    {
      cuentaId: normalizedCuentaId,
      nombreCorralon: finalCuentaNombre,
      ownerUid: uid,
      ownerEmail: normalizedEmail,
      activo: true,
      moneda: 'ARS',
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    usersConfigRef,
    {
      ...usersConfigData,
      adminFull: mergeUniqueEmails(
        usersConfigData.adminFull || usersConfigData.admins,
        normalizedEmail,
      ),
      admins: mergeUniqueEmails(usersConfigData.admins, normalizedEmail),
      operadores: normalizeArray(usersConfigData.operadores),
      vendedores: normalizeArray(usersConfigData.vendedores),
      soloLectura: normalizeArray(usersConfigData.soloLectura),
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    permisosRef,
    {
      updatedAt: now,
    },
    { merge: true },
  );

  await batch.commit();

  return {
    uid,
    email: normalizedEmail,
    name: safeName,
    cuentaId: normalizedCuentaId,
    cuentaNombre: finalCuentaNombre,
    role: 'owner',
    active: true,
  };
}

const callableOptions = {
  cors: true,
  invoker: 'public',
};

async function handleBootstrap(request) {
  const { uid, email } = assertAuthenticated(request);
  const cuentaId = normalizeCuentaId(request.data?.cuentaId);
  const cuentaNombre = sanitizeName(request.data?.cuentaNombre);
  const name = sanitizeName(request.data?.name);

  logger.info('bootstrap:start', {
    uid,
    email,
    cuentaId,
    cuentaNombre,
  });

  try {
    const profile = await upsertAccountAccess({
      uid,
      email,
      cuentaId,
      cuentaNombre,
      name,
    });

    logger.info('bootstrap:success', {
      uid,
      cuentaId: profile.cuentaId,
    });

    return { ok: true, profile };
  } catch (error) {
    if (error instanceof HttpsError) {
      logger.warn('bootstrap:handled_error', {
        uid,
        cuentaId,
        code: error.code,
        message: error.message,
      });
      throw error;
    }

    logger.error('bootstrap:internal_error', {
      uid,
      cuentaId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || null,
    });

    throw new HttpsError(
      'internal',
      error?.message || 'No se pudo completar el bootstrap seguro de la cuenta.',
    );
  }
}

export const bootstrapOwnerAccount = onCall(callableOptions, handleBootstrap);
export const syncOwnerAccount = onCall(callableOptions, handleBootstrap);