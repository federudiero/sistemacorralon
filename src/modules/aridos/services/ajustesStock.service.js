import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { MOVIMIENTO_TIPOS } from '../utils/constants';
import { assertStockAvailable, requirePositiveNumber, requireString } from '../utils/validators';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { subscribeCollection, docRef } from './base';

function normalizePayload(payload = {}) {
  requireString(payload.productoId, 'producto');
  requireString(payload.tipo, 'tipo');
  requireString(payload.motivo, 'motivo');
  requirePositiveNumber(payload.cantidad, 'cantidad');
  const fecha = payload.fecha ? parseInputDate(payload.fecha, { baseTime: new Date() }) : new Date();
  const fechaStr = buildDateStr(fecha);
  return {
    fecha,
    fechaStr,
    productoId: payload.productoId,
    productoNombre: payload.productoNombre || '',
    unidadStock: payload.unidadStock || payload.unidad || 'm3',
    pesoBolsaKg: payload.pesoBolsaKg ? Number(payload.pesoBolsaKg) : null,
    tipo: payload.tipo,
    cantidad: Number(payload.cantidad),
    motivo: String(payload.motivo || '').trim(),
  };
}

export async function createAjusteStock(cuentaId, payload, userEmail) {
  const data = normalizePayload(payload);
  const productoRef = doc(db, `cuentas/${cuentaId}/productos/${data.productoId}`);
  const ajustesRef = collection(db, `cuentas/${cuentaId}/ajustesStock`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);
  const cierreRef = docRef(cuentaId, 'cierresCaja', data.fechaStr);

  await runTransaction(db, async (tx) => {
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${data.fechaStr} ya está cerrado. No se pueden registrar ajustes nuevos.`);
    }

    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = Number(producto.stockActual || producto.stockTotalM3 || 0);
    const isNegative = data.tipo === MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO || data.tipo === MOVIMIENTO_TIPOS.MERMA;
    const delta = isNegative ? -data.cantidad : data.cantidad;

    if (isNegative) {
      assertStockAvailable(stockActual, data.cantidad);
    }

    const ajusteDoc = doc(ajustesRef);
    tx.set(ajusteDoc, {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
      autorizadoPor: userEmail || null,
    });

    tx.update(productoRef, {
      stockActual: stockActual + delta,
      stockTotalM3: stockActual + delta,
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: data.fecha,
      fechaStr: data.fechaStr,
      tipo: data.tipo,
      productoId: data.productoId,
      productoNombre: data.productoNombre || producto.nombre || '',
      unidadStock: data.unidadStock,
      pesoBolsaKg: data.pesoBolsaKg,
      cantidad: delta,
      referenciaTipo: 'ajuste_stock',
      referenciaId: ajusteDoc.id,
      motivo: data.motivo,
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeAjustesStock(cuentaId, filters, callback) {
  return subscribeCollection(cuentaId, 'ajustesStock', callback, {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  });
}
