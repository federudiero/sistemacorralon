import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import useReportesAridos from '../hooks/useReportesAridos';
import useProductos from '../hooks/useProductos';
import { downloadCsv } from '../utils/csv';
import { formatCurrency, formatDateTime, formatEntregaDisplay, formatMovimientoTipo, formatQuantity, monthStartInput, toInputDate } from '../utils/formatters';
import { METODOS_PAGO, TIPOS_ENTREGA, VENTA_ESTADOS } from '../utils/constants';
import ReportesVentasTable from '../components/reportes/ReportesVentasTable';
import ReportesMovimientosTable from '../components/reportes/ReportesMovimientosTable';
import AppSelect from '../components/shared/AppSelect';

const CHART_COLORS = [
  'var(--app-chart-1)',
  'var(--app-chart-2)',
  'var(--app-chart-3)',
  'var(--app-chart-4)',
  'var(--app-chart-5)',
  'var(--app-chart-6)',
];

function getChartColor(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function StatsList({ title, items = [], formatValue = (v) => v }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">{title}</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>
        <div className="space-y-2">
          {items.length ? items.map((item) => (
            <div key={item.key} className="app-soft-panel flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
              <span className="app-soft-text">{item.key}</span>
              <span className="font-semibold app-title-text">{formatValue(item.value)}</span>
            </div>
          )) : <div className="mobile-empty-state">Sin datos para el rango seleccionado.</div>}
        </div>
      </div>
    </div>
  );
}

function KpiMetric({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <div className="text-sm app-muted-text">{title}</div>
      <div className="mt-3 text-3xl font-semibold app-title-text">{value}</div>
      {subtitle ? <div className="mt-2 text-sm app-muted-text">{subtitle}</div> : null}
    </div>
  );
}

function PieStatsCard({ title, items = [], formatValue = formatCurrency }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const background = total
    ? `conic-gradient(${items.map((item, index) => {
      const previous = items.slice(0, index).reduce((sum, current) => sum + Number(current.value || 0), 0);
      const start = (previous / total) * 360;
      const end = ((previous + Number(item.value || 0)) / total) * 360;
      return `${getChartColor(index)} ${start}deg ${end}deg`;
    }).join(', ')})`
    : 'conic-gradient(var(--app-chart-empty) 0deg 360deg)';

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">{title}</h3>
          <span className="badge-soft">{items.length} segmentos</span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="app-chart-ring mx-auto flex h-48 w-48 items-center justify-center rounded-full" style={{ backgroundImage: background }}>
            <div className="app-chart-ring-center flex h-24 w-24 flex-col items-center justify-center rounded-full">
              <span className="app-chart-total-label text-xs uppercase tracking-[0.14em]">Total</span>
              <span className="app-chart-total-value mt-1 text-lg font-semibold">{formatValue(total)}</span>
            </div>
          </div>
          <div className="space-y-2">
            {items.length ? items.map((item, index) => (
              <div key={item.key} className="app-chart-legend-item flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="app-chart-swatch" style={{ backgroundColor: getChartColor(index) }} />
                  <span className="truncate app-soft-text">{item.key}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold app-title-text">{formatValue(item.value)}</div>
                  {typeof item.count === 'number' ? <div className="text-xs app-muted-text">{item.count} registros</div> : null}
                </div>
              </div>
            )) : <div className="mobile-empty-state">Sin datos para graficar.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportesPage({ cuentaId }) {
  const [filters, setFilters] = useState({ fechaDesde: monthStartInput(), fechaHasta: toInputDate(new Date()), productoId: '', metodoPago: '', tipoEntrega: '', estado: '' });
  const { data, loading, error } = useReportesAridos(cuentaId, filters);
  const { items: productos } = useProductos(cuentaId);

  function exportVentas() {
    downloadCsv('reportes-ventas.csv', (data?.ventas || []).map((item) => ({
      fecha: formatDateTime(item.fecha),
      cliente: item.clienteNombre,
      producto: item.productoNombre,
      cantidad: formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg),
      tipoEntrega: formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega),
      metodoPago: item.metodoPago,
      subtotal: item.subtotal || item.total,
      costoSnapshot: item.costoTotalSnapshot || 0,
      margenBruto: Number(item.total || 0) - Number(item.costoTotalSnapshot || 0),
      envio: item.envioMonto || 0,
      total: item.total,
      estado: item.estado,
      entregaEstado: item.entregaEstado || '-',
    })));
  }

  function exportMovimientos() {
    downloadCsv('reportes-movimientos.csv', (data?.movimientos || []).map((item) => ({
      fecha: formatDateTime(item.fecha),
      tipo: formatMovimientoTipo(item.tipo),
      producto: item.productoNombre,
      cantidad: formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg),
      motivo: item.motivo || item.detalleLogistico || '',
      monto: item.montoTotal || '',
      usuario: item.usuarioEmail || '',
    })));
  }

  const actions = useMemo(() => (
    <>
      <button className="btn h-12" onClick={exportVentas}>Exportar ventas</button>
      <button className="btn h-12" onClick={exportMovimientos}>Exportar movimientos</button>
    </>
  ), [data]);

  return (
    <div className="space-y-4">
      <PageHeader title="Reportes y estadísticas" subtitle="Leé el negocio completo: facturación, margen, entregas, clientes, medios de pago y producto más rentable." actions={actions} />

      <div className="page-section">
        <div className="page-section-body">
          <div className="form-grid">
            <label className="form-control"><span className="field-label">Fecha desde</span><input type="date" className="input input-bordered h-12" value={filters.fechaDesde || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaDesde: e.target.value }))} /></label>
            <label className="form-control"><span className="field-label">Fecha hasta</span><input type="date" className="input input-bordered h-12" value={filters.fechaHasta || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaHasta: e.target.value }))} /></label>
            <AppSelect
              label="Producto"
              options={productos.map((item) => ({ value: item.id, label: item.nombre }))}
              value={filters.productoId}
              onChange={(nextValue) => setFilters((p) => ({ ...p, productoId: nextValue }))}
              placeholder="Todos"
              includeEmptyOption
              emptyLabel="Todos"
            />
            <AppSelect
              label="Pago"
              options={METODOS_PAGO}
              value={filters.metodoPago}
              onChange={(nextValue) => setFilters((p) => ({ ...p, metodoPago: nextValue }))}
              placeholder="Todos"
              includeEmptyOption
              emptyLabel="Todos"
            />
            <AppSelect
              label="Entrega"
              options={TIPOS_ENTREGA}
              value={filters.tipoEntrega}
              onChange={(nextValue) => setFilters((p) => ({ ...p, tipoEntrega: nextValue }))}
              placeholder="Todas"
              includeEmptyOption
              emptyLabel="Todas"
            />
            <AppSelect
              label="Estado"
              options={Object.values(VENTA_ESTADOS).map((estado) => ({ value: estado, label: estado }))}
              value={filters.estado}
              onChange={(nextValue) => setFilters((p) => ({ ...p, estado: nextValue }))}
              placeholder="Todos"
              includeEmptyOption
              emptyLabel="Todos"
            />
            <div className="form-actions xl:col-span-4"><button className="btn h-12" onClick={() => setFilters({ fechaDesde: monthStartInput(), fechaHasta: toInputDate(new Date()), productoId: '', metodoPago: '', tipoEntrega: '', estado: '' })}>Restablecer</button></div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiMetric title="Facturación total" value={formatCurrency(data?.resumen?.totalVentas || 0)} subtitle={`Ticket promedio ${formatCurrency(data?.resumen?.ticketPromedio || 0)}`} />
            <KpiMetric title="Costo vendido" value={formatCurrency(data?.resumen?.totalCostoVentas || 0)} subtitle={`Margen ${Number(data?.resumen?.margenPorcentaje || 0).toFixed(1)}%`} />
            <KpiMetric title="Margen bruto" value={formatCurrency(data?.resumen?.totalMargenBruto || 0)} subtitle={`${data?.resumen?.cantidadVentas || 0} ventas registradas`} />
            <KpiMetric title="Envíos cobrados" value={formatCurrency(data?.resumen?.totalEnvio || 0)} subtitle={`Cantidad vendida ${Number(data?.resumen?.totalCantidadVendida || 0).toFixed(2)}`} />
            <KpiMetric title="Entregadas" value={data?.resumen?.cantidadEntregadas || 0} subtitle={formatCurrency(data?.resumen?.totalEntregado || 0)} />
            <KpiMetric title="Pendientes" value={data?.resumen?.cantidadPendientes || 0} subtitle={formatCurrency(data?.resumen?.totalPendiente || 0)} />
            <KpiMetric title="No entregadas" value={data?.resumen?.cantidadNoEntregadas || 0} subtitle={formatCurrency(data?.resumen?.totalNoEntregado || 0)} />
            <KpiMetric title="Clientes activos" value={(data?.stats?.ventasPorCliente || []).length} subtitle="Top clientes dentro del período" />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <PieStatsCard title="Ventas por forma de pago" items={data?.stats?.ventasPorPago || []} />
            <PieStatsCard title="Estado de las entregas" items={data?.stats?.entregasPorEstado || []} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <StatsList title="Facturación por producto" items={data?.stats?.ventasPorProducto || []} formatValue={formatCurrency} />
            <StatsList title="Margen bruto por producto" items={data?.stats?.margenPorProducto || []} formatValue={formatCurrency} />
            <StatsList title="Cantidad vendida por producto" items={data?.stats?.cantidadesPorProducto || []} formatValue={(value) => Number(value).toFixed(2)} />
            <StatsList title="Clientes con mayor compra" items={data?.stats?.ventasPorCliente || []} formatValue={formatCurrency} />
          </div>

          <ReportesVentasTable items={data?.ventas || []} />
          <ReportesMovimientosTable items={data?.movimientos || []} />
        </>
      )}
    </div>
  );
}
