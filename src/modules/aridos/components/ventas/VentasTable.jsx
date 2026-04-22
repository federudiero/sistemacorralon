import { useMemo, useState } from 'react';
import {
  formatCurrency,
  formatDateTime,
  formatEntregaDisplay,
  formatEntregaEstado,
  formatQuantity,
} from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';
import ListSearchInput from '../shared/ListSearchInput';
import EntregaStateSelector from '../shared/EntregaStateSelector';
import UiIconButton from '../shared/UiIconButton';

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.6 12s3.55-6.25 9.4-6.25S21.4 12 21.4 12 17.85 18.25 12 18.25 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M8.5 15.5 15.5 8.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3.8h6.2l4 4v10.3a2.1 2.1 0 0 1-2.1 2.1H8A2.1 2.1 0 0 1 5.9 18.1V5.9A2.1 2.1 0 0 1 8 3.8Z" />
      <path d="M14.2 3.8v4h4" />
      <path d="M8.8 12.2h6.5" />
      <path d="M8.8 15.5h4.9" />
    </svg>
  );
}

function EntregaActions({ item, onSetEntrega, processing = false }) {
  if (!onSetEntrega || item.estado === 'anulada') return null;

  return (
    <EntregaStateSelector
      value={item.entregaEstado}
      disabled={processing}
      size="sm"
      className="venta-state-stack"
      onChange={(nextValue) => onSetEntrega(item, nextValue)}
    />
  );
}

function ActionButtons({
  item,
  onView,
  onAnular,
  onGenerarRemito,
  canAnnul,
  canGenerateRemito,
}) {
  return (
    <div className="venta-action-stack">
      <UiIconButton
        size="sm"
        label="Ver"
        tone="neutral"
        icon={<EyeIcon />}
        onClick={() => onView?.(item)}
      />

      {item.estado !== 'anulada' && canAnnul ? (
        <UiIconButton
          size="sm"
          label="Anular"
          tone="danger"
          icon={<BanIcon />}
          onClick={() => onAnular?.(item)}
        />
      ) : null}

      {item.estado === 'confirmada' && !item.remitoGenerado && canGenerateRemito ? (
        <UiIconButton
          size="sm"
          label="Remito"
          tone="secondary"
          icon={<FileIcon />}
          onClick={() => onGenerarRemito?.(item)}
        />
      ) : null}
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
          <span className="mobile-data-value">
            {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Entrega</span>
          <span className="mobile-data-value">
            {formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}
          </span>
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

      {canUpdateEntrega ? (
        <EntregaActions item={item} onSetEntrega={onSetEntrega} processing={processing} />
      ) : null}

      <ActionButtons
        item={item}
        onView={onView}
        onAnular={onAnular}
        onGenerarRemito={onGenerarRemito}
        canAnnul={canAnnul}
        canGenerateRemito={canGenerateRemito}
      />
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
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Ventas registradas</h3>
            <p className="mt-1 text-sm app-muted-text">
              Podés buscar, abrir el detalle y marcar si la venta quedó pendiente, entregada o no entregada.
            </p>
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
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.fecha)}</td>
                    <td>{item.clienteNombre}</td>
                    <td>{item.productoNombre}</td>
                    <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                    <td>{formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</td>
                    <td>
                      <div className="flex flex-col gap-2">
                        <EstadoBadge value={item.entregaEstado} />
                        {canUpdateEntrega ? (
                          <EntregaActions
                            item={item}
                            onSetEntrega={onSetEntrega}
                            processing={processing}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td>{formatCurrency(item.envioMonto || 0)}</td>
                    <td>{formatCurrency(item.total)}</td>
                    <td>
                      <EstadoBadge value={item.estado} />
                    </td>
                    <td>
                      <ActionButtons
                        item={item}
                        onView={onView}
                        onAnular={onAnular}
                        onGenerarRemito={onGenerarRemito}
                        canAnnul={canAnnul}
                        canGenerateRemito={canGenerateRemito}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center app-muted-text">
                    No hay ventas que coincidan con la búsqueda.
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