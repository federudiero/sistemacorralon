import { useMemo, useState } from 'react';
import { describeProductoUnidad, formatCurrency, formatQuantity } from '../../utils/formatters';
import useClientPagination from '../../hooks/useClientPagination';
import ListSearchInput from '../shared/ListSearchInput';
import PaginationControls from '../shared/PaginationControls';
import UiIconButton from '../shared/UiIconButton';

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function ProductoCard({ item, onEdit, canEdit }) {
  const costoActual = item.costoActual ?? item.costoPromedio;

  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div>
          <div className="mobile-data-card-title">{item.nombre || '-'}</div>
          <div className="mobile-data-card-subtitle">{item.categoria || 'Sin categoría'}</div>
        </div>
        <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'Inactivo' : 'Activo'}</span>
      </div>

      <div className="mobile-data-grid">
        <div><span className="mobile-data-label">Unidad</span><span className="mobile-data-value">{describeProductoUnidad(item)}</span></div>
        <div><span className="mobile-data-label">Precio venta</span><span className="mobile-data-value">{formatCurrency(item.precioVenta)}</span></div>
        <div><span className="mobile-data-label">Costo actual</span><span className="mobile-data-value">{formatCurrency(costoActual)}</span></div>
        <div><span className="mobile-data-label">Stock actual</span><span className="mobile-data-value strong">{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</span></div>
        <div><span className="mobile-data-label">Stock mínimo</span><span className="mobile-data-value">{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</span></div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? <UiIconButton size="sm" label="Editar" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} className="flex-1" /> : <span className="text-xs app-muted-text">Solo lectura</span>}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.nombre, item.categoria, item.unidadStock, item.unidad].join(' ').toLowerCase().includes(q);
}

export default function ProductosTable({ items = [], onEdit, canEdit = true }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);
  const pagination = useClientPagination(filteredItems, { pageSize: 10 });
  const displayItems = pagination.paginatedItems;

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Productos</h3>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o categoría" count={filteredItems.length} className="mb-4" />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? displayItems.map((item) => <ProductoCard key={item.id} item={item} onEdit={onEdit} canEdit={canEdit} />) : <div className="mobile-empty-state">No hay productos cargados.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Categoría</th><th>Unidad</th><th>Precio venta</th><th>Costo actual</th><th>Stock actual</th><th>Stock mínimo</th><th>Activo</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredItems.length ? displayItems.map((item) => {
                const costoActual = item.costoActual ?? item.costoPromedio;
                return (
                  <tr key={item.id}>
                    <td>{item.nombre || '-'}</td>
                    <td>{item.categoria || '-'}</td>
                    <td>{describeProductoUnidad(item)}</td>
                    <td>{formatCurrency(item.precioVenta)}</td>
                    <td>{formatCurrency(costoActual)}</td>
                    <td>{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                    <td>{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                    <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
                    <td><div className="table-action-cell">{canEdit ? <UiIconButton size="sm" label="Editar" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} /> : <span className="text-xs app-muted-text">Solo lectura</span>}</div></td>
                  </tr>
                );
              }) : <tr><td colSpan="9" className="text-center app-muted-text">No hay productos cargados.</td></tr>}
            </tbody>
          </table>
        </div>

        <PaginationControls
          {...pagination}
          onPageChange={pagination.setPage}
        />
      </div>
    </div>
  );
}
