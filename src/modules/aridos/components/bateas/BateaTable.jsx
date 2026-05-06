import { formatM3 } from '../../utils/formatters';
import UiIconButton from '../shared/UiIconButton';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

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

      <div className="mobile-card-actions mt-4">
        {canEdit ? (
          <UiIconButton size="sm" label="Editar batea" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} className="flex-1" />
        ) : (
          <span className="text-xs app-muted-text">Solo lectura</span>
        )}
      </div>
    </div>
  );
}

export default function BateaTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="flex items-center justify-between gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <div className="font-semibold app-title-text">Bateas registradas</div>
        <span className="badge-soft">{items.length} registros</span>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {items.length ? items.map((item) => (
          <BateaMobileCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />
        )) : <div className="mobile-empty-state">No hay bateas cargadas.</div>}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table">
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
                  <div className="table-action-cell">
                    {canEdit ? (
                      <UiIconButton size="sm" label="Editar" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} />
                    ) : (
                      <span className="text-xs app-muted-text">Solo lectura</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
