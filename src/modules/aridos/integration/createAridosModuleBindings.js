import { normalizeEmail } from '../utils/permissions';

export function createAridosModuleBindings({ getCuentaId, getCurrentUserEmail }) {
  return function resolveAridosModuleBindings() {
    const cuentaId = typeof getCuentaId === 'function' ? getCuentaId() : '';
    const currentUserEmail = normalizeEmail(
      typeof getCurrentUserEmail === 'function' ? getCurrentUserEmail() : ''
    );

    return {
      cuentaId: String(cuentaId || '').trim(),
      currentUserEmail,
      isReady: Boolean(cuentaId && currentUserEmail),
    };
  };
}
