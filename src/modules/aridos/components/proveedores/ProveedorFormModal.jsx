import { useEffect, useState } from 'react';

const INITIAL_STATE = { nombre: '', telefono: '', direccion: '', cuit: '', activo: true };

export default function ProveedorFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) setForm(initialData ? { ...INITIAL_STATE, ...initialData } : INITIAL_STATE);
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">{initialData ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <label className="form-control w-full"><span className="label-text mb-1">Nombre</span><input className="input input-bordered" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Teléfono</span><input className="input input-bordered" value={form.telefono ?? ''} onChange={(e) => setForm((p) => ({ ...p, telefono: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Dirección</span><input className="input input-bordered" value={form.direccion ?? ''} onChange={(e) => setForm((p) => ({ ...p, direccion: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">CUIT</span><input className="input input-bordered" value={form.cuit ?? ''} onChange={(e) => setForm((p) => ({ ...p, cuit: e.target.value }))} disabled={blocked} /></label>
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
