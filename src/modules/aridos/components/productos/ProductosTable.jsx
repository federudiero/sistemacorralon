import { describeProductoUnidad, formatCurrency, formatQuantity } from '../../utils/formatters';

export default function ProductosTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Nombre</th><th>Categoría</th><th>Unidad</th><th>Precio venta</th><th>Costo promedio</th><th>Stock actual</th><th>Stock mínimo</th><th>Activo</th><th>Acciones</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre || '-'}</td>
              <td>{item.categoria || '-'}</td>
              <td>{describeProductoUnidad(item)}</td>
              <td>{formatCurrency(item.precioVenta)}</td>
              <td>{formatCurrency(item.costoPromedio)}</td>
              <td>{formatQuantity(item.stockActual ?? item.stockTotalM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
              <td>{formatQuantity(item.stockMinimo ?? item.stockMinimoM3, item.unidadStock || item.unidad, item.pesoBolsaKg)}</td>
              <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
              <td>{canEdit ? <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>Editar</button> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
