import AppIcon from './AppIcon';

export default function EmptyState({
  icon = 'file',
  title = 'Sin registros',
  message = 'Todavía no hay información para mostrar.',
  action,
  compact = false,
}) {
  return (
    <div className={`premium-empty-state ${compact ? 'premium-empty-state--compact' : ''}`.trim()}>
      <div className="premium-empty-state__icon" aria-hidden="true">
        <AppIcon name={icon} size={22} />
      </div>
      <div className="premium-empty-state__copy">
        <h3>{title}</h3>
        {message ? <p>{message}</p> : null}
      </div>
      {action ? <div className="premium-empty-state__action">{action}</div> : null}
    </div>
  );
}
