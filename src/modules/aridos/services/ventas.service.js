import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import {
  assertStockAvailable,
  requireNonNegativeNumber,
  requirePositiveNumber,
  requireString,
} from '../utils/validators';
import { MOVIMIENTO_TIPOS, VENTA_ESTADOS } from '../utils/constants';
import { subscribeCollection, docRef } from './base';

function normalizePayload(payload = {}) {
  requireString(payload.clienteNombre || payload.clienteId, 'cliente');
  requireString(payload.productoId, 'producto');
  requirePositiveNumber(payload.cantidad, 'cantidad');
  requireNonNegativeNumber(payload.precioUnitario ?? 0, 'precio unitario');
  requireNonNegativeNumber(payload.envioMonto ?? 0, 'envío');

  const fecha = payload.fecha ? new Date(payload.fecha) : new Date();
  const fechaStr = `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}-${`${fecha.getDate()}`.padStart(2, '0')}`;
  const subtotal = Number(payload.cantidad) * Number(payload.precioUnitario || 0);
  const envioMonto = Number(payload.tipoEntrega === 'envio' ? payload.envioMonto || 0 : 0);
  const total = subtotal + envioMonto;

  return {
    fecha,
    fechaStr,
    clienteId: payload.clienteId || '',
    clienteNombre: payload.clienteNombre || '',
    telefono: String(payload.telefono || '').trim(),
    direccion: String(payload.direccion || '').trim(),
    productoId: payload.productoId,
    productoNombre: payload.productoNombre || '',
    unidadStock: payload.unidadStock || payload.unidad || 'm3',
    pesoBolsaKg: payload.pesoBolsaKg ? Number(payload.pesoBolsaKg) : null,
    cantidad: Number(payload.cantidad),
    precioUnitario: Number(payload.precioUnitario || 0),
    subtotal,
    envioMonto,
    total,
    tipoEntrega: payload.tipoEntrega || 'retiro',
    metodoPago: payload.metodoPago || 'efectivo',
    vehiculoEntrega: payload.vehiculoEntrega || 'retiro_cliente',
    detalleEntrega: String(payload.detalleEntrega || '').trim(),
    observaciones: String(payload.observaciones || '').trim(),
    estado: VENTA_ESTADOS.CONFIRMADA,
    remitoGenerado: false,
    remitoId: null,
  };
}

function getStockActual(producto) {
  return Number(producto.stockActual ?? producto.stockTotalM3 ?? 0);
}

export async function createVenta(cuentaId, payload, userEmail) {
  const data = normalizePayload(payload);

  const productoRef = doc(db, `cuentas/${cuentaId}/productos/${data.productoId}`);
  const ventasRef = collection(db, `cuentas/${cuentaId}/ventas`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);
  const cierreRef = docRef(cuentaId, 'cierresCaja', data.fechaStr);

  await runTransaction(db, async (tx) => {
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${data.fechaStr} ya está cerrado. No se pueden cargar ventas nuevas.`);
    }

    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = getStockActual(producto);

    assertStockAvailable(stockActual, data.cantidad);

    const ventaDoc = doc(ventasRef);
    tx.set(ventaDoc, {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
    });

    tx.update(productoRef, {
      stockActual: stockActual - data.cantidad,
      stockTotalM3: stockActual - data.cantidad,
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: data.fecha,
      fechaStr: data.fechaStr,
      tipo: MOVIMIENTO_TIPOS.VENTA,
      productoId: data.productoId,
      productoNombre: data.productoNombre || producto.nombre || '',
      unidadStock: data.unidadStock,
      pesoBolsaKg: data.pesoBolsaKg,
      cantidad: -data.cantidad,
      montoTotal: data.total,
      montoEnvio: data.envioMonto,
      referenciaTipo: 'venta',
      referenciaId: ventaDoc.id,
      motivo:
        data.tipoEntrega === 'envio'
          ? `Envío ${data.vehiculoEntrega || ''}`.trim()
          : 'Retiro en corralón',
      detalleLogistico: data.detalleEntrega || data.observaciones || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}

export async function anularVenta(cuentaId, ventaId, motivo, userEmail) {
  const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${ventaId}`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);

  await runTransaction(db, async (tx) => {
    const ventaSnap = await tx.get(ventaRef);
    if (!ventaSnap.exists()) throw new Error('Venta inexistente.');

    const venta = ventaSnap.data();
    if (venta.estado === VENTA_ESTADOS.ANULADA) {
      throw new Error('La venta ya estaba anulada.');
    }

    const cierreRef = docRef(cuentaId, 'cierresCaja', venta.fechaStr);
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${venta.fechaStr} ya está cerrado. No se puede anular una venta cerrada.`);
    }

    const productoRef = doc(db, `cuentas/${cuentaId}/productos/${venta.productoId}`);
    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const producto = productoSnap.data();
    const stockActual = getStockActual(producto);

    tx.update(ventaRef, {
      estado: VENTA_ESTADOS.ANULADA,
      anuladaAt: serverTimestamp(),
      anuladaBy: userEmail || null,
      motivoAnulacion: String(motivo || '').trim(),
      updatedAt: serverTimestamp(),
    });

    tx.update(productoRef, {
      stockActual: stockActual + Number(venta.cantidad || 0),
      stockTotalM3: stockActual + Number(venta.cantidad || 0),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: new Date(),
      fechaStr: venta.fechaStr,
      tipo: MOVIMIENTO_TIPOS.DEVOLUCION,
      productoId: venta.productoId,
      productoNombre: venta.productoNombre || producto.nombre || '',
      unidadStock: venta.unidadStock || producto.unidadStock || producto.unidad || 'm3',
      pesoBolsaKg: venta.pesoBolsaKg || producto.pesoBolsaKg || null,
      cantidad: Number(venta.cantidad || 0),
      montoTotal: Number(venta.total || 0),
      referenciaTipo: 'venta_anulada',
      referenciaId: ventaId,
      motivo: String(motivo || '').trim(),
      detalleLogistico: venta.detalleEntrega || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeVentas(cuentaId, filters, callback) {
  return subscribeCollection(cuentaId, 'ventas', callback, {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  });
}