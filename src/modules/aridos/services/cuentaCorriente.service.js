import { collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { ESTADOS_PAGO } from '../utils/constants';
import { buildDateStr, parseInputDate } from '../utils/formatters';
import { requirePositiveNumber, requireString } from '../utils/validators';
import { docRef, fetchCollection, subscribeCollection } from './base';

const COLLECTION_NAME = 'cuentaCorrienteMovimientos';

function normalizePaymentPayload(payload = {}) {
  requireString(payload.clienteId, 'cliente');
  requirePositiveNumber(payload.monto, 'monto');

  const fecha = payload.fecha
    ? parseInputDate(payload.fecha, { baseTime: new Date() })
    : new Date();

  return {
    clienteId: payload.clienteId,
    clienteNombre: String(payload.clienteNombre || '').trim(),
    fecha,
    fechaStr: buildDateStr(fecha),
    monto: Number(payload.monto || 0),
    metodoCobro: payload.metodoCobro || 'efectivo',
    observaciones: String(payload.observaciones || '').trim(),
  };
}

function getVentaTime(item = {}) {
  const raw = item.fecha;
  const date = raw?.toDate ? raw.toDate() : new Date(raw || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function normalizePendingVenta(item = {}) {
  const total = Number(item.total || 0);
  const totalPagado = Number(item.totalPagado || 0);
  const saldoPendiente = Number(
    item.saldoPendiente ?? Math.max(total - totalPagado, 0),
  );

  return {
    ...item,
    total,
    totalPagado,
    saldoPendiente: Math.max(saldoPendiente, 0),
  };
}

async function fetchPendingVentasCuentaCorriente(cuentaId, clienteId) {
  const ventas = await fetchCollection(cuentaId, 'ventas', {
    where: [
      { field: 'clienteId', op: '==', value: clienteId },
      { field: 'condicionPago', op: '==', value: 'cuenta_corriente' },
    ],
    limit: 300,
  });

  return ventas
    .map(normalizePendingVenta)
    .filter(
      (item) =>
        item.estado !== 'anulada'
        && item.estadoPago !== ESTADOS_PAGO.PAGADO
        && Number(item.saldoPendiente || 0) > 0,
    )
    .sort((a, b) => getVentaTime(a) - getVentaTime(b));
}

async function registrarPagoCuentaCorriente(cuentaId, payload, userEmail) {
  const data = normalizePaymentPayload(payload);
  const pendingVentas = await fetchPendingVentasCuentaCorriente(cuentaId, data.clienteId);

  const clienteRef = doc(db, `cuentas/${cuentaId}/clientes/${data.clienteId}`);
  const movimientoRef = doc(collection(db, `cuentas/${cuentaId}/${COLLECTION_NAME}`));
  const cierreRef = docRef(cuentaId, 'cierresCaja', data.fechaStr);

  await runTransaction(db, async (tx) => {
    const [clienteSnap, cierreSnap] = await Promise.all([
      tx.get(clienteRef),
      tx.get(cierreRef),
    ]);

    if (cierreSnap.exists()) {
      throw new Error(
        `El día ${data.fechaStr} ya está cerrado. No se pueden registrar cobros para esa fecha.`,
      );
    }

    if (!clienteSnap.exists()) throw new Error('Cliente inexistente.');

    const cliente = clienteSnap.data();
    if (cliente.esGenerico) {
      throw new Error('No se pueden registrar pagos de cuenta corriente para el cliente genérico.');
    }

    const saldoAnterior = Number(cliente.saldoCuentaCorriente || 0);
    const montoAplicado = Math.min(Number(data.monto || 0), Math.max(saldoAnterior, 0));
    const saldoPosterior = Math.max(saldoAnterior - montoAplicado, 0);

    if (montoAplicado <= 0) {
      throw new Error('El cliente no tiene saldo pendiente para cobrar.');
    }

    let restante = montoAplicado;
    const ventasAplicadas = [];

    for (const venta of pendingVentas) {
      if (restante <= 0) break;

      const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${venta.id}`);
      const ventaSnap = await tx.get(ventaRef);
      if (!ventaSnap.exists()) continue;

      const ventaActual = normalizePendingVenta({ id: venta.id, ...ventaSnap.data() });
      if (
        ventaActual.estado === 'anulada'
        || ventaActual.condicionPago !== 'cuenta_corriente'
        || ventaActual.estadoPago === ESTADOS_PAGO.PAGADO
        || Number(ventaActual.saldoPendiente || 0) <= 0
      ) {
        continue;
      }

      const montoVenta = Math.min(restante, Number(ventaActual.saldoPendiente || 0));
      const nuevoTotalPagado = Number(ventaActual.totalPagado || 0) + montoVenta;
      const nuevoSaldoPendiente = Math.max(Number(ventaActual.total || 0) - nuevoTotalPagado, 0);
      const nuevoEstadoPago = nuevoSaldoPendiente <= 0
        ? ESTADOS_PAGO.PAGADO
        : ESTADOS_PAGO.PARCIAL;

      tx.update(ventaRef, {
        totalPagado: nuevoTotalPagado,
        saldoPendiente: nuevoSaldoPendiente,
        estadoPago: nuevoEstadoPago,
        ultimoPagoAt: serverTimestamp(),
        ultimoPagoBy: userEmail || null,
        updatedAt: serverTimestamp(),
        updatedBy: userEmail || null,
      });

      ventasAplicadas.push({
        ventaId: venta.id,
        monto: montoVenta,
        saldoPendientePosterior: nuevoSaldoPendiente,
      });

      restante -= montoVenta;
    }

    tx.update(clienteRef, {
      saldoCuentaCorriente: saldoPosterior,
      updatedAt: serverTimestamp(),
    });

    tx.set(movimientoRef, {
      clienteId: data.clienteId,
      clienteNombre: data.clienteNombre || cliente.nombre || '',
      tipo: 'pago',
      debe: 0,
      haber: montoAplicado,
      monto: montoAplicado,
      metodoCobro: data.metodoCobro,
      fecha: data.fecha,
      fechaStr: data.fechaStr,
      observaciones: data.observaciones,
      saldoAnterior,
      saldoPosterior,
      ventasAplicadas,
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
    });
  });

  return movimientoRef.id;
}

async function getMovimientosCuentaCorrienteByFecha(cuentaId, fechaStr) {
  return fetchCollection(cuentaId, COLLECTION_NAME, {
    where: [{ field: 'fechaStr', op: '==', value: fechaStr }],
    limit: 500,
  });
}

function subscribeMovimientosCuentaCorrienteCliente(cuentaId, clienteId, callback, onError) {
  return subscribeCollection(cuentaId, COLLECTION_NAME, callback, {
    where: [{ field: 'clienteId', op: '==', value: clienteId }],
    limit: 500,
  }, onError);
}

async function getClienteSaldoCuentaCorriente(cuentaId, clienteId) {
  const snap = await getDoc(doc(db, `cuentas/${cuentaId}/clientes/${clienteId}`));
  if (!snap.exists()) return 0;
  return Number(snap.data().saldoCuentaCorriente || 0);
}

export {
  getClienteSaldoCuentaCorriente,
  getMovimientosCuentaCorrienteByFecha,
  registrarPagoCuentaCorriente,
  subscribeMovimientosCuentaCorrienteCliente,
};
