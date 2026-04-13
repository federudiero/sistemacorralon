export default function EstadoBadge({ value }) {
  const map = {
    activa: 'badge-success',
    activo: 'badge-success',
    pendiente: 'badge-warning',
    confirmada: 'badge-success',
    anulada: 'badge-error',
    entregado: 'badge-success',
    en_camino: 'badge-info',
    cancelado: 'badge-error',
  };
  return <span className={`badge ${map[value] || 'badge-neutral'}`}>{value}</span>;
}
