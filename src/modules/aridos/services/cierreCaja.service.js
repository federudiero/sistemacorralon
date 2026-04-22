import { getDoc, runTransaction, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { fetchCollection, docRef } from './base';
import { MOVIMIENTO_TIPOS, VENTA_ENTREGA_ESTADOS } from '../utils/constants';
import { parseInputDate } from '../utils/formatters';

function buildDayBounds(fechaStr) {
  return {
    from: parseInputDate(fechaStr, { baseTime: new Date(2000, 0, 1, 0, 0, 0, 0) }),
    to: parseInputDate(fechaStr, { endOfDay: true }),
  };
}

function buildWhereByFechaStr(fechaStr) {
  return fechaStr ? [{ field: 'fechaStr', op: '==', value: fechaStr }] : [];
}

function sortByFechaDesc(items = []) {
  return [...items].sort((a, b) => {
    const aDate = a?.fecha?.toDate ? a.fecha.toDate() : new Date(a?.fecha || 0);
    const bDate = b?.fecha?.toDate ? b.fecha.toDate() : new Date(b?.fecha || 0);
    const aTime = Number.isNaN(aDate.getTime()) ? 0 : aDate.getTime();
    const bTime = Number.isNaN(bDate.getTime()) ? 0 : bDate.getTime();
    return bTime - aTime;
  });
}

function normalizeTimestamp(value) {
  if (!value) return '';

  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function shouldCountForClosure(item) {
  if (item.estado === 'anulada') return false;
  return item.entregaEstado === VENTA_ENTREGA_ESTADOS.ENTREGADA;
}

function filterOperationalMovimientos(movimientos = []) {
  return movimientos.filter(
    (item) =>
      item?.tipo !== MOVIMIENTO_TIPOS.CIERRE_CAJA && item?.referenciaTipo !== 'cierre_caja',
  );
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

function buildVentasFingerprint(ventas = []) {
  return ventas
    .map((item) => [
      item.id,
      item.estado || '',
      item.entregaEstado || '',
      Number(item.total || 0),
      Number(item.costoTotalSnapshot || 0),
      normalizeTimestamp(item.updatedAt),
      normalizeTimestamp(item.entregaMarcadaAt),
      normalizeTimestamp(item.anuladaAt),
    ].join('|'))
    .join('||');
}

function buildMovimientosFingerprint(movimientos = []) {
  return movimientos
    .map((item) => [
      item.id,
      item.tipo || '',
      item.referenciaTipo || '',
      item.referenciaId || '',
      Number(item.cantidad || 0),
      Number(item.montoTotal || 0),
      normalizeTimestamp(item.createdAt),
      normalizeTimestamp(item.updatedAt),
    ].join('|'))
    .join('||');
}

function buildResumenRevision({ ventas = [], movimientos = [], resumen = {}, fechaStr = '' } = {}) {
  return {
    fechaStr,
    ventasCount: ventas.length,
    movimientosCount: movimientos.length,
    fingerprint: JSON.stringify({
      ventas: buildVentasFingerprint(ventas),
      movimientos: buildMovimientosFingerprint(movimientos),
      totalVentas: Number(resumen.totalVentas || 0),
      totalCostoVentas: Number(resumen.totalCostoVentas || 0),
      totalMargenBruto: Number(resumen.totalMargenBruto || 0),
      cantidadOperaciones: Number(resumen.cantidadOperaciones || 0),
      cantidadEntregadas: Number(resumen.cantidadEntregadas || 0),
      cantidadPendientes: Number(resumen.cantidadPendientes || 0),
      cantidadNoEntregadas: Number(resumen.cantidadNoEntregadas || 0),
    }),
  };
}

async function fetchClosureDataset(cuentaId, fechaStr) {
  const whereFechaStr = buildWhereByFechaStr(fechaStr);
  const { from, to } = buildDayBounds(fechaStr);
  const fallbackWhereFecha = [];
  if (from) fallbackWhereFecha.push({ field: 'fecha', op: '>=', value: from });
  if (to) fallbackWhereFecha.push({ field: 'fecha', op: '<=', value: to });

  const [rawVentas, rawMovimientos, cierreDoc, cierreMovimientoDoc] = await Promise.all([
    fetchCollection(cuentaId, 'ventas', {
      where: whereFechaStr.length ? whereFechaStr : fallbackWhereFecha,
      ...(whereFechaStr.length ? {} : { orderBy: [{ field: 'fecha', direction: 'desc' }] }),
    }),
    fetchCollection(cuentaId, 'movimientosStock', {
      where: whereFechaStr.length ? whereFechaStr : fallbackWhereFecha,
      ...(whereFechaStr.length ? {} : { orderBy: [{ field: 'fecha', direction: 'desc' }] }),
    }),
    getDoc(docRef(cuentaId, 'cierresCaja', fechaStr)),
    getDoc(docRef(cuentaId, 'movimientosStock', `cierre_${fechaStr}`)),
  ]);

  const ventasByFechaStr = sortByFechaDesc(rawVentas);
  const movimientosByFechaStr = sortByFechaDesc(rawMovimientos);
  const movimientos = filterOperationalMovimientos(movimientosByFechaStr);
  const resumen = buildSummary(ventasByFechaStr);
  const ventasEntregadas = ventasByFechaStr.filter(shouldCountForClosure);
  const ventasPendientes = ventasByFechaStr.filter(
    (item) => item.estado !== 'anulada' && item.entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE,
  );
  const ventasNoEntregadas = ventasByFechaStr.filter(
    (item) =>
      item.estado !== 'anulada' && item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA,
  );
  const revision = buildResumenRevision({
    fechaStr,
    ventas: ventasByFechaStr,
    movimientos,
    resumen,
  });

  return {
    fechaStr,
    ventas: ventasByFechaStr,
    ventasEntregadas,
    ventasPendientes,
    ventasNoEntregadas,
    movimientos,
    resumen,
    revision,
    cierreExistente: cierreDoc.exists() ? { id: cierreDoc.id, ...cierreDoc.data() } : null,
    cierreMovimientoExistente: cierreMovimientoDoc.exists()
      ? { id: cierreMovimientoDoc.id, ...cierreMovimientoDoc.data() }
      : null,
  };
}

export async function isCajaCerrada(cuentaId, fechaStr) {
  if (!cuentaId || !fechaStr) return false;
  const snap = await getDoc(docRef(cuentaId, 'cierresCaja', fechaStr));
  return snap.exists();
}

export async function getResumenCierreCaja(cuentaId, fechaStr) {
  return fetchClosureDataset(cuentaId, fechaStr);
}

export async function crearCierreCaja(cuentaId, fechaStr, userEmail) {
  const cierreRef = docRef(cuentaId, 'cierresCaja', fechaStr);
  const cierreMovimientoRef = docRef(cuentaId, 'movimientosStock', `cierre_${fechaStr}`);

  const initial = await fetchClosureDataset(cuentaId, fechaStr);
  if (initial.cierreExistente || initial.cierreMovimientoExistente) {
    throw new Error(`El día ${fechaStr} ya estaba cerrado.`);
  }

  const fresh = await fetchClosureDataset(cuentaId, fechaStr);
  if (fresh.cierreExistente || fresh.cierreMovimientoExistente) {
    throw new Error(`El día ${fechaStr} ya estaba cerrado.`);
  }

  if (initial.revision.fingerprint !== fresh.revision.fingerprint) {
    throw new Error(
      'El resumen cambió mientras intentabas cerrar el día. Actualizá la pantalla y volvé a intentarlo.',
    );
  }

  await runTransaction(db, async (tx) => {
    const [cierreSnap, cierreMovimientoSnap] = await Promise.all([
      tx.get(cierreRef),
      tx.get(cierreMovimientoRef),
    ]);

    if (cierreSnap.exists() || cierreMovimientoSnap.exists()) {
      throw new Error(`El día ${fechaStr} ya estaba cerrado.`);
    }

    tx.set(
      cierreRef,
      {
        fechaStr,
        resumen: fresh.resumen,
        ventasIds: fresh.ventasEntregadas.map((item) => item.id),
        ventasPendientesIds: fresh.ventasPendientes.map((item) => item.id),
        ventasNoEntregadasIds: fresh.ventasNoEntregadas.map((item) => item.id),
        movimientosIds: fresh.movimientos.map((item) => item.id),
        resumenRevision: {
          fechaStr: fresh.revision.fechaStr,
          ventasCount: fresh.revision.ventasCount,
          movimientosCount: fresh.revision.movimientosCount,
          fingerprint: fresh.revision.fingerprint,
          source: 'fechaStr',
        },
        closedBy: userEmail || null,
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: userEmail || null,
      },
      { merge: false },
    );

    tx.set(
      cierreMovimientoRef,
      {
        fecha: new Date(`${fechaStr}T23:59:00`),
        fechaStr,
        tipo: MOVIMIENTO_TIPOS.CIERRE_CAJA,
        productoId: '',
        productoNombre: '',
        unidadStock: 'unidad',
        cantidad: 0,
        montoTotal: fresh.resumen.totalVentas,
        referenciaTipo: 'cierre_caja',
        referenciaId: fechaStr,
        motivo: `Cierre diario ${fechaStr}`,
        detalleLogistico: '',
        usuarioEmail: userEmail || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: userEmail || null,
      },
      { merge: false },
    );
  });

  return fresh;
}

export async function anularCierreCaja(cuentaId, fechaStr) {
  const cierreRef = docRef(cuentaId, 'cierresCaja', fechaStr);
  const cierreSnap = await getDoc(cierreRef);
  if (!cierreSnap.exists()) {
    throw new Error(`No existe un cierre generado para ${fechaStr}.`);
  }

  const batch = writeBatch(db);
  batch.delete(cierreRef);
  batch.delete(docRef(cuentaId, 'movimientosStock', `cierre_${fechaStr}`));
  await batch.commit();

  return { id: cierreSnap.id, ...cierreSnap.data() };
}

export async function getUltimosCierresCaja(cuentaId) {
  return fetchCollection(cuentaId, 'cierresCaja', {
    orderBy: [{ field: 'fechaStr', direction: 'desc' }],
    limit: 90,
  });
}
