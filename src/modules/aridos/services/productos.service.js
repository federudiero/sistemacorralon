import { createDoc, getById, subscribeCollection, updateById } from './base';
import { requireBolsaKg, requireNonNegativeNumber, requireString } from '../utils/validators';

function sanitizePayload(payload = {}) {
  requireString(payload.nombre, 'nombre');
  requireString(payload.unidadStock || payload.unidad || 'm3', 'unidad');
  requireNonNegativeNumber(payload.precioVenta ?? 0, 'precio de venta');
  requireNonNegativeNumber(payload.costoPromedio ?? 0, 'costo promedio');
  requireNonNegativeNumber(payload.stockMinimo ?? payload.stockMinimoM3 ?? 0, 'stock mínimo');

  const unidadStock = String(payload.unidadStock || payload.unidad || 'm3').trim();
  const pesoBolsaKg = unidadStock === 'bolsa' ? Number(payload.pesoBolsaKg || 0) : null;
  if (unidadStock === 'bolsa') requireBolsaKg(pesoBolsaKg);

  return {
    nombre: String(payload.nombre).trim(),
    categoria: String(payload.categoria || 'áridos').trim(),
    unidadStock,
    unidad: unidadStock,
    pesoBolsaKg,
    precioVenta: Number(payload.precioVenta || 0),
    costoPromedio: Number(payload.costoPromedio || 0),
    stockMinimo: Number(payload.stockMinimo ?? payload.stockMinimoM3 ?? 0),
    stockMinimoM3: Number(payload.stockMinimo ?? payload.stockMinimoM3 ?? 0),
    activo: payload.activo !== false,
  };
}

export async function createProducto(cuentaId, payload, userEmail) {
  const data = sanitizePayload(payload);
  const stockActual = Number(payload.stockActual ?? payload.stockTotalM3 ?? 0);
  return createDoc(cuentaId, 'productos', {
    ...data,
    stockActual,
    stockTotalM3: stockActual,
    createdBy: userEmail || null,
    updatedBy: userEmail || null,
  });
}

export async function updateProducto(cuentaId, productoId, payload, userEmail) {
  const data = sanitizePayload(payload);
  return updateById(cuentaId, 'productos', productoId, {
    ...data,
    updatedBy: userEmail || null,
  });
}

export function subscribeProductos(cuentaId, callback) {
  return subscribeCollection(cuentaId, 'productos', callback, {
    orderBy: [{ field: 'nombre', direction: 'asc' }],
  });
}

export function getProductoById(cuentaId, productoId) {
  return getById(cuentaId, 'productos', productoId);
}
