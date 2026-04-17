import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import { crearCierreCaja, getResumenCierreCaja, getUltimosCierresCaja } from '../services/cierreCaja.service';
import { formatCurrency, toInputDate } from '../utils/formatters';
import EstadoBadge from '../components/shared/EstadoBadge';
import AppSelect from '../components/shared/AppSelect';

function KpiMetric({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <div className="text-sm app-muted-text">{title}</div>
      <div className="mt-3 text-3xl font-semibold app-title-text">{value}</div>
      {subtitle ? <div className="mt-2 text-sm app-muted-text">{subtitle}</div> : null}
    </div>
  );
}

function VentaCierreCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.clienteNombre || 'Cliente'}</div>
          <div className="mobile-data-card-subtitle">{item.productoNombre || 'Producto'}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="badge-soft">{item.metodoPago || '-'}</span>
          <EstadoBadge value={item.entregaEstado} />
        </div>
      </div>
      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Total</span>
          <span className="mobile-data-value strong">{formatCurrency(item.total)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Pago</span>
          <span className="mobile-data-value">{item.metodoPago || '-'}</span>
        </div>
      </div>
    </div>
  );
}

function HistorialCierreCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title">{item.fechaStr || '-'}</div>
          <div className="mobile-data-card-subtitle">{item.closedBy || 'Sin usuario'}</div>
        </div>
        <span className="badge-soft">{item.resumen?.cantidadOperaciones || 0} ops</span>
      </div>
      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Total</span>
          <span className="mobile-data-value strong">{formatCurrency(item.resumen?.totalVentas || 0)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Costo</span>
          <span className="mobile-data-value">{formatCurrency(item.resumen?.totalCostoVentas || 0)}</span>
        </div>
        <div>
          <span className="mobile-data-label">Margen</span>
          <span className="mobile-data-value">{formatCurrency(item.resumen?.totalMargenBruto || 0)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CierreCajaPage({ cuentaId, currentUserEmail, security }) {
  const [fecha, setFecha] = useState(toInputDate(new Date()));
  const [data, setData] = useState(null);
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyMonth, setHistoryMonth] = useState('todos');
  const canClose = security?.permissions?.cierre_caja?.write !== false;

  async function load() {
    if (!cuentaId) return;
    setLoading(true);
    setError('');
    try {
      const [resumen, ultimos] = await Promise.all([
        getResumenCierreCaja(cuentaId, fecha),
        getUltimosCierresCaja(cuentaId),
      ]);
      setData(resumen);
      setCierres(ultimos);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el cierre.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [cuentaId, fecha]);

  async function handleCerrar() {
    if (data?.cierreExistente) return;
    setSaving(true);
    setError('');
    try {
      await crearCierreCaja(cuentaId, fecha, currentUserEmail);
      await load();
    } catch (err) {
      setError(err?.message || 'No se pudo generar el cierre.');
    } finally {
      setSaving(false);
    }
  }

  const historyOptions = useMemo(() => {
    const values = Array.from(new Set(cierres.map((item) => String(item.fechaStr || '').slice(0, 7)).filter(Boolean)));
    return values;
  }, [cierres]);

  const filteredHistory = useMemo(() => {
    if (historyMonth === 'todos') return cierres;
    return cierres.filter((item) => String(item.fechaStr || '').startsWith(historyMonth));
  }, [cierres, historyMonth]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cierre diario"
        subtitle="Consolidá solo las ventas entregadas del día para control de caja y auditoría operativa."
        actions={<label className="form-control w-full sm:w-auto"><span className="field-label">Fecha</span><input type="date" className="input input-bordered h-12 min-w-0 sm:min-w-52" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>}
      />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
            <KpiMetric title="Total entregado" value={formatCurrency(data.resumen.totalVentas)} />
            <KpiMetric title="Costo vendido" value={formatCurrency(data.resumen.totalCostoVentas || 0)} />
            <KpiMetric title="Margen bruto" value={formatCurrency(data.resumen.totalMargenBruto || 0)} />
            <KpiMetric title="Pendientes" value={data.resumen.cantidadPendientes || 0} subtitle={formatCurrency(data.resumen.totalPendienteEntrega || 0)} />
            <KpiMetric title="No entregadas" value={data.resumen.cantidadNoEntregadas || 0} subtitle={formatCurrency(data.resumen.totalNoEntregado || 0)} />
            <KpiMetric title="Estado" value={data.cierreExistente ? 'Cerrado' : 'Abierto'} subtitle={data.cierreExistente ? `Cierre generado para ${data.cierreExistente.fechaStr}` : 'Sin cierre generado'} />
          </div>

          {data.cierreExistente ? (
            <div className="alert alert-info">
              El día {fecha} ya está cerrado. La operatoria de ventas, reposición y ajustes para esa fecha quedó bloqueada.
            </div>
          ) : null}

          <div className="page-section">
            <div className="page-section-body space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold app-title-text">Resumen para cierre</h3>
                  <p className="mt-1 text-sm app-muted-text">Las ventas pendientes o no entregadas quedan visibles, pero no se suman al cierre del día.</p>
                </div>
                <button className="btn btn-primary w-full md:w-auto" onClick={handleCerrar} disabled={saving || !canClose || !!data.cierreExistente}>
                  {saving ? 'Generando...' : data.cierreExistente ? 'Día cerrado' : 'Generar cierre del día'}
                </button>
              </div>
              {!canClose ? <div className="alert alert-warning">Tu rol actual no puede generar cierres diarios.</div> : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="app-soft-panel rounded-2xl border p-4">
                  <div className="mb-3 text-sm font-semibold app-title-text">Totales por forma de pago</div>
                  <div className="space-y-2">
                    {Object.keys(data.resumen.porMetodoPago).length ? Object.entries(data.resumen.porMetodoPago).map(([key, value]) => <div key={key} className="flex items-center justify-between text-sm"><span className="capitalize app-soft-text">{key.replaceAll('_', ' ')}</span><span className="font-semibold app-title-text">{formatCurrency(value)}</span></div>) : <div className="text-sm app-muted-text">Sin ventas entregadas para la fecha.</div>}
                  </div>
                </div>
                <div className="app-soft-panel rounded-2xl border p-4">
                  <div className="mb-3 text-sm font-semibold app-title-text">Facturación por producto</div>
                  <div className="space-y-2">
                    {Object.keys(data.resumen.porProducto).length ? Object.entries(data.resumen.porProducto).map(([key, value]) => <div key={key} className="flex items-center justify-between text-sm"><span className="app-soft-text">{key}</span><span className="font-semibold app-title-text">{formatCurrency(value)}</span></div>) : <div className="text-sm app-muted-text">Sin productos entregados.</div>}
                  </div>
                </div>
                <div className="app-soft-panel rounded-2xl border p-4">
                  <div className="mb-3 text-sm font-semibold app-title-text">Pedidos fuera del cierre</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><span className="app-soft-text">Pendientes de entrega</span><span className="font-semibold app-title-text">{data.resumen.cantidadPendientes || 0}</span></div>
                    <div className="flex items-center justify-between"><span className="app-soft-text">Monto pendiente</span><span className="font-semibold app-title-text">{formatCurrency(data.resumen.totalPendienteEntrega || 0)}</span></div>
                    <div className="flex items-center justify-between"><span className="app-soft-text">No entregadas</span><span className="font-semibold app-title-text">{data.resumen.cantidadNoEntregadas || 0}</span></div>
                    <div className="flex items-center justify-between"><span className="app-soft-text">Monto no entregado</span><span className="font-semibold app-title-text">{formatCurrency(data.resumen.totalNoEntregado || 0)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="page-section">
              <div className="page-section-body">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold app-title-text">Ventas entregadas del día</h3>
                  <span className="badge-soft">{data.ventasEntregadas.length} registros</span>
                </div>
                <div className="space-y-3 md:hidden">
                  {data.ventasEntregadas.length ? data.ventasEntregadas.map((item) => <VentaCierreCard key={item.id} item={item} />) : <div className="mobile-empty-state">Sin ventas entregadas registradas.</div>}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="table">
                    <thead><tr><th>Cliente</th><th>Producto</th><th>Total</th><th>Pago</th><th>Entrega</th></tr></thead>
                    <tbody>
                      {data.ventasEntregadas.length ? data.ventasEntregadas.map((item) => <tr key={item.id}><td>{item.clienteNombre}</td><td>{item.productoNombre}</td><td>{formatCurrency(item.total)}</td><td>{item.metodoPago}</td><td><EstadoBadge value={item.entregaEstado} /></td></tr>) : <tr><td colSpan="5" className="text-center app-muted-text">Sin ventas entregadas registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="page-section">
              <div className="page-section-body">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold app-title-text">Historial de cierres</h3>
                    <p className="mt-1 text-sm app-muted-text">Queda contraído para que la pantalla no se haga eterna cuando se acumulan cierres.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AppSelect
                      options={[{ value: 'todos', label: 'Todos los meses' }, ...historyOptions.map((option) => ({ value: option, label: option }))]}
                      value={historyMonth}
                      onChange={setHistoryMonth}
                      placeholder="Todos los meses"
                      includeEmptyOption={false}
                      size="sm"
                      triggerClassName="min-w-[140px]"
                      menuClassName="min-w-[180px]"
                    />
                    <button className="btn h-11" onClick={() => setShowHistory((prev) => !prev)}>
                      {showHistory ? 'Ocultar historial' : 'Ver historial'}
                    </button>
                  </div>
                </div>
                {showHistory ? (
                  <>
                    <div className="space-y-3 md:hidden">
                      {filteredHistory.length ? filteredHistory.map((item) => <HistorialCierreCard key={item.id} item={item} />) : <div className="mobile-empty-state">No hay cierres para el filtro elegido.</div>}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="table">
                        <thead><tr><th>Fecha</th><th>Total</th><th>Costo</th><th>Margen</th><th>Operaciones</th><th>Usuario</th></tr></thead>
                        <tbody>
                          {filteredHistory.length ? filteredHistory.map((item) => <tr key={item.id}><td>{item.fechaStr}</td><td>{formatCurrency(item.resumen?.totalVentas || 0)}</td><td>{formatCurrency(item.resumen?.totalCostoVentas || 0)}</td><td>{formatCurrency(item.resumen?.totalMargenBruto || 0)}</td><td>{item.resumen?.cantidadOperaciones || 0}</td><td>{item.closedBy || '-'}</td></tr>) : <tr><td colSpan="6" className="text-center app-muted-text">No hay cierres para el filtro elegido.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-base-300/70 bg-base-100 px-4 py-8 text-center text-sm text-base-content/60">
                    Abrí el historial solo cuando necesites revisar cierres anteriores.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
