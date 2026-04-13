import { createDoc, getById, subscribeCollection, updateById } from './base';
import { requireString } from '../utils/validators';

function sanitizePayload(payload = {}) {
  requireString(payload.nombre, 'nombre');
  return {
    nombre: String(payload.nombre).trim(),
    telefono: String(payload.telefono || '').trim(),
    direccion: String(payload.direccion || '').trim(),
    cuit: String(payload.cuit || '').trim(),
    activo: payload.activo !== false,
  };
}

export async function createProveedor(cuentaId, payload) {
  return createDoc(cuentaId, 'proveedores', sanitizePayload(payload));
}

export async function updateProveedor(cuentaId, proveedorId, payload) {
  return updateById(cuentaId, 'proveedores', proveedorId, sanitizePayload(payload));
}

export function subscribeProveedores(cuentaId, callback) {
  return subscribeCollection(cuentaId, 'proveedores', callback, {
    orderBy: [{ field: 'nombre', direction: 'asc' }],
  });
}

export function getProveedorById(cuentaId, proveedorId) {
  return getById(cuentaId, 'proveedores', proveedorId);
}
