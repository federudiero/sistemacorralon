import { formatDateTime, formatQuantity, formatCurrency, formatMovimientoTipo } from '../../utils/formatters';

function UltimoMovimientoCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.productoNombre || 'Producto'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha || item.fechaStr)}</div>
        </div>
        <span className="badge-soft">{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Monto</span>
          <span className="mobile-data-value">{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Detalle</span>
          <span className="mobile-data-value">{item.motivo || item.detalleLogistico || '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default function UltimosMovimientosTable({ items = [] }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Últimos movimientos</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? items.map((item) => <UltimoMovimientoCard key={item.id} item={item} />) : <div className="mobile-empty-state">Sin movimientos cargados.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Detalle</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha || item.fechaStr)}</td>
                  <td>{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.motivo || item.detalleLogistico || '-'}</td>
                </tr>
              )) : <tr><td colSpan="5" className="text-center app-muted-text">Sin movimientos cargados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
