import { useEffect, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import { crearCierreCaja, getResumenCierreCaja, getUltimosCierresCaja } from '../services/cierreCaja.service';
import { formatCurrency, toInputDate } from '../utils/formatters';

export default function CierreCajaPage({ cuentaId, currentUserEmail, security }) {
  const [fecha, setFecha] = useState(toInputDate(new Date()));
  const [data, setData] = useState(null);
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Cierre diario"
        subtitle="Consolidá ventas y movimientos del día para control de caja y auditoría operativa. Al cerrar el día se bloquean ventas, reposiciones y ajustes de esa fecha."
        actions={<label className="form-control"><span className="field-label">Fecha</span><input type="date" className="input input-bordered h-12 min-w-52" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>}
      />
      {error ? <div className="alert alert-error">{error}</div> : null}
      {loading ? <div className="loading loading-spinner loading-lg" /> : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="kpi-card"><div className="text-sm text-slate-300">Total del día</div><div className="mt-3 text-3xl font-semibold text-white">{formatCurrency(data.resumen.totalVentas)}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Envíos cobrados</div><div className="mt-3 text-3xl font-semibold text-white">{formatCurrency(data.resumen.totalEnvio)}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Operaciones</div><div className="mt-3 text-3xl font-semibold text-white">{data.resumen.cantidadOperaciones}</div></div>
            <div className="kpi-card"><div className="text-sm text-slate-300">Estado</div><div className="mt-3 text-2xl font-semibold text-white">{data.cierreExistente ? 'Cerrado' : 'Abierto'}</div><div className="mt-1 text-sm text-slate-400">{data.cierreExistente ? `Cierre generado para ${data.cierreExistente.fechaStr}` : 'Sin cierre generado'}</div></div>
          </div>

          {data.cierreExistente ? (
            <div className="alert alert-info">
              El día {fecha} ya está cerrado. La operatoria de ventas, reposición y ajustes para esa fecha quedó bloqueada.
            </div>
          ) : null}

          <div className="page-section">
            <div className="page-section-body space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Resumen para cierre</h3>
                  <p className="mt-1 text-sm text-slate-300">Revisá totales y generá el cierre diario cuando la operatoria del día esté terminada.</p>
                </div>
                <button className="btn btn-primary" onClick={handleCerrar} disabled={saving || !canClose || !!data.cierreExistente}>
                  {saving ? 'Generando...' : data.cierreExistente ? 'Día cerrado' : 'Generar cierre del día'}
                </button>
              </div>
              {!canClose ? <div className="alert alert-warning">Tu rol actual no puede generar cierres diarios.</div> : null}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 text-sm font-semibold text-white">Totales por forma de pago</div>
                  <div className="space-y-2">
                    {Object.keys(data.resumen.porMetodoPago).length ? Object.entries(data.resumen.porMetodoPago).map(([key, value]) => <div key={key} className="flex items-center justify-between text-sm"><span className="capitalize text-slate-300">{key.replaceAll('_', ' ')}</span><span className="font-semibold text-white">{formatCurrency(value)}</span></div>) : <div className="text-sm text-slate-400">Sin ventas para la fecha.</div>}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 text-sm font-semibold text-white">Facturación por producto</div>
                  <div className="space-y-2">
                    {Object.keys(data.resumen.porProducto).length ? Object.entries(data.resumen.porProducto).map(([key, value]) => <div key={key} className="flex items-center justify-between text-sm"><span className="text-slate-300">{key}</span><span className="font-semibold text-white">{formatCurrency(value)}</span></div>) : <div className="text-sm text-slate-400">Sin productos vendidos.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="page-section">
              <div className="page-section-body">
                <h3 className="mb-4 text-lg font-semibold text-white">Ventas del día</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead><tr><th>Cliente</th><th>Producto</th><th>Total</th><th>Pago</th></tr></thead>
                    <tbody>
                      {data.ventas.length ? data.ventas.map((item) => <tr key={item.id}><td>{item.clienteNombre}</td><td>{item.productoNombre}</td><td>{formatCurrency(item.total)}</td><td>{item.metodoPago}</td></tr>) : <tr><td colSpan="4" className="text-center text-slate-400">Sin ventas registradas.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="page-section">
              <div className="page-section-body">
                <h3 className="mb-4 text-lg font-semibold text-white">Historial de cierres</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead><tr><th>Fecha</th><th>Total</th><th>Operaciones</th><th>Usuario</th></tr></thead>
                    <tbody>
                      {cierres.length ? cierres.map((item) => <tr key={item.id}><td>{item.fechaStr}</td><td>{formatCurrency(item.resumen?.totalVentas || 0)}</td><td>{item.resumen?.cantidadOperaciones || 0}</td><td>{item.closedBy || '-'}</td></tr>) : <tr><td colSpan="4" className="text-center text-slate-400">Todavía no hay cierres guardados.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
