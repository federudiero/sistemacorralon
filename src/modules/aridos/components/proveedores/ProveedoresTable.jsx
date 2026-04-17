import { useMemo, useState } from 'react';
import ListSearchInput from '../shared/ListSearchInput';

function ProveedorCard({ item, onEdit, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.nombre || 'Proveedor'}</div>
          <div className="mobile-data-card-subtitle">{item.cuit || 'Sin CUIT'}</div>
        </div>
        <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'Inactivo' : 'Activo'}</span>
      </div>

      <div className="mobile-data-grid">
        <div><span className="mobile-data-label">Teléfono</span><span className="mobile-data-value">{item.telefono || '-'}</span></div>
        <div><span className="mobile-data-label">CUIT</span><span className="mobile-data-value">{item.cuit || '-'}</span></div>
        <div className="col-span-full"><span className="mobile-data-label">Dirección</span><span className="mobile-data-value">{item.direccion || '-'}</span></div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? <button className="btn btn-sm btn-outline w-full" onClick={() => onEdit?.(item)}>Editar proveedor</button> : <span className="text-xs opacity-60">Solo lectura</span>}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.nombre, item.telefono, item.direccion, item.cuit].join(' ').toLowerCase().includes(q);
}

export default function ProveedoresTable({ items = [], onEdit, canEdit = true }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Proveedores cargados</h3>
            <p className="mt-1 text-sm app-muted-text">Buscá proveedores por nombre, teléfono, dirección o CUIT.</p>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, teléfono, dirección o CUIT" count={filteredItems.length} className="mb-4" />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? filteredItems.map((item) => <ProveedorCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />) : <div className="mobile-empty-state">No hay proveedores cargados.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>CUIT</th><th>Activo</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredItems.length ? filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>{item.direccion || '-'}</td>
                  <td>{item.cuit || '-'}</td>
                  <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
                  <td>{canEdit ? <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>Editar</button> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
                </tr>
              )) : <tr><td colSpan="6" className="text-center app-muted-text">No hay proveedores cargados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
