import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import useVentasAgenda from '../hooks/useVentasAgenda';
import { updateVentaEntregaEstado } from '../services/ventas.service';
import { VENTA_ENTREGA_ESTADOS } from '../utils/constants';
import {
  formatCurrency,
  formatDateOnly,
  formatEntregaDisplay,
  formatEntregaEstado,
  formatQuantity,
  toInputDate,
} from '../utils/formatters';
import EstadoBadge from '../components/shared/EstadoBadge';

function buildMonthDate(baseDate, deltaMonths = 0) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + deltaMonths, 1);
}

function getMonthLabel(date) {
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date);
}

function buildDateKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalendarCells(monthDate) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const offset = (start.getDay() + 6) % 7;
  const firstCell = new Date(start);
  firstCell.setDate(start.getDate() - offset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(firstCell);
    cellDate.setDate(firstCell.getDate() + index);
    return cellDate;
  });
}

function DayCard({ date, active, inMonth, count, onClick, isToday }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`calendar-day-card ${active ? 'is-active' : ''} ${!inMonth ? 'is-outside' : ''}`}
    >
      <div className="calendar-day-card__header">
        <span className={`calendar-day-card__date ${active ? 'is-active' : ''}`}>{date.getDate()}</span>
        {isToday ? <span className="calendar-day-card__today">Hoy</span> : null}
      </div>

      <div className="calendar-day-card__summary">
        <span className={`calendar-day-card__dot ${count > 0 ? 'is-active' : ''}`} />
        <span className={`calendar-day-card__metric ${count > 0 ? 'has-sales' : 'is-empty'}`}>
          {count > 0 ? `${count} venta${count === 1 ? '' : 's'}` : 'Libre'}
        </span>
      </div>
    </button>
  );
}

function AgendaVentaCard({ item, onSetEntrega, processing = false }) {
  const canChangeEntrega = item.estado !== 'anulada' && item.tipoEntrega === 'envio';

  return (
    <div className="agenda-sale-card">
      <div className="agenda-sale-card__header">
        <div className="min-w-0">
          <div className="agenda-sale-card__title">{item.clienteNombre || 'Cliente'}</div>
          <div className="agenda-sale-card__subtitle">{item.productoNombre || '-'}</div>
        </div>
        <div className="agenda-sale-card__aside">
          <div className="agenda-sale-card__total">{formatCurrency(item.total)}</div>
          <EstadoBadge value={item.entregaEstado} />
        </div>
      </div>

      <div className="agenda-sale-card__details">
        <div><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</div>
        <div><b>Entrega:</b> {formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</div>
        <div><b>Dirección:</b> {item.detalleEntrega || item.direccion || '-'}</div>
        <div><b>Estado:</b> {formatEntregaEstado(item.entregaEstado)}</div>
      </div>

      {canChangeEntrega ? (
        <div className="agenda-sale-card__actions">
          <button
            className={`btn btn-sm ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.ENTREGADA ? 'btn-success' : 'btn-outline'}`}
            disabled={processing}
            onClick={() => onSetEntrega?.(item, VENTA_ENTREGA_ESTADOS.ENTREGADA)}
          >
            Entregada
          </button>
          <button
            className={`btn btn-sm ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA ? 'btn-error' : 'btn-outline'}`}
            disabled={processing}
            onClick={() => onSetEntrega?.(item, VENTA_ENTREGA_ESTADOS.NO_ENTREGADA)}
          >
            No entregada
          </button>
        </div>
      ) : (
        <div className="agenda-sale-card__note">
          {item.tipoEntrega === 'retiro' ? 'Las ventas retiradas se toman como entregadas automáticamente.' : 'No disponible.'}
        </div>
      )}
    </div>
  );
}

export default function AgendaVentasPage({ cuentaId, currentUserEmail }) {
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(today));
  const [processing, setProcessing] = useState(false);

  const monthStart = useMemo(() => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1), [monthCursor]);
  const monthEnd = useMemo(() => new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0), [monthCursor]);
  const range = useMemo(
    () => ({ fechaDesde: toInputDate(monthStart), fechaHasta: toInputDate(monthEnd), limit: 600 }),
    [monthStart, monthEnd],
  );
  const { items, loading, error } = useVentasAgenda(cuentaId, range);

  const calendarCells = useMemo(() => buildCalendarCells(monthCursor), [monthCursor]);
  const salesByDate = useMemo(() => {
    const out = {};
    items.forEach((item) => {
      if (item.estado === 'anulada') return;
      const key = item.fechaStr || toInputDate(item.fecha);
      if (!key) return;
      if (!out[key]) out[key] = { count: 0, amount: 0, items: [] };
      out[key].count += 1;
      out[key].amount += Number(item.total || 0);
      out[key].items.push(item);
    });
    return out;
  }, [items]);

  const selectedItems = useMemo(() => {
    const list = salesByDate[selectedDate]?.items || [];
    return [...list].sort((a, b) => {
      const da = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
      const db = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
      return da - db;
    });
  }, [salesByDate, selectedDate]);

  const selectedSummary = salesByDate[selectedDate] || { count: 0, amount: 0 };

  async function handleEntrega(item, entregaEstado) {
    if (!item?.id) return;
    setProcessing(true);
    try {
      await updateVentaEntregaEstado(cuentaId, item.id, entregaEstado, currentUserEmail);
    } finally {
      setProcessing(false);
    }
  }

  const actions = (
    <div className="agenda-toolbar">
      <button className="btn h-12" onClick={() => {
        const next = buildMonthDate(monthCursor, -1);
        setMonthCursor(next);
        setSelectedDate(buildDateKey(next));
      }}>
        Mes anterior
      </button>
      <div className="agenda-toolbar__month">{getMonthLabel(monthCursor)}</div>
      <button className="btn h-12" onClick={() => {
        const next = buildMonthDate(monthCursor, 1);
        setMonthCursor(next);
        setSelectedDate(buildDateKey(next));
      }}>
        Mes siguiente
      </button>
      <button
        className="btn btn-outline h-12"
        onClick={() => {
          const now = new Date();
          setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
          setSelectedDate(toInputDate(now));
        }}
      >
        Ir a hoy
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agenda de ventas"
        subtitle="Calendario mensual para ver qué días tienen ventas cargadas y marcar si ya se entregaron o no."
        actions={actions}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="page-section">
          <div className="page-section-body space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-base-content/60 sm:text-xs">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {calendarCells.map((date) => {
                  const key = buildDateKey(date);
                  const dayData = salesByDate[key] || { count: 0, amount: 0 };
                  return (
                    <DayCard
                      key={key}
                      date={date}
                      active={selectedDate === key}
                      inMonth={date.getMonth() === monthCursor.getMonth()}
                      count={dayData.count}
                      isToday={key === toInputDate(today)}
                      onClick={() => setSelectedDate(key)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="page-section">
          <div className="page-section-body space-y-4">
            <div className="agenda-summary-card">
              <div className="agenda-summary-card__eyebrow">Fecha seleccionada</div>
              <div className="agenda-summary-card__date">{formatDateOnly(`${selectedDate}T12:00:00`)}</div>
              <div className="agenda-summary-card__meta">
                <span>{selectedSummary.count} venta{selectedSummary.count === 1 ? '' : 's'}</span>
                <span className="agenda-summary-card__bullet">•</span>
                <span>{formatCurrency(selectedSummary.amount)}</span>
              </div>
            </div>

            <label className="form-control">
              <span className="field-label">Ir directo a una fecha</span>
              <input
                type="date"
                className="input input-bordered h-12"
                value={selectedDate}
                onChange={(e) => {
                  const next = e.target.value;
                  setSelectedDate(next);
                  const nextDate = new Date(`${next}T12:00:00`);
                  if (!Number.isNaN(nextDate.getTime())) {
                    setMonthCursor(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
                  }
                }}
              />
            </label>

            <div className="agenda-note-card">
              <div className="agenda-note-card__dot" />
              <div>
                En el calendario se muestra solo el movimiento básico del día para que en celular siga limpio. El detalle completo se ve al abrir la fecha.
              </div>
            </div>

            <div className="space-y-3">
              {selectedItems.length ? selectedItems.map((item) => (
                <AgendaVentaCard key={item.id} item={item} onSetEntrega={handleEntrega} processing={processing} />
              )) : (
                <div className="agenda-empty-state">
                  No hay ventas registradas para esta fecha.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
