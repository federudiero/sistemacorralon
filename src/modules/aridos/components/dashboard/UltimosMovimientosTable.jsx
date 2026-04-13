import { formatDateTime, formatQuantity } from '../../utils/formatters';

export default function UltimosMovimientosTable({ items = [] }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <div className="p-4 border-b border-base-200 font-semibold">Últimos movimientos</div>
      <table className="table table-zebra">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Detalle</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{formatDateTime(item.fecha)}</td>
              <td>{item.tipo}</td>
              <td>{item.productoNombre}</td>
              <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
              <td>{item.motivo || item.detalleLogistico || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
