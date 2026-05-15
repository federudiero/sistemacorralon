import useClientPagination from '../../hooks/useClientPagination';
import { formatDateTime, formatQuantity } from '../../utils/formatters';
import PaginationControls from '../shared/PaginationControls';
import UiIconButton from '../shared/UiIconButton';

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M3 13C5.4 7.4 11.5 4 18 5.5a9 9 0 0 1 3 16.5" />
    </svg>
  );
}

function AjusteMobileCard({ item, onAnnular, canAnnul }) {
  const isBlocked = item.revertido || item.esReversion;

  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{item.productoNombre || 'Producto'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <span className="badge-soft capitalize">{item.tipo || '-'}</span>
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Cantidad</span>
          <span className="font-medium app-title-text text-right">
            {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Motivo</span>
          <span className="font-medium app-title-text text-right">{item.motivo || '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Estado</span>
          <span className="font-medium app-title-text text-right">
            {item.esReversion ? 'Reversión' : item.revertido ? 'Revertido' : 'Vigente'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Usuario</span>
          <span className="font-medium app-title-text text-right">{item.createdBy || '-'}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canAnnul && !isBlocked ? <UiIconButton size="sm" label="Revertir" tone="secondary" icon={<UndoIcon />} onClick={() => onAnnular?.(item)} className="flex-1" /> : <span className="text-xs app-muted-text">{item.esReversion ? 'Documento de reversión' : item.revertido ? 'Ya revertido' : 'Sin acción'}</span>}
      </div>
    </div>
  );
}

export default function AjustesTable({ items = [], onAnnular, canAnnul = false }) {
  const pagination = useClientPagination(items, { pageSize: 10 });
  const displayItems = pagination.paginatedItems;

  return (
    <div className="page-section">
      <div className="flex items-center justify-between gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <div className="font-semibold app-title-text">Ajustes registrados</div>
        <span className="badge-soft">{items.length} registros</span>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {items.length ? displayItems.map((item) => <AjusteMobileCard key={item.id} item={item} onAnnular={onAnnular} canAnnul={canAnnul} />) : (
          <div className="mobile-empty-state">No hay ajustes para mostrar.</div>
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
              <th>Motivo</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item) => {
              const isBlocked = item.revertido || item.esReversion;
              return (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td className="capitalize">{item.tipo}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.motivo}</td>
                  <td>{item.esReversion ? 'Reversión' : item.revertido ? 'Revertido' : 'Vigente'}</td>
                  <td>{item.createdBy || '-'}</td>
                  <td><div className="table-action-cell">{canAnnul && !isBlocked ? <UiIconButton size="sm" label="Revertir" tone="secondary" icon={<UndoIcon />} onClick={() => onAnnular?.(item)} /> : <span className="text-xs app-muted-text">{item.esReversion ? 'Reversión' : item.revertido ? 'Revertido' : '-'}</span>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 pb-4">
        <PaginationControls
          {...pagination}
          onPageChange={pagination.setPage}
        />
      </div>
    </div>
  );
}
