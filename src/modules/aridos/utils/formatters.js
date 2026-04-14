import { METODOS_PAGO, MOVIMIENTO_LABELS, MOVIMIENTO_TIPOS, TIPOS_ENTREGA, VEHICULOS_ENVIO } from './constants';

export function formatCurrency(value = 0, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateOnly(value) {
  if (!value) return '-';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(date);
}

export function toInputDate(value) {
  return buildDateStr(value);
}


export function buildDateStr(value = new Date()) {
  const date = value?.toDate ? value.toDate() : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseInputDate(value, options = {}) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    const base = options.baseTime instanceof Date && !Number.isNaN(options.baseTime.getTime())
      ? options.baseTime
      : new Date();
    const hours = options.endOfDay ? 23 : base.getHours();
    const minutes = options.endOfDay ? 59 : base.getMinutes();
    const seconds = options.endOfDay ? 59 : base.getSeconds();
    const ms = options.endOfDay ? 999 : base.getMilliseconds();
    return new Date(Number(y), Number(m) - 1, Number(d), hours, minutes, seconds, ms);
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}


export function formatM3(value = 0) {
  return `${Number(value || 0).toFixed(2)} m³`;
}

export function getUnidadLabel(unidad = 'm3', pesoBolsaKg) {
  switch (unidad) {
    case 'bolsa':
      return pesoBolsaKg ? `bolsas de ${Number(pesoBolsaKg)} kg` : 'bolsas';
    case 'unidad':
      return 'unidades';
    case 'kg':
      return 'kg';
    case 'tonelada':
      return 'toneladas';
    case 'litro':
      return 'litros';
    case 'm2':
      return 'm²';
    case 'metro':
      return 'metros';
    case 'pallet':
      return 'pallets';
    default:
      return 'm³';
  }
}

export function formatQuantity(value = 0, unidad = 'm3', pesoBolsaKg) {
  const n = Number(value || 0);
  switch (unidad) {
    case 'unidad':
      return `${n.toFixed(0)} un.`;
    case 'bolsa': {
      const label = pesoBolsaKg ? `bolsas x ${Number(pesoBolsaKg)} kg` : 'bolsas';
      return `${n.toFixed(0)} ${label}`;
    }
    case 'kg':
      return `${n.toFixed(2)} kg`;
    case 'tonelada':
      return `${n.toFixed(2)} tn`;
    case 'litro':
      return `${n.toFixed(2)} l`;
    case 'm2':
      return `${n.toFixed(2)} m²`;
    case 'metro':
      return `${n.toFixed(2)} m`;
    case 'pallet':
      return `${n.toFixed(0)} pallets`;
    default:
      return formatM3(n);
  }
}

export function describeProductoUnidad(producto = {}) {
  return getUnidadLabel(producto.unidadStock || producto.unidad, producto.pesoBolsaKg);
}



function findOptionLabel(options = [], value, fallback = '') {
  return options.find((item) => item.value === value)?.label || fallback || value || '-';
}

export function formatMetodoPago(value = '') {
  return findOptionLabel(METODOS_PAGO, value, value || '-');
}

export function formatTipoEntrega(value = '') {
  return findOptionLabel(TIPOS_ENTREGA, value, value || '-');
}

export function formatVehiculoEntrega(value = '') {
  if (!value) return '-';
  return findOptionLabel(VEHICULOS_ENVIO, value, value);
}

export function formatEntregaDisplay(tipoEntrega = 'retiro', vehiculoEntrega = '') {
  if (tipoEntrega === 'retiro') return formatTipoEntrega('retiro');
  if (vehiculoEntrega && vehiculoEntrega !== 'retiro_cliente') return formatVehiculoEntrega(vehiculoEntrega);
  return formatTipoEntrega('envio');
}
export function formatMovimientoTipo(tipo, referenciaTipo = '') {
  if (tipo === MOVIMIENTO_TIPOS.DEVOLUCION && referenciaTipo === 'venta_anulada') {
    return 'Anulación de venta';
  }

  return MOVIMIENTO_LABELS[tipo] || tipo || '-';
}

export function formatReferenciaMovimiento(referenciaTipo = '') {
  switch (referenciaTipo) {
    case 'venta_anulada':
      return 'anulación venta';
    case 'venta':
      return 'venta';
    case 'ingreso_reposicion':
      return 'reposición';
    case 'ajuste_stock':
      return 'ajuste';
    case 'cierre_caja':
      return 'cierre';
    default:
      return referenciaTipo || 'movimiento';
  }
}

export function formatPercent(value = 0) {
  return `${Number(value || 0).toFixed(0)}%`;
}

export function monthStartInput() {
  const date = new Date();
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-01`;
}
