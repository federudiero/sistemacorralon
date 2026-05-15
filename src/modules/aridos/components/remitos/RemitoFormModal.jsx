import { useEffect, useState } from 'react';
import { createRemitoDesdeVenta } from '../../services/remitos.service';
import { formatQuantity } from '../../utils/formatters';
import PremiumModalShell from '../shared/PremiumModalShell';
import AppIcon from '../shared/AppIcon';

export default function RemitoFormModal({ open, venta, cuentaId, currentUserEmail, onClose, onSaved }) {
  const [form, setForm] = useState({ camion: '', chofer: '', observaciones: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ camion: '', chofer: '', observaciones: '' });
      setError('');
    }
  }, [open]);

  if (!open || !venta) return null;

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      await createRemitoDesdeVenta(cuentaId, venta.id, form, currentUserEmail);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'No se pudo generar el remito.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <PremiumModalShell
      open={open}
      icon="file"
      title="Generar remito"
      subtitle="Completá los datos operativos del traslado antes de emitirlo."
      onClose={onClose}
      maxWidth="max-w-2xl"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="button" className="btn btn-primary premium-action-btn" onClick={handleSubmit} disabled={saving}>
            <AppIcon name="file" size={17} />
            {saving ? 'Generando...' : 'Generar remito'}
          </button>
        </>
      )}
    >
      <div className="premium-form-stack">
        <div className="premium-summary-card">
          <span className="premium-summary-card__label">Venta asociada</span>
          <strong>{venta.clienteNombre || 'Cliente'}</strong>
          <p>{venta.productoNombre || 'Producto'} · {formatQuantity(venta.cantidad, venta.unidadStock, venta.pesoBolsaKg)}</p>
        </div>

        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="truck" size={17} /></span>
            <div>
              <h4>Datos de traslado</h4>
              <p>Vehículo, chofer y observaciones internas para seguimiento.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="form-control w-full">
              <span className="field-label">Vehículo / camión</span>
              <input className="input input-bordered h-12" value={form.camion} onChange={(e) => setForm((p) => ({ ...p, camion: e.target.value }))} disabled={saving} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Chofer</span>
              <input className="input input-bordered h-12" value={form.chofer} onChange={(e) => setForm((p) => ({ ...p, chofer: e.target.value }))} disabled={saving} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Observaciones</span>
              <textarea className="textarea textarea-bordered min-h-28" value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} disabled={saving} />
            </label>
            {error ? <div className="alert alert-error">{error}</div> : null}
          </div>
        </section>
      </div>
    </PremiumModalShell>
  );
}
