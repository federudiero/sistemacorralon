import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';

export default function VentasTable({ items = [], onView, onAnular, onGenerarRemito, canAnnul = true, canGenerateRemito = true }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Cantidad</th><th>Modalidad</th><th>Envío</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{items.map((item) => <tr key={item.id}><td>{formatDateTime(item.fecha)}</td><td>{item.clienteNombre}</td><td>{item.productoNombre}</td><td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td><td>{item.tipoEntrega === 'retiro' ? 'Retiro' : item.vehiculoEntrega || 'Envío'}</td><td>{formatCurrency(item.envioMonto || 0)}</td><td>{formatCurrency(item.total)}</td><td><EstadoBadge value={item.estado} /></td><td className="flex gap-2 flex-wrap"><button className="btn btn-xs btn-outline" onClick={() => onView?.(item)}>Ver</button>{item.estado !== 'anulada' && canAnnul ? <button className="btn btn-xs btn-error btn-outline" onClick={() => onAnular?.(item)}>Anular</button> : null}{item.estado !== 'anulada' && !canAnnul ? <span className="text-xs opacity-60">Sin permiso para anular</span> : null}{item.estado === 'confirmada' && !item.remitoGenerado && canGenerateRemito ? <button className="btn btn-xs btn-secondary btn-outline" onClick={() => onGenerarRemito?.(item)}>Remito</button> : null}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
