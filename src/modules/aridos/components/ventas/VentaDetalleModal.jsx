import {
  formatCurrency,
  formatDateTime,
  formatEntregaDisplay,
  formatEntregaEstado,
  formatMetodoPago,
  formatQuantity,
} from '../../utils/formatters';
import EstadoBadge from '../shared/EstadoBadge';
import EntregaStateSelector from '../shared/EntregaStateSelector';

export default function VentaDetalleModal({ item, open, onClose, onSetEntrega, processing = false }) {
  if (!open || !item) return null;
  const canManageEntrega = typeof onSetEntrega === 'function' && item.estado !== 'anulada';

  return (
    <dialog className="modal modal-open">
      <div className="max-w-2xl modal-box">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold app-title-text">Detalle de venta</h3>
            <p className="mt-1 text-sm app-muted-text">Podés revisar la operación y actualizar manualmente el estado real de entrega.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <EstadoBadge value={item.estado} />
            <EstadoBadge value={item.entregaEstado} />
          </div>
        </div>

        <div className="grid gap-3 mt-4 text-sm md:grid-cols-2">
          <div className="p-4 space-y-2 border app-soft-panel rounded-2xl">
            <p><b>Fecha:</b> {formatDateTime(item.fecha)}</p>
            <p><b>Cliente:</b> {item.clienteNombre}</p>
            <p><b>Producto:</b> {item.productoNombre}</p>
            <p><b>Teléfono:</b> {item.telefono || '-'}</p>
            <p><b>Dirección:</b> {item.direccion || '-'}</p>
            <p><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</p>
          </div>
          <div className="p-4 space-y-2 border app-soft-panel rounded-2xl">
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

        <div className="p-4 mt-4 text-sm border app-soft-panel rounded-2xl">
          <b className="app-title-text">Observaciones:</b>
          <div className="mt-2 whitespace-pre-wrap app-soft-text">{item.observaciones || 'Sin observaciones.'}</div>
        </div>

        {canManageEntrega ? (
          <div className="p-4 mt-4 border rounded-2xl border-base-300/70 bg-base-200/40">
            <div className="text-sm font-semibold app-title-text">Actualizar entrega</div>
            <p className="mt-1 text-sm app-muted-text">El cierre diario solo toma ventas marcadas como entregadas. Si todavía no salió o no se concretó, dejala pendiente o no entregada.</p>
            <div className="mt-3">
              <EntregaStateSelector
                value={item.entregaEstado}
                disabled={processing}
                onChange={(nextValue) => onSetEntrega(item, nextValue)}
                size="sm"
              />
            </div>
          </div>
        ) : null}

        <div className="modal-action"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </dialog>
  );
}