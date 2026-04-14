import { useEffect, useMemo, useState } from 'react';
import { createIngresoCamion } from '../../services/ingresosCamion.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import { describeProductoUnidad, formatCurrency, toInputDate } from '../../utils/formatters';

const buildInitialForm = (fecha = toInputDate(new Date())) => ({
  fecha,
  proveedorId: '',
  productoId: '',
  cantidad: '',
  costoUnitario: '',
  remitoNumero: '',
  observaciones: '',
});

export default function IngresoCamionForm({
  cuentaId,
  currentUserEmail,
  productos = [],
  proveedores = [],
  onSaved,
  disabled = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const fechaOperativa = form.fecha || toInputDate(new Date());
  const producto = useMemo(
    () => productos.find((item) => item.id === form.productoId),
    [productos, form.productoId],
  );
  const proveedor = useMemo(
    () => proveedores.find((item) => item.id === form.proveedorId),
    [proveedores, form.proveedorId],
  );
  const quantityLabel = producto ? `Cantidad (${describeProductoUnidad(producto)})` : 'Cantidad';
  const costoTotal = Number(form.cantidad || 0) * Number(form.costoUnitario || 0);
  const blocked = saving || disabled || cajaCerrada || checkingClose;

  useEffect(() => {
    let active = true;

    async function loadCloseState() {
      if (!cuentaId || !fechaOperativa) return;
      setCheckingClose(true);
      try {
        const closed = await isCajaCerrada(cuentaId, fechaOperativa);
        if (!active) return;
        setCajaCerrada(closed);
      } catch {
        if (!active) return;
        setCajaCerrada(false);
      } finally {
        if (active) setCheckingClose(false);
      }
    }

    loadCloseState();
    return () => {
      active = false;
    };
  }, [cuentaId, fechaOperativa]);

  async function handleSubmit() {
    if (blocked) return;

    setSaving(true);
    setError('');

    try {
      await createIngresoCamion(
        cuentaId,
        {
          ...form,
          fecha: fechaOperativa,
          productoNombre: producto?.nombre || '',
          unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
          pesoBolsaKg: producto?.pesoBolsaKg || null,
          proveedorNombre: proveedor?.nombre || '',
        },
        currentUserEmail,
      );

      setForm(buildInitialForm(fechaOperativa));
      setCajaCerrada(await isCajaCerrada(cuentaId, fechaOperativa));
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el ingreso.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 page-section">
      <div className="space-y-5 page-section-body pb-28 md:pb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Registrar reposición</h2>
          <p className="mt-1 text-sm text-slate-300">
            Podés dejar registrada la reposición para la fecha operativa que corresponda.
          </p>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {fechaOperativa} ya está cerrado. No se pueden registrar reposiciones nuevas para esa fecha.
          </div>
        ) : null}

        <div className="form-grid">
          <label className="w-full form-control">
            <span className="field-label">Fecha</span>
            <input
              type="date"
              className="h-12 input input-bordered"
              value={fechaOperativa}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))}
              disabled={saving || disabled}
            />
          </label>

          <EntitySearchSelect
            label="Proveedor"
            items={proveedores}
            value={form.proveedorId}
            onChange={(value) => setForm((prev) => ({ ...prev, proveedorId: value }))}
            disabled={blocked}
          />

          <EntitySearchSelect
            label="Producto"
            items={productos}
            value={form.productoId}
            onChange={(value) => setForm((prev) => ({ ...prev, productoId: value }))}
            disabled={blocked}
          />

          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3
              value={form.cantidad}
              onChange={(value) => setForm((prev) => ({ ...prev, cantidad: value }))}
              disabled={blocked}
            />
          </div>

          <label className="w-full form-control">
            <span className="field-label">Costo unitario</span>
            <input
              type="number"
              className="h-12 input input-bordered"
              value={form.costoUnitario}
              onChange={(e) => setForm((prev) => ({ ...prev, costoUnitario: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">N° remito</span>
            <input
              className="h-12 input input-bordered"
              value={form.remitoNumero}
              onChange={(e) => setForm((prev) => ({ ...prev, remitoNumero: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="form-control form-grid-wide">
            <span className="field-label">Observaciones</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={form.observaciones}
              onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
              disabled={blocked}
              placeholder="Opcional"
            />
          </label>
        </div>

        {disabled ? (
          <div className="alert alert-warning">Tu rol actual no puede registrar ingresos.</div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Costo estimado</div>
            <div className="mt-1 text-2xl font-semibold text-white">{formatCurrency(costoTotal)}</div>
            <div className="mt-1 text-sm text-slate-400">
              Fecha {fechaOperativa} • {proveedor?.nombre || 'Sin proveedor seleccionado'}
            </div>
          </div>

          <div className="form-actions">
            <button className="px-6 btn btn-primary h-11" onClick={handleSubmit} disabled={blocked}>
              {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar reposición'}
            </button>
          </div>
        </div>

        <div className="btm-action-bar md:hidden">
          <div className="text-left min-w-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Costo estimado</div>
            <div className="text-xl font-semibold text-white">{formatCurrency(costoTotal)}</div>
            <div className="mt-1 text-xs text-slate-400">Fecha {fechaOperativa}</div>
          </div>
          <button className="btn btn-primary flex-1 h-11" onClick={handleSubmit} disabled={blocked}>
            {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar reposición'}
          </button>
        </div>
      </div>
    </div>
  );
}
