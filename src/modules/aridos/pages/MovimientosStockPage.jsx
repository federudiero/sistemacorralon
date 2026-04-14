import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
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
      <PageHeader title="Movimientos de stock" subtitle="Auditoría de ingresos, ventas, ajustes, anulaciones y cierres." />
      <MovimientoFilters filters={filters} setFilters={setFilters} productos={productos} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : <MovimientosTable items={items} />}
    </div>
  );
}
