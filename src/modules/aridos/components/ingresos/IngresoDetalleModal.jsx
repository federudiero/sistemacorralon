import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';

export default function IngresoDetalleModal({ item, open, onClose }) {
  if (!open || !item) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg app-title-text">Detalle de reposición</h3>
            <p className="mt-1 text-sm app-muted-text">Revisá la carga y confirmá si sigue activa o si fue anulada.</p>
          </div>
          <EstadoBadge value={item.estado || 'confirmado'} />
        </div>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div className="app-soft-panel rounded-2xl border p-4 space-y-2">
            <p><b>Fecha:</b> {formatDateTime(item.fecha)}</p>
            <p><b>Proveedor:</b> {item.proveedorNombre}</p>
            <p><b>Producto:</b> {item.productoNombre}</p>
            <p><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</p>
          </div>
          <div className="app-soft-panel rounded-2xl border p-4 space-y-2">
            <p><b>Costo unitario:</b> {formatCurrency(item.costoUnitario)}</p>
            <p><b>Costo total:</b> {formatCurrency(item.costoTotal)}</p>
            <p><b>Remito:</b> {item.remitoNumero || '-'}</p>
            <p><b>Observaciones:</b> {item.observaciones || '-'}</p>
            {item.motivoAnulacion ? <p><b>Motivo de anulación:</b> {item.motivoAnulacion}</p> : null}
          </div>
        </div>
        <div className="modal-action"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </dialog>
  );
}
