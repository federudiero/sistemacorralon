import { MOVIMIENTO_CATEGORIAS, MOVIMIENTO_LABELS, MOVIMIENTO_TIPOS } from '../../utils/constants';
import AppSelect from '../shared/AppSelect';
import { toInputDate } from '../../utils/formatters';

export default function MovimientoFilters({ filters, setFilters, productos = [] }) {
  return (
    <div className="page-section mb-4">
      <div className="page-section-body space-y-4">
        <div>
          <h2 className="text-lg font-semibold app-title-text">Filtros de movimientos</h2>
          <p className="mt-1 text-sm app-soft-text">Separá ingresos, ventas, ajustes y cierres. También podés filtrar por fecha y producto.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="form-control">
            <span className="field-label">Fecha desde</span>
            <input type="date" className="input input-bordered h-12" value={filters.fechaDesde || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaDesde: e.target.value }))} />
          </label>

          <label className="form-control">
            <span className="field-label">Fecha hasta</span>
            <input type="date" className="input input-bordered h-12" value={filters.fechaHasta || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaHasta: e.target.value }))} />
          </label>

          <AppSelect
            label="Grupo"
            options={MOVIMIENTO_CATEGORIAS}
            value={filters.categoria || ''}
            onChange={(nextValue) => setFilters((p) => ({ ...p, categoria: nextValue, tipo: '' }))}
            placeholder="Todos"
            includeEmptyOption
            emptyLabel="Todos"
          />

          <AppSelect
            label="Tipo exacto"
            options={Object.values(MOVIMIENTO_TIPOS).map((tipo) => ({ value: tipo, label: MOVIMIENTO_LABELS[tipo] || tipo }))}
            value={filters.tipo || ''}
            onChange={(nextValue) => setFilters((p) => ({ ...p, tipo: nextValue }))}
            placeholder="Todos los tipos"
            includeEmptyOption
            emptyLabel="Todos los tipos"
          />

          <AppSelect
            label="Producto"
            options={productos.map((item) => ({ value: item.id, label: item.nombre }))}
            value={filters.productoId || ''}
            onChange={(nextValue) => setFilters((p) => ({ ...p, productoId: nextValue }))}
            placeholder="Todos los productos"
            includeEmptyOption
            emptyLabel="Todos los productos"
          />

          <div className="flex items-end">
            <button className="btn h-12 w-full" onClick={() => setFilters({ limit: 300, fechaDesde: toInputDate(new Date()), fechaHasta: toInputDate(new Date()) })}>Hoy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
