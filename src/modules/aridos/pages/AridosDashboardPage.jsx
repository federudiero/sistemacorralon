import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import ReadOnlyBanner from '../components/shared/ReadOnlyBanner';
import useDashboardAridos from '../hooks/useDashboardAridos';
import { formatCurrency, formatMovimientoTipo, formatPercent, formatQuantity, toInputDate } from '../utils/formatters';

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
      {subtitle ? <div className="mt-2 text-sm text-slate-400">{subtitle}</div> : null}
    </div>
  );
}

function SimpleList({ title, items = [], renderItem, empty = 'Sin datos para la fecha seleccionada.' }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>
        {items.length ? (
          <div className="space-y-3">{items.map(renderItem)}</div>
        ) : (
          <div className="px-4 py-8 text-sm text-center border border-dashed rounded-2xl border-white/10 text-slate-400">{empty}</div>
        )}
      </div>
    </div>
  );
}

function QuickActions({ readOnly }) {
  const items = [
    { to: '/aridos/ventas', label: 'Nueva venta', tone: 'btn-primary' },
    { to: '/aridos/ingresos', label: 'Registrar reposición', tone: 'btn-outline' },
    { to: '/aridos/cierre-caja', label: 'Cierre diario', tone: 'btn-outline' },
    { to: '/aridos/movimientos', label: 'Ver movimientos', tone: 'btn-ghost' },
  ];

  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-white">Acciones rápidas</h3>
          <span className="badge-soft">uso diario</span>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`btn ${item.tone} h-14 rounded-2xl text-sm md:text-base ${readOnly ? 'btn-disabled pointer-events-none' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AridosDashboardPage({ cuentaId, security }) {
  const [filters, setFilters] = useState({ fecha: toInputDate(new Date()) });
  const { data, loading, error } = useDashboardAridos(cuentaId, filters);

  const actions = useMemo(() => (
    <div className="flex flex-wrap w-full gap-2 sm:w-auto">
      <label className="w-full form-control sm:w-auto">
        <span className="field-label">Fecha operativa</span>
        <input
          type="date"
          className="h-12 min-w-0 input input-bordered sm:min-w-52"
          value={filters.fecha}
          onChange={(e) => setFilters((prev) => ({ ...prev, fecha: e.target.value }))}
        />
      </label>
    </div>
  ), [filters.fecha]);

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard corralón" subtitle="Resumen operativo por fecha de ventas, reposición, stock y alertas." actions={actions} />
      {security?.isReadOnly ? <ReadOnlyBanner message="Entraste en modo solo lectura. Podés consultar métricas y reportes, pero no registrar operaciones." /> : null}
      <QuickActions readOnly={security?.isReadOnly} />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Ventas del día" value={formatCurrency(data.ventasHoyMonto)} subtitle={`${data.ventasHoyOperaciones} operaciones • envíos cobrados ${formatCurrency(data.ventasHoyEnvio)}`} />
            <KpiCard title="Reposición del día" value={String(data.ingresosHoyOperaciones || 0)} subtitle={`Ingresos registrados • costo ${formatCurrency(data.ingresosHoyCosto)}`} />
            <KpiCard title="Cobertura de stock" value={formatPercent(data.coberturaStockPct)} subtitle={`${data.productosActivos} productos activos • ${data.alertas.productosSinStock} sin stock`} />
            <KpiCard title="Stock crítico" value={String(data.stockCritico.length)} subtitle={`${data.alertas.movimientosAjusteDia} ajustes / mermas en la fecha`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Resumen del día</h3>
                  <span className="badge-soft">{data.fecha}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="p-4 border rounded-2xl border-white/10 bg-white/5">
                    <div className="text-sm text-slate-300">Cantidad vendida</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{Number(data.ventasHoyCantidad || 0).toFixed(2)}</div>
                  </div>
                  <div className="p-4 border rounded-2xl border-white/10 bg-white/5">
                    <div className="text-sm text-slate-300">Venta del mes</div>
                    <div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(data.ventasMesMonto)}</div>
                    <div className="mt-1 text-sm text-slate-400">{data.ventasMesOperaciones} operaciones del mes</div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-white">Ventas por forma de pago</div>
                  <div className="space-y-2">
                    {data.ventasPorPagoDia.length ? data.ventasPorPagoDia.map((item) => (
                      <div key={item.key} className="flex items-center justify-between px-3 py-2 text-sm border rounded-xl border-white/10">
                        <span className="capitalize text-slate-300">{item.key.replaceAll('_', ' ')}</span>
                        <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="text-sm text-slate-400">Sin ventas para la fecha.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-white">Ventas por modalidad</div>
                  <div className="space-y-2">
                    {data.ventasPorEntregaDia.length ? data.ventasPorEntregaDia.map((item) => (
                      <div key={item.key} className="flex items-center justify-between px-3 py-2 text-sm border rounded-xl border-white/10">
                        <span className="capitalize text-slate-300">{item.key === 'retiro' ? 'Retiro en corralón' : 'Envío a domicilio'}</span>
                        <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="text-sm text-slate-400">Sin entregas para la fecha.</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="page-section">
              <div className="space-y-4 page-section-body">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Materiales destacados</h3>
                  <span className="badge-soft">día / mes</span>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-white">Top del día</div>
                  <div className="space-y-2">
                    {data.topProductosDia.length ? data.topProductosDia.map((item) => (
                      <div key={item.key} className="flex items-center justify-between px-3 py-2 text-sm border rounded-xl border-white/10">
                        <span className="text-slate-300">{item.key}</span>
                        <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="text-sm text-slate-400">Sin ventas del día.</div>}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-white">Top del mes</div>
                  <div className="space-y-2">
                    {data.topProductosMes.length ? data.topProductosMes.map((item) => (
                      <div key={item.key} className="flex items-center justify-between px-3 py-2 text-sm border rounded-xl border-white/10">
                        <span className="text-slate-300">{item.key}</span>
                        <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                      </div>
                    )) : <div className="text-sm text-slate-400">Sin ventas acumuladas en el mes.</div>}
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
                <div key={item.key} className="flex items-center justify-between px-3 py-3 text-sm border rounded-xl border-white/10">
                  <span className="text-slate-300">{item.key}</span>
                  <span className="font-semibold text-white">{Number(item.value).toFixed(2)}</span>
                </div>
              )}
            />
            <div className="page-section xl:col-span-2">
              <div className="page-section-body">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-white">Stock crítico</h3>
                  <span className="badge-soft">{data.stockCritico.length} productos</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr><th>Producto</th><th>Stock actual</th><th>Mínimo</th><th>Unidad</th></tr>
                    </thead>
                    <tbody>
                      {data.stockCritico.length ? data.stockCritico.map((item) => (
                        <tr key={item.id}>
                          <td>{item.nombre}</td>
                          <td>{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                          <td>{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                          <td>{item.unidadStock || item.unidad}</td>
                        </tr>
                      )) : <tr><td colSpan="4" className="text-center text-slate-400">Sin stock crítico para esta fecha.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="page-section">
            <div className="page-section-body">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-white">Últimos movimientos</h3>
                <span className="badge-soft">12 más recientes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Monto</th><th>Detalle</th></tr>
                  </thead>
                  <tbody>
                    {data.ultimosMovimientos.length ? data.ultimosMovimientos.map((item) => (
                      <tr key={item.id}>
                        <td>{item.fechaStr || '-'}</td>
                        <td>{formatMovimientoTipo(item.tipo)}</td>
                        <td>{item.productoNombre || '-'}</td>
                        <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                        <td>{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</td>
                        <td>{item.detalleLogistico || item.motivo || '-'}</td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center text-slate-400">Sin movimientos cargados.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
