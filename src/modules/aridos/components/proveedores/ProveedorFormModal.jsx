import { useEffect, useState } from 'react';
import PremiumModalShell from '../shared/PremiumModalShell';
import AppIcon from '../shared/AppIcon';

const INITIAL_STATE = { nombre: '', telefono: '', direccion: '', cuit: '', activo: true };

export default function ProveedorFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <PremiumModalShell
      open={open}
      icon="suppliers"
      title={initialData ? 'Editar proveedor' : 'Nuevo proveedor'}
      subtitle="Datos de contacto para ingresos, remitos y reposiciones."
      onClose={onClose}
      maxWidth="max-w-3xl"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btn-primary premium-action-btn" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>
            <AppIcon name="save" size={17} />
            {loading ? 'Guardando...' : 'Guardar proveedor'}
          </button>
        </>
      )}
    >
      <div className="premium-form-stack">
        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="suppliers" size={17} /></span>
            <div>
              <h4>Datos del proveedor</h4>
              <p>Información básica para identificar compras y reposiciones.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Nombre</span>
              <input className="input input-bordered h-12" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Teléfono</span>
              <input className="input input-bordered h-12" value={form.telefono ?? ''} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full form-grid-wide">
              <span className="field-label">Dirección</span>
              <input className="input input-bordered h-12" value={form.direccion ?? ''} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">CUIT</span>
              <input className="input input-bordered h-12" value={form.cuit ?? ''} onChange={(e) => setForm((p) => ({ ...p, cuit: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section premium-form-section--compact">
          <label className="premium-switch-card">
            <input type="checkbox" className="toggle toggle-success" checked={Boolean(form.activo)} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} disabled={blocked} />
            <span>
              <strong>Proveedor activo</strong>
              <small>Disponible para nuevas reposiciones de stock.</small>
            </span>
          </label>
        </section>
      </div>
    </PremiumModalShell>
  );
}
