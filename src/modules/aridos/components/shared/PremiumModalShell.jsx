import AppIcon from './AppIcon';

export default function PremiumModalShell({
  open,
  icon = 'file',
  title,
  subtitle,
  children,
  actions,
  onClose,
  maxWidth = 'max-w-2xl',
  className = '',
}) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open premium-modal">
      <div className={`modal-box premium-modal-box ${maxWidth} ${className}`.trim()}>
        <div className="premium-modal-header">
          <div className="premium-modal-icon" aria-hidden="true">
            <AppIcon name={icon} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="premium-modal-title">{title}</h3>
            {subtitle ? <p className="premium-modal-subtitle">{subtitle}</p> : null}
          </div>
          {onClose ? (
            <button type="button" className="premium-modal-close" onClick={onClose} aria-label="Cerrar modal">
              <AppIcon name="closeX" size={18} />
            </button>
          ) : null}
        </div>

        <div className="premium-modal-content">
          {children}
        </div>

        {actions ? <div className="premium-modal-actions">{actions}</div> : null}
      </div>
    </dialog>
  );
}
