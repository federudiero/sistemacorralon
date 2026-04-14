import { REMITO_ESTADOS } from '../../utils/constants';
import { formatDateTime, formatQuantity, formatVehiculoEntrega } from '../../utils/formatters';
import RemitoEstadoBadge from './RemitoEstadoBadge';

export default function RemitosTable({ items = [], onChangeEstado, canEdit = true }) {
  return (
    <div className="overflow-x-auto bg-base-100 rounded-2xl shadow-sm border border-base-200">
      <table className="table table-zebra">
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Vehículo</th><th>Chofer</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}><td>{formatDateTime(item.fecha)}</td><td>{item.clienteNombre}</td><td>{item.productoNombre}</td><td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td><td>{item.camion ? formatVehiculoEntrega(item.camion) : '-'}</td><td>{item.chofer || '-'}</td><td><RemitoEstadoBadge value={item.estado} /></td><td>{canEdit ? <select className="select select-bordered select-xs" value={item.estado} onChange={(e) => onChangeEstado?.(item, e.target.value)}>{Object.values(REMITO_ESTADOS).map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select> : <span className="text-xs opacity-60">Solo lectura</span>}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
