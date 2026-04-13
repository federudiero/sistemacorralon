import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';

export default function ReportesVentasTable({ items = [] }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200 mb-4">
      <div className="p-4 border-b border-base-200 font-semibold">Ventas filtradas</div>
      <table className="table table-zebra">
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Pago</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{formatDateTime(item.fecha)}</td><td>{item.clienteNombre}</td><td>{item.productoNombre}</td><td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td><td>{item.metodoPago}</td><td>{formatCurrency(item.total)}</td><td>{item.estado}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
