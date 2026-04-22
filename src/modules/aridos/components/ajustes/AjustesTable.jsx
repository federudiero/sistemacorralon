import { formatDateTime, formatQuantity } from '../../utils/formatters';

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
        {canAnnul && !isBlocked ? <button className="btn btn-xs" onClick={() => onAnnular?.(item)}>Revertir</button> : <span className="text-xs opacity-60">{item.esReversion ? 'Documento de reversión' : item.revertido ? 'Ya revertido' : 'Sin acción'}</span>}
      </div>
    </div>
  );
}

export default function AjustesTable({ items = [], onAnnular, canAnnul = false }) {
  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-base-200 px-4 py-4">
        <div className="font-semibold app-title-text">Ajustes registrados</div>
        <span className="badge-soft">{items.length} registros</span>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {items.length ? items.map((item) => <AjusteMobileCard key={item.id} item={item} onAnnular={onAnnular} canAnnul={canAnnul} />) : (
          <div className="mobile-empty-state">No hay ajustes para mostrar.</div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table table-zebra">
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
            {items.map((item) => {
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
                  <td>{canAnnul && !isBlocked ? <button className="btn btn-xs" onClick={() => onAnnular?.(item)}>Revertir</button> : <span className="text-xs opacity-60">{item.esReversion ? 'Documento de reversión' : item.revertido ? 'Ya revertido' : 'Sin acción'}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
