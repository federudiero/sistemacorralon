import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { fetchCollection, docRef } from './base';
import { MOVIMIENTO_TIPOS, VENTA_ENTREGA_ESTADOS } from '../utils/constants';
import { parseInputDate } from '../utils/formatters';

function buildDayBounds(fechaStr) {
  return {
    from: parseInputDate(fechaStr, { baseTime: new Date(2000, 0, 1, 0, 0, 0, 0) }),
    to: parseInputDate(fechaStr, { endOfDay: true }),
  };
}

function shouldCountForClosure(item) {
  if (item.estado === 'anulada') return false;
  return item.entregaEstado !== VENTA_ENTREGA_ESTADOS.NO_ENTREGADA
    && item.entregaEstado !== VENTA_ENTREGA_ESTADOS.PENDIENTE;
}

function buildSummary(ventas = []) {
  const base = {
    totalVentas: 0,
    totalEnvio: 0,
    totalCostoVentas: 0,
    totalMargenBruto: 0,
    cantidadOperaciones: 0,
    cantidadEntregadas: 0,
    cantidadPendientes: 0,
    cantidadNoEntregadas: 0,
    totalPendienteEntrega: 0,
    totalNoEntregado: 0,
    porMetodoPago: {},
    porProducto: {},
  };

  ventas.forEach((item) => {
    if (item.estado === 'anulada') return;

    const totalVenta = Number(item.total || 0);
    const costoSnapshot = Number(item.costoTotalSnapshot || 0);
    const metodo = item.metodoPago || 'sin_definir';
    const producto = item.productoNombre || 'Sin producto';

    if (item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA) {
      base.cantidadNoEntregadas += 1;
      base.totalNoEntregado += totalVenta;
      return;
    }

    if (item.entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE) {
      base.cantidadPendientes += 1;
      base.totalPendienteEntrega += totalVenta;
      return;
    }

    base.totalVentas += totalVenta;
    base.totalEnvio += Number(item.envioMonto || 0);
    base.totalCostoVentas += costoSnapshot;
    base.totalMargenBruto += totalVenta - costoSnapshot;
    base.cantidadOperaciones += 1;
    base.cantidadEntregadas += 1;
    base.porMetodoPago[metodo] = (base.porMetodoPago[metodo] || 0) + totalVenta;
    base.porProducto[producto] = (base.porProducto[producto] || 0) + totalVenta;
  });

  return base;
}

export async function isCajaCerrada(cuentaId, fechaStr) {
  if (!cuentaId || !fechaStr) return false;
  const snap = await getDoc(docRef(cuentaId, 'cierresCaja', fechaStr));
  return snap.exists();
}

export async function getResumenCierreCaja(cuentaId, fechaStr) {
  const { from, to } = buildDayBounds(fechaStr);
  const whereFecha = [];
  if (from) whereFecha.push({ field: 'fecha', op: '>=', value: from });
  if (to) whereFecha.push({ field: 'fecha', op: '<=', value: to });

  const [ventas, movimientos, cierreDoc] = await Promise.all([
    fetchCollection(cuentaId, 'ventas', {
      where: whereFecha,
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'movimientosStock', {
      where: whereFecha,
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    getDoc(docRef(cuentaId, 'cierresCaja', fechaStr)),
  ]);

  const ventasEntregadas = ventas.filter(shouldCountForClosure);
  const ventasPendientes = ventas.filter((item) => item.estado !== 'anulada' && item.entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE);
  const ventasNoEntregadas = ventas.filter((item) => item.estado !== 'anulada' && item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA);

  return {
    fechaStr,
    ventas,
    ventasEntregadas,
    ventasPendientes,
    ventasNoEntregadas,
    movimientos,
    resumen: buildSummary(ventas),
    cierreExistente: cierreDoc.exists() ? { id: cierreDoc.id, ...cierreDoc.data() } : null,
  };
}

export async function crearCierreCaja(cuentaId, fechaStr, userEmail) {
  const resumen = await getResumenCierreCaja(cuentaId, fechaStr);

  await setDoc(
    docRef(cuentaId, 'cierresCaja', fechaStr),
    {
      fechaStr,
      resumen: resumen.resumen,
      ventasIds: resumen.ventasEntregadas.map((item) => item.id),
      ventasPendientesIds: resumen.ventasPendientes.map((item) => item.id),
      ventasNoEntregadasIds: resumen.ventasNoEntregadas.map((item) => item.id),
      movimientosIds: resumen.movimientos.map((item) => item.id),
      closedBy: userEmail || null,
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    docRef(cuentaId, 'movimientosStock', `cierre_${fechaStr}`),
    {
      fecha: new Date(`${fechaStr}T23:59:00`),
      fechaStr,
      tipo: MOVIMIENTO_TIPOS.CIERRE_CAJA,
      productoId: '',
      productoNombre: '',
      unidadStock: 'unidad',
      cantidad: 0,
      montoTotal: resumen.resumen.totalVentas,
      referenciaTipo: 'cierre_caja',
      referenciaId: fechaStr,
      motivo: `Cierre diario ${fechaStr}`,
      detalleLogistico: '',
      usuarioEmail: userEmail || null,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  return resumen;
}

export async function getUltimosCierresCaja(cuentaId) {
  return fetchCollection(cuentaId, 'cierresCaja', {
    orderBy: [{ field: 'fechaStr', direction: 'desc' }],
    limit: 90,
  });
}
