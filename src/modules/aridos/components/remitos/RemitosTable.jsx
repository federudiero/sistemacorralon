import { REMITO_ESTADOS } from '../../utils/constants';
import { formatDateTime, formatQuantity, formatVehiculoEntrega } from '../../utils/formatters';
import RemitoEstadoBadge from './RemitoEstadoBadge';

function RemitoCard({ item, onChangeEstado, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.clienteNombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <RemitoEstadoBadge value={item.estado} />
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Producto</span>
          <span className="mobile-data-value">{item.productoNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Vehículo</span>
          <span className="mobile-data-value">{item.camion ? formatVehiculoEntrega(item.camion) : '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Chofer</span>
          <span className="mobile-data-value">{item.chofer || '-'}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <select
            className="select select-bordered w-full"
            value={item.estado}
            onChange={(e) => onChangeEstado?.(item, e.target.value)}
          >
            {Object.values(REMITO_ESTADOS).map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs opacity-60">Solo lectura</span>
        )}
      </div>
    </div>
  );
}

export default function RemitosTable({ items = [], onChangeEstado, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Remitos operativos</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? (
            items.map((item) => (
              <RemitoCard
                key={item.id}
                item={item}
                onChangeEstado={onChangeEstado}
                canEdit={canEdit}
              />
            ))
          ) : (
            <div className="mobile-empty-state">No hay remitos para mostrar.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Vehículo</th>
                <th>Chofer</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.fecha)}</td>
                    <td>{item.clienteNombre || '-'}</td>
                    <td>{item.productoNombre || '-'}</td>
                    <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                    <td>{item.camion ? formatVehiculoEntrega(item.camion) : '-'}</td>
                    <td>{item.chofer || '-'}</td>
                    <td><RemitoEstadoBadge value={item.estado} /></td>
                    <td>
                      {canEdit ? (
                        <select
                          className="select select-bordered select-xs"
                          value={item.estado}
                          onChange={(e) => onChangeEstado?.(item, e.target.value)}
                        >
                          {Object.values(REMITO_ESTADOS).map((estado) => (
                            <option key={estado} value={estado}>
                              {estado}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs opacity-60">Solo lectura</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center app-muted-text">
                    No hay remitos para mostrar.
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
