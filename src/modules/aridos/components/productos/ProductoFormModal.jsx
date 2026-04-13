import { useEffect, useState } from 'react';
import { UNIDADES_PRODUCTO } from '../../utils/constants';

const INITIAL_STATE = {
  nombre: '',
  categoria: 'Áridos',
  unidadStock: 'm3',
  pesoBolsaKg: '',
  precioVenta: 0,
  costoPromedio: 0,
  stockActual: 0,
  stockMinimo: 0,
  activo: true,
};

export default function ProductoFormModal({ open, initialData, onClose, onSubmit, loading = false, disabled = false }) {
  const [form, setForm] = useState(INITIAL_STATE);

  useEffect(() => {
    if (open) {
      setForm(initialData ? {
        ...INITIAL_STATE,
        ...initialData,
        unidadStock: initialData.unidadStock || initialData.unidad || 'm3',
        stockActual: initialData.stockActual ?? initialData.stockTotalM3 ?? 0,
        stockMinimo: initialData.stockMinimo ?? initialData.stockMinimoM3 ?? 0,
      } : INITIAL_STATE);
    }
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;
  const isBolsa = form.unidadStock === 'bolsa';

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg">{initialData ? 'Editar producto' : 'Nuevo producto'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <label className="form-control w-full"><span className="label-text mb-1">Nombre</span><input className="input input-bordered" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Categoría</span><input className="input input-bordered" value={form.categoria ?? ''} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full">
            <span className="label-text mb-1">Unidad de stock / venta</span>
            <select className="select select-bordered" value={form.unidadStock} onChange={(e) => setForm((p) => ({ ...p, unidadStock: e.target.value, pesoBolsaKg: e.target.value === 'bolsa' ? p.pesoBolsaKg : '' }))} disabled={blocked}>
              {UNIDADES_PRODUCTO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="form-control w-full"><span className="label-text mb-1">Precio venta</span><input type="number" step="0.01" className="input input-bordered" value={form.precioVenta ?? ''} onChange={(e) => setForm((p) => ({ ...p, precioVenta: e.target.value }))} disabled={blocked} /></label>
          {isBolsa ? <label className="form-control w-full"><span className="label-text mb-1">Peso por bolsa (kg)</span><input type="number" min="1" max="25" className="input input-bordered" value={form.pesoBolsaKg ?? ''} onChange={(e) => setForm((p) => ({ ...p, pesoBolsaKg: e.target.value }))} disabled={blocked} /></label> : null}
          <label className="form-control w-full"><span className="label-text mb-1">Costo promedio</span><input type="number" step="0.01" className="input input-bordered" value={form.costoPromedio ?? ''} onChange={(e) => setForm((p) => ({ ...p, costoPromedio: e.target.value }))} disabled={blocked} /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Stock actual (solo lectura)</span><input type="number" step="0.01" className="input input-bordered" value={form.stockActual ?? ''} readOnly disabled /></label>
          <label className="form-control w-full"><span className="label-text mb-1">Stock mínimo</span><input type="number" step="0.01" className="input input-bordered" value={form.stockMinimo ?? ''} onChange={(e) => setForm((p) => ({ ...p, stockMinimo: e.target.value }))} disabled={blocked} /></label>
          <label className="label cursor-pointer justify-start gap-3"><input type="checkbox" className="checkbox" checked={Boolean(form.activo)} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} disabled={blocked} /><span className="label-text">Activo</span></label>
        </div>
        {disabled ? <div className="alert alert-warning mt-4">Modo solo lectura. No se pueden guardar cambios en catálogo.</div> : null}
        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </dialog>
  );
}
