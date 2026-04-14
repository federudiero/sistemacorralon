import { useEffect, useMemo, useState } from 'react';
import { createVenta } from '../../services/ventas.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import {
  CLIENTE_GENERICO_NOMBRE,
  METODOS_PAGO,
  TIPOS_ENTREGA,
  VEHICULOS_ENVIO,
} from '../../utils/constants';
import {
  describeProductoUnidad,
  formatCurrency,
  formatQuantity,
} from '../../utils/formatters';

const INITIAL_FORM = {
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
};

function buildTodayStr() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}-${`${fecha.getDate()}`.padStart(2, '0')}`;
}

export default function VentaForm({
  cuentaId,
  currentUserEmail,
  productos = [],
  clientes = [],
  onSaved,
  disabled = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [checkingClose, setCheckingClose] = useState(true);

  const todayStr = useMemo(() => buildTodayStr(), []);

  const clienteGenerico = useMemo(
    () =>
      clientes.find((item) => item.esGenerico) ||
      clientes.find((item) => item.nombre === CLIENTE_GENERICO_NOMBRE) ||
      null,
    [clientes],
  );

  useEffect(() => {
    if (!form.clienteId && clienteGenerico?.id) {
      setForm((prev) => ({ ...prev, clienteId: clienteGenerico.id }));
    }
  }, [clienteGenerico, form.clienteId]);

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

  async function handleSubmit() {
    if (blocked) return;

    setSaving(true);
    setError('');

    try {
      await createVenta(
        cuentaId,
        {
          ...form,
          clienteNombre: cliente?.nombre || '',
          telefono: cliente?.telefono || '',
          direccion: cliente?.direccion || '',
          productoNombre: producto?.nombre || '',
          unidadStock: producto?.unidadStock || producto?.unidad || 'm3',
          pesoBolsaKg: producto?.pesoBolsaKg || null,
        },
        currentUserEmail,
      );

      setForm({ ...INITIAL_FORM, clienteId: clienteGenerico?.id || '' });
      setCajaCerrada(await isCajaCerrada(cuentaId, todayStr));
      onSaved?.();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la venta.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 page-section">
      <div className="space-y-5 page-section-body pb-28 md:pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Registrar venta</h2>
            <p className="mt-1 text-sm text-slate-300">
              Pensado para mostrador y uso rápido desde teléfono.
            </p>
          </div>

          <div className="p-3 border rounded-2xl border-white/10 bg-white/5">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Cliente actual
            </div>
            <div className="mt-1 text-sm font-medium text-white">
              {cliente?.nombre || 'Sin cliente'}
            </div>
          </div>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {todayStr} ya está cerrado. No se pueden registrar ventas nuevas.
          </div>
        ) : null}

        <div className="mobile-summary-strip md:hidden">
          <div>
            <div className="mobile-summary-label">Producto</div>
            <div className="mobile-summary-value">{producto?.nombre || 'Seleccionar'}</div>
          </div>
          <div>
            <div className="mobile-summary-label">Cantidad</div>
            <div className="mobile-summary-value">
              {producto
                ? formatQuantity(form.cantidad || 0, producto.unidadStock || producto.unidad, producto.pesoBolsaKg)
                : '0'}
            </div>
          </div>
        </div>

        <div className="form-grid">
          <EntitySearchSelect
            label="Cliente"
            items={clientes}
            value={form.clienteId}
            onChange={(value) => setForm((p) => ({ ...p, clienteId: value }))}
            disabled={blocked}
          />

          <EntitySearchSelect
            label="Producto"
            items={productos}
            value={form.productoId}
            onChange={(value) => {
              const prod = productos.find((item) => item.id === value);
              setForm((p) => ({
                ...p,
                productoId: value,
                precioUnitario: prod?.precioVenta || '',
              }));
            }}
            disabled={blocked}
          />

          <div>
            <span className="field-label">{quantityLabel}</span>
            <NumericInputM3
              value={form.cantidad}
              onChange={(value) => setForm((p) => ({ ...p, cantidad: value }))}
              disabled={blocked}
            />
          </div>

          <label className="w-full form-control">
            <span className="field-label">Precio unitario</span>
            <input
              type="number"
              className="h-12 input input-bordered"
              value={form.precioUnitario}
              onChange={(e) => setForm((p) => ({ ...p, precioUnitario: e.target.value }))}
              disabled={blocked}
            />
          </label>

          <label className="w-full form-control">
            <span className="field-label">Método de pago</span>
            <select
              className="h-12 select select-bordered"
              value={form.metodoPago}
              onChange={(e) => setForm((p) => ({ ...p, metodoPago: e.target.value }))}
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
            <span className="field-label">Modalidad</span>
            <select
              className="h-12 select select-bordered"
              value={form.tipoEntrega}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  tipoEntrega: e.target.value,
                  vehiculoEntrega:
                    e.target.value === 'retiro' ? 'retiro_cliente' : p.vehiculoEntrega,
                }))
              }
              disabled={blocked}
            >
              {TIPOS_ENTREGA.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="w-full form-control">
            <span className="field-label">Vehículo / logística</span>
            <select
              className="h-12 select select-bordered"
              value={form.vehiculoEntrega}
              onChange={(e) => setForm((p) => ({ ...p, vehiculoEntrega: e.target.value }))}
              disabled={blocked}
            >
              {VEHICULOS_ENVIO.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="w-full form-control">
            <span className="field-label">Envío cobrado</span>
            <input
              type="number"
              className="h-12 input input-bordered"
              value={form.envioMonto}
              onChange={(e) => setForm((p) => ({ ...p, envioMonto: e.target.value }))}
              disabled={blocked || form.tipoEntrega !== 'envio'}
              placeholder="0"
            />
          </label>

          <label className="form-control form-grid-wide">
            <span className="field-label">Detalle de entrega / dirección</span>
            <input
              className="h-12 input input-bordered"
              value={form.detalleEntrega}
              onChange={(e) => setForm((p) => ({ ...p, detalleEntrega: e.target.value }))}
              disabled={blocked}
              placeholder="Dirección, barrio, referencias o datos del flete"
            />
          </label>

          <div className="p-4 border rounded-2xl border-white/10 bg-white/5 xl:col-span-2">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Resumen económico
            </div>

            <div className="grid gap-3 mt-3 md:grid-cols-3">
              <div>
                <div className="text-sm text-slate-300">Subtotal</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {formatCurrency(subtotal)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-300">Envío</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {formatCurrency(envioMonto)}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-300">Total final</div>
                <div className="mt-1 text-xl font-semibold text-white">
                  {formatCurrency(totalFinal)}
                </div>
              </div>
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
          <div className="alert alert-warning">Tu rol actual no puede registrar ventas nuevas.</div>
        ) : null}

        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="hidden form-actions md:flex">
          <button className="px-6 btn btn-primary h-11" onClick={handleSubmit} disabled={blocked}>
            {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar venta'}
          </button>
        </div>

        <div className="mobile-sticky-actionbar md:hidden">
          <div className="mobile-sticky-actionbar-inner">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                Total a cobrar
              </div>
              <div className="text-lg font-semibold text-white truncate">
                {formatCurrency(totalFinal)}
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
  );
}