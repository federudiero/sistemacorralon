import { formatQuantity } from '../../utils/formatters';

export default function StockCriticoTable({ items = [] }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <div className="p-4 border-b border-base-200 font-semibold">Stock crítico</div>
      <table className="table table-zebra">
        <thead><tr><th>Producto</th><th>Stock actual</th><th>Stock mínimo</th></tr></thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
              <td>{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
            </tr>
          )) : <tr><td colSpan="3" className="text-center opacity-60">Sin stock crítico</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
