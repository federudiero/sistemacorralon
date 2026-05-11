import { useEffect, useMemo, useState } from 'react';
import { createVenta } from '../../services/ventas.service';
import { isCajaCerrada } from '../../services/cierreCaja.service';
import EntitySearchSelect from '../shared/EntitySearchSelect';
import AppSelect from '../shared/AppSelect';
import NumericInputM3 from '../shared/NumericInputM3';
import {
  CLIENTE_GENERICO_NOMBRE,
  CONDICIONES_PAGO,
  METODOS_COBRO,
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
  condicionPago: 'contado',
  metodoPago: 'efectivo',
  metodoCobro: 'efectivo',
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
  initialFecha = toInputDate(new Date()),
  onFechaChange,
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialFecha));
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

  const fechaOperativa = form.fecha || initialFecha || toInputDate(new Date());

  useEffect(() => {
    if (initialFecha && initialFecha !== form.fecha) {
      setForm((prev) => ({ ...prev, fecha: initialFecha }));
    }
  }, [initialFecha, form.fecha]);

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
  const isCuentaCorriente = form.condicionPago === 'cuenta_corriente';
  const saldoActualCuentaCorriente = Number(cliente?.saldoCuentaCorriente || 0);
  const limiteCuentaCorriente = Number(cliente?.limiteCuentaCorriente || 0);
  const nuevoSaldoCuentaCorriente = saldoActualCuentaCorriente + totalFinal;
  const isClienteGenerico = Boolean(cliente?.esGenerico || cliente?.nombre === CLIENTE_GENERICO_NOMBRE);
  const cuentaCorrienteBloqueada = isCuentaCorriente && (!cliente?.id || isClienteGenerico);
  const cuentaCorrienteSobreLimite = isCuentaCorriente
    && limiteCuentaCorriente > 0
    && nuevoSaldoCuentaCorriente > limiteCuentaCorriente;
  const blocked = saving || disabled || cajaCerrada || checkingClose;
  const submitBlocked = blocked || cuentaCorrienteBloqueada;
  const isEnvio = form.tipoEntrega === 'envio';

  function handleFechaChange(value) {
    const nextFecha = value || toInputDate(new Date());
    setForm((prev) => ({ ...prev, fecha: nextFecha }));
    onFechaChange?.(nextFecha);
  }

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
    if (submitBlocked) return;

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
      <div className="page-section-body space-y-5 pb-24 md:pb-6">
        <div className="space-y-2">
          <div className="app-eyebrow">Venta rápida</div>
          <h2 className="page-title !text-[1.45rem] md:!text-[1.8rem]">Registrar venta</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="app-inline-meta">
            <span className="app-muted-text">Fecha operativa</span>
            <strong className="app-title-text">{fechaOperativa}</strong>
          </div>
          <div className="app-inline-meta">
            <span className="app-muted-text">Entrega</span>
            <strong className="app-title-text">{isEnvio ? 'Se lo llevamos' : 'Retiro en corralón'}</strong>
          </div>
          <div className="app-inline-meta">
            <span className="app-muted-text">Total actual</span>
            <strong className="app-title-text">{formatCurrency(totalFinal)}</strong>
          </div>
        </div>

        {cajaCerrada ? (
          <div className="alert alert-warning">
            El día {fechaOperativa} ya está cerrado. No se pueden registrar ventas nuevas para esa fecha.
          </div>
        ) : null}

        <div className="form-grid">
          <div className="form-section-divider form-grid-wide">
            <span className="form-section-divider__label">Cliente y producto</span>
            <span className="form-section-divider__line" />
          </div>

          <label className="w-full form-control">
            <span className="field-label">Fecha</span>
            <input
              type="date"
              className="h-12 input input-bordered"
              value={fechaOperativa}
              onChange={(e) => handleFechaChange(e.target.value)}
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
            <div className="form-grid-wide app-soft-panel rounded-2xl border px-4 py-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="field-label">Teléfono</div>
                  <div className="mt-1 text-sm app-soft-text">{cliente?.telefono || '-'}</div>
                </div>
                <div>
                  <div className="field-label">Dirección</div>
                  <div className="mt-1 text-sm app-soft-text">{cliente?.direccion || '-'}</div>
                </div>
              </div>
            </div>
          ) : null}

          {isCuentaCorriente ? (
            <div className={`form-grid-wide alert ${cuentaCorrienteBloqueada ? 'alert-error' : cuentaCorrienteSobreLimite ? 'alert-warning' : 'alert-info'}`}>
              {cuentaCorrienteBloqueada ? (
                <span>Seleccioná un cliente registrado. La cuenta corriente no se permite con consumidor final o cliente genérico.</span>
              ) : (
                <div className="w-full">
                  <div className="font-semibold">Resumen de cuenta corriente</div>
                  <div className="mt-1 text-sm">
                    Saldo actual: {formatCurrency(saldoActualCuentaCorriente)} · Nuevo saldo: {formatCurrency(nuevoSaldoCuentaCorriente)}
                    {limiteCuentaCorriente > 0 ? ` · Límite: ${formatCurrency(limiteCuentaCorriente)}` : ''}
                  </div>
                  {cuentaCorrienteSobreLimite ? (
                    <div className="mt-1 text-sm font-semibold">El nuevo saldo supera el límite configurado para este cliente.</div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          <div className="form-section-divider form-grid-wide">
            <span className="form-section-divider__label">Precio y pago</span>
            <span className="form-section-divider__line" />
          </div>

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

          <AppSelect
            label="Condición de pago"
            options={CONDICIONES_PAGO}
            value={form.condicionPago}
            onChange={(nextValue) => setForm((prev) => ({
              ...prev,
              condicionPago: nextValue,
              metodoPago: nextValue === 'cuenta_corriente' ? 'cuenta_corriente' : (prev.metodoCobro || 'efectivo'),
            }))}
            disabled={blocked}
          />

          {!isCuentaCorriente ? (
            <AppSelect
              label="Método de cobro"
              options={METODOS_COBRO}
              value={form.metodoCobro}
              onChange={(nextValue) => setForm((prev) => ({
                ...prev,
                metodoCobro: nextValue,
                metodoPago: nextValue,
              }))}
              disabled={blocked}
            />
          ) : (
            <div className="app-soft-panel rounded-2xl border px-4 py-3">
              <div className="field-label">Cuenta corriente</div>
              <div className="mt-1 text-sm app-soft-text">
                La venta descuenta stock, pero no entra como caja cobrada hasta registrar el pago del cliente.
              </div>
            </div>
          )}

          <div className="form-section-divider form-grid-wide">
            <span className="form-section-divider__label">Entrega</span>
            <span className="form-section-divider__line" />
          </div>

          <AppSelect
            label="Tipo de entrega"
            options={TIPOS_ENTREGA}
            value={form.tipoEntrega}
            onChange={updateEntrega}
            disabled={blocked}
          />

          {isEnvio ? (
            <>
              <label className="w-full form-control">
                <span className="field-label">Costo de envío</span>
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
                  placeholder="Ej: barrio, calle, altura, observación de entrega"
                />
              </label>
            </>
          ) : null}

          <label className="form-control form-grid-wide">
            <span className="field-label">Observaciones</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={form.observaciones}
              onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
              disabled={blocked}
              placeholder="Dato opcional para dejar asentado en la venta"
            />
          </label>
        </div>

        {disabled ? <div className="alert alert-warning">Tu rol actual no puede registrar ventas.</div> : null}
        {error ? <div className="alert alert-error">{error}</div> : null}

        <div className="sales-submit-bar md:hidden">
          <div className="sales-submit-bar__meta">
            <div className="sales-submit-bar__label">Total a cobrar</div>
            <div className="sales-submit-bar__value">{formatCurrency(totalFinal)}</div>
            <div className="sales-submit-bar__hint">
              {subtotal ? `Subtotal ${formatCurrency(subtotal)}${isEnvio ? ` + envío ${formatCurrency(envioMonto)}` : ' · retiro'}` : 'Completá producto, cantidad y precio'}
            </div>
          </div>
          <button className="btn btn-primary sales-submit-bar__button" onClick={handleSubmit} disabled={submitBlocked}>
            {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Guardar venta'}
          </button>
        </div>

        <div className="hidden items-center justify-between gap-4 md:flex">
          <div className="min-w-0">
            <div className="field-label !mb-1">Total a cobrar</div>
            <div className="text-3xl font-semibold app-title-text">{formatCurrency(totalFinal)}</div>
            <div className="mt-1 text-sm app-muted-text">
              {subtotal ? `Subtotal ${formatCurrency(subtotal)}${isEnvio ? ` + envío ${formatCurrency(envioMonto)}` : ' · retiro en corralón'}` : 'Completá el formulario para calcular el total'}
            </div>
          </div>

          <div className="form-actions !border-0 !pt-0">
            <button className="btn btn-primary h-12 px-6" onClick={handleSubmit} disabled={submitBlocked}>
              {saving ? 'Guardando...' : cajaCerrada ? 'Día cerrado' : 'Registrar venta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
