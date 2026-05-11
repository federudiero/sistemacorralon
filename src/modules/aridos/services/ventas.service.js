import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import {
  assertStockAvailable,
  requireNonNegativeNumber,
  requirePositiveNumber,
  requireString,
} from '../utils/validators';
import { ESTADOS_PAGO, MOVIMIENTO_TIPOS, VENTA_ENTREGA_ESTADOS, VENTA_ESTADOS } from '../utils/constants';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { buildStockFields, getStockActual } from '../utils/stock';
import { subscribeCollection, docRef } from './base';

function getDefaultEntregaEstado() {
  return VENTA_ENTREGA_ESTADOS.PENDIENTE;
}

function normalizePayload(payload = {}) {
  requireString(payload.clienteNombre || payload.clienteId, 'cliente');
  requireString(payload.productoId, 'producto');
  requirePositiveNumber(payload.cantidad, 'cantidad');
  requireNonNegativeNumber(payload.precioUnitario ?? 0, 'precio unitario');
  requireNonNegativeNumber(payload.envioMonto ?? 0, 'envío');

  const fecha = payload.fecha
    ? parseInputDate(payload.fecha, { baseTime: new Date() })
    : new Date();

  const fechaStr = buildDateStr(fecha);
  const subtotal = Number(payload.cantidad) * Number(payload.precioUnitario || 0);
  const envioMonto = Number(payload.tipoEntrega === 'envio' ? payload.envioMonto || 0 : 0);
  const total = subtotal + envioMonto;
  const entregaEstado = payload.entregaEstado || getDefaultEntregaEstado();
  const condicionPago = payload.condicionPago || (payload.metodoPago === 'cuenta_corriente' ? 'cuenta_corriente' : 'contado');
  const metodoCobro = condicionPago === 'cuenta_corriente' ? '' : (payload.metodoCobro || payload.metodoPago || 'efectivo');
  const metodoPago = condicionPago === 'cuenta_corriente' ? 'cuenta_corriente' : metodoCobro;

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
    condicionPago,
    metodoCobro,
    metodoPago,
    estadoPago: condicionPago === 'cuenta_corriente' ? ESTADOS_PAGO.PENDIENTE : ESTADOS_PAGO.PAGADO,
    totalPagado: condicionPago === 'cuenta_corriente' ? 0 : total,
    saldoPendiente: condicionPago === 'cuenta_corriente' ? total : 0,
    vehiculoEntrega:
      payload.vehiculoEntrega || (payload.tipoEntrega === 'envio' ? 'envio' : 'retiro_cliente'),
    detalleEntrega: String(payload.detalleEntrega || '').trim(),
    observaciones: String(payload.observaciones || '').trim(),
    estado: VENTA_ESTADOS.CONFIRMADA,
    entregaEstado,
    entregaMarcadaAt: null,
    entregaMarcadaBy: null,
    remitoGenerado: false,
    remitoId: null,
  };
}
async function createVenta(cuentaId, payload, userEmail) {
  const data = normalizePayload({ ...payload, userEmail });

  const productoRef = doc(db, `cuentas/${cuentaId}/productos/${data.productoId}`);
  const clienteRef = data.clienteId ? doc(db, `cuentas/${cuentaId}/clientes/${data.clienteId}`) : null;
  const ventasRef = collection(db, `cuentas/${cuentaId}/ventas`);
  const movimientosRef = collection(db, `cuentas/${cuentaId}/movimientosStock`);
  const cuentaCorrienteMovimientosRef = collection(db, `cuentas/${cuentaId}/cuentaCorrienteMovimientos`);
  const cierreRef = docRef(cuentaId, 'cierresCaja', data.fechaStr);
  const ventaDoc = doc(ventasRef);

  await runTransaction(db, async (tx) => {
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(`El día ${data.fechaStr} ya está cerrado. No se pueden cargar ventas nuevas.`);
    }

    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const clienteSnap = clienteRef ? await tx.get(clienteRef) : null;
    const cliente = clienteSnap?.exists?.() ? clienteSnap.data() : null;

    if (data.condicionPago === 'cuenta_corriente') {
      if (!clienteRef || !clienteSnap?.exists?.()) {
        throw new Error('Para vender por cuenta corriente tenés que seleccionar un cliente registrado.');
      }
      if (cliente?.esGenerico) {
        throw new Error('No se puede usar cuenta corriente con el cliente genérico.');
      }
      if (cliente?.activo === false) {
        throw new Error('No se puede usar cuenta corriente con un cliente inactivo.');
      }
    }

    const producto = productoSnap.data();
    const stockActual = getStockActual(producto);
    const costoUnitarioSnapshot = Number(producto.costoActual ?? producto.costoPromedio ?? 0);
    const costoTotalSnapshot = Number(data.cantidad || 0) * costoUnitarioSnapshot;

    assertStockAvailable(stockActual, data.cantidad);

    const saldoAnteriorCuentaCorriente = Number(cliente?.saldoCuentaCorriente || 0);
    const saldoPosteriorCuentaCorriente = data.condicionPago === 'cuenta_corriente'
      ? saldoAnteriorCuentaCorriente + Number(data.total || 0)
      : saldoAnteriorCuentaCorriente;
    const limiteCuentaCorriente = Number(cliente?.limiteCuentaCorriente || 0);
    const cuentaCorrienteSobreLimite = data.condicionPago === 'cuenta_corriente'
      && limiteCuentaCorriente > 0
      && saldoPosteriorCuentaCorriente > limiteCuentaCorriente;

    tx.set(ventaDoc, {
      ...data,
      costoUnitarioSnapshot,
      costoTotalSnapshot,
      precioListaSnapshot: Number(producto.precioVenta ?? data.precioUnitario ?? 0),
      saldoAnteriorCuentaCorriente: data.condicionPago === 'cuenta_corriente'
        ? saldoAnteriorCuentaCorriente
        : null,
      saldoPosteriorCuentaCorriente: data.condicionPago === 'cuenta_corriente'
        ? saldoPosteriorCuentaCorriente
        : null,
      limiteCuentaCorrienteSnapshot: data.condicionPago === 'cuenta_corriente'
        ? limiteCuentaCorriente
        : null,
      cuentaCorrienteSobreLimite,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
      entregaMarcadaAt: null,
      entregaMarcadaBy: null,
    });

    if (data.condicionPago === 'cuenta_corriente' && clienteRef) {
      tx.update(clienteRef, {
        saldoCuentaCorriente: saldoPosteriorCuentaCorriente,
        updatedAt: serverTimestamp(),
      });

      const cuentaCorrienteMovDoc = doc(cuentaCorrienteMovimientosRef);
      tx.set(cuentaCorrienteMovDoc, {
        clienteId: data.clienteId,
        clienteNombre: data.clienteNombre || cliente?.nombre || '',
        tipo: 'venta',
        ventaId: ventaDoc.id,
        debe: Number(data.total || 0),
        haber: 0,
        monto: Number(data.total || 0),
        fecha: data.fecha,
        fechaStr: data.fechaStr,
        metodoCobro: '',
        observaciones: data.observaciones || '',
        saldoAnterior: saldoAnteriorCuentaCorriente,
        saldoPosterior: saldoPosteriorCuentaCorriente,
        limiteCuentaCorrienteSnapshot: limiteCuentaCorriente,
        cuentaCorrienteSobreLimite,
        createdAt: serverTimestamp(),
        createdBy: userEmail || null,
      });
    }

    tx.update(productoRef, {
      ...buildStockFields(producto.unidadStock || producto.unidad || data.unidadStock, stockActual - data.cantidad),
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
      costoUnitarioSnapshot,
      costoTotalSnapshot,
      referenciaTipo: 'venta',
      referenciaId: ventaDoc.id,
      motivo: data.tipoEntrega === 'envio' ? 'Se lo llevamos' : 'Retira cliente',
      detalleLogistico: data.detalleEntrega || data.observaciones || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });

  return ventaDoc.id;
}

async function updateVentaEntregaEstado(cuentaId, ventaId, entregaEstado, userEmail) {
  if (
    ![
      VENTA_ENTREGA_ESTADOS.PENDIENTE,
      VENTA_ENTREGA_ESTADOS.ENTREGADA,
      VENTA_ENTREGA_ESTADOS.NO_ENTREGADA,
    ].includes(entregaEstado)
  ) {
    throw new Error('Estado de entrega inválido.');
  }

  const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${ventaId}`);

  await runTransaction(db, async (tx) => {
    const ventaSnap = await tx.get(ventaRef);
    if (!ventaSnap.exists()) throw new Error('Venta inexistente.');

    const venta = ventaSnap.data();
    if (venta.estado === VENTA_ESTADOS.ANULADA) {
      throw new Error('No se puede actualizar la entrega de una venta anulada.');
    }

    const cierreRef = docRef(cuentaId, 'cierresCaja', venta.fechaStr);
    const cierreSnap = await tx.get(cierreRef);
    if (cierreSnap.exists()) {
      throw new Error(
        `El día ${venta.fechaStr} ya está cerrado. No se puede cambiar el estado de entrega.`,
      );
    }

    const entregaMarcadaAt =
      entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE ? null : serverTimestamp();

    const entregaMarcadaBy =
      entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE ? null : userEmail || null;

    tx.update(ventaRef, {
      entregaEstado,
      entregaMarcadaAt,
      entregaMarcadaBy,
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });
  });
}

async function anularVenta(cuentaId, ventaId, motivo, userEmail) {
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
      throw new Error(
        `El día ${venta.fechaStr} ya está cerrado. No se puede anular una venta cerrada.`,
      );
    }

    const productoRef = doc(db, `cuentas/${cuentaId}/productos/${venta.productoId}`);
    const clienteRef = venta.condicionPago === 'cuenta_corriente' && venta.clienteId
      ? doc(db, `cuentas/${cuentaId}/clientes/${venta.clienteId}`)
      : null;
    const productoSnap = await tx.get(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto inexistente.');

    const clienteSnap = clienteRef ? await tx.get(clienteRef) : null;
    const cliente = clienteSnap?.exists?.() ? clienteSnap.data() : null;

    if (venta.condicionPago === 'cuenta_corriente' && Number(venta.totalPagado || 0) > 0) {
      throw new Error('No se puede anular una venta de cuenta corriente que ya tiene pagos aplicados.');
    }

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
      ...buildStockFields(producto.unidadStock || producto.unidad || venta.unidadStock, stockActual + Number(venta.cantidad || 0)),
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || null,
    });

    if (venta.condicionPago === 'cuenta_corriente' && clienteRef && cliente) {
      const saldoAnterior = Number(cliente.saldoCuentaCorriente || 0);
      const montoARevertir = Number(venta.saldoPendiente ?? venta.total ?? 0);
      const saldoPosterior = Math.max(saldoAnterior - montoARevertir, 0);

      tx.update(clienteRef, {
        saldoCuentaCorriente: saldoPosterior,
        updatedAt: serverTimestamp(),
      });

      const cuentaCorrienteMovDoc = doc(collection(db, `cuentas/${cuentaId}/cuentaCorrienteMovimientos`));
      tx.set(cuentaCorrienteMovDoc, {
        clienteId: venta.clienteId,
        clienteNombre: venta.clienteNombre || cliente.nombre || '',
        tipo: 'anulacion_venta',
        ventaId,
        debe: 0,
        haber: montoARevertir,
        monto: montoARevertir,
        fecha: new Date(),
        fechaStr: venta.fechaStr,
        metodoCobro: '',
        observaciones: String(motivo || '').trim(),
        saldoAnterior,
        saldoPosterior,
        createdAt: serverTimestamp(),
        createdBy: userEmail || null,
      });
    }

    const movDoc = doc(movimientosRef);
    tx.set(movDoc, {
      fecha: new Date(),           // timestamp real de la anulación
      fechaStr: venta.fechaStr,    // apunta al día original para que el movimiento quede en ese día
      tipo: MOVIMIENTO_TIPOS.DEVOLUCION,
      productoId: venta.productoId,
      productoNombre: venta.productoNombre || producto.nombre || '',
      unidadStock: venta.unidadStock || producto.unidadStock || producto.unidad || 'm3',
      pesoBolsaKg: venta.pesoBolsaKg || producto.pesoBolsaKg || null,
      cantidad: Number(venta.cantidad || 0),
      montoTotal: Number(venta.total || 0),
      costoUnitarioSnapshot: Number(venta.costoUnitarioSnapshot || 0),
      costoTotalSnapshot: Number(venta.costoTotalSnapshot || 0),
      referenciaTipo: 'venta_anulada',
      referenciaId: ventaId,
      motivo: String(motivo || '').trim(),
      detalleLogistico: venta.detalleEntrega || '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    });
  });
}


function getVentaTime(item = {}) {
  const raw = item.fecha;
  const date = raw?.toDate ? raw.toDate() : new Date(raw || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function subscribeVentas(cuentaId, filters = {}, callback, onError) {
  const where = [];
  if (filters?.fechaStr) {
    where.push({ field: 'fechaStr', op: '==', value: filters.fechaStr });
  }

  const handleItems = (items = []) => {
    callback([...items].sort((a, b) => getVentaTime(b) - getVentaTime(a)));
  };

  return subscribeCollection(cuentaId, 'ventas', handleItems, {
    where,
    orderBy: where.length ? [] : [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  }, onError);
}

function subscribeVentasAgenda(cuentaId, range = {}, callback, onError) {
  const fechaDesde = parseInputDate(range?.fechaDesde, {
    baseTime: new Date(2000, 0, 1, 0, 0, 0, 0),
  });
  const fechaHasta = parseInputDate(range?.fechaHasta, { endOfDay: true });

  const where = [];
  if (fechaDesde) where.push({ field: 'fecha', op: '>=', value: fechaDesde });
  if (fechaHasta) where.push({ field: 'fecha', op: '<=', value: fechaHasta });

  return subscribeCollection(cuentaId, 'ventas', callback, {
    where,
    orderBy: [{ field: 'fecha', direction: 'asc' }],
    limit: range?.limit || 500,
  }, onError);
}

export {
  anularVenta,
  createVenta,
  subscribeVentas,
  subscribeVentasAgenda,
  updateVentaEntregaEstado,
};