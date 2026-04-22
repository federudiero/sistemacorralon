import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { requireNonNegativeNumber, requirePositiveNumber, requireString } from '../utils/validators';
import { MOVIMIENTO_TIPOS } from '../utils/constants';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { buildStockFields, calculateWeightedAverageCost, getStockActual } from '../utils/stock';
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
    presentacionIngreso: payload.presentacionIngreso || 'reposicion',
    detalleLogistico: String(payload.detalleLogistico || '').trim(),
    remitoNumero: String(payload.remitoNumero || '').trim(),
    observaciones: String(payload.observaciones || '').trim(),
    estado: 'confirmado',
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
    const stockActual = getStockActual(producto);
    const ingresoDoc = doc(ingresosRef);
    const costoActualAnterior = Number(producto.costoActual ?? producto.costoPromedio ?? 0);
    const costoPromedioAnterior = Number(producto.costoPromedio ?? producto.costoActual ?? 0);
    const nuevoCostoActual = Number(data.costoUnitario || costoActualAnterior || 0);
    const nuevoCostoPromedio = calculateWeightedAverageCost({
      stockAnterior: stockActual,
      costoPromedioAnterior,
      cantidadIngresada: data.cantidad,
      costoUnitarioIngresado: data.costoUnitario,
    });
    const nuevoStock = stockActual + data.cantidad;

    tx.set(ingresoDoc, {
      ...data,
      stockAnterior: stockActual,
      stockPosterior: nuevoStock,
      costoActualAnterior,
      costoPromedioAnterior,
      costoActualPosterior: nuevoCostoActual,
      costoPromedioPosterior: nuevoCostoPromedio,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
    });

    tx.update(productoRef, {
      ...buildStockFields(producto.unidadStock || producto.unidad || data.unidadStock, nuevoStock),
      costoActual: nuevoCostoActual,
      costoPromedio: nuevoCostoPromedio,
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
      motivo: data.remitoNumero ? `Remito ${data.remitoNumero}` : 'Reposición',
      detalleLogistico: data.detalleLogistico || data.observaciones || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}

export async function anularIngresoCamion(cuentaId, ingresoId, motivo, userEmail) {
  const ingresoRef = doc(db, `cuentas/${cuentaId}/ingresosCamion/${ingresoId}`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);

  await runTransaction(db, async (tx) => {
    const ingresoSnap = await tx.get(ingresoRef);
    if (!ingresoSnap.exists()) throw new Error('La reposición ya no existe.');

    const ingreso = ingresoSnap.data();
    if (ingreso.estado === 'anulado') {
      throw new Error('La reposición ya estaba anulada.');
    }

    const cierreRef = docRef(cuentaId, 'cierresCaja', ingreso.fechaStr);
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${ingreso.fechaStr} ya está cerrado. No se puede anular la reposición.`);
    }

    const productoRef = doc(db, `cuentas/${cuentaId}/productos/${ingreso.productoId}`);
    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = getStockActual(producto);
    const nuevoStock = stockActual - Number(ingreso.cantidad || 0);
    if (nuevoStock < 0) {
      throw new Error('No se puede anular la reposición porque el stock actual quedaría negativo.');
    }

    tx.update(ingresoRef, {
      estado: 'anulado',
      anuladaAt: serverTimestamp(),
      anuladaBy: userEmail || null,
      motivoAnulacion: String(motivo || 'Anulación manual de reposición').trim(),
      updatedAt: serverTimestamp(),
    });

    tx.update(productoRef, {
      ...buildStockFields(producto.unidadStock || producto.unidad || ingreso.unidadStock, nuevoStock),
      costoActual: Number(ingreso.costoActualAnterior ?? producto.costoActual ?? producto.costoPromedio ?? 0),
      costoPromedio: Number(ingreso.costoPromedioAnterior ?? producto.costoPromedio ?? producto.costoActual ?? 0),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: new Date(),
      fechaStr: ingreso.fechaStr,
      tipo: MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO,
      productoId: ingreso.productoId,
      productoNombre: ingreso.productoNombre || producto.nombre || '',
      unidadStock: ingreso.unidadStock || producto.unidadStock || producto.unidad || 'm3',
      pesoBolsaKg: ingreso.pesoBolsaKg || producto.pesoBolsaKg || null,
      cantidad: -Math.abs(Number(ingreso.cantidad || 0)),
      montoTotal: Number(ingreso.costoTotal || 0),
      referenciaTipo: 'ingreso_anulado',
      referenciaId: ingresoId,
      motivo: String(motivo || 'Anulación manual de reposición').trim(),
      detalleLogistico: ingreso.remitoNumero ? `Reverso remito ${ingreso.remitoNumero}` : 'Reverso de reposición',
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
