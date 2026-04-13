import { useEffect, useMemo, useState } from 'react';
import { AJUSTE_TIPOS } from '../../utils/constants';
import { createAjusteStock } from '../../services/ajustesStock.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import { describeProductoUnidad } from '../../utils/formatters';

function buildTodayStr() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}-${`${fecha.getDate()}`.padStart(2, '0')}`;
}

export default function AjusteStockForm({ cuentaId, currentUserEmail, productos = [], onSaved, disabled = false }) {
  const [form, setForm] = useState({ productoId: '', tipo: AJUSTE_TIPOS[0].value, cantidad: '', motivo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const todayStr = useMemo(() => buildTodayStr(), []);
  const producto = useMemo(() => productos.find((item) => item.id === form.productoId), [productos, form.productoId]);
  const quantityLabel = producto ? `Cantidad (${describeProductoUnidad(producto)})` : 'Cantidad';

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
      await createAjusteStock(cuentaId, {
        ...form,
        productoNombre: producto?.nombre || '',
        unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
        pesoBolsaKg: producto?.pesoBolsaKg || null,
      }, currentUserEmail);
      setForm({ productoId: '', tipo: AJUSTE_TIPOS[0].value, cantidad: '', motivo: '' });
      setCajaCerrada(await isCajaCerrada(cuentaId, todayStr));
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el ajuste.');
    } finally {
      setSaving(false);
    }
  }

  const blocked = saving || disabled || cajaCerrada || checkingClose;

  return (
    <div className="page-section mb-4">
      <div className="page-section-body space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Registrar ajuste</h2>
          <p className="mt-1 text-sm text-slate-300">Aplicá ajustes positivos, negativos o mermas sobre el stock del producto dejando trazabilidad del motivo.</p>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {todayStr} ya está cerrado. No se pueden registrar ajustes nuevos hasta abrir un nuevo día operativo.
          </div>
        ) : null}

        <div className="form-grid">
          <EntitySearchSelect label="Producto" items={productos} value={form.productoId} onChange={(value) => setForm((p) => ({ ...p, productoId: value }))} disabled={blocked} />

          <label className="form-control w-full">
            <span className="field-label">Tipo</span>
            <select className="select select-bordered h-12" value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} disabled={blocked}>
              {AJUSTE_TIPOS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3 value={form.cantidad} onChange={(value) => setForm((p) => ({ ...p, cantidad: value }))} disabled={blocked} />
          </div>

          <label className="form-control form-grid-wide">
            <span className="field-label">Motivo</span>
            <textarea className="textarea textarea-bordered min-h-28" value={form.motivo} onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))} disabled={blocked} />
          </label>
        </div>

        {disabled ? <div className="alert alert-warning">Tu rol actual no puede registrar ajustes de stock.</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="form-actions">
          <button className="btn btn-primary h-11 px-6" onClick={handleSubmit} disabled={blocked}>{saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar ajuste'}</button>
        </div>
      </div>
    </div>
  );
}
