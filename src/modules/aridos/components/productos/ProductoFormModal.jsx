import { useEffect, useState } from 'react';
import { UNIDADES_PRODUCTO } from '../../utils/constants';
import AppSelect from '../shared/AppSelect';
import PremiumModalShell from '../shared/PremiumModalShell';
import AppIcon from '../shared/AppIcon';

const INITIAL_STATE = {
  nombre: '',
  categoria: 'Áridos',
  unidadStock: 'm3',
  pesoBolsaKg: '',
  precioVenta: 0,
  costoActual: 0,
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
        costoActual: initialData.costoActual ?? initialData.costoPromedio ?? 0,
        stockActual: initialData.stockActual ?? initialData.stockTotalM3 ?? 0,
        stockMinimo: initialData.stockMinimo ?? initialData.stockMinimoM3 ?? 0,
      } : INITIAL_STATE);
    }
  }, [open, initialData]);

  if (!open) return null;

  const blocked = loading || disabled;
  const isBolsa = form.unidadStock === 'bolsa';

  return (
    <PremiumModalShell
      open={open}
      icon="product"
      title={initialData ? 'Editar producto' : 'Nuevo producto'}
      subtitle="Configurá unidad, precio, costo y alertas de stock mínimo."
      onClose={onClose}
      maxWidth="max-w-4xl"
      actions={(
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancelar</button>
          <button type="button" className="btn btn-primary premium-action-btn" onClick={() => !blocked && onSubmit?.(form)} disabled={blocked}>
            <AppIcon name="save" size={17} />
            {loading ? 'Guardando...' : 'Guardar producto'}
          </button>
        </>
      )}
    >
      <div className="premium-form-stack">
        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="product" size={17} /></span>
            <div>
              <h4>Ficha comercial</h4>
              <p>Nombre, categoría, unidad de venta y precio visible.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Nombre</span>
              <input className="input input-bordered h-12" value={form.nombre ?? ''} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Categoría</span>
              <input className="input input-bordered h-12" value={form.categoria ?? ''} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} disabled={blocked} />
            </label>
            <div className="form-control w-full">
              <AppSelect label="Unidad de medida" options={UNIDADES_PRODUCTO} value={form.unidadStock} onChange={(nextValue) => setForm((p) => ({ ...p, unidadStock: nextValue, pesoBolsaKg: nextValue === 'bolsa' ? p.pesoBolsaKg : '' }))} disabled={blocked} />
            </div>
            <label className="form-control w-full">
              <span className="field-label">Precio de venta</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.precioVenta ?? ''} onChange={(e) => setForm((p) => ({ ...p, precioVenta: e.target.value }))} disabled={blocked} />
            </label>
            {isBolsa ? (
              <label className="form-control w-full">
                <span className="field-label">Peso por bolsa (kg)</span>
                <input type="number" min="1" max="25" className="input input-bordered h-12" value={form.pesoBolsaKg ?? ''} onChange={(e) => setForm((p) => ({ ...p, pesoBolsaKg: e.target.value }))} disabled={blocked} />
              </label>
            ) : null}
          </div>
        </section>

        <section className="premium-form-section">
          <div className="premium-form-section__header">
            <span className="premium-form-section__icon"><AppIcon name="stock" size={17} /></span>
            <div>
              <h4>Stock y costo</h4>
              <p>El stock actual queda protegido: se modifica desde reposiciones, ventas o ajustes.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="form-control w-full">
              <span className="field-label">Costo actual</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.costoActual ?? ''} onChange={(e) => setForm((p) => ({ ...p, costoActual: e.target.value }))} disabled={blocked} />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Stock actual</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.stockActual ?? ''} readOnly disabled />
            </label>
            <label className="form-control w-full">
              <span className="field-label">Stock mínimo</span>
              <input type="number" step="0.01" className="input input-bordered h-12" value={form.stockMinimo ?? ''} onChange={(e) => setForm((p) => ({ ...p, stockMinimo: e.target.value }))} disabled={blocked} />
            </label>
          </div>
        </section>

        <section className="premium-form-section premium-form-section--compact">
          <label className="premium-switch-card">
            <input type="checkbox" className="toggle toggle-success" checked={Boolean(form.activo)} onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))} disabled={blocked} />
            <span>
              <strong>Producto activo</strong>
              <small>Disponible para ventas, reposiciones y reportes operativos.</small>
            </span>
          </label>
        </section>

        {disabled ? <div className="alert alert-warning">Modo solo lectura. No se pueden guardar cambios en catálogo.</div> : null}
      </div>
    </PremiumModalShell>
  );
}
