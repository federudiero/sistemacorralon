import {
  formatCurrency,
  formatDateTime,
  formatMovimientoTipo,
  formatQuantity,
  formatReferenciaMovimiento,
} from '../../utils/formatters';

function MovimientoCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>

        <span className="badge-soft">{formatReferenciaMovimiento(item.referenciaTipo)}</span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Producto</span>
          <span className="mobile-data-value">{item.productoNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value strong">
            {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Monto</span>
          <span className="mobile-data-value">
            {item.montoTotal ? formatCurrency(item.montoTotal) : '-'}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Detalle</span>
          <span className="mobile-data-value">
            {item.detalleLogistico || item.motivo || '-'}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Usuario</span>
          <span className="mobile-data-value">{item.usuarioEmail || '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default function MovimientosTable({ items = [] }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Detalle de movimientos</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => <MovimientoCard key={item.id} item={item} />)
          ) : (
            <div className="mobile-empty-state">
              No hay movimientos para los filtros seleccionados.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Monto</th>
                <th>Referencia</th>
                <th>Detalle</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.fecha)}</td>
                    <td>{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</td>
                    <td>{item.productoNombre || '-'}</td>
                    <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                    <td>{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</td>
                    <td>{formatReferenciaMovimiento(item.referenciaTipo)}</td>
                    <td>{item.detalleLogistico || item.motivo || '-'}</td>
                    <td>{item.usuarioEmail || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-slate-400">
                    No hay movimientos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
