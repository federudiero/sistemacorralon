import { useEffect, useState } from 'react';
import { createRemitoDesdeVenta } from '../../services/remitos.service';
import { formatQuantity } from '../../utils/formatters';

export default function RemitoFormModal({ open, venta, cuentaId, currentUserEmail, onClose, onSaved }) {
  const [form, setForm] = useState({ camion: '', chofer: '', observaciones: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) setForm({ camion: '', chofer: '', observaciones: '' });
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
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Generar remito</h3>
        <p className="text-sm opacity-70 mt-1">Venta: {venta.clienteNombre} / {venta.productoNombre} / {formatQuantity(venta.cantidad, venta.unidadStock, venta.pesoBolsaKg)}</p>
        <div className="grid grid-cols-1 gap-3 mt-4">
          <label className="form-control w-full"><span className="label-text mb-1">Vehículo / camión</span><input className="input input-bordered" value={form.camion} onChange={(e) => setForm((p) => ({ ...p, camion: e.target.value }))} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Chofer</span><input className="input input-bordered" value={form.chofer} onChange={(e) => setForm((p) => ({ ...p, chofer: e.target.value }))} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Observaciones</span><textarea className="textarea textarea-bordered" value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} /></label>
          {error ? <div className="alert alert-error">{error}</div> : null}
        </div>
        <div className="modal-action"><button className="btn" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Generando...' : 'Generar'}</button></div>
      </div>
    </dialog>
  );
}
