import { useEffect, useMemo, useState } from 'react';
import { createIngresoCamion } from '../../services/ingresosCamion.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import { describeProductoUnidad, formatCurrency } from '../../utils/formatters';
import { PRESENTACIONES_REPOSICION } from '../../utils/constants';

const INITIAL_FORM = {
  proveedorId: '',
  productoId: '',
  cantidad: '',
  costoUnitario: '',
  patente: '',
  chofer: '',
  remitoNumero: '',
  observaciones: '',
  presentacionIngreso: 'batea_20_24',
  detalleLogistico: '',
};

function buildTodayStr() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}-${`${fecha.getDate()}`.padStart(2, '0')}`;
}

export default function IngresoCamionForm({
  cuentaId,
  currentUserEmail,
  productos = [],
  proveedores = [],
  onSaved,
  disabled = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const todayStr = useMemo(() => buildTodayStr(), []);
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
      if (!cuentaId) return;
      setCheckingClose(true);
      try {
        const closed = await isCajaCerrada(cuentaId, todayStr);
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
  }, [cuentaId, todayStr]);

  async function handleSubmit() {
    if (blocked) return;

    setSaving(true);
    setError('');

    try {
      await createIngresoCamion(
        cuentaId,
        {
          ...form,
          productoNombre: producto?.nombre || '',
          unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
          pesoBolsaKg: producto?.pesoBolsaKg || null,
          proveedorNombre: proveedor?.nombre || '',
        },
        currentUserEmail,
      );

      setForm(INITIAL_FORM);
      setCajaCerrada(await isCajaCerrada(cuentaId, todayStr));
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
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Registrar reposición</h2>
            <p className="mt-1 text-sm text-slate-300">
              Carga rápida para batea, big bag, chasis, pallet u otra presentación.
            </p>
          </div>

          <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Proveedor</div>
            <div className="mt-1 text-sm font-medium text-white">
              {proveedor?.nombre || 'Seleccionar'}
            </div>
          </div>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {todayStr} ya está cerrado. No se pueden registrar reposiciones nuevas.
          </div>
        ) : null}

        <div className="mobile-summary-strip md:hidden">
          <div>
            <div className="mobile-summary-label">Producto</div>
            <div className="mobile-summary-value">{producto?.nombre || 'Seleccionar'}</div>
          </div>
          <div>
            <div className="mobile-summary-label">Presentación</div>
            <div className="mobile-summary-value">
              {
                PRESENTACIONES_REPOSICION.find((item) => item.value === form.presentacionIngreso)
                  ?.label
              }
            </div>
          </div>
        </div>

        <div className="form-grid">
          <EntitySearchSelect
            label="Proveedor"
            items={proveedores}
            value={form.proveedorId}
            onChange={(value) => setForm((p) => ({ ...p, proveedorId: value }))}
            disabled={blocked}
          />

          <EntitySearchSelect
            label="Producto"
            items={productos}
            value={form.productoId}
            onChange={(value) => setForm((p) => ({ ...p, productoId: value }))}
            disabled={blocked}
          />

          <label className="w-full form-control">
            <span className="field-label">Presentación</span>
            <select
              className="h-12 select select-bordered"
              value={form.presentacionIngreso}
              onChange={(e) => setForm((p) => ({ ...p, presentacionIngreso: e.target.value }))}
              disabled={blocked}
            >
              {PRESENTACIONES_REPOSICION.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3
              value={form.cantidad}
              onChange={(value) => setForm((p) => ({ ...p, cantidad: value }))}
              disabled={blocked}
            />
          </div>

          <label className="w-full form-control">
            <span className="field-label">Costo unitario</span>
            <input
              type="number"
              className="h-12 input input-bordered"
              value={form.costoUnitario}
              onChange={(e) => setForm((p) => ({ ...p, costoUnitario: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">Patente</span>
            <input
              className="h-12 input input-bordered"
              value={form.patente}
              onChange={(e) => setForm((p) => ({ ...p, patente: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">Chofer</span>
            <input
              className="h-12 input input-bordered"
              value={form.chofer}
              onChange={(e) => setForm((p) => ({ ...p, chofer: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">N° remito</span>
            <input
              className="h-12 input input-bordered"
              value={form.remitoNumero}
              onChange={(e) => setForm((p) => ({ ...p, remitoNumero: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="form-control form-grid-wide">
            <span className="field-label">Detalle logístico</span>
            <input
              className="h-12 input input-bordered"
              value={form.detalleLogistico}
              onChange={(e) => setForm((p) => ({ ...p, detalleLogistico: e.target.value }))}
              disabled={blocked}
              placeholder="Ej: batea 24 m³ / 4 big bag / 1 pallet de bolsas / descarga en playa"
            />
          </label>

          <div className="p-4 border rounded-2xl border-white/10 bg-white/5 xl:col-span-2">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Costo total estimado
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {formatCurrency(costoTotal)}
            </div>
          </div>

          <label className="form-control form-grid-wide">
            <span className="field-label">Observaciones</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={form.observaciones}
              onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              disabled={blocked}
            />
          </label>
        </div>

        {disabled ? (
          <div className="alert alert-warning">Tu rol actual no puede registrar ingresos.</div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="hidden form-actions md:flex">
          <button className="px-6 btn btn-primary h-11" onClick={handleSubmit} disabled={blocked}>
            {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar reposición'}
          </button>
        </div>

        <div className="mobile-sticky-actionbar md:hidden">
          <div className="mobile-sticky-actionbar-inner">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                Costo estimado
              </div>
              <div className="text-lg font-semibold text-white truncate">
                {formatCurrency(costoTotal)}
              </div>
            </div>

            <button
              className="btn btn-primary h-12 min-w-[148px] px-5"
              onClick={handleSubmit}
              disabled={blocked}
            >
              {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Guardar ingreso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}