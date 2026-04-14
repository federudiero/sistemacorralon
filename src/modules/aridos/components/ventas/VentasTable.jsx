import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';

function VentaCard({ item, onView, onAnular, onGenerarRemito, canAnnul, canGenerateRemito }) {
  return (
    <div className="mobile-data-card ventas-mobile-card">
      <div className="mobile-data-card-header">
        <div className="flex-1 min-w-0">
          <div className="truncate mobile-data-card-title">{item.clienteNombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <EstadoBadge value={item.estado} />
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Producto</span>
          <span className="mobile-data-value">{item.productoNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value">
            {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Modalidad</span>
          <span className="mobile-data-value">
            {item.tipoEntrega === 'retiro' ? 'Retiro' : item.vehiculoEntrega || 'Envío'}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Envío</span>
          <span className="mobile-data-value">{formatCurrency(item.envioMonto || 0)}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Total</span>
          <span className="mobile-data-value strong">{formatCurrency(item.total)}</span>
        </div>
      </div>

      <div className="mobile-card-actions mobile-card-actions-spaced">
        <button className="btn btn-sm btn-outline flex-1 min-w-[88px]" onClick={() => onView?.(item)}>
          Ver
        </button>

        {item.estado !== 'anulada' && canAnnul ? (
          <button
            className="btn btn-sm btn-error btn-outline flex-1 min-w-[88px]"
            onClick={() => onAnular?.(item)}
          >
            Anular
          </button>
        ) : null}

        {item.estado === 'confirmada' && !item.remitoGenerado && canGenerateRemito ? (
          <button
            className="btn btn-sm btn-secondary btn-outline flex-1 min-w-[88px]"
            onClick={() => onGenerarRemito?.(item)}
          >
            Remito
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function VentasTable({
  items = [],
  onView,
  onAnular,
  onGenerarRemito,
  canAnnul = true,
  canGenerateRemito = true,
}) {
  return (
    <div className="page-section">
      <div className="page-section-body ventas-table-body">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">Ventas registradas</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>

        <div className="space-y-3 md:hidden ventas-mobile-list">
          {items.length ? (
            items.map((item) => (
              <VentaCard
                key={item.id}
                item={item}
                onView={onView}
                onAnular={onAnular}
                onGenerarRemito={onGenerarRemito}
                canAnnul={canAnnul}
                canGenerateRemito={canGenerateRemito}
              />
            ))
          ) : (
            <div className="mobile-empty-state">No hay ventas para mostrar.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Modalidad</th>
                <th>Envío</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{item.clienteNombre}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.tipoEntrega === 'retiro' ? 'Retiro' : item.vehiculoEntrega || 'Envío'}</td>
                  <td>{formatCurrency(item.envioMonto || 0)}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td>
                    <EstadoBadge value={item.estado} />
                  </td>
                  <td className="flex flex-wrap gap-2">
                    <button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>
                      Ver
                    </button>

                    {item.estado !== 'anulada' && canAnnul ? (
                      <button
                        className="btn btn-xs btn-error btn-outline"
                        onClick={() => onAnular?.(item)}
                      >
                        Anular
                      </button>
                    ) : null}

                    {item.estado === 'confirmada' &&
                    !item.remitoGenerado &&
                    canGenerateRemito ? (
                      <button
                        className="btn btn-xs btn-secondary btn-outline"
                        onClick={() => onGenerarRemito?.(item)}
                      >
                        Remito
                      </button>
                    ) : null}
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