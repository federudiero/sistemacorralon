import { useEffect, useState } from 'react';
import PremiumModalShell from '../shared/PremiumModalShell';
import AppIcon from '../shared/AppIcon';

const INITIAL_STATE = { nombre: '', codigo: '', capacidadM3: 0, productoId: '', productoNombre: '', stockActualM3: 0, activa: true, observaciones: '' };

export default function BateaFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <PremiumModalShell
      open={open}
      icon="truck"
      title={initialData ? 'Editar batea' : 'Nueva batea'}
      subtitle="Ubicación física del material y capacidad operativa disponible."
      onClose={onClose}
      maxWidth="max-w-3xl"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btn-primary premium-action-btn" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>
            <AppIcon name="save" size={17} />
            {loading ? 'Guardando...' : 'Guardar batea'}
          </button>
        </>
      )}
    >
      <div className="premium-form-stack">
        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="truck" size={17} /></span>
            <div>
              <h4>Identificación</h4>
              <p>Nombre visible, código interno y producto asociado.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Nombre</span>
              <input className="input input-bordered h-12" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Código</span>
              <input className="input input-bordered h-12" value={form.codigo ?? ''} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Producto ID</span>
              <input className="input input-bordered h-12" value={form.productoId ?? ''} onChange={(e) => setForm((p) => ({ ...p, productoId: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Producto nombre</span>
              <input className="input input-bordered h-12" value={form.productoNombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, productoNombre: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="stock" size={17} /></span>
            <div>
              <h4>Capacidad y stock</h4>
              <p>El stock actual queda solo lectura para proteger la trazabilidad.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Capacidad m³</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.capacidadM3 ?? ''} onChange={(e) => setForm((p) => ({ ...p, capacidadM3: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Stock actual</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.stockActualM3 ?? ''} readOnly disabled />
            </label>
            <label className="form-control w-full form-grid-wide">
              <span className="field-label">Observaciones</span>
              <input className="input input-bordered h-12" value={form.observaciones ?? ''} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section premium-form-section--compact">
          <label className="premium-switch-card">
            <input type="checkbox" className="toggle toggle-success" checked={Boolean(form.activa)} onChange={(e) => setForm((p) => ({ ...p, activa: e.target.checked }))} disabled={blocked} />
            <span>
              <strong>Batea activa</strong>
              <small>Disponible para controlar capacidad y ubicación del stock.</small>
            </span>
          </label>
        </section>

        {disabled ? <div className="alert alert-warning">Modo solo lectura. No se pueden guardar cambios en bateas.</div> : null}
      </div>
    </PremiumModalShell>
  );
}
