import { createDoc, getById, subscribeCollection, updateById } from './base';
import { requireString } from '../utils/validators';

function sanitizePayload(payload = {}) {
  requireString(payload.nombre, 'nombre');
  return {
    nombre: String(payload.nombre).trim(),
    alias: String(payload.alias || '').trim(),
    telefono: String(payload.telefono || '').trim(),
    direccion: String(payload.direccion || '').trim(),
    cuitDni: String(payload.cuitDni || '').trim(),
    saldoCuentaCorriente: Number(payload.saldoCuentaCorriente || 0),
    limiteCuentaCorriente: Number(payload.limiteCuentaCorriente || 0),
    esGenerico: Boolean(payload.esGenerico),
    activo: payload.activo !== false,
  };
}

export async function createCliente(cuentaId, payload) {
  return createDoc(cuentaId, 'clientes', sanitizePayload(payload));
}

export async function updateCliente(cuentaId, clienteId, payload) {
  return updateById(cuentaId, 'clientes', clienteId, sanitizePayload(payload));
}

export function subscribeClientes(cuentaId, callback) {
  return subscribeCollection(cuentaId, 'clientes', callback, {
    orderBy: [{ field: 'nombre', direction: 'asc' }],
  });
}

export function getClienteById(cuentaId, clienteId) {
  return getById(cuentaId, 'clientes', clienteId);
}
