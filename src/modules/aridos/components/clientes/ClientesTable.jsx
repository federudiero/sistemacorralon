import { formatCurrency } from '../../utils/formatters';

export default function ClientesTable({ items = [], onEdit, canEdit = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Alias</th><th>Teléfono</th><th>Dirección</th><th>CUIT / DNI</th><th>Saldo CC</th><th>Tipo</th><th>Activo</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre || '-'}</td>
                  <td>{item.alias || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>{item.direccion || '-'}</td>
                  <td>{item.cuitDni || '-'}</td>
                  <td>{formatCurrency(item.saldoCuentaCorriente)}</td>
                  <td>{item.esGenerico ? <span className="badge badge-info">Genérico</span> : <span className="badge badge-ghost">Regular</span>}</td>
                  <td><span className={`badge ${item.activo === false ? 'badge-error' : 'badge-success'}`}>{item.activo === false ? 'No' : 'Sí'}</span></td>
                  <td>{canEdit ? <button className="btn btn-xs btn-outline" onClick={() => onEdit?.(item)}>Editar</button> : <span className="text-xs opacity-60">Solo lectura</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
