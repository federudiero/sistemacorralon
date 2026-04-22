function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.6 12s3.55-6.25 9.4-6.25S21.4 12 21.4 12 17.85 18.25 12 18.25 2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.3" />
      <path d="M8.5 15.5 15.5 8.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.05" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3.8h6.2l4 4v10.3a2.1 2.1 0 0 1-2.1 2.1H8A2.1 2.1 0 0 1 5.9 18.1V5.9A2.1 2.1 0 0 1 8 3.8Z" />
      <path d="M14.2 3.8v4h4" />
      <path d="M8.8 12.2h6.5" />
      <path d="M8.8 15.5h4.9" />
    </svg>
  );
}

function resolveIcon(icon) {
  switch (icon) {
    case 'view':
      return <EyeIcon />;
    case 'delete':
      return <BanIcon />;
    case 'file':
      return <FileIcon />;
    default:
      return null;
  }
}

export default function ActionIconButton({
  tone = 'outline',
  label,
  title,
  icon,
  onClick,
  className = '',
  size = 'sm',
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`btn ${size === 'xs' ? 'btn-xs' : size === 'sm' ? 'btn-sm' : ''} unified-icon-btn action-icon-btn action-icon-btn--${tone} ${className}`.trim()}
      onClick={onClick}
      title={title || label}
      aria-label={label}
      disabled={disabled}
    >
      <span className="unified-icon-btn__icon action-icon-btn__icon" aria-hidden="true">
        {resolveIcon(icon)}
      </span>
      <span className="unified-icon-btn__label action-icon-btn__label">{label}</span>
    </button>
  );
}