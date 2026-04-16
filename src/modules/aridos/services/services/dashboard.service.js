import { fetchCollection } from './base';
import { MOVIMIENTO_TIPOS } from '../utils/constants';
import { parseInputDate } from '../utils/formatters';

function sumBy(items, getter) {
  return items.reduce((acc, item) => acc + Number(getter(item) || 0), 0);
}

function toDateStr(date = new Date()) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function dayBounds(dateStr) {
  return {
    start: parseInputDate(dateStr, { baseTime: new Date(2000, 0, 1, 0, 0, 0, 0) }),
    end: parseInputDate(dateStr, { endOfDay: true }),
  };
}

function monthBounds(dateStr) {
  const base = parseInputDate(dateStr, { baseTime: new Date(2000, 0, 1, 0, 0, 0, 0) }) || new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function aggregateByKey(items, keyGetter, valueGetter) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyGetter(item);
    if (!key) return;
    const current = map.get(key);
    if (current) {
      current.value += Number(valueGetter(item) || 0);
      return;
    }
    map.set(key, {
      key,
      value: Number(valueGetter(item) || 0),
      unidadStock: item.unidadStock || item.unidad || 'm3',
      pesoBolsaKg: item.pesoBolsaKg || null,
    });
  });
  return Array.from(map.values());
}

export async function getDashboardAridos(cuentaId, filters = {}) {
  const fecha = filters.fecha || toDateStr();
  const { start: dayStart, end: dayEnd } = dayBounds(fecha);
  const { start: monthStart, end: monthEnd } = monthBounds(fecha);

  const [productos, ventasDia, ingresosDia, movimientosDia, ventasMes, ultimosMovimientos] = await Promise.all([
    fetchCollection(cuentaId, 'productos', { orderBy: [{ field: 'nombre', direction: 'asc' }] }),
    fetchCollection(cuentaId, 'ventas', {
      where: [
        { field: 'fecha', op: '>=', value: dayStart },
        { field: 'fecha', op: '<=', value: dayEnd },
      ],
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'ingresosCamion', {
      where: [
        { field: 'fecha', op: '>=', value: dayStart },
        { field: 'fecha', op: '<=', value: dayEnd },
      ],
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'movimientosStock', {
      where: [
        { field: 'fecha', op: '>=', value: dayStart },
        { field: 'fecha', op: '<=', value: dayEnd },
      ],
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'ventas', {
      where: [
        { field: 'fecha', op: '>=', value: monthStart },
        { field: 'fecha', op: '<=', value: monthEnd },
      ],
      orderBy: [{ field: 'fecha', direction: 'desc' }],
    }),
    fetchCollection(cuentaId, 'movimientosStock', {
      orderBy: [{ field: 'fecha', direction: 'desc' }],
      limit: 12,
    }),
  ]);

  const ventasDiaConfirmadas = ventasDia.filter((item) => item.estado !== 'anulada');
  const ventasMesConfirmadas = ventasMes.filter((item) => item.estado !== 'anulada');

  const stockCritico = productos.filter((p) => Number(p.stockActual || p.stockTotalM3 || 0) <= Number(p.stockMinimo || p.stockMinimoM3 || 0));
  const productosActivos = productos.filter((p) => p.activo !== false);
  const conStock = productosActivos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) > 0).length;

  const topProductosDia = aggregateByKey(ventasDiaConfirmadas, (item) => item.productoNombre, (item) => item.cantidad)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const ventasPorPagoDia = aggregateByKey(ventasDiaConfirmadas, (item) => item.metodoPago, (item) => item.total)
    .sort((a, b) => b.value - a.value);

  const ventasPorEntregaDia = aggregateByKey(ventasDiaConfirmadas, (item) => item.tipoEntrega, (item) => item.total);
  const reposicionPorProductoDia = aggregateByKey(ingresosDia, (item) => item.productoNombre, (item) => item.cantidad)
    .sort((a, b) => b.value - a.value);

  const topProductosMes = aggregateByKey(ventasMesConfirmadas, (item) => item.productoNombre, (item) => item.total)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    fecha,
    productosCount: productos.length,
    productosActivos: productosActivos.length,
    ventasHoyMonto: sumBy(ventasDiaConfirmadas, (item) => item.total),
    ventasHoyCantidad: sumBy(ventasDiaConfirmadas, (item) => item.cantidad),
    ventasHoyEnvio: sumBy(ventasDiaConfirmadas, (item) => item.envioMonto),
    ventasHoyOperaciones: ventasDiaConfirmadas.length,
    ingresosHoyCantidad: sumBy(ingresosDia, (item) => item.cantidad),
    ingresosHoyOperaciones: ingresosDia.length,
    ingresosHoyCosto: sumBy(ingresosDia, (item) => item.costoTotal),
    stockCritico,
    ultimosMovimientos,
    movimientosDia,
    productos,
    coberturaStockPct: productosActivos.length ? Math.round((conStock / productosActivos.length) * 100) : 0,
    ventasPorPagoDia,
    ventasPorEntregaDia,
    topProductosDia,
    reposicionPorProductoDia,
    ventasMesMonto: sumBy(ventasMesConfirmadas, (item) => item.total),
    ventasMesOperaciones: ventasMesConfirmadas.length,
    topProductosMes,
    alertas: {
      productosSinStock: productos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) <= 0).length,
      movimientosAjusteDia: movimientosDia.filter((item) => [MOVIMIENTO_TIPOS.AJUSTE_NEGATIVO, MOVIMIENTO_TIPOS.AJUSTE_POSITIVO, MOVIMIENTO_TIPOS.MERMA].includes(item.tipo)).length,
    },
  };
}
