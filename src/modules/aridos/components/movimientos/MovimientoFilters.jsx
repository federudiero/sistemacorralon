import { MOVIMIENTO_CATEGORIAS, MOVIMIENTO_LABELS, MOVIMIENTO_TIPOS } from '../../utils/constants';
import { toInputDate } from '../../utils/formatters';

export default function MovimientoFilters({ filters, setFilters, productos = [] }) {
  return (
    <div className="page-section mb-4">
      <div className="page-section-body space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Filtros de movimientos</h2>
          <p className="mt-1 text-sm text-slate-300">Separá ingresos, ventas, ajustes y cierres. También podés filtrar por fecha y producto.</p>
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

          <label className="form-control">
            <span className="field-label">Grupo</span>
            <select className="select select-bordered h-12" value={filters.categoria || ''} onChange={(e) => setFilters((p) => ({ ...p, categoria: e.target.value, tipo: '' }))}>
              <option value="">Todos</option>
              {MOVIMIENTO_CATEGORIAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="field-label">Tipo exacto</span>
            <select className="select select-bordered h-12" value={filters.tipo || ''} onChange={(e) => setFilters((p) => ({ ...p, tipo: e.target.value }))}>
              <option value="">Todos los tipos</option>
              {Object.values(MOVIMIENTO_TIPOS).map((tipo) => <option key={tipo} value={tipo}>{MOVIMIENTO_LABELS[tipo] || tipo}</option>)}
            </select>
          </label>

          <label className="form-control">
            <span className="field-label">Producto</span>
            <select className="select select-bordered h-12" value={filters.productoId || ''} onChange={(e) => setFilters((p) => ({ ...p, productoId: e.target.value }))}>
              <option value="">Todos los productos</option>
              {productos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            </select>
          </label>

          <div className="flex items-end">
            <button className="btn h-12 w-full" onClick={() => setFilters({ limit: 300, fechaDesde: toInputDate(new Date()), fechaHasta: toInputDate(new Date()) })}>Hoy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
