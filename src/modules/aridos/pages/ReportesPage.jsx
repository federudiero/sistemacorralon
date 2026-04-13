import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import useReportesAridos from '../hooks/useReportesAridos';
import useProductos from '../hooks/useProductos';
import { downloadCsv } from '../utils/csv';
import { formatCurrency, formatDateTime, formatMovimientoTipo, formatQuantity, monthStartInput, toInputDate } from '../utils/formatters';
import { METODOS_PAGO, MOVIMIENTO_LABELS, TIPOS_ENTREGA, VENTA_ESTADOS } from '../utils/constants';

function StatsList({ title, items = [], formatValue = (v) => v }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
        <div className="space-y-2">
          {items.length ? items.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm">
              <span className="text-slate-300">{item.key}</span>
              <span className="font-semibold text-white">{formatValue(item.value)}</span>
            </div>
          )) : <div className="text-sm text-slate-400">Sin datos para el rango seleccionado.</div>}
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
      tipoEntrega: item.tipoEntrega,
      metodoPago: item.metodoPago,
      subtotal: item.subtotal || item.total,
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
      <PageHeader title="Reportes y estadísticas" subtitle="Análisis detallado por fecha, producto, forma de pago y clientes." actions={actions} />

      <div className="page-section">
        <div className="page-section-body">
          <div className="form-grid">
            <label className="form-control"><span className="field-label">Fecha desde</span><input type="date" className="input input-bordered h-12" value={filters.fechaDesde || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaDesde: e.target.value }))} /></label>
            <label className="form-control"><span className="field-label">Fecha hasta</span><input type="date" className="input input-bordered h-12" value={filters.fechaHasta || ''} onChange={(e) => setFilters((p) => ({ ...p, fechaHasta: e.target.value }))} /></label>
            <label className="form-control"><span className="field-label">Producto</span><select className="select select-bordered h-12" value={filters.productoId} onChange={(e) => setFilters((p) => ({ ...p, productoId: e.target.value }))}><option value="">Todos</option>{productos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Pago</span><select className="select select-bordered h-12" value={filters.metodoPago} onChange={(e) => setFilters((p) => ({ ...p, metodoPago: e.target.value }))}><option value="">Todos</option>{METODOS_PAGO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Modalidad</span><select className="select select-bordered h-12" value={filters.tipoEntrega} onChange={(e) => setFilters((p) => ({ ...p, tipoEntrega: e.target.value }))}><option value="">Todas</option>{TIPOS_ENTREGA.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label className="form-control"><span className="field-label">Estado</span><select className="select select-bordered h-12" value={filters.estado} onChange={(e) => setFilters((p) => ({ ...p, estado: e.target.value }))}><option value="">Todos</option>{Object.values(VENTA_ESTADOS).map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select></label>
            <div className="form-actions xl:col-span-4"><button className="btn h-12" onClick={() => setFilters({ fechaDesde: monthStartInput(), fechaHasta: toInputDate(new Date()), productoId: '', metodoPago: '', tipoEntrega: '', estado: '' })}>Restablecer</button></div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="kpi-card"><div className="text-sm text-slate-300">Facturación</div><div className="mt-3 text-3xl font-semibold text-white">{formatCurrency(data?.resumen?.totalVentas || 0)}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Ventas registradas</div><div className="mt-3 text-3xl font-semibold text-white">{data?.resumen?.cantidadVentas || 0}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Cantidad vendida</div><div className="mt-3 text-3xl font-semibold text-white">{Number(data?.resumen?.totalCantidadVendida || 0).toFixed(2)}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Envíos cobrados</div><div className="mt-3 text-3xl font-semibold text-white">{formatCurrency(data?.resumen?.totalEnvio || 0)}</div></div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <StatsList title="Facturación por producto" items={data?.stats?.ventasPorProducto || []} formatValue={formatCurrency} />
            <StatsList title="Cantidad vendida por producto" items={data?.stats?.cantidadesPorProducto || []} formatValue={(value) => Number(value).toFixed(2)} />
            <StatsList title="Ventas por forma de pago" items={data?.stats?.ventasPorPago || []} formatValue={formatCurrency} />
            <StatsList title="Clientes con mayor compra" items={data?.stats?.ventasPorCliente || []} formatValue={formatCurrency} />
          </div>

          <div className="page-section">
            <div className="page-section-body">
              <h3 className="mb-4 text-lg font-semibold text-white">Ventas del período</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Pago</th><th>Modalidad</th><th>Envío</th><th>Total</th><th>Estado</th></tr></thead>
                  <tbody>
                    {(data?.ventas || []).length ? data.ventas.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateTime(item.fecha)}</td>
                        <td>{item.clienteNombre}</td>
                        <td>{item.productoNombre}</td>
                        <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                        <td>{item.metodoPago}</td>
                        <td>{item.tipoEntrega === 'envio' ? `Envío (${item.vehiculoEntrega || '-'})` : 'Retiro'}</td>
                        <td>{formatCurrency(item.envioMonto || 0)}</td>
                        <td>{formatCurrency(item.total || 0)}</td>
                        <td>{item.estado}</td>
                      </tr>
                    )) : <tr><td colSpan="9" className="text-center text-slate-400">Sin ventas en el rango filtrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="page-section">
            <div className="page-section-body">
              <h3 className="mb-4 text-lg font-semibold text-white">Movimientos del período</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Monto</th><th>Detalle</th><th>Usuario</th></tr></thead>
                  <tbody>
                    {(data?.movimientos || []).length ? data.movimientos.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDateTime(item.fecha)}</td>
                        <td>{MOVIMIENTO_LABELS[item.tipo] || item.tipo}</td>
                        <td>{item.productoNombre || '-'}</td>
                        <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                        <td>{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</td>
                        <td>{item.detalleLogistico || item.motivo || '-'}</td>
                        <td>{item.usuarioEmail || '-'}</td>
                      </tr>
                    )) : <tr><td colSpan="7" className="text-center text-slate-400">Sin movimientos en el rango filtrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
