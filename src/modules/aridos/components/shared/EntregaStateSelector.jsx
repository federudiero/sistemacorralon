import { VENTA_ENTREGA_ESTADOS } from '../../utils/constants';
import UiIconButton from './UiIconButton';

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.2l2.65 1.7" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M8.3 12.15 10.75 14.6 15.7 9.65" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.45 9.45 14.55 14.55" />
      <path d="M14.55 9.45 9.45 14.55" />
    </svg>
  );
}

const OPTIONS = [
  {
    value: VENTA_ENTREGA_ESTADOS.PENDIENTE,
    label: 'Pendiente',
    tone: 'pending',
    icon: <ClockIcon />,
  },
  {
    value: VENTA_ENTREGA_ESTADOS.ENTREGADA,
    label: 'Entregada',
    tone: 'success',
    icon: <CheckCircleIcon />,
  },
  {
    value: VENTA_ENTREGA_ESTADOS.NO_ENTREGADA,
    label: 'No entregada',
    tone: 'danger',
    icon: <XCircleIcon />,
  },
];

export default function EntregaStateSelector({
  value,
  onChange,
  disabled = false,
  size = 'sm',
  className = '',
}) {
  return (
    <div className={`ui6-stack ${className}`.trim()} role="group" aria-label="Estado de entrega">
      {OPTIONS.map((option) => (
        <UiIconButton
          key={option.value}
          size={size}
          label={option.label}
          tone={option.tone}
          icon={option.icon}
          active={value === option.value}
          disabled={disabled}
          onClick={() => onChange?.(option.value)}
        />
      ))}
    </div>
  );
}