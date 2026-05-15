export default function SectionToolbar({
  title,
  subtitle,
  badge,
  children,
  className = '',
}) {
  return (
    <div className={`section-toolbar ${className}`.trim()}>
      <div className="section-toolbar__copy">
        {title ? <h3 className="section-toolbar__title">{title}</h3> : null}
        {subtitle ? <p className="section-toolbar__subtitle">{subtitle}</p> : null}
      </div>
      <div className="section-toolbar__actions">
        {badge ? <span className="badge-soft whitespace-nowrap">{badge}</span> : null}
        {children}
      </div>
    </div>
  );
}
