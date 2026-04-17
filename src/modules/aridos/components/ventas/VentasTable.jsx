import { useMemo, useState } from 'react';
import { VENTA_ENTREGA_ESTADOS } from '../../utils/constants';
import {
  formatCurrency,
  formatDateTime,
  formatEntregaDisplay,
  formatEntregaEstado,
  formatQuantity,
} from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';
import ListSearchInput from '../shared/ListSearchInput';

function EntregaActions({ item, onSetEntrega, processing = false, compact = false }) {
  if (!onSetEntrega || item.estado === 'anulada') return null;
  const disabled = processing || item.tipoEntrega === 'retiro';

  return (
    <div className={`venta-entrega-actions ${compact ? 'is-compact' : ''}`}>
      <button
        type="button"
        className={`btn btn-xs ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.ENTREGADA ? 'btn-success' : 'btn-outline'}`}
        disabled={disabled}
        onClick={() => onSetEntrega(item, VENTA_ENTREGA_ESTADOS.ENTREGADA)}
      >
        Entregada
      </button>
      <button
        type="button"
        className={`btn btn-xs ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA ? 'btn-error' : 'btn-outline'}`}
        disabled={disabled}
        onClick={() => onSetEntrega(item, VENTA_ENTREGA_ESTADOS.NO_ENTREGADA)}
      >
        No entregada
      </button>
    </div>
  );
}

function VentaCard({
  item,
  onView,
  onAnular,
  onGenerarRemito,
  onSetEntrega,
  canAnnul,
  canGenerateRemito,
  canUpdateEntrega,
  processing,
}) {
  return (
    <div className="mobile-data-card ventas-mobile-card">
      <div className="mobile-data-card-header">
        <div className="flex-1 min-w-0">
          <div className="truncate mobile-data-card-title">{item.clienteNombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EstadoBadge value={item.estado} />
          <EstadoBadge value={item.entregaEstado} />
        </div>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Producto</span>
          <span className="mobile-data-value">{item.productoNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Entrega</span>
          <span className="mobile-data-value">{formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Estado entrega</span>
          <span className="mobile-data-value">{formatEntregaEstado(item.entregaEstado)}</span>
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

      {canUpdateEntrega ? <EntregaActions item={item} onSetEntrega={onSetEntrega} processing={processing} compact /> : null}

      <div className="mobile-card-actions mobile-card-actions-spaced">
        <button className="btn btn-sm btn-outline flex-1 min-w-[88px]" onClick={() => onView?.(item)}>
          Ver
        </button>

        {item.estado !== 'anulada' && canAnnul ? (
          <button className="btn btn-sm btn-error btn-outline flex-1 min-w-[88px]" onClick={() => onAnular?.(item)}>
            Anular
          </button>
        ) : null}

        {item.estado === 'confirmada' && !item.remitoGenerado && canGenerateRemito ? (
          <button className="btn btn-sm btn-secondary btn-outline flex-1 min-w-[88px]" onClick={() => onGenerarRemito?.(item)}>
            Remito
          </button>
        ) : null}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    item.clienteNombre,
    item.productoNombre,
    item.telefono,
    item.direccion,
    item.metodoPago,
    formatEntregaEstado(item.entregaEstado),
    formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega),
  ]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export default function VentasTable({
  items = [],
  onView,
  onAnular,
  onGenerarRemito,
  onSetEntrega,
  canAnnul = true,
  canGenerateRemito = true,
  canUpdateEntrega = true,
  processing = false,
}) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="page-section">
      <div className="page-section-body ventas-table-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Ventas registradas</h3>
            <p className="mt-1 text-sm app-muted-text">Podés buscar, abrir el detalle y marcar si la venta se entregó o no.</p>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por cliente, producto, entrega o dirección"
          count={filteredItems.length}
          className="mb-4"
        />

        <div className="space-y-3 md:hidden ventas-mobile-list">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <VentaCard
                key={item.id}
                item={item}
                onView={onView}
                onAnular={onAnular}
                onGenerarRemito={onGenerarRemito}
                onSetEntrega={onSetEntrega}
                canAnnul={canAnnul}
                canGenerateRemito={canGenerateRemito}
                canUpdateEntrega={canUpdateEntrega}
                processing={processing}
              />
            ))
          ) : (
            <div className="mobile-empty-state">No hay ventas que coincidan con la búsqueda.</div>
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
                <th>Entrega</th>
                <th>Estado entrega</th>
                <th>Envío</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{item.clienteNombre}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</td>
                  <td>
                    <div className="flex flex-col gap-2">
                      <EstadoBadge value={item.entregaEstado} />
                      {canUpdateEntrega ? <EntregaActions item={item} onSetEntrega={onSetEntrega} processing={processing} /> : null}
                    </div>
                  </td>
                  <td>{formatCurrency(item.envioMonto || 0)}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td><EstadoBadge value={item.estado} /></td>
                  <td className="flex flex-wrap gap-2">
                    <button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>Ver</button>
                    {item.estado !== 'anulada' && canAnnul ? <button className="btn btn-xs btn-error btn-outline" onClick={() => onAnular?.(item)}>Anular</button> : null}
                    {item.estado === 'confirmada' && !item.remitoGenerado && canGenerateRemito ? <button className="btn btn-xs btn-secondary btn-outline" onClick={() => onGenerarRemito?.(item)}>Remito</button> : null}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="10" className="text-center app-muted-text">No hay ventas que coincidan con la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
