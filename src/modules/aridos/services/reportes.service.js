import { fetchCollection } from './base';
import { VENTA_ENTREGA_ESTADOS } from '../utils/constants';
import { parseInputDate } from '../utils/formatters';

function groupSum(items, keyGetter, valueGetter) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyGetter(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + Number(valueGetter(item) || 0));
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

function buildRange(filters = {}) {
  const from = parseInputDate(filters.fechaDesde, { baseTime: new Date(2000, 0, 1, 0, 0, 0, 0) });
  const to = parseInputDate(filters.fechaHasta, { endOfDay: true });
  return { from, to };
}

function buildFechaWhere(from, to) {
  const where = [];
  if (from) where.push({ field: 'fecha', op: '>=', value: from });
  if (to) where.push({ field: 'fecha', op: '<=', value: to });
  return where;
}

function isActiveVenta(item) {
  return item?.estado !== 'anulada';
}

function isDeliveredVenta(item) {
  return isActiveVenta(item) && item?.entregaEstado === VENTA_ENTREGA_ESTADOS.ENTREGADA;
}

export async function getReportesAridos(cuentaId, filters = {}) {
  const { from, to } = buildRange(filters);
  const whereFecha = buildFechaWhere(from, to);

  const [ventas, movimientos] = await Promise.all([
    fetchCollection(cuentaId, 'ventas', {
      where: whereFecha,
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'movimientosStock', {
      where: whereFecha,
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
  ]);

  const filteredVentas = ventas.filter((item) => {
    if (filters.productoId && item.productoId !== filters.productoId) return false;
    if (filters.metodoPago && item.metodoPago !== filters.metodoPago) return false;
    if (filters.tipoEntrega && item.tipoEntrega !== filters.tipoEntrega) return false;
    if (filters.estado && item.estado !== filters.estado) return false;
    return true;
  });

  const filteredMovimientos = movimientos.filter((item) => {
    if (filters.productoId && item.productoId !== filters.productoId) return false;
    if (filters.tipoMovimiento && item.tipo !== filters.tipoMovimiento) return false;
    return true;
  });

  const activeSales = filteredVentas.filter(isActiveVenta);
  const deliveredSales = activeSales.filter(isDeliveredVenta);
  const pendingSales = activeSales.filter((item) => item.entregaEstado === VENTA_ENTREGA_ESTADOS.PENDIENTE);
  const notDeliveredSales = activeSales.filter((item) => item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA);

  const resumen = {
    totalVentas: 0,
    totalCostoVentas: 0,
    totalMargenBruto: 0,
    totalCantidadVendida: 0,
    totalEnvio: 0,
    cantidadVentas: 0,
    totalVentasRegistradas: 0,
    cantidadVentasRegistradas: 0,
    totalEntregado: 0,
    cantidadEntregadas: 0,
    totalPendiente: 0,
    cantidadPendientes: 0,
    totalNoEntregado: 0,
    cantidadNoEntregadas: 0,
  };

  activeSales.forEach((item) => {
    resumen.totalVentasRegistradas += Number(item.total || 0);
    resumen.cantidadVentasRegistradas += 1;
  });

  deliveredSales.forEach((item) => {
    const costoSnapshot = Number(item.costoTotalSnapshot || 0);
    const totalVenta = Number(item.total || 0);
    const margen = totalVenta - costoSnapshot;

    resumen.totalVentas += totalVenta;
    resumen.totalCostoVentas += costoSnapshot;
    resumen.totalMargenBruto += margen;
    resumen.totalCantidadVendida += Number(item.cantidad || 0);
    resumen.totalEnvio += Number(item.envioMonto || 0);
    resumen.cantidadVentas += 1;
    resumen.totalEntregado += totalVenta;
    resumen.cantidadEntregadas += 1;
  });

  pendingSales.forEach((item) => {
    resumen.totalPendiente += Number(item.total || 0);
    resumen.cantidadPendientes += 1;
  });

  notDeliveredSales.forEach((item) => {
    resumen.totalNoEntregado += Number(item.total || 0);
    resumen.cantidadNoEntregadas += 1;
  });

  resumen.ticketPromedio = resumen.cantidadVentas ? resumen.totalVentas / resumen.cantidadVentas : 0;
  resumen.margenPorcentaje = resumen.totalVentas ? (resumen.totalMargenBruto / resumen.totalVentas) * 100 : 0;

  return {
    ventas: filteredVentas,
    movimientos: filteredMovimientos,
    resumen,
    stats: {
      ventasPorProducto: groupSum(deliveredSales, (item) => item.productoNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      margenPorProducto: groupSum(deliveredSales, (item) => item.productoNombre, (item) => Number(item.total || 0) - Number(item.costoTotalSnapshot || 0)).sort((a, b) => b.value - a.value).slice(0, 10),
      cantidadesPorProducto: groupSum(deliveredSales, (item) => item.productoNombre, (item) => item.cantidad).sort((a, b) => b.value - a.value).slice(0, 10),
      ventasPorPago: groupSum(deliveredSales, (item) => item.metodoPago, (item) => item.total).sort((a, b) => b.value - a.value),
      ventasPorCliente: groupSum(deliveredSales, (item) => item.clienteNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      movimientosPorTipo: groupSum(filteredMovimientos, (item) => item.tipo, () => 1).sort((a, b) => b.value - a.value),
      entregasPorEstado: [
        { key: 'Entregadas', value: resumen.totalEntregado, count: resumen.cantidadEntregadas },
        { key: 'Pendientes', value: resumen.totalPendiente, count: resumen.cantidadPendientes },
        { key: 'No entregadas', value: resumen.totalNoEntregado, count: resumen.cantidadNoEntregadas },
      ].filter((item) => item.value > 0 || item.count > 0),
      facturacionEntregadaPorProducto: groupSum(deliveredSales, (item) => item.productoNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 5),
    },
  };
}
