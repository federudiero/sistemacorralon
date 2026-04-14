import { describeProductoUnidad, formatCurrency, formatQuantity } from '../../utils/formatters';

function ProductoCard({ item, onEdit, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{item.nombre || '-'}</div>
          <div className="mobile-data-card-subtitle">{item.categoria || 'Sin categoría'}</div>
        </div>

        <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>
          {item.activo === false ? 'Inactivo' : 'Activo'}
        </span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Unidad</span>
          <span className="mobile-data-value">{describeProductoUnidad(item)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Precio venta</span>
          <span className="mobile-data-value">{formatCurrency(item.precioVenta)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo promedio</span>
          <span className="mobile-data-value">{formatCurrency(item.costoPromedio)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Stock actual</span>
          <span className="mobile-data-value strong">
            {formatQuantity(
              item.stockActual ?? item.stockTotalM3,
              item.unidadStock || item.unidad,
              item.pesoBolsaKg,
            )}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Stock mínimo</span>
          <span className="mobile-data-value">
            {formatQuantity(
              item.stockMinimo ?? item.stockMinimoM3,
              item.unidadStock || item.unidad,
              item.pesoBolsaKg,
            )}
          </span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <button className="btn btn-sm btn-outline" onClick={() => onEdit?.(item)}>
            Editar
          </button>
        ) : (
          <span className="text-xs opacity-60">Solo lectura</span>
        )}
      </div>
    </div>
  );
}

export default function ProductosTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">Productos</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => (
              <ProductoCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />
            ))
          ) : (
            <div className="mobile-empty-state">No hay productos cargados.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto border shadow-sm rounded-2xl border-base-200 bg-base-100 md:block">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th>Precio venta</th>
                <th>Costo promedio</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre || '-'}</td>
                  <td>{item.categoria || '-'}</td>
                  <td>{describeProductoUnidad(item)}</td>
                  <td>{formatCurrency(item.precioVenta)}</td>
                  <td>{formatCurrency(item.costoPromedio)}</td>
                  <td>
                    {formatQuantity(
                      item.stockActual ?? item.stockTotalM3,
                      item.unidadStock || item.unidad,
                      item.pesoBolsaKg,
                    )}
                  </td>
                  <td>
                    {formatQuantity(
                      item.stockMinimo ?? item.stockMinimoM3,
                      item.unidadStock || item.unidad,
                      item.pesoBolsaKg,
                    )}
                  </td>
                  <td>
                    <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>
                      {item.activo === false ? 'No' : 'Sí'}
                    </span>
                  </td>
                  <td>
                    {canEdit ? (
                      <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>
                        Editar
                      </button>
                    ) : (
                      <span className="text-xs opacity-60">Solo lectura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}