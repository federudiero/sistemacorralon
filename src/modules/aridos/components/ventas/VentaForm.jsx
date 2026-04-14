import { useEffect, useMemo, useState } from 'react';
import { createVenta } from '../../services/ventas.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import {
  CLIENTE_GENERICO_NOMBRE,
  METODOS_PAGO,
  TIPOS_ENTREGA,
} from '../../utils/constants';
import {
  describeProductoUnidad,
  formatCurrency,
  toInputDate,
} from '../../utils/formatters';

const buildInitialForm = (fecha = toInputDate(new Date())) => ({
  fecha,
  clienteId: '',
  productoId: '',
  cantidad: '',
  precioUnitario: '',
  metodoPago: 'efectivo',
  tipoEntrega: 'retiro',
  vehiculoEntrega: 'retiro_cliente',
  envioMonto: '',
  detalleEntrega: '',
  observaciones: '',
});

export default function VentaForm({
  cuentaId,
  currentUserEmail,
  productos = [],
  clientes = [],
  onSaved,
  disabled = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const clienteGenerico = useMemo(
    () =>
      clientes.find((item) => item.esGenerico) ||
      clientes.find((item) => item.nombre === CLIENTE_GENERICO_NOMBRE) ||
      null,
    [clientes],
  );

  const fechaOperativa = form.fecha || toInputDate(new Date());

  useEffect(() => {
    if (!form.clienteId && clienteGenerico?.id) {
      setForm((prev) => ({ ...prev, clienteId: clienteGenerico.id }));
    }
  }, [clienteGenerico, form.clienteId]);

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

  const cliente = useMemo(
    () => clientes.find((item) => item.id === form.clienteId),
    [clientes, form.clienteId],
  );

  const producto = useMemo(
    () => productos.find((item) => item.id === form.productoId),
    [productos, form.productoId],
  );

  const quantityLabel = producto ? `Cantidad (${describeProductoUnidad(producto)})` : 'Cantidad';
  const subtotal = Number(form.cantidad || 0) * Number(form.precioUnitario || 0);
  const envioMonto = form.tipoEntrega === 'envio' ? Number(form.envioMonto || 0) : 0;
  const totalFinal = subtotal + envioMonto;
  const blocked = saving || disabled || cajaCerrada || checkingClose;
  const isEnvio = form.tipoEntrega === 'envio';

  function updateEntrega(tipoEntrega) {
    setForm((prev) => ({
      ...prev,
      tipoEntrega,
      vehiculoEntrega: tipoEntrega === 'retiro' ? 'retiro_cliente' : 'envio',
      envioMonto: tipoEntrega === 'retiro' ? '' : prev.envioMonto,
      detalleEntrega: tipoEntrega === 'retiro' ? '' : prev.detalleEntrega,
    }));
  }

  async function handleSubmit() {
    if (blocked) return;

    setSaving(true);
    setError('');

    try {
      await createVenta(
        cuentaId,
        {
          ...form,
          fecha: fechaOperativa,
          clienteNombre: cliente?.nombre || '',
          telefono: cliente?.telefono || '',
          direccion: cliente?.direccion || '',
          productoNombre: producto?.nombre || '',
          unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
          pesoBolsaKg: producto?.pesoBolsaKg || null,
        },
        currentUserEmail,
      );

      setForm({ ...buildInitialForm(fechaOperativa), clienteId: clienteGenerico?.id || '' });
      setCajaCerrada(await isCajaCerrada(cuentaId, fechaOperativa));
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la venta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 page-section">
      <div className="pb-4 space-y-5 page-section-body md:pb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Registrar venta</h2>
          <p className="mt-1 text-sm text-slate-300">
            Podés registrar la venta para hoy o dejarla programada en otra fecha operativa.
          </p>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {fechaOperativa} ya está cerrado. No se pueden registrar ventas nuevas para esa fecha.
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
            label="Cliente"
            items={clientes}
            value={form.clienteId}
            onChange={(value) => setForm((prev) => ({ ...prev, clienteId: value }))}
            disabled={blocked}
          />

          <EntitySearchSelect
            label="Producto"
            items={productos}
            value={form.productoId}
            onChange={(value) => {
              const prod = productos.find((item) => item.id === value);
              setForm((prev) => ({
                ...prev,
                productoId: value,
                precioUnitario: prod?.precioVenta || '',
              }));
            }}
            disabled={blocked}
          />

          {cliente?.telefono || cliente?.direccion ? (
            <div className="px-4 py-3 border form-grid-wide rounded-2xl border-base-300/70 bg-base-200/50">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="field-label">Teléfono</div>
                  <div className="mt-1 text-sm text-base-content/80">{cliente?.telefono || '-'}</div>
                </div>
                <div>
                  <div className="field-label">Dirección</div>
                  <div className="mt-1 text-sm text-base-content/80">{cliente?.direccion || '-'}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3
              value={form.cantidad}
              onChange={(value) => setForm((prev) => ({ ...prev, cantidad: value }))}
              disabled={blocked}
            />
          </div>

          <label className="w-full form-control">
            <span className="field-label">Precio unitario</span>
            <input
              type="number"
              className="h-12 input input-bordered"
              value={form.precioUnitario}
              onChange={(e) => setForm((prev) => ({ ...prev, precioUnitario: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">Método de pago</span>
            <select
              className="h-12 select select-bordered"
              value={form.metodoPago}
              onChange={(e) => setForm((prev) => ({ ...prev, metodoPago: e.target.value }))}
              disabled={blocked}
            >
              {METODOS_PAGO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="w-full form-control">
            <span className="field-label">Entrega</span>
            <select
              className="h-12 select select-bordered"
              value={form.tipoEntrega}
              onChange={(e) => updateEntrega(e.target.value)}
              disabled={blocked}
            >
              {TIPOS_ENTREGA.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {isEnvio ? (
            <>
              <label className="w-full form-control">
                <span className="field-label">Flete</span>
                <input
                  type="number"
                  className="h-12 input input-bordered"
                  value={form.envioMonto}
                  onChange={(e) => setForm((prev) => ({ ...prev, envioMonto: e.target.value }))}
                  disabled={blocked}
                  placeholder="0"
                />
              </label>

              <label className="form-control form-grid-wide">
                <span className="field-label">Dirección o referencia</span>
                <input
                  className="h-12 input input-bordered"
                  value={form.detalleEntrega}
                  onChange={(e) => setForm((prev) => ({ ...prev, detalleEntrega: e.target.value }))}
                  disabled={blocked}
                  placeholder="Dirección, barrio o referencia útil para la entrega"
                />
              </label>
            </>
          ) : null}

          <label className="form-control form-grid-wide">
            <span className="field-label">Nota interna</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={form.observaciones}
              onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
              disabled={blocked}
              placeholder="Dato opcional para dejar asentado en la venta"
            />
          </label>
        </div>

        {disabled ? (
          <div className="alert alert-warning">Tu rol actual no puede registrar ventas nuevas.</div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Total a cobrar</div>
            <div className="mt-1 text-2xl font-semibold text-white">{formatCurrency(totalFinal)}</div>
            <div className="mt-1 text-sm text-slate-400">
              Fecha {fechaOperativa} • Subtotal {formatCurrency(subtotal)} {isEnvio ? `• Flete ${formatCurrency(envioMonto)}` : ''}
            </div>
          </div>

          <div className="form-actions">
            <button className="px-6 btn btn-primary h-11" onClick={handleSubmit} disabled={blocked}>
              {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar venta'}
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="rounded-2xl border border-base-300/70 bg-base-100 px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Total a cobrar
                </div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {formatCurrency(totalFinal)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Fecha {fechaOperativa} • {isEnvio ? `Flete ${formatCurrency(envioMonto)}` : 'Retiro sin flete'}
                </div>
              </div>

              <button
                className="btn btn-primary h-12 min-w-[148px] px-5"
                onClick={handleSubmit}
                disabled={blocked}
              >
                {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Guardar venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
