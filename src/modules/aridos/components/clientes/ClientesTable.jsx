import { useMemo, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
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

function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M6.8 9.2h.01M17.2 14.8h.01" />
    </svg>
  );
}

function ClienteCard({ item, onEdit, onRegisterPago, canEdit }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="truncate mobile-data-card-title">{item.nombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{item.alias || item.cuitDni || 'Sin alias'}</div>
        </div>
        <span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>
          {item.activo === false ? 'Inactivo' : 'Activo'}
        </span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Teléfono</span>
          <span className="mobile-data-value">{item.telefono || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">CUIT / DNI</span>
          <span className="mobile-data-value">{item.cuitDni || '-'}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Dirección</span>
          <span className="mobile-data-value">{item.direccion || '-'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Saldo cuenta corriente</span>
          <span className="mobile-data-value strong">{formatCurrency(item.saldoCuentaCorriente)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Tipo</span>
          <span className="mobile-data-value">{item.esGenerico ? 'Genérico' : 'Regular'}</span>
        </div>
      </div>

      <div className="mobile-card-actions">
        {canEdit ? (
          <>
            <UiIconButton size="sm" label="Editar cliente" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} />
            {Number(item.saldoCuentaCorriente || 0) > 0 && !item.esGenerico ? (
              <UiIconButton size="sm" label="Registrar pago" tone="secondary" icon={<CashIcon />} onClick={() => onRegisterPago?.(item)} />
            ) : null}
          </>
        ) : <span className="text-xs app-muted-text">Solo lectura</span>}
      </div>
    </div>
  );
}

function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.nombre, item.alias, item.telefono, item.direccion, item.cuitDni].join(' ').toLowerCase().includes(q);
}

export default function ClientesTable({ items = [], onEdit, onRegisterPago, canEdit = true }) {
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => items.filter((item) => matchesSearch(item, search)), [items, search]);
  const pagination = useClientPagination(filteredItems, { pageSize: 10 });
  const displayItems = pagination.paginatedItems;

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold app-title-text">Clientes cargados</h3>
          </div>
          <span className="badge-soft">{filteredItems.length} registros</span>
        </div>

        <ListSearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, alias, teléfono o documento" count={filteredItems.length} className="mb-4" />

        <div className="space-y-3 md:hidden">
          {filteredItems.length ? displayItems.map((item) => <ClienteCard key={item.id} item={item} onEdit={onEdit} onRegisterPago={onRegisterPago} canEdit={canEdit} />) : <div className="mobile-empty-state">No hay clientes cargados.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead>
              <tr><th>Nombre</th><th>Alias</th><th>Teléfono</th><th>Dirección</th><th>CUIT / DNI</th><th>Saldo CC</th><th>Tipo</th><th>Activo</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {filteredItems.length ? displayItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre || '-'}</td>
                  <td>{item.alias || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>{item.direccion || '-'}</td>
                  <td>{item.cuitDni || '-'}</td>
                  <td>{formatCurrency(item.saldoCuentaCorriente)}</td>
                  <td>{item.esGenerico ? <span className="badge badge-info">Genérico</span> : <span className="badge badge-ghost">Regular</span>}</td>
                  <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
                  <td>
                    <div className="table-action-cell">
                      {canEdit ? (
                        <>
                          <UiIconButton size="sm" label="Editar" tone="neutral" icon={<PencilIcon />} onClick={() => onEdit?.(item)} />
                          {Number(item.saldoCuentaCorriente || 0) > 0 && !item.esGenerico ? (
                            <UiIconButton size="sm" label="Registrar pago" tone="secondary" icon={<CashIcon />} onClick={() => onRegisterPago?.(item)} />
                          ) : null}
                        </>
                      ) : <span className="text-xs app-muted-text">Solo lectura</span>}
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="9" className="text-center app-muted-text">No hay clientes cargados.</td></tr>}
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
