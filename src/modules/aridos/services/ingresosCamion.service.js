import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { requireNonNegativeNumber, requirePositiveNumber, requireString } from '../utils/validators';
import { MOVIMIENTO_TIPOS } from '../utils/constants';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { subscribeCollection, docRef } from './base';

function normalizePayload(payload = {}) {
  requireString(payload.proveedorId || payload.proveedorNombre, 'proveedor');
  requireString(payload.productoId, 'producto');
  requirePositiveNumber(payload.cantidad, 'cantidad');
  requireNonNegativeNumber(payload.costoUnitario ?? 0, 'costo unitario');

  const fecha = payload.fecha ? parseInputDate(payload.fecha, { baseTime: new Date() }) : new Date();
  const fechaStr = buildDateStr(fecha);

  return {
    fecha,
    fechaStr,
    proveedorId: payload.proveedorId || '',
    proveedorNombre: payload.proveedorNombre || '',
    patente: String(payload.patente || '').trim(),
    chofer: String(payload.chofer || '').trim(),
    productoId: payload.productoId,
    productoNombre: payload.productoNombre || '',
    unidadStock: payload.unidadStock || payload.unidad || 'm3',
    pesoBolsaKg: payload.pesoBolsaKg ? Number(payload.pesoBolsaKg) : null,
    cantidad: Number(payload.cantidad),
    costoUnitario: Number(payload.costoUnitario || 0),
    costoTotal: Number(payload.cantidad) * Number(payload.costoUnitario || 0),
    presentacionIngreso: payload.presentacionIngreso || 'batea_20_24',
    detalleLogistico: String(payload.detalleLogistico || '').trim(),
    remitoNumero: String(payload.remitoNumero || '').trim(),
    observaciones: String(payload.observaciones || '').trim(),
  };
}

export async function createIngresoCamion(cuentaId, payload, userEmail) {
  const data = normalizePayload(payload);
  const productoRef = doc(db, `cuentas/${cuentaId}/productos/${data.productoId}`);
  const ingresosRef = collection(db, `cuentas/${cuentaId}/ingresosCamion`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);
  const cierreRef = docRef(cuentaId, 'cierresCaja', data.fechaStr);

  await runTransaction(db, async (tx) => {
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${data.fechaStr} ya está cerrado. No se pueden registrar reposiciones nuevas.`);
    }

    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = Number(producto.stockActual || producto.stockTotalM3 || 0);
    const ingresoDoc = doc(ingresosRef);

    tx.set(ingresoDoc, {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
    });

    tx.update(productoRef, {
      stockActual: stockActual + data.cantidad,
      stockTotalM3: stockActual + data.cantidad,
      costoPromedio: data.costoUnitario || Number(producto.costoPromedio || 0),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: data.fecha,
      fechaStr: data.fechaStr,
      tipo: MOVIMIENTO_TIPOS.INGRESO_CAMION,
      productoId: data.productoId,
      productoNombre: data.productoNombre || producto.nombre || '',
      unidadStock: data.unidadStock,
      pesoBolsaKg: data.pesoBolsaKg,
      cantidad: data.cantidad,
      montoTotal: data.costoTotal,
      referenciaTipo: 'ingreso_reposicion',
      referenciaId: ingresoDoc.id,
      motivo: data.remitoNumero ? `Remito ${data.remitoNumero}` : data.presentacionIngreso,
      detalleLogistico: data.detalleLogistico || data.observaciones || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeIngresosCamion(cuentaId, filters, callback) {
  return subscribeCollection(cuentaId, 'ingresosCamion', callback, {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  });
}
