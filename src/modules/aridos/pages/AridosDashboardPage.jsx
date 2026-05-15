import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import VisualStatCard from '../components/shared/VisualStatCard';
import SectionToolbar from '../components/shared/SectionToolbar';
import useDashboardAridos from '../hooks/useDashboardAridos';
import useClientes from '../hooks/useClientes';
import { ARIDOS_SECTIONS, canReadSection } from '../utils/permissions';
import { formatCurrency, formatPercent, formatQuantity, toInputDate } from '../utils/formatters';
import StockCriticoTable from '../components/dashboard/StockCriticoTable';
import UltimosMovimientosTable from '../components/dashboard/UltimosMovimientosTable';
import PageLoadingState from '../components/shared/PageLoadingState';

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 18.5h16" />
      <path d="M7 16V9.5" />
      <path d="M12 16V5.5" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
      <path d="m4 12 8 4.5 8-4.5" />
      <path d="m4 16.5 8 4.5 8-4.5" />
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

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
      <path d="M10.35 4.25 2.7 17.5A2 2 0 0 0 4.43 20.5h15.14a2 2 0 0 0 1.73-3L13.65 4.25a1.9 1.9 0 0 0-3.3 0Z" />
    </svg>
  );
}

function QuickAction({ to, title, subtitle, icon, primary = false, disabled = false }) {
  const content = (
    <>
      <span className="dashboard-action__icon" aria-hidden="true">{icon}</span>
      <span className="dashboard-action__copy">
        <span className="dashboard-action__title">{title}</span>
        <span className="dashboard-action__subtitle">{subtitle}</span>
      </span>
      <span className="dashboard-action__arrow" aria-hidden="true">›</span>
    </>
  );

  if (disabled) {
    return <div className="dashboard-action is-disabled">{content}</div>;
  }

  return (
    <Link to={to} className={`dashboard-action ${primary ? 'is-primary' : ''}`}>
      {content}
    </Link>
  );
}

function MetricRow({ label, value, helper }) {
  return (
    <div className="metric-row">
      <div className="min-w-0">
        <div className="metric-row__label">{label}</div>
        {helper ? <div className="metric-row__helper">{helper}</div> : null}
      </div>
      <div className="metric-row__value">{value}</div>
    </div>
  );
}

function SimpleList({ title, items = [], renderItem, empty = 'Sin datos para la fecha seleccionada.' }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <SectionToolbar title={title} badge={`${items.length} registros`} />
        {items.length ? (
          <div className="space-y-3">{items.map(renderItem)}</div>
        ) : (
          <div className="mobile-empty-state">{empty}</div>
        )}
      </div>
    </div>
  );
}

function getNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AridosDashboardPage({ cuentaId, security }) {
  const [filters, setFilters] = useState({ fecha: toInputDate(new Date()) });
  const { data, loading, error } = useDashboardAridos(cuentaId, filters);
  const { items: clientes = [] } = useClientes(cuentaId);

  const cuentaCorrienteResumen = useMemo(() => {
    const clientesConDeuda = clientes.filter((cliente) => !cliente.esGenerico && getNumber(cliente.saldoCuentaCorriente) > 0);
    return {
      clientesConDeuda: clientesConDeuda.length,
      totalPendiente: clientesConDeuda.reduce((acc, cliente) => acc + getNumber(cliente.saldoCuentaCorriente), 0),
    };
  }, [clientes]);

  const canRead = (section) => canReadSection(security?.permissions, section);

  const actions = useMemo(() => (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <label className="form-control w-full sm:w-auto">
        <span className="field-label">Fecha operativa</span>
        <input
          type="date"
          className="input input-bordered h-12 min-w-0 sm:min-w-52"
          value={filters.fecha}
          onChange={(e) => setFilters((prev) => ({ ...prev, fecha: e.target.value }))}
        />
      </label>
    </div>
  ), [filters.fecha]);

  return (
    <div className="space-y-4 dashboard-page">
      <PageHeader title="Dashboard corralón" subtitle="Resumen operativo, accesos rápidos y alertas del día." actions={actions} />
      {security?.isReadOnly ? <ReadOnlyBanner message="Entraste en modo solo lectura. Podés consultar métricas y reportes, pero no registrar operaciones." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <PageLoadingState title="Cargando tablero operativo..." rows={4} variant="dashboard" />
      ) : data ? (
        <>
          <section className="dashboard-hero">
            <div className="dashboard-hero__copy">
              <div className="app-eyebrow">Operación del día</div>
              <h2 className="dashboard-hero__title">{formatCurrency(data.ventasHoyMonto)}</h2>
              <p className="dashboard-hero__subtitle">
                {data.ventasHoyOperaciones} ventas entregadas · {formatCurrency(data.ventasHoyPendientesMonto || 0)} pendiente de entrega
              </p>
            </div>
            <div className="dashboard-hero__actions">
              {canRead(ARIDOS_SECTIONS.VENTAS) ? (
                <QuickAction to="/aridos/ventas" title="Nueva venta" subtitle="Cargar y marcar entrega" icon="💸" primary />
              ) : null}
              {canRead(ARIDOS_SECTIONS.CLIENTES) ? (
                <QuickAction to="/aridos/cuentas-corrientes" title="Cuentas" subtitle="Ver deudas y pagos" icon="💳" />
              ) : null}
              {canRead(ARIDOS_SECTIONS.INGRESOS) ? (
                <QuickAction to="/aridos/ingresos" title="Reposición" subtitle="Ingreso de stock" icon="📦" />
              ) : null}
              {canRead(ARIDOS_SECTIONS.CIERRE_CAJA) ? (
                <QuickAction to="/aridos/cierre-caja" title="Cerrar día" subtitle="Control de caja" icon="🧾" />
              ) : null}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <VisualStatCard
              label="Realizado del día"
              value={formatCurrency(data.ventasHoyMonto)}
              helper={`Entregadas ${data.ventasHoyOperaciones} · registrado ${formatCurrency(data.ventasHoyRegistradasMonto)}`}
              icon={<SalesIcon />}
              tone="success"
            />
            <VisualStatCard
              label="Cuenta corriente"
              value={formatCurrency(cuentaCorrienteResumen.totalPendiente)}
              helper={`${cuentaCorrienteResumen.clientesConDeuda} clientes con saldo abierto`}
              icon={<WalletIcon />}
              tone="warning"
            />
            <VisualStatCard
              label="Cobertura de stock"
              value={formatPercent(data.coberturaStockPct)}
              helper={`${data.productosActivos} productos activos · ${data.alertas.productosSinStock} sin stock`}
              icon={<StockIcon />}
              tone="info"
            />
            <VisualStatCard
              label="Alertas"
              value={String(data.stockCritico.length)}
              helper={`${data.alertas.movimientosAjusteDia} ajustes / mermas en la fecha`}
              icon={<AlertIcon />}
              tone={data.stockCritico.length ? 'danger' : 'neutral'}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <SectionToolbar title="Resumen del día" subtitle="Cobros, entregas y acumulados para la fecha seleccionada." badge={data.fecha} />

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="app-soft-panel rounded-2xl border p-4">
                    <div className="text-sm app-muted-text">Cantidad entregada</div>
                    <div className="mt-2 text-2xl font-semibold app-title-text">{Number(data.ventasHoyCantidad || 0).toFixed(2)}</div>
                    <div className="mt-1 text-sm app-muted-text">Pendiente {formatCurrency(data.ventasHoyPendientesMonto || 0)} · no entregado {formatCurrency(data.ventasHoyNoEntregadasMonto || 0)}</div>
                  </div>
                  <div className="app-soft-panel rounded-2xl border p-4">
                    <div className="text-sm app-muted-text">Realizado del mes</div>
                    <div className="mt-2 text-2xl font-semibold app-title-text">{formatCurrency(data.ventasMesMonto)}</div>
                    <div className="mt-1 text-sm app-muted-text">{data.ventasMesOperaciones} entregadas · registradas {formatCurrency(data.ventasMesRegistradasMonto)}</div>
                  </div>
                </div>

                <div className="dashboard-metric-panel">
                  <div className="dashboard-metric-panel__title">Cobro realizado por forma de pago</div>
                  <div className="space-y-2">
                    {data.ventasPorPagoDia.length ? data.ventasPorPagoDia.map((item) => (
                      <MetricRow key={item.key} label={item.key.replaceAll('_', ' ')} value={formatCurrency(item.value)} />
                    )) : <div className="mobile-empty-state">Sin ventas para la fecha.</div>}
                  </div>
                </div>

                <div className="dashboard-metric-panel">
                  <div className="dashboard-metric-panel__title">Ventas registradas por tipo de entrega</div>
                  <div className="space-y-2">
                    {data.ventasPorEntregaDia.length ? data.ventasPorEntregaDia.map((item) => (
                      <MetricRow key={item.key} label={item.key === 'retiro' ? 'Retira cliente' : 'Se lo llevamos'} value={formatCurrency(item.value)} />
                    )) : <div className="mobile-empty-state">Sin entregas para la fecha.</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <SectionToolbar title="Materiales destacados" subtitle="Ranking operativo por producto." badge="día / mes" />

                <div className="dashboard-metric-panel">
                  <div className="dashboard-metric-panel__title">Top entregado del día</div>
                  <div className="space-y-2">
                    {data.topProductosDia.length ? data.topProductosDia.map((item) => (
                      <MetricRow key={item.key} label={item.key} value={formatQuantity(item.value, item.unidadStock, item.pesoBolsaKg)} />
                    )) : <div className="mobile-empty-state">Sin ventas entregadas en el día.</div>}
                  </div>
                </div>

                <div className="dashboard-metric-panel">
                  <div className="dashboard-metric-panel__title">Top realizado del mes</div>
                  <div className="space-y-2">
                    {data.topProductosMes.length ? data.topProductosMes.map((item) => (
                      <MetricRow key={item.key} label={item.key} value={formatCurrency(item.value)} />
                    )) : <div className="mobile-empty-state">Sin ventas realizadas acumuladas en el mes.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <SimpleList
              title="Reposición del día por producto"
              items={data.reposicionPorProductoDia}
              renderItem={(item) => (
                <MetricRow key={item.key} label={item.key} value={Number(item.value).toFixed(2)} />
              )}
            />
            <div className="xl:col-span-2">
              <StockCriticoTable items={data.stockCritico} />
            </div>
          </div>

          <UltimosMovimientosTable items={data.ultimosMovimientos} />
        </>
      ) : null}
    </div>
  );
}
