import { useEffect, useState } from 'react';

const INITIAL_STATE = { nombre: '', codigo: '', capacidadM3: 0, productoId: '', productoNombre: '', stockActualM3: 0, activa: true, observaciones: '' };

export default function BateaFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">{initialData ? 'Editar batea' : 'Nueva batea'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <label className="form-control w-full"><span className="label-text mb-1">Nombre</span><input className="input input-bordered" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Código</span><input className="input input-bordered" value={form.codigo ?? ''} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Capacidad m3</span><input type="number" step="0.01" className="input input-bordered" value={form.capacidadM3 ?? ''} onChange={(e) => setForm((p) => ({ ...p, capacidadM3: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Producto ID</span><input className="input input-bordered" value={form.productoId ?? ''} onChange={(e) => setForm((p) => ({ ...p, productoId: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Producto nombre</span><input className="input input-bordered" value={form.productoNombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, productoNombre: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Stock actual (solo lectura)</span><input type="number" step="0.01" className="input input-bordered" value={form.stockActualM3 ?? ''} readOnly disabled /></label>
          <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox" checked={Boolean(form.activa)} onChange={(e) => setForm((p) => ({ ...p, activa: e.target.checked }))} disabled={blocked} /><span className="label-text">Activa</span></label>
          <label className="form-control w-full"><span className="label-text mb-1">Observaciones</span><input className="input input-bordered" value={form.observaciones ?? ''} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} disabled={blocked} /></label>
        </div>
        {disabled ? <div className="alert alert-warning mt-4">Modo solo lectura. No se pueden guardar cambios en bateas.</div> : null}
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </dialog>
  );
}
