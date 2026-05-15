import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import PageLoadingState from '../components/shared/PageLoadingState';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import ListSearchInput from '../components/shared/ListSearchInput';
import AppSelect from '../components/shared/AppSelect';
import CuentaCorrientePagoModal from '../components/clientes/CuentaCorrientePagoModal';
import PaginationControls from '../components/shared/PaginationControls';
import VisualStatCard from '../components/shared/VisualStatCard';
import SectionToolbar from '../components/shared/SectionToolbar';
import UiIconButton from '../components/shared/UiIconButton';
import useClientes from '../hooks/useClientes';
import useClientPagination from '../hooks/useClientPagination';
import {
  registrarPagoCuentaCorriente,
  subscribeMovimientosCuentaCorrienteCliente,
} from '../services/cuentaCorriente.service';
import { ARIDOS_SECTIONS, canWriteSection } from '../utils/permissions';
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
  formatMetodoCobro,
} from '../utils/formatters';

const FILTROS_ESTADO = [
  { value: 'con_deuda', label: 'Con deuda' },
  { value: 'sobre_limite', label: 'Sobre límite' },
  { value: 'sin_limite', label: 'Con deuda sin límite' },
  { value: 'saldados', label: 'Saldados' },
  { value: 'inactivos', label: 'Inactivos' },
  { value: 'todos', label: 'Todos' },
];


function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.6 12s3.55-6.25 9.4-6.25S21.4 12 21.4 12 17.85 18.25 12 18.25 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
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

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10.5A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
      <path d="M15.5 12h5" />
      <path d="M17.8 12h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 20v-1.2a3.2 3.2 0 0 0-2.4-3.1" />
      <path d="M16.5 4.3a3.5 3.5 0 0 1 0 6.4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
      <path d="M10.35 4.25 2.7 17.5A2 2 0 0 0 4.43 20.5h15.14a2 2 0 0 0 1.73-3L13.65 4.25a1.9 1.9 0 0 0-3.3 0Z" />
    </svg>
  );
}

const ORDENES = [
  { value: 'mayor_deuda', label: 'Mayor deuda primero' },
  { value: 'menor_deuda', label: 'Menor deuda primero' },
  { value: 'nombre', label: 'Nombre A-Z' },
  { value: 'sobre_limite', label: 'Sobre límite primero' },
];

function normalizeText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDateMillis(value) {
  if (!value) return 0;
  const date = value?.toDate ? value.toDate() : new Date(value);
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getClienteEstadoCuenta(cliente = {}) {
  const saldo = getNumber(cliente.saldoCuentaCorriente);
  const limite = getNumber(cliente.limiteCuentaCorriente);

  if (cliente.activo === false) return 'inactivo';
  if (saldo <= 0) return 'saldado';
  if (limite > 0 && saldo > limite) return 'sobre_limite';
  if (limite <= 0) return 'sin_limite';
  return 'con_deuda';
}

function getClienteEstadoLabel(cliente = {}) {
  const estado = getClienteEstadoCuenta(cliente);
  switch (estado) {
    case 'sobre_limite':
      return 'Sobre límite';
    case 'sin_limite':
      return 'Sin límite cargado';
    case 'saldado':
      return 'Saldado';
    case 'inactivo':
      return 'Inactivo';
    default:
      return 'Con deuda';
  }
}

function getEstadoBadgeClass(cliente = {}) {
  const estado = getClienteEstadoCuenta(cliente);
  switch (estado) {
    case 'sobre_limite':
      return 'badge-error';
    case 'sin_limite':
      return 'badge-warning';
    case 'saldado':
      return 'badge-success';
    case 'inactivo':
      return 'badge-ghost';
    default:
      return 'badge-info';
  }
}

function getLimiteDisponible(cliente = {}) {
  const saldo = getNumber(cliente.saldoCuentaCorriente);
  const limite = getNumber(cliente.limiteCuentaCorriente);
  if (limite <= 0) return null;
  return limite - saldo;
}

function matchesCliente(cliente = {}, search = '') {
  const q = normalizeText(search);
  if (!q) return true;

  return normalizeText([
    cliente.nombre,
    cliente.alias,
    cliente.telefono,
    cliente.direccion,
    cliente.cuitDni,
  ].join(' ')).includes(q);
}

function sortClientes(a = {}, b = {}, orden = 'mayor_deuda') {
  const saldoA = getNumber(a.saldoCuentaCorriente);
  const saldoB = getNumber(b.saldoCuentaCorriente);
  const limiteA = getNumber(a.limiteCuentaCorriente);
  const limiteB = getNumber(b.limiteCuentaCorriente);
  const excedenteA = limiteA > 0 ? Math.max(saldoA - limiteA, 0) : 0;
  const excedenteB = limiteB > 0 ? Math.max(saldoB - limiteB, 0) : 0;

  switch (orden) {
    case 'menor_deuda':
      return saldoA - saldoB;
    case 'nombre':
      return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    case 'sobre_limite':
      return excedenteB - excedenteA || saldoB - saldoA;
    case 'mayor_deuda':
    default:
      return saldoB - saldoA;
  }
}

function shouldShowCliente(cliente = {}, filtro = 'con_deuda') {
  if (cliente.esGenerico) return false;

  const saldo = getNumber(cliente.saldoCuentaCorriente);
  const limite = getNumber(cliente.limiteCuentaCorriente);

  switch (filtro) {
    case 'todos':
      return true;
    case 'sobre_limite':
      return saldo > 0 && limite > 0 && saldo > limite;
    case 'sin_limite':
      return saldo > 0 && limite <= 0;
    case 'saldados':
      return saldo <= 0;
    case 'inactivos':
      return cliente.activo === false;
    case 'con_deuda':
    default:
      return saldo > 0;
  }
}

function useCuentaCorrienteMovimientos(cuentaId, clienteId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cuentaId || !clienteId) {
      setItems([]);
      setLoading(false);
      setError('');
      return () => {};
    }

    setLoading(true);
    setError('');

    const unsubscribe = subscribeMovimientosCuentaCorrienteCliente(
      cuentaId,
      clienteId,
      (nextItems = []) => {
        setItems(
          [...nextItems].sort((a, b) => {
            const fechaDiff = getDateMillis(b.fecha || b.createdAt) - getDateMillis(a.fecha || a.createdAt);
            if (fechaDiff !== 0) return fechaDiff;
            return String(b.id || '').localeCompare(String(a.id || ''));
          }),
        );
        setLoading(false);
      },
      (err) => {
        setError(err?.message || 'No se pudieron cargar los movimientos de cuenta corriente.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [cuentaId, clienteId]);

  return { items, loading, error };
}

function SummaryCard({ label, value, helper, icon, tone }) {
  return (
    <VisualStatCard
      label={label}
      value={value}
      helper={helper}
      icon={icon}
      tone={tone}
    />
  );
}

function ClienteCuentaCard({ cliente, onView, onRegisterPago, canWrite }) {
  const saldo = getNumber(cliente.saldoCuentaCorriente);
  const limite = getNumber(cliente.limiteCuentaCorriente);
  const disponible = getLimiteDisponible(cliente);

  return (
    <div className="mobile-data-card account-client-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="truncate mobile-data-card-title">{cliente.nombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">
            {[cliente.alias, cliente.telefono].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
          </div>
        </div>
        <span className={`badge ${getEstadoBadgeClass(cliente)}`}>{getClienteEstadoLabel(cliente)}</span>
      </div>

      <div className="account-client-card__balance">
        <span>Saldo pendiente</span>
        <strong>{formatCurrency(saldo)}</strong>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Límite</span>
          <span className="mobile-data-value">{limite > 0 ? formatCurrency(limite) : 'Sin límite'}</span>
        </div>
        <div>
          <span className="mobile-data-label">Disponible</span>
          <span className="mobile-data-value">
            {disponible == null ? '-' : formatCurrency(disponible)}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Documento</span>
          <span className="mobile-data-value">{cliente.cuitDni || '-'}</span>
        </div>
        <div className="col-span-full">
          <span className="mobile-data-label">Dirección</span>
          <span className="mobile-data-value">{cliente.direccion || '-'}</span>
        </div>
      </div>

      <div className="mobile-card-actions account-action-row">
        <UiIconButton size="sm" label="Ver detalle" tone="neutral" icon={<EyeIcon />} onClick={() => onView?.(cliente)} />
        {canWrite && saldo > 0 ? (
          <UiIconButton size="sm" label="Registrar pago" tone="secondary" icon={<CashIcon />} onClick={() => onRegisterPago?.(cliente)} />
        ) : null}
      </div>
    </div>
  );
}

function formatMovimientoTipo(tipo = '') {
  switch (tipo) {
    case 'venta':
      return 'Venta fiada';
    case 'pago':
      return 'Pago recibido';
    case 'anulacion_venta':
      return 'Anulación de venta';
    default:
      return tipo ? String(tipo).replaceAll('_', ' ') : '-';
  }
}

function MovimientoBadge({ tipo }) {
  const className = tipo === 'pago' || tipo === 'anulacion_venta'
    ? 'badge-success'
    : 'badge-warning';

  return <span className={`badge ${className}`}>{formatMovimientoTipo(tipo)}</span>;
}

function CuentaCorrienteDetalleModal({
  open,
  cliente,
  cuentaId,
  canWrite,
  onClose,
  onRegisterPago,
}) {
  const { items, loading, error } = useCuentaCorrienteMovimientos(cuentaId, open ? cliente?.id : null);
  const movimientosPagination = useClientPagination(items, { pageSize: 10 });
  const movimientosVisibles = movimientosPagination.paginatedItems;

  if (!open || !cliente) return null;

  const saldo = getNumber(cliente.saldoCuentaCorriente);
  const limite = getNumber(cliente.limiteCuentaCorriente);
  const disponible = getLimiteDisponible(cliente);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box account-detail-modal max-w-5xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold app-title-text">Cuenta corriente de {cliente.nombre || 'Cliente'}</h3>
            <p className="mt-1 text-sm app-muted-text">
              {cliente.telefono || 'Sin teléfono'} · {cliente.cuitDni || 'Sin CUIT/DNI'}
            </p>
          </div>
          <span className={`badge ${getEstadoBadgeClass(cliente)}`}>{getClienteEstadoLabel(cliente)}</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="account-modal-metric">
            <div className="app-eyebrow">Saldo pendiente</div>
            <div className="mt-1 text-xl font-bold app-title-text">{formatCurrency(saldo)}</div>
          </div>
          <div className="account-modal-metric">
            <div className="app-eyebrow">Límite asignado</div>
            <div className="mt-1 text-xl font-bold app-title-text">
              {limite > 0 ? formatCurrency(limite) : 'Sin límite'}
            </div>
          </div>
          <div className="account-modal-metric">
            <div className="app-eyebrow">Disponible</div>
            <div className="mt-1 text-xl font-bold app-title-text">
              {disponible == null ? '-' : formatCurrency(disponible)}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="font-semibold app-title-text">Movimientos</h4>
              <p className="text-sm app-muted-text">Ventas fiadas, pagos recibidos y anulaciones de esta cuenta.</p>
            </div>
            <span className="badge-soft">{items.length} movimientos</span>
          </div>

          {error ? <div className="alert alert-error mb-3">{error}</div> : null}

          {loading ? (
            <PageLoadingState title="Cargando movimientos..." rows={4} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {items.length ? movimientosVisibles.map((item) => (
                  <div key={item.id} className="mobile-data-card">
                    <div className="mobile-data-card-header">
                      <div>
                        <div className="mobile-data-card-title">{formatDateOnly(item.fecha)}</div>
                        <div className="mobile-data-card-subtitle">{formatDateTime(item.createdAt || item.fecha)}</div>
                      </div>
                      <MovimientoBadge tipo={item.tipo} />
                    </div>
                    <div className="mobile-data-grid">
                      <div>
                        <span className="mobile-data-label">Debe</span>
                        <span className="mobile-data-value">{formatCurrency(item.debe || 0)}</span>
                      </div>
                      <div>
                        <span className="mobile-data-label">Haber</span>
                        <span className="mobile-data-value">{formatCurrency(item.haber || 0)}</span>
                      </div>
                      <div>
                        <span className="mobile-data-label">Saldo posterior</span>
                        <span className="mobile-data-value strong">{formatCurrency(item.saldoPosterior || 0)}</span>
                      </div>
                      <div>
                        <span className="mobile-data-label">Cobro</span>
                        <span className="mobile-data-value">{item.metodoCobro ? formatMetodoCobro(item.metodoCobro) : '-'}</span>
                      </div>
                      {item.observaciones ? (
                        <div className="col-span-full">
                          <span className="mobile-data-label">Observaciones</span>
                          <span className="mobile-data-value">{item.observaciones}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )) : <div className="mobile-empty-state">No hay movimientos registrados para este cliente.</div>}
              </div>

              <div className="hidden max-h-[420px] overflow-auto rounded-2xl border border-base-300 md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Debe</th>
                      <th>Haber</th>
                      <th>Saldo posterior</th>
                      <th>Método</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length ? movimientosVisibles.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateOnly(item.fecha)}</td>
                        <td><MovimientoBadge tipo={item.tipo} /></td>
                        <td>{formatCurrency(item.debe || 0)}</td>
                        <td>{formatCurrency(item.haber || 0)}</td>
                        <td className="font-semibold app-title-text">{formatCurrency(item.saldoPosterior || 0)}</td>
                        <td>{item.metodoCobro ? formatMetodoCobro(item.metodoCobro) : '-'}</td>
                        <td>{item.observaciones || '-'}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" className="text-center app-muted-text">
                          No hay movimientos registrados para este cliente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                {...movimientosPagination}
                onPageChange={movimientosPagination.setPage}
              />
            </>
          )}
        </div>

        {saldo > 0 && items.length === 0 && !loading ? (
          <div className="alert alert-warning mt-4">
            El cliente tiene saldo pendiente, pero no se encontraron movimientos. Conviene revisar si el saldo fue cargado manualmente.
          </div>
        ) : null}

        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>Cerrar</button>
          {canWrite && saldo > 0 ? (
            <button type="button" className="btn btn-primary" onClick={() => onRegisterPago?.(cliente)}>
              Registrar pago
            </button>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}

export default function CuentasCorrientesPage({ cuentaId, currentUserEmail, security }) {
  const { items: clientes, loading, error } = useClientes(cuentaId);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('con_deuda');
  const [orden, setOrden] = useState('mayor_deuda');
  const [clienteDetalle, setClienteDetalle] = useState(null);
  const [clientePago, setClientePago] = useState(null);
  const [savingPago, setSavingPago] = useState(false);
  const [errorPago, setErrorPago] = useState('');

  const canWrite = canWriteSection(security?.permissions, ARIDOS_SECTIONS.CLIENTES);

  const clientesCuentaCorriente = useMemo(
    () => clientes.filter((cliente) => !cliente.esGenerico),
    [clientes],
  );

  const resumen = useMemo(() => {
    const conDeuda = clientesCuentaCorriente.filter((cliente) => getNumber(cliente.saldoCuentaCorriente) > 0);
    const sobreLimite = conDeuda.filter((cliente) => {
      const saldo = getNumber(cliente.saldoCuentaCorriente);
      const limite = getNumber(cliente.limiteCuentaCorriente);
      return limite > 0 && saldo > limite;
    });

    return {
      totalPendiente: conDeuda.reduce((acc, cliente) => acc + getNumber(cliente.saldoCuentaCorriente), 0),
      clientesConDeuda: conDeuda.length,
      clientesSobreLimite: sobreLimite.length,
      totalSobreLimite: sobreLimite.reduce((acc, cliente) => {
        const saldo = getNumber(cliente.saldoCuentaCorriente);
        const limite = getNumber(cliente.limiteCuentaCorriente);
        return acc + Math.max(saldo - limite, 0);
      }, 0),
    };
  }, [clientesCuentaCorriente]);

  const filteredClientes = useMemo(
    () => clientesCuentaCorriente
      .filter((cliente) => shouldShowCliente(cliente, filtroEstado))
      .filter((cliente) => matchesCliente(cliente, search))
      .sort((a, b) => sortClientes(a, b, orden)),
    [clientesCuentaCorriente, filtroEstado, orden, search],
  );

  const clientesPagination = useClientPagination(filteredClientes, { pageSize: 10 });
  const clientesVisibles = clientesPagination.paginatedItems;

  async function handleRegistrarPago(form) {
    if (!canWrite || !clientePago?.id) return;
    setSavingPago(true);
    setErrorPago('');

    try {
      await registrarPagoCuentaCorriente(
        cuentaId,
        {
          ...form,
          clienteId: clientePago.id,
          clienteNombre: clientePago.nombre || '',
        },
        currentUserEmail,
      );
      setClientePago(null);
    } catch (err) {
      setErrorPago(err?.message || 'No se pudo registrar el pago.');
    } finally {
      setSavingPago(false);
    }
  }

  function openPago(cliente) {
    setErrorPago('');
    setClientePago(cliente);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cuentas corrientes"
        subtitle="Controlá clientes con pagos pendientes, saldos, límites y movimientos de cobro."
      />

      {!canWrite ? (
        <ReadOnlyBanner message="Podés consultar cuentas corrientes, pero no tenés permiso para registrar pagos." />
      ) : null}

      {error ? <div className="alert alert-error">{error}</div> : null}
      {errorPago ? <div className="alert alert-error">{errorPago}</div> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total pendiente"
          value={formatCurrency(resumen.totalPendiente)}
          helper="Saldo abierto en cuentas corrientes."
          icon={<WalletIcon />}
          tone="warning"
        />
        <SummaryCard
          label="Clientes con deuda"
          value={resumen.clientesConDeuda}
          helper="Clientes registrados con saldo mayor a cero."
          icon={<UsersIcon />}
          tone="info"
        />
        <SummaryCard
          label="Sobre límite"
          value={resumen.clientesSobreLimite}
          helper="Clientes que superaron el límite cargado."
          icon={<AlertIcon />}
          tone={resumen.clientesSobreLimite ? 'danger' : 'neutral'}
        />
        <SummaryCard
          label="Excedente total"
          value={formatCurrency(resumen.totalSobreLimite)}
          helper="Monto que supera los límites definidos."
          icon={<CashIcon />}
          tone={resumen.totalSobreLimite ? 'danger' : 'success'}
        />
      </div>

      <div className="page-section">
        <div className="page-section-body">
          <SectionToolbar
            title="Clientes y saldos"
            subtitle="No se muestra el cliente genérico porque no puede operar con cuenta corriente."
            badge={`${filteredClientes.length} registros`}
          />

          <div className="account-filter-panel mb-4 grid gap-3 lg:grid-cols-[1fr_220px_230px]">
            <ListSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por cliente, alias, teléfono, dirección o documento"
              count={filteredClientes.length}
            />
            <AppSelect
              label="Estado"
              options={FILTROS_ESTADO}
              value={filtroEstado}
              onChange={setFiltroEstado}
            />
            <AppSelect
              label="Orden"
              options={ORDENES}
              value={orden}
              onChange={setOrden}
            />
          </div>

          {loading ? (
            <PageLoadingState title="Cargando cuentas corrientes..." rows={5} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {filteredClientes.length ? clientesVisibles.map((cliente) => (
                  <ClienteCuentaCard
                    key={cliente.id}
                    cliente={cliente}
                    canWrite={canWrite}
                    onView={setClienteDetalle}
                    onRegisterPago={openPago}
                  />
                )) : <div className="mobile-empty-state">No hay clientes que coincidan con los filtros.</div>}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Documento</th>
                      <th>Saldo pendiente</th>
                      <th>Límite</th>
                      <th>Disponible</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClientes.length ? clientesVisibles.map((cliente) => {
                      const saldo = getNumber(cliente.saldoCuentaCorriente);
                      const limite = getNumber(cliente.limiteCuentaCorriente);
                      const disponible = getLimiteDisponible(cliente);

                      return (
                        <tr key={cliente.id}>
                          <td>
                            <div className="flex flex-col">
                              <span className="font-semibold app-title-text">{cliente.nombre || '-'}</span>
                              <span className="text-xs app-muted-text">{cliente.alias || cliente.direccion || '-'}</span>
                            </div>
                          </td>
                          <td>{cliente.telefono || '-'}</td>
                          <td>{cliente.cuitDni || '-'}</td>
                          <td className="font-semibold app-title-text">{formatCurrency(saldo)}</td>
                          <td>{limite > 0 ? formatCurrency(limite) : 'Sin límite'}</td>
                          <td>{disponible == null ? '-' : formatCurrency(disponible)}</td>
                          <td><span className={`badge ${getEstadoBadgeClass(cliente)}`}>{getClienteEstadoLabel(cliente)}</span></td>
                          <td>
                            <div className="table-action-cell">
                              <UiIconButton size="sm" label="Detalle" tone="neutral" icon={<EyeIcon />} onClick={() => setClienteDetalle(cliente)} />
                              {canWrite && saldo > 0 ? (
                                <UiIconButton size="sm" label="Pago" tone="secondary" icon={<CashIcon />} onClick={() => openPago(cliente)} />
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="8" className="text-center app-muted-text">
                          No hay clientes que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                {...clientesPagination}
                onPageChange={clientesPagination.setPage}
              />
            </>
          )}
        </div>
      </div>

      <CuentaCorrienteDetalleModal
        open={Boolean(clienteDetalle)}
        cliente={clienteDetalle}
        cuentaId={cuentaId}
        canWrite={canWrite}
        onClose={() => setClienteDetalle(null)}
        onRegisterPago={(cliente) => {
          setClienteDetalle(null);
          openPago(cliente);
        }}
      />

      <CuentaCorrientePagoModal
        open={Boolean(clientePago)}
        cliente={clientePago}
        onClose={() => { setClientePago(null); setErrorPago(''); }}
        onSubmit={handleRegistrarPago}
        loading={savingPago}
        disabled={!canWrite}
      />
    </div>
  );
}
