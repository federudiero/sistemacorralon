import { fetchCollection } from './base';

function parseDate(value) {
  return value?.toDate ? value.toDate() : new Date(value);
}

function groupSum(items, keyGetter, valueGetter) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyGetter(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + Number(valueGetter(item) || 0));
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

export async function getReportesAridos(cuentaId, filters = {}) {
  const ventas = await fetchCollection(cuentaId, 'ventas', {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: 500,
  });
  const movimientos = await fetchCollection(cuentaId, 'movimientosStock', {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: 800,
  });

  const from = filters.fechaDesde ? new Date(`${filters.fechaDesde}T00:00:00`) : null;
  const to = filters.fechaHasta ? new Date(`${filters.fechaHasta}T23:59:59`) : null;

  const byDate = (value) => {
    const d = parseDate(value);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  };

  const filteredVentas = ventas.filter((item) => {
    if (!byDate(item.fecha)) return false;
    if (filters.productoId && item.productoId !== filters.productoId) return false;
    if (filters.metodoPago && item.metodoPago !== filters.metodoPago) return false;
    if (filters.tipoEntrega && item.tipoEntrega !== filters.tipoEntrega) return false;
    if (filters.estado && item.estado !== filters.estado) return false;
    return true;
  });

  const filteredMovimientos = movimientos.filter((item) => {
    if (!byDate(item.fecha)) return false;
    if (filters.productoId && item.productoId !== filters.productoId) return false;
    if (filters.tipoMovimiento && item.tipo !== filters.tipoMovimiento) return false;
    return true;
  });

  const resumen = filteredVentas.reduce((acc, item) => {
    acc.totalVentas += Number(item.total || 0);
    acc.totalCantidadVendida += Number(item.cantidad || 0);
    acc.totalEnvio += Number(item.envioMonto || 0);
    acc.cantidadVentas += 1;
    return acc;
  }, { totalVentas: 0, totalCantidadVendida: 0, totalEnvio: 0, cantidadVentas: 0 });

  return {
    ventas: filteredVentas,
    movimientos: filteredMovimientos,
    resumen,
    stats: {
      ventasPorProducto: groupSum(filteredVentas, (item) => item.productoNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      cantidadesPorProducto: groupSum(filteredVentas, (item) => item.productoNombre, (item) => item.cantidad).sort((a, b) => b.value - a.value).slice(0, 10),
      ventasPorPago: groupSum(filteredVentas, (item) => item.metodoPago, (item) => item.total).sort((a, b) => b.value - a.value),
      ventasPorCliente: groupSum(filteredVentas, (item) => item.clienteNombre, (item) => item.total).sort((a, b) => b.value - a.value).slice(0, 10),
      movimientosPorTipo: groupSum(filteredMovimientos, (item) => item.tipo, () => 1).sort((a, b) => b.value - a.value),
    },
  };
}
