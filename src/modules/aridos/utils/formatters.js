import { MOVIMIENTO_LABELS } from './constants';

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
  const date = value?.toDate ? value.toDate() : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
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
    case 'pallet':
      return `${n.toFixed(0)} pallets`;
    default:
      return formatM3(n);
  }
}

export function describeProductoUnidad(producto = {}) {
  return getUnidadLabel(producto.unidadStock || producto.unidad, producto.pesoBolsaKg);
}

export function formatMovimientoTipo(tipo) {
  return MOVIMIENTO_LABELS[tipo] || tipo || '-';
}

export function formatPercent(value = 0) {
  return `${Number(value || 0).toFixed(0)}%`;
}

export function monthStartInput() {
  const date = new Date();
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-01`;
}