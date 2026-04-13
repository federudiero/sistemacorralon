export default function ProveedoresTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>CUIT</th><th>Activo</th><th>Acciones</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre || '-'}</td>
              <td>{item.telefono || '-'}</td>
              <td>{item.direccion || '-'}</td>
              <td>{item.cuit || '-'}</td>
              <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
              <td>{canEdit ? <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>Editar</button> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
