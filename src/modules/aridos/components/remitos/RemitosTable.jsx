import { useMemo, useState } from 'react';
import { REMITO_ESTADOS } from '../../utils/constants';
import { formatDateTime, formatQuantity, formatVehiculoEntrega } from '../../utils/formatters';
import ListSearchInput from '../shared/ListSearchInput';
import RemitoEstadoBadge from './RemitoEstadoBadge';
import AppSelect from '../shared/AppSelect';

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
        <div><span className="mobile-data-label">Producto</span><span className="mobile-data-value">{item.productoNombre || '-'}</span></div>
        <div><span className="mobile-data-label">Cantidad</span><span className="mobile-data-value strong">{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</span></div>
        <div><span className="mobile-data-label">Vehículo</span><span className="mobile-data-value">{item.camion ? formatVehiculoEntrega(item.camion) : '-'}</span></div>
        <div><span className="mobile-data-label">Chofer</span><span className="mobile-data-value">{item.chofer || '-'}</span></div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <AppSelect
            options={Object.values(REMITO_ESTADOS).map((estado) => ({ value: estado, label: estado }))}
            value={item.estado}
            onChange={(nextValue) => onChangeEstado?.(item, nextValue)}
            size="sm"
          />
        ) : <span className="text-xs opacity-60">Solo lectura</span>}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.clienteNombre, item.productoNombre, item.camion, item.chofer, item.estado].join(' ').toLowerCase().includes(q);
}

export default function RemitosTable({ items = [], onChangeEstado, canEdit = true }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Remitos operativos</h3>
            <p className="mt-1 text-sm app-muted-text">Buscá remitos por cliente, producto, chofer o estado.</p>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, producto, chofer o estado" count={filteredItems.length} className="mb-4" />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? filteredItems.map((item) => <RemitoCard key={item.id} item={item} onChangeEstado={onChangeEstado} canEdit={canEdit} />) : <div className="mobile-empty-state">No hay remitos para mostrar.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Vehículo</th><th>Chofer</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{item.clienteNombre || '-'}</td>
                  <td>{item.productoNombre || '-'}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.camion ? formatVehiculoEntrega(item.camion) : '-'}</td>
                  <td>{item.chofer || '-'}</td>
                  <td><RemitoEstadoBadge value={item.estado} /></td>
                  <td>{canEdit ? <AppSelect options={Object.values(REMITO_ESTADOS).map((estado) => ({ value: estado, label: estado }))} value={item.estado} onChange={(nextValue) => onChangeEstado?.(item, nextValue)} size="xs" /> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center app-muted-text">No hay remitos para mostrar.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
