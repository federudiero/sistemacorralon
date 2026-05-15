export default function PaginationControls({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  startItem = 0,
  endItem = 0,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1 || totalItems <= 0) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  function goTo(nextPage) {
    const normalized = Math.min(Math.max(Number(nextPage) || 1, 1), totalPages);
    onPageChange?.(normalized);
  }

  return (
    <div className={['app-pagination', className].filter(Boolean).join(' ')}>
      <div className="app-pagination__info">
        Mostrando {startItem}-{endItem} de {totalItems}
      </div>

      <div className="app-pagination__actions">
        <button
          type="button"
          className="btn btn-sm app-pagination__button"
          onClick={() => goTo(1)}
          disabled={!canPrev}
          aria-label="Primera página"
        >
          «
        </button>
        <button
          type="button"
          className="btn btn-sm app-pagination__button"
          onClick={() => goTo(page - 1)}
          disabled={!canPrev}
          aria-label="Página anterior"
        >
          ‹
        </button>

        <span className="app-pagination__page">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          className="btn btn-sm app-pagination__button"
          onClick={() => goTo(page + 1)}
          disabled={!canNext}
          aria-label="Página siguiente"
        >
          ›
        </button>
        <button
          type="button"
          className="btn btn-sm app-pagination__button"
          onClick={() => goTo(totalPages)}
          disabled={!canNext}
          aria-label="Última página"
        >
          »
        </button>
      </div>
    </div>
  );
}
