import { createDoc, getById, subscribeCollection, updateById } from './base';
import { requireNonNegativeNumber, requireString } from '../utils/validators';

function sanitizePayload(payload = {}) {
  requireString(payload.nombre, 'nombre');
  requireNonNegativeNumber(payload.capacidadM3 ?? 0, 'capacidad');

  return {
    nombre: String(payload.nombre).trim(),
    codigo: String(payload.codigo || '').trim(),
    capacidadM3: Number(payload.capacidadM3 || 0),
    productoId: payload.productoId || '',
    productoNombre: payload.productoNombre || '',
    activa: payload.activa !== false,
    observaciones: String(payload.observaciones || '').trim(),
    // stockActualM3 se mantiene fuera del catálogo
  };
}

export async function createBatea(cuentaId, payload, userEmail) {
  const data = sanitizePayload(payload);
  return createDoc(cuentaId, 'bateas', {
    ...data,
    stockActualM3: Number(payload.stockActualM3 || 0),
    createdBy: userEmail || null,
    updatedBy: userEmail || null,
  });
}

export async function updateBatea(cuentaId, bateaId, payload, userEmail) {
  const data = sanitizePayload(payload);
  return updateById(cuentaId, 'bateas', bateaId, {
    ...data,
    updatedBy: userEmail || null,
  });
}

export function subscribeBateas(cuentaId, callback) {
  return subscribeCollection(cuentaId, 'bateas', callback, {
    orderBy: [{ field: 'nombre', direction: 'asc' }],
  });
}

export function getBateaById(cuentaId, bateaId) {
  return getById(cuentaId, 'bateas', bateaId);
}
