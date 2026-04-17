import { useMemo, useState } from 'react';
import { formatDateTime, formatQuantity } from '../../utils/formatters';
import ListSearchInput from '../shared/ListSearchInput';

function MovimientoReporteCard({ item }) {
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
          <span className="font-medium app-title-text text-right">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Motivo</span>
          <span className="font-medium app-title-text text-right">{item.motivo || item.detalleLogistico || '-'}</span>
        </div>
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.tipo, item.productoNombre, item.motivo, item.detalleLogistico].join(' ').toLowerCase().includes(q);
}

export default function ReportesMovimientosTable({ items = [] }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-base-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold app-title-text">Movimientos filtrados</div>
          <p className="mt-1 text-sm app-muted-text">Buscá movimientos por tipo, producto o motivo.</p>
        </div>
        <span className="badge-soft">{filteredItems.length} registros</span>
      </div>

      <div className="p-4">
        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por tipo, producto o motivo" count={filteredItems.length} className="mb-4" />

        <div className="grid gap-3 md:hidden">
          {filteredItems.length ? filteredItems.map((item) => <MovimientoReporteCard key={item.id} item={item} />) : (
            <div className="mobile-empty-state">No hay movimientos para mostrar en este rango.</div>
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
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{item.tipo}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.motivo || item.detalleLogistico || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center app-muted-text">No hay movimientos para mostrar en este rango.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
