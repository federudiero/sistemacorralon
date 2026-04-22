import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { MOVIMIENTO_TIPOS } from '../utils/constants';
import { assertStockAvailable, requirePositiveNumber, requireString } from '../utils/validators';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { buildStockFields, getAjusteDelta, getAjusteReversionTipo, getStockActual } from '../utils/stock';
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
    const stockActual = getStockActual(producto);
    const isNegative = data.tipo === MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO || data.tipo === MOVIMIENTO_TIPOS.MERMA;
    const delta = getAjusteDelta(data.tipo, data.cantidad);

    if (isNegative) {
      assertStockAvailable(stockActual, data.cantidad);
    }

    const ajusteDoc = doc(ajustesRef);
    tx.set(ajusteDoc, {
      ...data,
      deltaStock: delta,
      revertido: false,
      revertidoAt: null,
      revertidoBy: null,
      motivoReversion: '',
      reversionAjusteId: null,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
      autorizadoPor: userEmail || null,
    });

    tx.update(productoRef, {
      ...buildStockFields(producto.unidadStock || producto.unidad || data.unidadStock, stockActual + delta),
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


export async function anularAjusteStock(cuentaId, ajusteId, motivo, userEmail) {
  const ajusteRef = doc(db, `cuentas/${cuentaId}/ajustesStock/${ajusteId}`);
  const ajustesRef = collection(db, `cuentas/${cuentaId}/ajustesStock`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);
  const fechaReversion = new Date();
  const fechaReversionStr = buildDateStr(fechaReversion);
  const cierreReversionRef = docRef(cuentaId, 'cierresCaja', fechaReversionStr);

  await runTransaction(db, async (tx) => {
    const cierreSnap = await tx.get(cierreReversionRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${fechaReversionStr} ya está cerrado. No se puede revertir el ajuste ahora.`);
    }

    const ajusteSnap = await tx.get(ajusteRef);
    if (!ajusteSnap.exists()) throw new Error('El ajuste ya no existe.');

    const ajuste = ajusteSnap.data();
    if (ajuste.revertido || ajuste.revertidoAt || ajuste.reversionAjusteId) {
      throw new Error('El ajuste ya fue revertido.');
    }

    const productoRef = doc(db, `cuentas/${cuentaId}/productos/${ajuste.productoId}`);
    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = getStockActual(producto);
    const deltaOriginal = Number(ajuste.deltaStock != null ? ajuste.deltaStock : getAjusteDelta(ajuste.tipo, ajuste.cantidad));
    const deltaReversion = -deltaOriginal;

    if (deltaReversion < 0) {
      assertStockAvailable(stockActual, Math.abs(deltaReversion));
    }

    const stockNuevo = stockActual + deltaReversion;
    const tipoReversion = getAjusteReversionTipo(ajuste.tipo);
    const motivoReversion = String(motivo || 'Reversión manual de ajuste').trim();
    const reversionAjusteRef = doc(ajustesRef);
    const reversionMovimientoRef = doc(movimientosRef);

    tx.set(reversionAjusteRef, {
      fecha: fechaReversion,
      fechaStr: fechaReversionStr,
      productoId: ajuste.productoId,
      productoNombre: ajuste.productoNombre || producto.nombre || '',
      unidadStock: ajuste.unidadStock || producto.unidadStock || producto.unidad || 'm3',
      pesoBolsaKg: ajuste.pesoBolsaKg || producto.pesoBolsaKg || null,
      tipo: tipoReversion,
      cantidad: Number(ajuste.cantidad || 0),
      deltaStock: deltaReversion,
      motivo: `Reversión de ajuste ${ajusteId}`,
      observaciones: motivoReversion,
      esReversion: true,
      ajusteOriginalId: ajusteId,
      revertido: false,
      revertidoAt: null,
      revertidoBy: null,
      motivoReversion: '',
      reversionAjusteId: null,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
      autorizadoPor: userEmail || null,
    });

    tx.update(ajusteRef, {
      revertido: true,
      revertidoAt: serverTimestamp(),
      revertidoBy: userEmail || null,
      motivoReversion,
      reversionAjusteId: reversionAjusteRef.id,
      updatedAt: serverTimestamp(),
    });

    tx.update(productoRef, {
      ...buildStockFields(producto.unidadStock || producto.unidad || ajuste.unidadStock, stockNuevo),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    tx.set(reversionMovimientoRef, {
      fecha: fechaReversion,
      fechaStr: fechaReversionStr,
      tipo: tipoReversion,
      productoId: ajuste.productoId,
      productoNombre: ajuste.productoNombre || producto.nombre || '',
      unidadStock: ajuste.unidadStock || producto.unidadStock || producto.unidad || 'm3',
      pesoBolsaKg: ajuste.pesoBolsaKg || producto.pesoBolsaKg || null,
      cantidad: deltaReversion,
      referenciaTipo: 'ajuste_revertido',
      referenciaId: ajusteId,
      motivo: motivoReversion,
      detalleLogistico: `Reversión de ajuste ${ajusteId}`,
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
