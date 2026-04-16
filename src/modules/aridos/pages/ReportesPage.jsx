import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import useReportesAridos from '../hooks/useReportesAridos';
import useProductos from '../hooks/useProductos';
import { downloadCsv } from '../utils/csv';
import { formatCurrency, formatDateTime, formatEntregaDisplay, formatMovimientoTipo, formatQuantity, monthStartInput, toInputDate } from '../utils/formatters';
import { METODOS_PAGO, TIPOS_ENTREGA, VENTA_ESTADOS } from '../utils/constants';
import ReportesVentasTable from '../components/reportes/ReportesVentasTable';
import ReportesMovimientosTable from '../components/reportes/ReportesMovimientosTable';

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

function KpiMetric({ title, value }) {
  return (
    <div className="kpi-card">
      <div className="text-sm app-muted-text">{title}</div>
      <div className="mt-3 text-3xl font-semibold app-title-text">{value}</div>
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
      <PageHeader title="Reportes y estadísticas" subtitle="Análisis del período usando el precio vendido y el costo snapshot guardado en cada venta." actions={actions} />

      <div className="page-section">
        <div className="page-section-body">
          <div className="form-grid">
            <label className="form-control"><span className="field-label">Fecha desde</span><input type="date" className="input input-bordered h-12" value={filters.fechaDesde || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaDesde: e.target.value }))} /></label>
            <label className="form-control"><span className="field-label">Fecha hasta</span><input type="date" className="input input-bordered h-12" value={filters.fechaHasta || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaHasta: e.target.value }))} /></label>
            <label className="form-control"><span className="field-label">Producto</span><select className="select select-bordered h-12" value={filters.productoId} onChange={(e) => setFilters((p) => ({ ...p, productoId: e.target.value }))}><option value="">Todos</option>{productos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Pago</span><select className="select select-bordered h-12" value={filters.metodoPago} onChange={(e) => setFilters((p) => ({ ...p, metodoPago: e.target.value }))}><option value="">Todos</option>{METODOS_PAGO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Entrega</span><select className="select select-bordered h-12" value={filters.tipoEntrega} onChange={(e) => setFilters((p) => ({ ...p, tipoEntrega: e.target.value }))}><option value="">Todas</option>{TIPOS_ENTREGA.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Estado</span><select className="select select-bordered h-12" value={filters.estado} onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}><option value="">Todos</option>{Object.values(VENTA_ESTADOS).map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select></label>
            <div className="form-actions xl:col-span-4"><button className="btn h-12" onClick={() => setFilters({ fechaDesde: monthStartInput(), fechaHasta: toInputDate(new Date()), productoId: '', metodoPago: '', tipoEntrega: '', estado: '' })}>Restablecer</button></div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KpiMetric title="Facturación" value={formatCurrency(data?.resumen?.totalVentas || 0)} />
            <KpiMetric title="Costo vendido" value={formatCurrency(data?.resumen?.totalCostoVentas || 0)} />
            <KpiMetric title="Margen bruto" value={formatCurrency(data?.resumen?.totalMargenBruto || 0)} />
            <KpiMetric title="Ventas registradas" value={data?.resumen?.cantidadVentas || 0} />
            <KpiMetric title="Cantidad vendida" value={Number(data?.resumen?.totalCantidadVendida || 0).toFixed(2)} />
            <KpiMetric title="Envíos cobrados" value={formatCurrency(data?.resumen?.totalEnvio || 0)} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <StatsList title="Facturación por producto" items={data?.stats?.ventasPorProducto || []} formatValue={formatCurrency} />
            <StatsList title="Margen bruto por producto" items={data?.stats?.margenPorProducto || []} formatValue={formatCurrency} />
            <StatsList title="Cantidad vendida por producto" items={data?.stats?.cantidadesPorProducto || []} formatValue={(value) => Number(value).toFixed(2)} />
            <StatsList title="Ventas por forma de pago" items={data?.stats?.ventasPorPago || []} formatValue={formatCurrency} />
            <StatsList title="Clientes con mayor compra" items={data?.stats?.ventasPorCliente || []} formatValue={formatCurrency} />
          </div>

          <ReportesVentasTable items={data?.ventas || []} />
          <ReportesMovimientosTable items={data?.movimientos || []} />
        </>
      )}
    </div>
  );
}
