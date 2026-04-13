import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';

export default function IngresosTable({ items = [], onView }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Fecha</th><th>Proveedor</th><th>Producto</th><th>Presentación</th><th>Cantidad</th><th>Costo</th><th>Acciones</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{formatDateTime(item.fecha)}</td><td>{item.proveedorNombre}</td><td>{item.productoNombre}</td><td>{item.presentacionIngreso || '-'}</td><td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td><td>{formatCurrency(item.costoTotal)}</td><td><button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>Ver</button></td></tr>)}</tbody>
      </table>
    </div>
  );
}
