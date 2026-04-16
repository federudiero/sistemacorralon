import { formatCurrency } from '../../utils/formatters';

function ClienteCard({ item, onEdit, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.nombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{item.alias || 'Sin alias'}</div>
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
          <span className="mobile-data-label">CUIT / DNI</span>
          <span className="mobile-data-value">{item.cuitDni || '-'}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Dirección</span>
          <span className="mobile-data-value">{item.direccion || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Saldo cuenta corriente</span>
          <span className="mobile-data-value strong">{formatCurrency(item.saldoCuentaCorriente)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Tipo</span>
          <span className="mobile-data-value">{item.esGenerico ? 'Genérico' : 'Regular'}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <button className="btn btn-sm btn-outline w-full" onClick={() => onEdit?.(item)}>
            Editar cliente
          </button>
        ) : (
          <span className="text-xs opacity-60">Solo lectura</span>
        )}
      </div>
    </div>
  );
}

export default function ClientesTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Clientes cargados</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => (
              <ClienteCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />
            ))
          ) : (
            <div className="mobile-empty-state">No hay clientes cargados.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Alias</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>CUIT / DNI</th>
                <th>Saldo CC</th>
                <th>Tipo</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre || '-'}</td>
                    <td>{item.alias || '-'}</td>
                    <td>{item.telefono || '-'}</td>
                    <td>{item.direccion || '-'}</td>
                    <td>{item.cuitDni || '-'}</td>
                    <td>{formatCurrency(item.saldoCuentaCorriente)}</td>
                    <td>
                      {item.esGenerico ? (
                        <span className="badge badge-info">Genérico</span>
                      ) : (
                        <span className="badge badge-ghost">Regular</span>
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
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center app-muted-text">
                    No hay clientes cargados.
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
