export default function PageLoadingState({ title = 'Cargando información...', rows = 6, variant = 'cards' }) {
  const skeletonRows = Array.from({ length: rows }, (_, index) => index);

  return (
    <div className={`premium-loading premium-loading--${variant}`} role="status" aria-live="polite">
      <div className="premium-loading__header">
        <span className="premium-loading__dot" />
        <span>{title}</span>
      </div>

      <div className="premium-loading__grid">
        {skeletonRows.map((item) => (
          <div key={item} className="premium-skeleton-card">
            <div className="premium-skeleton-line premium-skeleton-line--title" />
            <div className="premium-skeleton-line" />
            <div className="premium-skeleton-line premium-skeleton-line--short" />
          </div>
        ))}
      </div>
    </div>
  );
}
