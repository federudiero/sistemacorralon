import { useEffect, useMemo, useState } from 'react';
import { AJUSTE_TIPOS } from '../../utils/constants';
import { createAjusteStock } from '../../services/ajustesStock.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import AppSelect from '../shared/AppSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import { describeProductoUnidad, toInputDate } from '../../utils/formatters';

const buildInitialForm = (fecha = toInputDate(new Date())) => ({
  fecha,
  productoId: '',
  tipo: AJUSTE_TIPOS[0].value,
  cantidad: '',
  motivo: '',
});

export default function AjusteStockForm({ cuentaId, currentUserEmail, productos = [], onSaved, disabled = false }) {
  const [form, setForm] = useState(() => buildInitialForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const fechaOperativa = form.fecha || toInputDate(new Date());
  const producto = useMemo(() => productos.find((item) => item.id === form.productoId), [productos, form.productoId]);
  const quantityLabel = producto ? `Cantidad (${describeProductoUnidad(producto)})` : 'Cantidad';

  useEffect(() => {
    let active = true;

    async function loadCloseState() {
      if (!cuentaId || !fechaOperativa) return;
      setCheckingClose(true);
      try {
        const closed = await isCajaCerrada(cuentaId, fechaOperativa);
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
  }, [cuentaId, fechaOperativa]);

  async function handleSubmit() {
    if (disabled || blocked) return;
    setSaving(true);
    setError('');
    try {
      await createAjusteStock(cuentaId, {
        ...form,
        fecha: fechaOperativa,
        productoNombre: producto?.nombre || '',
        unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
        pesoBolsaKg: producto?.pesoBolsaKg || null,
      }, currentUserEmail);
      setForm(buildInitialForm(fechaOperativa));
      setCajaCerrada(await isCajaCerrada(cuentaId, fechaOperativa));
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
          <h2 className="text-lg font-semibold app-title-text">Registrar ajuste</h2>
          <p className="mt-1 text-sm app-soft-text">Podés dejar el ajuste en la fecha operativa correcta y mantener la trazabilidad del motivo.</p>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {fechaOperativa} ya está cerrado. No se pueden registrar ajustes nuevos para esa fecha.
          </div>
        ) : null}

        <div className="form-grid">
          <label className="form-control w-full">
            <span className="field-label">Fecha</span>
            <input
              type="date"
              className="input input-bordered h-12"
              value={fechaOperativa}
              onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))}
              disabled={saving || disabled}
            />
          </label>

          <EntitySearchSelect label="Producto" items={productos} value={form.productoId} onChange={(value) => setForm((p) => ({ ...p, productoId: value }))} disabled={blocked} />

          <AppSelect
            label="Tipo"
            options={AJUSTE_TIPOS}
            value={form.tipo}
            onChange={(nextValue) => setForm((p) => ({ ...p, tipo: nextValue }))}
            disabled={blocked}
          />

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
