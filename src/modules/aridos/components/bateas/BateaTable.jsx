import { formatM3 } from '../../utils/formatters';

export default function BateaTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Nombre</th><th>Código</th><th>Capacidad</th><th>Producto ID</th><th>Producto</th><th>Stock actual</th><th>Activa</th><th>Observaciones</th><th>Acciones</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre || '-'}</td>
              <td>{item.codigo || '-'}</td>
              <td>{formatM3(item.capacidadM3)}</td>
              <td>{item.productoId || '-'}</td>
              <td>{item.productoNombre || '-'}</td>
              <td>{formatM3(item.stockActualM3)}</td>
              <td><span className={`badge ${item.activa === false ? 'badge-error' : 'badge-success'}`}>{item.activa === false ? 'No' : 'Sí'}</span></td>
              <td>{item.observaciones || '-'}</td>
              <td>{canEdit ? <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>Editar</button> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
