import { formatQuantity } from '../../utils/formatters';

function StockCriticoCard({ item }) {
  return (
    <div className="mobile-data-card">
      <div className="mobile-data-card-header">
        <div className="min-w-0 flex-1">
          <div className="mobile-data-card-title truncate">{item.nombre}</div>
          <div className="mobile-data-card-subtitle">{item.unidadStock || item.unidad || '-'}</div>
        </div>
        <span className="badge badge-error">Crítico</span>
      </div>

      <div className="mobile-data-grid">
        <div>
          <span className="mobile-data-label">Stock actual</span>
          <span className="mobile-data-value strong">
            {formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}
          </span>
        </div>
        <div>
          <span className="mobile-data-label">Stock mínimo</span>
          <span className="mobile-data-value">
            {formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StockCriticoTable({ items = [] }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold app-title-text">Stock crítico</h3>
          <span className="badge-soft">{items.length} productos</span>
        </div>

        <div className="space-y-3 md:hidden">
          {items.length ? items.map((item) => <StockCriticoCard key={item.id} item={item} />) : <div className="mobile-empty-state">Sin stock crítico para esta fecha.</div>}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="table table-zebra">
            <thead><tr><th>Producto</th><th>Stock actual</th><th>Stock mínimo</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                  <td>{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
                </tr>
              )) : <tr><td colSpan="3" className="text-center app-muted-text">Sin stock crítico</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
