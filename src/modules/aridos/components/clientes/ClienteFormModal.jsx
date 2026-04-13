import { useEffect, useState } from 'react';

const INITIAL_STATE = { nombre: '', alias: '', telefono: '', direccion: '', cuitDni: '', saldoCuentaCorriente: 0, limiteCuentaCorriente: 0, esGenerico: false, activo: true };

export default function ClienteFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">{initialData ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <label className="form-control w-full"><span className="label-text mb-1">Nombre</span><input className="input input-bordered" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Alias / detalle</span><input className="input input-bordered" value={form.alias ?? ''} onChange={(e) => setForm((p) => ({ ...p, alias: e.target.value }))} disabled={blocked} placeholder="Ej: mostrador / ocasional" /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Teléfono</span><input className="input input-bordered" value={form.telefono ?? ''} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Dirección</span><input className="input input-bordered" value={form.direccion ?? ''} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">CUIT / DNI</span><input className="input input-bordered" value={form.cuitDni ?? ''} onChange={(e) => setForm((p) => ({ ...p, cuitDni: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Saldo cuenta corriente</span><input type="number" step="0.01" className="input input-bordered" value={form.saldoCuentaCorriente ?? ''} onChange={(e) => setForm((p) => ({ ...p, saldoCuentaCorriente: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Límite cuenta corriente</span><input type="number" step="0.01" className="input input-bordered" value={form.limiteCuentaCorriente ?? ''} onChange={(e) => setForm((p) => ({ ...p, limiteCuentaCorriente: e.target.value }))} disabled={blocked} /></label>
          <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox" checked={Boolean(form.esGenerico)} onChange={(e) => setForm((p) => ({ ...p, esGenerico: e.target.checked }))} disabled={blocked} /><span className="label-text">Cliente genérico / mostrador</span></label>
          <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox" checked={Boolean(form.activo)} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} disabled={blocked} /><span className="label-text">Activo</span></label>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </dialog>
  );
}
