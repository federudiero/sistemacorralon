import { useEffect, useState } from 'react';
import PremiumModalShell from '../shared/PremiumModalShell';
import AppIcon from '../shared/AppIcon';

const INITIAL_STATE = {
  nombre: '',
  alias: '',
  telefono: '',
  direccion: '',
  cuitDni: '',
  saldoCuentaCorriente: 0,
  limiteCuentaCorriente: 0,
  esGenerico: false,
  activo: true,
};

export default function ClienteFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <PremiumModalShell
      open={open}
      icon="clients"
      title={initialData ? 'Editar cliente' : 'Nuevo cliente'}
      subtitle="Datos comerciales, contacto y configuración de cuenta corriente."
      onClose={onClose}
      maxWidth="max-w-3xl"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btn-primary premium-action-btn" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>
            <AppIcon name="save" size={17} />
            {loading ? 'Guardando...' : 'Guardar cliente'}
          </button>
        </>
      )}
    >
      <div className="premium-form-stack">
        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="clients" size={17} /></span>
            <div>
              <h4>Datos principales</h4>
              <p>Identificación del cliente para ventas, filtros y remitos.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Nombre</span>
              <input className="input input-bordered h-12" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Alias / detalle</span>
              <input className="input input-bordered h-12" value={form.alias ?? ''} onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))} disabled={blocked} placeholder="Ej: mostrador / ocasional" />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Teléfono</span>
              <input className="input input-bordered h-12" value={form.telefono ?? ''} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">CUIT / DNI</span>
              <input className="input input-bordered h-12" value={form.cuitDni ?? ''} onChange={(e) => setForm((p) => ({ ...p, cuitDni: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full form-grid-wide">
              <span className="field-label">Dirección</span>
              <input className="input input-bordered h-12" value={form.direccion ?? ''} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="wallet" size={17} /></span>
            <div>
              <h4>Cuenta corriente</h4>
              <p>Usá estos campos solo si el cliente compra a pagar después.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Saldo cuenta corriente</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.saldoCuentaCorriente ?? ''} onChange={(e) => setForm((p) => ({ ...p, saldoCuentaCorriente: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Límite cuenta corriente</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.limiteCuentaCorriente ?? ''} onChange={(e) => setForm((p) => ({ ...p, limiteCuentaCorriente: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section premium-form-section--compact">
          <div className="premium-switch-grid">
            <label className="premium-switch-card">
              <input type="checkbox" className="toggle toggle-primary" checked={Boolean(form.esGenerico)} onChange={(e) => setForm((p) => ({ ...p, esGenerico: e.target.checked }))} disabled={blocked} />
              <span>
                <strong>Cliente genérico / mostrador</strong>
                <small>Para ventas rápidas sin cuenta corriente.</small>
              </span>
            </label>
            <label className="premium-switch-card">
              <input type="checkbox" className="toggle toggle-success" checked={Boolean(form.activo)} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} disabled={blocked} />
              <span>
                <strong>Cliente activo</strong>
                <small>Disponible para nuevas operaciones.</small>
              </span>
            </label>
          </div>
        </section>
      </div>
    </PremiumModalShell>
  );
}
