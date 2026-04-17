import { formatEntregaEstado } from '../../utils/formatters';

export default function EstadoBadge({ value }) {
  const map = {
    activa: 'badge-success',
    activo: 'badge-success',
    pendiente: 'badge-warning',
    confirmada: 'badge-success',
    confirmado: 'badge-success',
    anulada: 'badge-error',
    entregado: 'badge-success',
    entregada: 'badge-success',
    no_entregada: 'badge-error',
    en_camino: 'badge-info',
    cancelado: 'badge-error',
  };

  const label = ['pendiente', 'entregada', 'no_entregada'].includes(value)
    ? formatEntregaEstado(value)
    : String(value || '-').replaceAll('_', ' ');

  return <span className={`badge ${map[value] || 'badge-neutral'}`}>{label}</span>;
}
