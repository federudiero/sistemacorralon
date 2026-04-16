import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/firebase';

function getCallable(name) {
  return httpsCallable(functions, name);
}

function normalizeCallableError(error, fallbackMessage) {
  const code = String(error?.code || '').replace('functions/', '');

  switch (code) {
    case 'unauthenticated':
      return 'La sesión no es válida para completar el alta segura.';
    case 'already-exists':
      return 'La cuenta ya tiene un owner vinculado a otro usuario.';
    case 'permission-denied':
      return 'La cuenta existe pero está reservada para otro email owner.';
    case 'invalid-argument':
      return error?.message || 'Faltan datos para completar el alta segura.';
    case 'internal':
      return error?.message || fallbackMessage;
    default:
      return error?.message || fallbackMessage;
  }
}

export async function bootstrapOwnerAccount(payload) {
  try {
    const call = getCallable('bootstrapOwnerAccount');
    const result = await call(payload);
    return result?.data?.profile || null;
  } catch (error) {
    throw new Error(normalizeCallableError(error, 'No se pudo completar el alta segura de la cuenta.'));
  }
}

export async function syncOwnerAccount(payload) {
  try {
    const call = getCallable('syncOwnerAccount');
    const result = await call(payload);
    return result?.data?.profile || null;
  } catch (error) {
    throw new Error(normalizeCallableError(error, 'No se pudo sincronizar el acceso de la cuenta.'));
  }
}
