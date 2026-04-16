function ProveedorCard({ item, onEdit, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.nombre || 'Proveedor'}</div>
          <div className="mobile-data-card-subtitle">{item.cuit || 'Sin CUIT'}</div>
        </div>
        <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>
          {item.activo === false ? 'Inactivo' : 'Activo'}
        </span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Teléfono</span>
          <span className="mobile-data-value">{item.telefono || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">CUIT</span>
          <span className="mobile-data-value">{item.cuit || '-'}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Dirección</span>
          <span className="mobile-data-value">{item.direccion || '-'}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <button className="btn btn-sm btn-outline w-full" onClick={() => onEdit?.(item)}>
            Editar proveedor
          </button>
        ) : (
          <span className="text-xs opacity-60">Solo lectura</span>
        )}
      </div>
    </div>
  );
}

export default function ProveedoresTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Proveedores cargados</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => (
              <ProveedorCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />
            ))
          ) : (
            <div className="mobile-empty-state">No hay proveedores cargados.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>CUIT</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre || '-'}</td>
                    <td>{item.telefono || '-'}</td>
                    <td>{item.direccion || '-'}</td>
                    <td>{item.cuit || '-'}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center app-muted-text">
                    No hay proveedores cargados.
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
