import { useMemo, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import useVentasAgenda from '../hooks/useVentasAgenda';
import { formatCurrency, formatDateOnly, formatEntregaDisplay, formatQuantity, toInputDate } from '../utils/formatters';

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

function DayCard({ date, active, inMonth, count, amount, onClick, isToday }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[68px] rounded-2xl border p-2 text-left transition md:min-h-[92px] md:p-3 ${
        active
          ? 'border-primary bg-primary/10 shadow-sm'
          : 'border-base-300/70 bg-base-100 hover:border-primary/40'
      } ${inMonth ? '' : 'opacity-45'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-base-content'}`}>
          {date.getDate()}
        </span>
        {isToday ? <span className="badge badge-outline badge-sm">Hoy</span> : null}
      </div>

      <div className="mt-2 flex min-h-[20px] items-center gap-2 md:mt-3 md:min-h-[24px]">
        {count > 0 ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : <span className="h-2.5 w-2.5 rounded-full bg-base-300" />}
        <span className="text-xs text-base-content/70">{count > 0 ? `${count} venta${count === 1 ? '' : 's'}` : 'Sin ventas'}</span>
      </div>

      {count > 0 ? <div className="mt-2 text-sm font-medium text-base-content">{formatCurrency(amount)}</div> : null}
    </button>
  );
}

export default function AgendaVentasPage({ cuentaId }) {
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(today));

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

  const actions = (
    <div className="flex flex-wrap items-end gap-2">
      <button className="btn h-12" onClick={() => {
        const next = buildMonthDate(monthCursor, -1);
        setMonthCursor(next);
        setSelectedDate(buildDateKey(next));
      }}>
        Mes anterior
      </button>
      <div className="min-w-[170px] rounded-2xl border border-base-300/70 bg-base-100 px-4 py-3 text-center text-sm font-medium text-base-content capitalize">
        {getMonthLabel(monthCursor)}
      </div>
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
        subtitle="Calendario mensual para ver qué días tienen ventas cargadas y consultar el detalle por fecha."
        actions={actions}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="page-section">
          <div className="page-section-body space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-base-content/60">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
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
                      amount={dayData.amount}
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
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/60">Fecha seleccionada</div>
              <div className="mt-2 text-xl font-semibold text-base-content">{formatDateOnly(`${selectedDate}T12:00:00`)}</div>
              <div className="mt-1 text-sm text-base-content/70">
                {selectedSummary.count} venta{selectedSummary.count === 1 ? '' : 's'} • {formatCurrency(selectedSummary.amount)}
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

            <div className="rounded-2xl border border-base-300/70 bg-base-200/40 p-4 text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span>El punto indica que hay al menos una venta registrada ese día.</span>
              </div>
            </div>

            <div className="space-y-3">
              {selectedItems.length ? selectedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-base-300/70 bg-base-100 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-base-content">{item.clienteNombre || 'Cliente'}</div>
                      <div className="text-sm text-base-content/70">{item.productoNombre || '-'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-base-content">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-base-content/60">{item.estado || '-'}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-base-content/75">
                    <div><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</div>
                    <div><b>Entrega:</b> {formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</div>
                    <div><b>Dirección:</b> {item.detalleEntrega || item.direccion || '-'}</div>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-base-300/70 bg-base-100 px-4 py-8 text-center text-sm text-base-content/60">
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
