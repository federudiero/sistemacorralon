import { VENTA_ENTREGA_ESTADOS } from '../../utils/constants';
import {
  formatCurrency,
  formatDateTime,
  formatEntregaDisplay,
  formatEntregaEstado,
  formatMetodoPago,
  formatQuantity,
} from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';

export default function VentaDetalleModal({ item, open, onClose, onSetEntrega, processing = false }) {
  if (!open || !item) return null;
  const canManageEntrega = typeof onSetEntrega === 'function' && item.estado !== 'anulada';

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg app-title-text">Detalle de venta</h3>
            <p className="mt-1 text-sm app-muted-text">Podés revisar la operación y actualizar si ya fue entregada.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <EstadoBadge value={item.estado} />
            <EstadoBadge value={item.entregaEstado} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div className="app-soft-panel rounded-2xl border p-4 space-y-2">
            <p><b>Fecha:</b> {formatDateTime(item.fecha)}</p>
            <p><b>Cliente:</b> {item.clienteNombre}</p>
            <p><b>Producto:</b> {item.productoNombre}</p>
            <p><b>Teléfono:</b> {item.telefono || '-'}</p>
            <p><b>Dirección:</b> {item.direccion || '-'}</p>
            <p><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</p>
          </div>
          <div className="app-soft-panel rounded-2xl border p-4 space-y-2">
            <p><b>Precio unitario:</b> {formatCurrency(item.precioUnitario)}</p>
            <p><b>Subtotal:</b> {formatCurrency(item.subtotal || item.total)}</p>
            <p><b>Envío:</b> {formatCurrency(item.envioMonto || 0)}</p>
            <p><b>Total:</b> {formatCurrency(item.total)}</p>
            <p><b>Método de pago:</b> {formatMetodoPago(item.metodoPago)}</p>
            <p><b>Tipo de entrega:</b> {formatEntregaDisplay(item.tipoEntrega, item.vehiculoEntrega)}</p>
            <p><b>Estado de entrega:</b> {formatEntregaEstado(item.entregaEstado)}</p>
            <p><b>Detalle:</b> {item.detalleEntrega || '-'}</p>
          </div>
        </div>

        <div className="mt-4 app-soft-panel rounded-2xl border p-4 text-sm">
          <b className="app-title-text">Observaciones:</b>
          <div className="mt-2 app-soft-text whitespace-pre-wrap">{item.observaciones || 'Sin observaciones.'}</div>
        </div>

        {canManageEntrega ? (
          <div className="mt-4 rounded-2xl border border-base-300/70 bg-base-200/40 p-4">
            <div className="text-sm font-semibold app-title-text">Actualizar entrega</div>
            <p className="mt-1 text-sm app-muted-text">El cierre diario solo toma ventas entregadas. Si un envío no llegó, marcá “No entregada”.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={`btn ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.ENTREGADA ? 'btn-success' : 'btn-outline'}`}
                disabled={processing || item.tipoEntrega === 'retiro'}
                onClick={() => onSetEntrega(item, VENTA_ENTREGA_ESTADOS.ENTREGADA)}
              >
                Marcar entregada
              </button>
              <button
                className={`btn ${item.entregaEstado === VENTA_ENTREGA_ESTADOS.NO_ENTREGADA ? 'btn-error' : 'btn-outline'}`}
                disabled={processing || item.tipoEntrega === 'retiro'}
                onClick={() => onSetEntrega(item, VENTA_ENTREGA_ESTADOS.NO_ENTREGADA)}
              >
                Marcar no entregada
              </button>
            </div>
          </div>
        ) : null}

        <div className="modal-action"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </dialog>
  );
}
