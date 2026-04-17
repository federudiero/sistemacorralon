import { useMemo, useState } from 'react';
import { formatCurrency, formatDateTime, formatEntregaEstado, formatQuantity } from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';
import ListSearchInput from '../shared/ListSearchInput';

function VentaReporteCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{item.clienteNombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge-soft capitalize">{item.estado || '-'}</span>
          <EstadoBadge value={item.entregaEstado} />
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Producto</span>
          <span className="font-medium app-title-text text-right">{item.productoNombre || '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Cantidad</span>
          <span className="font-medium app-title-text text-right">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Pago</span>
          <span className="font-medium app-title-text text-right capitalize">{item.metodoPago || '-'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Entrega</span>
          <span className="font-medium app-title-text text-right">{formatEntregaEstado(item.entregaEstado)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="app-muted-text">Total</span>
          <span className="font-semibold app-title-text text-right">{formatCurrency(item.total)}</span>
        </div>
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.clienteNombre, item.productoNombre, item.metodoPago, item.estado, item.entregaEstado].join(' ').toLowerCase().includes(q);
}

export default function ReportesVentasTable({ items = [] }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="mb-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-base-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold app-title-text">Ventas filtradas</div>
          <p className="mt-1 text-sm app-muted-text">Incluye el estado comercial y el estado de entrega.</p>
        </div>
        <span className="badge-soft">{filteredItems.length} registros</span>
      </div>

      <div className="p-4">
        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, producto, pago o estado" count={filteredItems.length} className="mb-4" />

        <div className="grid gap-3 md:hidden">
          {filteredItems.length ? filteredItems.map((item) => <VentaReporteCard key={item.id} item={item} />) : (
            <div className="mobile-empty-state">No hay ventas para mostrar en este rango.</div>
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
                <th>Pago</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Entrega</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{item.clienteNombre}</td>
                  <td>{item.productoNombre}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.metodoPago}</td>
                  <td>{formatCurrency(item.total)}</td>
                  <td>{item.estado}</td>
                  <td><EstadoBadge value={item.entregaEstado} /></td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center app-muted-text">No hay ventas para mostrar en este rango.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
