export default function UiIconButton({
  label,
  icon,
  tone = 'neutral',
  active = false,
  onClick,
  disabled = false,
  className = '',
  size = 'sm',
  title,
  type = 'button',
}) {
  const sizeClass = size === 'xs' ? 'btn-xs' : size === 'lg' ? 'btn-lg' : 'btn-sm';

  return (
    <button
      type={type}
      className={`btn ${sizeClass} ui6-btn ui6-btn--${tone} ${active ? 'is-active' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active || undefined}
      aria-label={label}
      title={title || label}
    >
      <span className="ui6-btn__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="ui6-btn__label">{label}</span>
    </button>
  );
}