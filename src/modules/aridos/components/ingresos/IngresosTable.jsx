import { useMemo, useState } from 'react';
import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';
import ListSearchInput from '../shared/ListSearchInput';

function IngresoCard({ item, onView, onAnular, processing = false }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.productoNombre || 'Producto'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge-soft">{item.remitoNumero || 'Sin remito'}</span>
          <EstadoBadge value={item.estado || 'confirmado'} />
        </div>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Proveedor</span>
          <span className="mobile-data-value">{item.proveedorNombre || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Cantidad</span>
          <span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo total</span>
          <span className="mobile-data-value strong">{formatCurrency(item.costoTotal)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo unitario</span>
          <span className="mobile-data-value">{formatCurrency(item.costoUnitario)}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        <button className="btn btn-sm btn-outline flex-1" onClick={() => onView?.(item)}>
          Ver detalle
        </button>
        {item.estado !== 'anulado' && onAnular ? (
          <button className="btn btn-sm btn-error btn-outline flex-1" onClick={() => onAnular?.(item)} disabled={processing}>
            Anular
          </button>
        ) : null}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.proveedorNombre, item.productoNombre, item.remitoNumero, item.observaciones]
    .join(' ')
    .toLowerCase()
    .includes(q);
}

export default function IngresosTable({ items = [], onView, onAnular, processing = false }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Reposiciones registradas</h3>
            <p className="mt-1 text-sm app-muted-text">Podés buscar reposiciones y anularlas mientras el día siga abierto.</p>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por proveedor, producto o remito"
          count={filteredItems.length}
          className="mb-4"
        />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? (
            filteredItems.map((item) => <IngresoCard key={item.id} item={item} onView={onView} onAnular={onAnular} processing={processing} />)
          ) : (
            <div className="mobile-empty-state">No hay reposiciones para mostrar.</div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Remito</th>
                <th>Costo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.fecha)}</td>
                    <td>{item.proveedorNombre || '-'}</td>
                    <td>{item.productoNombre || '-'}</td>
                    <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                    <td>{item.remitoNumero || '-'}</td>
                    <td>{formatCurrency(item.costoTotal)}</td>
                    <td><EstadoBadge value={item.estado || 'confirmado'} /></td>
                    <td className="flex flex-wrap gap-2">
                      <button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>Ver</button>
                      {item.estado !== 'anulado' && onAnular ? (
                        <button className="btn btn-xs btn-error btn-outline" onClick={() => onAnular?.(item)} disabled={processing}>Anular</button>
                      ) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center app-muted-text">
                    No hay reposiciones para mostrar.
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
