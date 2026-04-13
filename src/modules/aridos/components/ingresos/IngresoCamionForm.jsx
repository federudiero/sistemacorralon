import { useEffect, useMemo, useState } from 'react';
import { createIngresoCamion } from '../../services/ingresosCamion.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import { describeProductoUnidad, formatCurrency } from '../../utils/formatters';
import { PRESENTACIONES_REPOSICION } from '../../utils/constants';

const INITIAL_FORM = {
  proveedorId: '',
  productoId: '',
  cantidad: '',
  costoUnitario: '',
  patente: '',
  chofer: '',
  remitoNumero: '',
  observaciones: '',
  presentacionIngreso: 'batea_20_24',
  detalleLogistico: '',
};

function buildTodayStr() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}-${`${fecha.getDate()}`.padStart(2, '0')}`;
}

export default function IngresoCamionForm({ cuentaId, currentUserEmail, productos = [], proveedores = [], onSaved, disabled = false }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const todayStr = useMemo(() => buildTodayStr(), []);
  const producto = useMemo(() => productos.find((item) => item.id === form.productoId), [productos, form.productoId]);
  const proveedor = useMemo(() => proveedores.find((item) => item.id === form.proveedorId), [proveedores, form.proveedorId]);
  const quantityLabel = producto ? `Cantidad (${describeProductoUnidad(producto)})` : 'Cantidad';
  const costoTotal = Number(form.cantidad || 0) * Number(form.costoUnitario || 0);

  useEffect(() => {
    let active = true;

    async function loadCloseState() {
      if (!cuentaId) return;
      setCheckingClose(true);
      try {
        const closed = await isCajaCerrada(cuentaId, todayStr);
        if (!active) return;
        setCajaCerrada(closed);
      } catch {
        if (!active) return;
        setCajaCerrada(false);
      } finally {
        if (active) setCheckingClose(false);
      }
    }

    loadCloseState();
    return () => {
      active = false;
    };
  }, [cuentaId, todayStr]);

  async function handleSubmit() {
    if (disabled || cajaCerrada) return;
    setSaving(true);
    setError('');
    try {
      await createIngresoCamion(cuentaId, {
        ...form,
        productoNombre: producto?.nombre || '',
        unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
        pesoBolsaKg: producto?.pesoBolsaKg || null,
        proveedorNombre: proveedor?.nombre || '',
      }, currentUserEmail);
      setForm(INITIAL_FORM);
      setCajaCerrada(await isCajaCerrada(cuentaId, todayStr));
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el ingreso.');
    } finally {
      setSaving(false);
    }
  }

  const blocked = saving || disabled || cajaCerrada || checkingClose;

  return (
    <div className="page-section mb-4">
      <div className="page-section-body space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Registrar reposición</h2>
          <p className="mt-1 text-sm text-slate-300">Cargá ingresos por batea, big bag, camión chasis, pallet o cualquier otra presentación. El stock suma directo al producto.</p>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {todayStr} ya está cerrado. No se pueden registrar reposiciones nuevas hasta abrir un nuevo día operativo.
          </div>
        ) : null}

        <div className="form-grid">
          <EntitySearchSelect label="Proveedor" items={proveedores} value={form.proveedorId} onChange={(value) => setForm((p) => ({ ...p, proveedorId: value }))} disabled={blocked} />
          <EntitySearchSelect label="Producto" items={productos} value={form.productoId} onChange={(value) => setForm((p) => ({ ...p, productoId: value }))} disabled={blocked} />
          <label className="form-control w-full">
            <span className="field-label">Presentación de ingreso</span>
            <select className="select select-bordered h-12" value={form.presentacionIngreso} onChange={(e) => setForm((p) => ({ ...p, presentacionIngreso: e.target.value }))} disabled={blocked}>
              {PRESENTACIONES_REPOSICION.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3 value={form.cantidad} onChange={(value) => setForm((p) => ({ ...p, cantidad: value }))} disabled={blocked} />
          </div>

          <label className="form-control w-full">
            <span className="field-label">Costo unitario</span>
            <input type="number" className="input input-bordered h-12" value={form.costoUnitario} onChange={(e) => setForm((p) => ({ ...p, costoUnitario: e.target.value }))} disabled={blocked} />
          </label>
          <label className="form-control w-full">
            <span className="field-label">Patente</span>
            <input className="input input-bordered h-12" value={form.patente} onChange={(e) => setForm((p) => ({ ...p, patente: e.target.value }))} disabled={blocked} />
          </label>
          <label className="form-control w-full">
            <span className="field-label">Chofer</span>
            <input className="input input-bordered h-12" value={form.chofer} onChange={(e) => setForm((p) => ({ ...p, chofer: e.target.value }))} disabled={blocked} />
          </label>
          <label className="form-control w-full">
            <span className="field-label">N° remito</span>
            <input className="input input-bordered h-12" value={form.remitoNumero} onChange={(e) => setForm((p) => ({ ...p, remitoNumero: e.target.value }))} disabled={blocked} />
          </label>
          <label className="form-control form-grid-wide">
            <span className="field-label">Detalle logístico</span>
            <input className="input input-bordered h-12" value={form.detalleLogistico} onChange={(e) => setForm((p) => ({ ...p, detalleLogistico: e.target.value }))} disabled={blocked} placeholder="Ej: batea completa 24 m³ / 4 big bag / 1 pallet de bolsas / descarga en playa" />
          </label>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 xl:col-span-2">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Costo total estimado</div>
            <div className="mt-2 text-2xl font-semibold text-white">{formatCurrency(costoTotal)}</div>
          </div>

          <label className="form-control form-grid-wide">
            <span className="field-label">Observaciones</span>
            <textarea className="textarea textarea-bordered min-h-28" value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} disabled={blocked} />
          </label>
        </div>

        {disabled ? <div className="alert alert-warning">Tu rol actual no puede registrar ingresos.</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="form-actions">
          <button className="btn btn-primary h-11 px-6" onClick={handleSubmit} disabled={blocked}>{saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar reposición'}</button>
        </div>
      </div>
    </div>
  );
}
