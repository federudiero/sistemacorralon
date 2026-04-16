import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';

function IngresoCard({ item, onView }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.productoNombre || 'Producto'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <span className="badge-soft">{item.remitoNumero || 'Sin remito'}</span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Proveedor</span>
          <span className="mobile-data-value">{item.proveedorNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo total</span>
          <span className="mobile-data-value strong">{formatCurrency(item.costoTotal)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo unitario</span>
          <span className="mobile-data-value">{formatCurrency(item.costoUnitario)}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        <button className="btn btn-sm btn-outline w-full" onClick={() => onView?.(item)}>
          Ver detalle
        </button>
      </div>
    </div>
  );
}

export default function IngresosTable({ items = [], onView }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Reposiciones registradas</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => <IngresoCard key={item.id} item={item} onView={onView} />)
          ) : (
            <div className="mobile-empty-state">No hay reposiciones para mostrar.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Remito</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.fecha)}</td>
                    <td>{item.proveedorNombre || '-'}</td>
                    <td>{item.productoNombre || '-'}</td>
                    <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                    <td>{item.remitoNumero || '-'}</td>
                    <td>{formatCurrency(item.costoTotal)}</td>
                    <td>
                      <button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center app-muted-text">
                    No hay reposiciones para mostrar.
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
