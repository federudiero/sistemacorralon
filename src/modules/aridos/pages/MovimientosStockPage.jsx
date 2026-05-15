import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import MovimientoFilters from '../components/movimientos/MovimientoFilters';
import MovimientosTable from '../components/movimientos/MovimientosTable';
import useMovimientosStock from '../hooks/useMovimientosStock';
import useProductos from '../hooks/useProductos';
import { toInputDate } from '../utils/formatters';

export default function MovimientosStockPage({ cuentaId }) {
  const [filters, setFilters] = useState({ limit: 300, fechaDesde: toInputDate(new Date()), fechaHasta: toInputDate(new Date()) });
  const { items, loading, error } = useMovimientosStock(cuentaId, filters);
  const { items: productos } = useProductos(cuentaId);

  return (
    <div className="space-y-4">
      <PageHeader title="Movimientos de stock" />
      <MovimientoFilters filters={filters} setFilters={setFilters} productos={productos} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <PageLoadingState title="Cargando movimientos..." rows={6} /> : <MovimientosTable items={items} />}
    </div>
  );
}
