import { VENTA_ENTREGA_ESTADOS } from '../../utils/constants';

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.75v4.7l3.05 1.75" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M8.15 12.15 10.75 14.75 16.05 9.45" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.35 9.35 14.65 14.65" />
      <path d="M14.65 9.35 9.35 14.65" />
    </svg>
  );
}

const OPTIONS = [
  {
    value: VENTA_ENTREGA_ESTADOS.PENDIENTE,
    label: 'Pendiente',
    shortLabel: 'Pendiente',
    tone: 'pending',
    icon: <ClockIcon />,
  },
  {
    value: VENTA_ENTREGA_ESTADOS.ENTREGADA,
    label: 'Entregada',
    shortLabel: 'Entregada',
    tone: 'delivered',
    icon: <CheckCircleIcon />,
  },
  {
    value: VENTA_ENTREGA_ESTADOS.NO_ENTREGADA,
    label: 'No entregada',
    shortLabel: 'No entregada',
    tone: 'not-delivered',
    icon: <XCircleIcon />,
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function EntregaStateSelector({
  value,
  onChange,
  disabled = false,
  size = 'sm',
  className = '',
}) {
  return (
    <div
      className={cx('delivery-state-picker', `delivery-state-picker--${size}`, className)}
      role="group"
      aria-label="Estado de entrega"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={cx(
              'delivery-state-option',
              `delivery-state-option--${option.tone}`,
              active && 'is-active',
            )}
            onClick={() => onChange?.(option.value)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={`Marcar como ${option.label}`}
            title={option.label}
          >
            <span className="delivery-state-option__icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="delivery-state-option__label">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
