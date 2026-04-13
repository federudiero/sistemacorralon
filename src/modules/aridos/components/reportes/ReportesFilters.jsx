import { MOVIMIENTO_TIPOS, METODOS_PAGO } from '../../utils/constants';

export default function ReportesFilters({ filters, setFilters, productos = [], onExportVentas, onExportMovimientos }) {
  return (
    <div className="page-section mb-4">
      <div className="page-section-body space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Filtros de reportes</h2>
          <p className="mt-1 text-sm text-slate-300">Consultá ventas y movimientos por rango de fechas, producto y forma de pago.</p>
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
            <span className="field-label">Producto</span>
            <select className="select select-bordered h-12" value={filters.productoId || ''} onChange={(e) => setFilters((p) => ({ ...p, productoId: e.target.value }))}><option value="">Todos</option>{productos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
          </label>
          <label className="form-control">
            <span className="field-label">Pago</span>
            <select className="select select-bordered h-12" value={filters.metodoPago || ''} onChange={(e) => setFilters((p) => ({ ...p, metodoPago: e.target.value }))}><option value="">Todos</option>{METODOS_PAGO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          </label>
          <label className="form-control">
            <span className="field-label">Movimiento</span>
            <select className="select select-bordered h-12" value={filters.tipoMovimiento || ''} onChange={(e) => setFilters((p) => ({ ...p, tipoMovimiento: e.target.value }))}><option value="">Todos</option>{Object.values(MOVIMIENTO_TIPOS).map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}</select>
          </label>
          <div className="flex items-end">
            <button className="btn h-12 w-full" onClick={() => setFilters({})}>Limpiar</button>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button className="btn btn-outline h-11" onClick={onExportVentas}>CSV ventas</button>
          <button className="btn btn-outline h-11" onClick={onExportMovimientos}>CSV movimientos</button>
        </div>
      </div>
    </div>
  );
}
