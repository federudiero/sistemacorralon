export default function ListSearchInput({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  count = 0,
  className = '',
}) {
  return (
    <div className={`app-searchbar ${className}`.trim()}>
      <div className="app-searchbar-icon" aria-hidden="true">⌕</div>
      <input
        type="search"
        className="input input-bordered app-search-input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      <span className="badge-soft whitespace-nowrap">{count} resultados</span>
    </div>
  );
}
