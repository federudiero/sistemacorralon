import { useMemo, useState } from 'react';
import {
  formatCurrency,
  formatDateTime,
  formatMovimientoTipo,
  formatQuantity,
  formatReferenciaMovimiento,
} from '../../utils/formatters';
import ListSearchInput from '../shared/ListSearchInput';

function MovimientoCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</div>
          <div className="mobile-data-card-subtitle">{formatDateTime(item.fecha)}</div>
        </div>

        <span className="badge-soft">{formatReferenciaMovimiento(item.referenciaTipo)}</span>
      </div>

      <div className="mobile-data-grid">
        <div><span className="mobile-data-label">Producto</span><span className="mobile-data-value">{item.productoNombre || '-'}</span></div>
        <div><span className="mobile-data-label">Cantidad</span><span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span></div>
        <div><span className="mobile-data-label">Monto</span><span className="mobile-data-value">{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</span></div>
        <div><span className="mobile-data-label">Detalle</span><span className="mobile-data-value">{item.detalleLogistico || item.motivo || '-'}</span></div>
        <div><span className="mobile-data-label">Usuario</span><span className="mobile-data-value">{item.usuarioEmail || '-'}</span></div>
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.productoNombre, item.tipo, item.referenciaTipo, item.detalleLogistico, item.motivo, item.usuarioEmail].join(' ').toLowerCase().includes(q);
}

export default function MovimientosTable({ items = [] }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Detalle de movimientos</h3>
            <p className="mt-1 text-sm app-muted-text">Buscá por producto, tipo, motivo o usuario.</p>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por producto, tipo, motivo o usuario" count={filteredItems.length} className="mb-4" />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? filteredItems.map((item) => <MovimientoCard key={item.id} item={item} />) : <div className="mobile-empty-state">No hay movimientos para los filtros seleccionados.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Monto</th><th>Referencia</th><th>Detalle</th><th>Usuario</th></tr></thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{formatMovimientoTipo(item.tipo, item.referenciaTipo)}</td>
                  <td>{item.productoNombre || '-'}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</td>
                  <td>{formatReferenciaMovimiento(item.referenciaTipo)}</td>
                  <td>{item.detalleLogistico || item.motivo || '-'}</td>
                  <td>{item.usuarioEmail || '-'}</td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center app-muted-text">No hay movimientos para los filtros seleccionados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
