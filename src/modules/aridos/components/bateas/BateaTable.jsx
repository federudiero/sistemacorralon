import { formatM3 } from '../../utils/formatters';

function BateaMobileCard({ item, onEdit, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{item.nombre || 'Batea'}</div>
          <div className="mobile-data-card-subtitle">{item.codigo || 'Sin código'}</div>
        </div>
        <span className={`badge ${item.activa === false ? 'badge-error' : 'badge-success'}`}>
          {item.activa === false ? 'Inactiva' : 'Activa'}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Capacidad</span>
          <span className="font-medium app-title-text">{formatM3(item.capacidadM3)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Stock actual</span>
          <span className="font-medium app-title-text">{formatM3(item.stockActualM3)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Producto</span>
          <span className="font-medium app-title-text text-right">{item.productoNombre || item.productoId || '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Observaciones</span>
          <span className="font-medium app-title-text text-right">{item.observaciones || '-'}</span>
        </div>
      </div>

      <div className="mt-4">
        {canEdit ? (
          <button className="btn btn-outline btn-sm w-full" onClick={() => onEdit?.(item)}>
            Editar batea
          </button>
        ) : (
          <div className="text-xs app-muted-text">Solo lectura</div>
        )}
      </div>
    </div>
  );
}

export default function BateaTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-base-200 px-4 py-4">
        <div className="font-semibold app-title-text">Bateas registradas</div>
        <span className="badge-soft">{items.length} registros</span>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {items.length ? items.map((item) => (
          <BateaMobileCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />
        )) : <div className="mobile-empty-state">No hay bateas cargadas.</div>}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Capacidad</th>
              <th>Producto ID</th>
              <th>Producto</th>
              <th>Stock actual</th>
              <th>Activa</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre || '-'}</td>
                <td>{item.codigo || '-'}</td>
                <td>{formatM3(item.capacidadM3)}</td>
                <td>{item.productoId || '-'}</td>
                <td>{item.productoNombre || '-'}</td>
                <td>{formatM3(item.stockActualM3)}</td>
                <td>
                  <span className={`badge ${item.activa === false ? 'badge-error' : 'badge-success'}`}>
                    {item.activa === false ? 'No' : 'Sí'}
                  </span>
                </td>
                <td>{item.observaciones || '-'}</td>
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
  );
}
