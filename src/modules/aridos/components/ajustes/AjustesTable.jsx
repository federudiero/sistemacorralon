import { formatDateTime, formatQuantity } from '../../utils/formatters';

export default function AjustesTable({ items = [] }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Motivo</th><th>Usuario</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{formatDateTime(item.fecha)}</td><td>{item.tipo}</td><td>{item.productoNombre}</td><td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td><td>{item.motivo}</td><td>{item.createdBy || '-'}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
