import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useDashboardAridos from '../hooks/useDashboardAridos';
import { formatCurrency, formatPercent, formatQuantity, toInputDate } from '../utils/formatters';
import StockCriticoTable from '../components/dashboard/StockCriticoTable';
import UltimosMovimientosTable from '../components/dashboard/UltimosMovimientosTable';

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <div className="text-sm app-muted-text">{title}</div>
      <div className="mt-3 text-3xl font-semibold app-title-text">{value}</div>
      {subtitle ? <div className="mt-2 text-sm app-muted-text">{subtitle}</div> : null}
    </div>
  );
}

function SimpleList({ title, items = [], renderItem, empty = 'Sin datos para la fecha seleccionada.' }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">{title}</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>
        {items.length ? (
          <div className="space-y-3">{items.map(renderItem)}</div>
        ) : (
          <div className="mobile-empty-state">{empty}</div>
        )}
      </div>
    </div>
  );
}

export default function AridosDashboardPage({ cuentaId, security }) {
  const [filters, setFilters] = useState({ fecha: toInputDate(new Date()) });
  const { data, loading, error } = useDashboardAridos(cuentaId, filters);

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
    <div className="space-y-4">
      <PageHeader title="Dashboard corralón" subtitle="Tablero operativo: muestra lo registrado y separa lo efectivamente entregado para no mezclar operación con caja realizada." actions={actions} />
      {security?.isReadOnly ? <ReadOnlyBanner message="Entraste en modo solo lectura. Podés consultar métricas y reportes, pero no registrar operaciones." /> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Realizado del día" value={formatCurrency(data.ventasHoyMonto)} subtitle={`Entregadas ${data.ventasHoyOperaciones} • registrado ${formatCurrency(data.ventasHoyRegistradasMonto)}`} />
            <KpiCard title="Reposición del día" value={String(data.ingresosHoyOperaciones || 0)} subtitle={`Ingresos registrados • costo ${formatCurrency(data.ingresosHoyCosto)}`} />
            <KpiCard title="Cobertura de stock" value={formatPercent(data.coberturaStockPct)} subtitle={`${data.productosActivos} productos activos • ${data.alertas.productosSinStock} sin stock`} />
            <KpiCard title="Stock crítico" value={String(data.stockCritico.length)} subtitle={`${data.alertas.movimientosAjusteDia} ajustes / mermas en la fecha`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold app-title-text">Resumen del día</h3>
                  <span className="badge-soft">{data.fecha}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="app-soft-panel rounded-2xl border p-4">
                    <div className="text-sm app-muted-text">Cantidad entregada</div>
                    <div className="mt-2 text-2xl font-semibold app-title-text">{Number(data.ventasHoyCantidad || 0).toFixed(2)}</div>
                    <div className="mt-1 text-sm app-muted-text">Pendiente {formatCurrency(data.ventasHoyPendientesMonto || 0)} • no entregado {formatCurrency(data.ventasHoyNoEntregadasMonto || 0)}</div>
                  </div>
                  <div className="app-soft-panel rounded-2xl border p-4">
                    <div className="text-sm app-muted-text">Realizado del mes</div>
                    <div className="mt-2 text-2xl font-semibold app-title-text">{formatCurrency(data.ventasMesMonto)}</div>
                    <div className="mt-1 text-sm app-muted-text">{data.ventasMesOperaciones} entregadas • registradas {formatCurrency(data.ventasMesRegistradasMonto)}</div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold app-title-text">Cobro realizado por forma de pago</div>
                  <div className="space-y-2">
                    {data.ventasPorPagoDia.length ? data.ventasPorPagoDia.map((item) => (
                      <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                        <span className="capitalize app-soft-text">{item.key.replaceAll('_', ' ')}</span>
                        <span className="font-semibold app-title-text">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="mobile-empty-state">Sin ventas para la fecha.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold app-title-text">Ventas registradas por tipo de entrega</div>
                  <div className="space-y-2">
                    {data.ventasPorEntregaDia.length ? data.ventasPorEntregaDia.map((item) => (
                      <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                        <span className="capitalize app-soft-text">{item.key === 'retiro' ? 'Retira cliente' : 'Se lo llevamos'}</span>
                        <span className="font-semibold app-title-text">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="mobile-empty-state">Sin entregas para la fecha.</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold app-title-text">Materiales destacados</h3>
                  <span className="badge-soft">día / mes</span>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold app-title-text">Top entregado del día</div>
                  <div className="space-y-2">
                    {data.topProductosDia.length ? data.topProductosDia.map((item) => (
                      <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                        <span className="app-soft-text">{item.key}</span>
                        <span className="font-semibold app-title-text">{formatQuantity(item.value, item.unidadStock, item.pesoBolsaKg)}</span>
                      </div>
                    )) : <div className="mobile-empty-state">Sin ventas entregadas en el día.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold app-title-text">Top realizado del mes</div>
                  <div className="space-y-2">
                    {data.topProductosMes.length ? data.topProductosMes.map((item) => (
                      <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
                        <span className="app-soft-text">{item.key}</span>
                        <span className="font-semibold app-title-text">{formatCurrency(item.value)}</span>
                      </div>
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
                <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-3 text-sm">
                  <span className="app-soft-text">{item.key}</span>
                  <span className="font-semibold app-title-text">{Number(item.value).toFixed(2)}</span>
                </div>
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
