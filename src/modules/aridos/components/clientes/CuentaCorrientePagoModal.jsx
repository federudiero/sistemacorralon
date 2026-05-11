import { useEffect, useMemo, useState } from 'react';
import AppSelect from '../shared/AppSelect';
import { METODOS_COBRO } from '../../utils/constants';
import { formatCurrency, toInputDate } from '../../utils/formatters';

const buildInitialForm = () => ({
  fecha: toInputDate(new Date()),
  monto: '',
  metodoCobro: 'efectivo',
  observaciones: '',
});

export default function CuentaCorrientePagoModal({
  open,
  cliente,
  onClose,
  onSubmit,
  loading = false,
  disabled = false,
}) {
  const [form, setForm] = useState(buildInitialForm);

  useEffect(() => {
    if (open) {
      setForm({
        ...buildInitialForm(),
        monto: Number(cliente?.saldoCuentaCorriente || 0) > 0
          ? String(Number(cliente?.saldoCuentaCorriente || 0))
          : '',
      });
    }
  }, [open, cliente]);

  const saldoActual = Number(cliente?.saldoCuentaCorriente || 0);
  const monto = Number(form.monto || 0);
  const saldoPosterior = Math.max(saldoActual - monto, 0);
  const blocked = loading || disabled || !cliente?.id || monto <= 0 || saldoActual <= 0;

  const helperText = useMemo(() => {
    if (!cliente?.id) return 'Seleccioná un cliente para registrar el pago.';
    if (cliente?.esGenerico) return 'El cliente genérico no usa cuenta corriente.';
    if (saldoActual <= 0) return 'El cliente no tiene saldo pendiente.';
    return `Saldo actual ${formatCurrency(saldoActual)} · Saldo posterior ${formatCurrency(saldoPosterior)}`;
  }, [cliente, saldoActual, saldoPosterior]);

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-xl">
        <div>
          <h3 className="text-lg font-bold app-title-text">Registrar pago de cuenta corriente</h3>
          <p className="mt-1 text-sm app-muted-text">
            {cliente?.nombre || 'Cliente'} · {helperText}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="form-control w-full">
            <span className="label-text mb-1">Fecha de cobro</span>
            <input
              type="date"
              className="input input-bordered h-12"
              value={form.fecha}
              onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value }))}
              disabled={loading || disabled}
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1">Monto cobrado</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max={saldoActual || undefined}
              className="input input-bordered h-12"
              value={form.monto}
              onChange={(e) => setForm((prev) => ({ ...prev, monto: e.target.value }))}
              disabled={loading || disabled || saldoActual <= 0}
            />
          </label>

          <AppSelect
            label="Método de cobro"
            options={METODOS_COBRO}
            value={form.metodoCobro}
            onChange={(nextValue) => setForm((prev) => ({ ...prev, metodoCobro: nextValue }))}
            disabled={loading || disabled}
          />

          <label className="form-control w-full md:col-span-2">
            <span className="label-text mb-1">Observaciones</span>
            <textarea
              className="textarea textarea-bordered min-h-24"
              value={form.observaciones}
              onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
              disabled={loading || disabled}
              placeholder="Ej: pago parcial, comprobante, transferencia recibida"
            />
          </label>
        </div>

        {monto > saldoActual ? (
          <div className="alert alert-warning mt-4">
            El monto supera el saldo pendiente. Se imputará como máximo {formatCurrency(saldoActual)}.
          </div>
        ) : null}

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>Cerrar</button>
          <button
            className="btn btn-primary"
            onClick={() => !blocked && onSubmit?.({ ...form, monto: Math.min(monto, saldoActual) })}
            disabled={blocked}
          >
            {loading ? 'Registrando...' : 'Registrar pago'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
