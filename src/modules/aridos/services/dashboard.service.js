import { fetchCollection } from './base';
import { MOVIMIENTO_TIPOS } from '../utils/constants';

function sumBy(items, getter) {
  return items.reduce((acc, item) => acc + Number(getter(item) || 0), 0);
}

function parseDate(value) {
  return value?.toDate ? value.toDate() : new Date(value);
}

function toDateStr(date = new Date()) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function monthBounds(dateStr) {
  const base = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

function aggregateByKey(items, keyGetter, valueGetter) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyGetter(item);
    if (!key) return;
    const current = map.get(key) || 0;
    map.set(key, current + Number(valueGetter(item) || 0));
  });
  return Array.from(map.entries()).map(([key, value]) => ({ key, value }));
}

export async function getDashboardAridos(cuentaId, filters = {}) {
  const fecha = filters.fecha || toDateStr();
  const [{ start, end }, productos, ventas, ingresos, movimientos] = await Promise.all([
    Promise.resolve(monthBounds(fecha)),
    fetchCollection(cuentaId, 'productos', { orderBy: [{ field: 'nombre', direction: 'asc' }] }),
    fetchCollection(cuentaId, 'ventas', { orderBy: [{ field: 'fecha', direction: 'desc' }], limit: 400 }),
    fetchCollection(cuentaId, 'ingresosCamion', { orderBy: [{ field: 'fecha', direction: 'desc' }], limit: 300 }),
    fetchCollection(cuentaId, 'movimientosStock', { orderBy: [{ field: 'fecha', direction: 'desc' }], limit: 100 }),
  ]);

  const ventasDia = ventas.filter((item) => item.fechaStr === fecha && item.estado !== 'anulada');
  const ingresosDia = ingresos.filter((item) => item.fechaStr === fecha);
  const movimientosDia = movimientos.filter((item) => item.fechaStr === fecha);
  const ventasMes = ventas.filter((item) => {
    const d = parseDate(item.fecha);
    return d >= start && d <= end && item.estado !== 'anulada';
  });

  const stockCritico = productos.filter((p) => Number(p.stockActual || p.stockTotalM3 || 0) <= Number(p.stockMinimo || p.stockMinimoM3 || 0));
  const productosActivos = productos.filter((p) => p.activo !== false);
  const conStock = productosActivos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) > 0).length;

  const topProductosDia = aggregateByKey(ventasDia, (item) => item.productoNombre, (item) => item.cantidad)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const ventasPorPagoDia = aggregateByKey(ventasDia, (item) => item.metodoPago, (item) => item.total)
    .sort((a, b) => b.value - a.value);

  const ventasPorEntregaDia = aggregateByKey(ventasDia, (item) => item.tipoEntrega, (item) => item.total);
  const reposicionPorProductoDia = aggregateByKey(ingresosDia, (item) => item.productoNombre, (item) => item.cantidad)
    .sort((a, b) => b.value - a.value);

  const topProductosMes = aggregateByKey(ventasMes, (item) => item.productoNombre, (item) => item.total)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    fecha,
    productosCount: productos.length,
    productosActivos: productosActivos.length,
    ventasHoyMonto: sumBy(ventasDia, (item) => item.total),
    ventasHoyCantidad: sumBy(ventasDia, (item) => item.cantidad),
    ventasHoyEnvio: sumBy(ventasDia, (item) => item.envioMonto),
    ventasHoyOperaciones: ventasDia.length,
    ingresosHoyCantidad: sumBy(ingresosDia, (item) => item.cantidad),
    ingresosHoyOperaciones: ingresosDia.length,
    ingresosHoyCosto: sumBy(ingresosDia, (item) => item.costoTotal),
    stockCritico,
    ultimosMovimientos: movimientos.slice(0, 12),
    movimientosDia,
    productos,
    coberturaStockPct: productosActivos.length ? Math.round((conStock / productosActivos.length) * 100) : 0,
    ventasPorPagoDia,
    ventasPorEntregaDia,
    topProductosDia,
    reposicionPorProductoDia,
    ventasMesMonto: sumBy(ventasMes, (item) => item.total),
    ventasMesOperaciones: ventasMes.length,
    topProductosMes,
    alertas: {
      productosSinStock: productos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) <= 0).length,
      movimientosAjusteDia: movimientosDia.filter((item) => [MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO, MOVIMIENTO_TIPOS.AJUSTE_POSITIVO, MOVIMIENTO_TIPOS.MERMA].includes(item.tipo)).length,
    },
  };
}
