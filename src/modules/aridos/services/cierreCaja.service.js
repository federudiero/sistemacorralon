import { getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { fetchCollection, docRef } from './base';
import { MOVIMIENTO_TIPOS } from '../utils/constants';

function buildSummary(ventas = []) {
  const base = {
    totalVentas: 0,
    totalEnvio: 0,
    cantidadOperaciones: 0,
    porMetodoPago: {},
    porProducto: {},
  };

  ventas.forEach((item) => {
    if (item.estado === 'anulada') return;

    base.totalVentas += Number(item.total || 0);
    base.totalEnvio += Number(item.envioMonto || 0);
    base.cantidadOperaciones += 1;

    const metodo = item.metodoPago || 'sin_definir';
    const producto = item.productoNombre || 'Sin producto';

    base.porMetodoPago[metodo] = (base.porMetodoPago[metodo] || 0) + Number(item.total || 0);
    base.porProducto[producto] = (base.porProducto[producto] || 0) + Number(item.total || 0);
  });

  return base;
}

export async function isCajaCerrada(cuentaId, fechaStr) {
  if (!cuentaId || !fechaStr) return false;
  const snap = await getDoc(docRef(cuentaId, 'cierresCaja', fechaStr));
  return snap.exists();
}

export async function getResumenCierreCaja(cuentaId, fechaStr) {
  const ventas = await fetchCollection(cuentaId, 'ventas', {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: 400,
  });

  const movimientos = await fetchCollection(cuentaId, 'movimientosStock', {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: 400,
  });

  const ventasDia = ventas.filter((item) => item.fechaStr === fechaStr);
  const movimientosDia = movimientos.filter((item) => item.fechaStr === fechaStr);
  const cierreDoc = await getDoc(docRef(cuentaId, 'cierresCaja', fechaStr));

  return {
    fechaStr,
    ventas: ventasDia,
    movimientos: movimientosDia,
    resumen: buildSummary(ventasDia),
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
      ventasIds: resumen.ventas.map((item) => item.id),
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
    limit: 30,
  });
}