import { fetchCollection } from './base';
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

  const resumen = filteredVentas.reduce((acc, item) => {
    if (item.estado === 'anulada') return acc;

    const costoSnapshot = Number(item.costoTotalSnapshot || 0);
    const totalVenta = Number(item.total || 0);

    acc.totalVentas += totalVenta;
    acc.totalCostoVentas += costoSnapshot;
    acc.totalMargenBruto += totalVenta - costoSnapshot;
    acc.totalCantidadVendida += Number(item.cantidad || 0);
    acc.totalEnvio += Number(item.envioMonto || 0);
    acc.cantidadVentas += 1;
    return acc;
  }, {
    totalVentas: 0,
    totalCostoVentas: 0,
    totalMargenBruto: 0,
    totalCantidadVendida: 0,
    totalEnvio: 0,
    cantidadVentas: 0,
  });

  return {
    ventas: filteredVentas,
    movimientos: filteredMovimientos,
    resumen,
    stats: {
      ventasPorProducto: groupSum(filteredVentas.filter((item) => item.estado !== 'anulada'), (item) => item.productoNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      margenPorProducto: groupSum(filteredVentas.filter((item) => item.estado !== 'anulada'), (item) => item.productoNombre, (item) => Number(item.total || 0) - Number(item.costoTotalSnapshot || 0)).sort((a, b) => b.value - a.value).slice(0, 10),
      cantidadesPorProducto: groupSum(filteredVentas.filter((item) => item.estado !== 'anulada'), (item) => item.productoNombre, (item) => item.cantidad).sort((a, b) => b.value - a.value).slice(0, 10),
      ventasPorPago: groupSum(filteredVentas.filter((item) => item.estado !== 'anulada'), (item) => item.metodoPago, (item) => item.total).sort((a, b) => b.value - a.value),
      ventasPorCliente: groupSum(filteredVentas.filter((item) => item.estado !== 'anulada'), (item) => item.clienteNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      movimientosPorTipo: groupSum(filteredMovimientos, (item) => item.tipo, () => 1).sort((a, b) => b.value - a.value),
    },
  };
}
