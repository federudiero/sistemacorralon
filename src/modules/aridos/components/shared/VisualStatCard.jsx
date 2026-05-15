export default function VisualStatCard({
  label,
  value,
  helper,
  icon,
  tone = 'neutral',
  className = '',
}) {
  return (
    <div className={`visual-stat-card visual-stat-card--${tone} ${className}`.trim()}>
      <div className="visual-stat-card__top">
        <div className="visual-stat-card__copy">
          <div className="visual-stat-card__label">{label}</div>
          <div className="visual-stat-card__value">{value}</div>
        </div>
        {icon ? <div className="visual-stat-card__icon" aria-hidden="true">{icon}</div> : null}
      </div>
      {helper ? <div className="visual-stat-card__helper">{helper}</div> : null}
    </div>
  );
}
