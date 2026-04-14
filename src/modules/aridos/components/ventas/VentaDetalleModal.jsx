import { formatCurrency, formatDateTime, formatMetodoPago, formatQuantity, formatTipoEntrega, formatVehiculoEntrega } from '../../utils/formatters';

export default function VentaDetalleModal({ item, open, onClose }) {
  if (!open || !item) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Detalle de venta</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p><b>Fecha:</b> {formatDateTime(item.fecha)}</p>
          <p><b>Cliente:</b> {item.clienteNombre}</p>
          <p><b>Producto:</b> {item.productoNombre}</p>
          <p><b>Teléfono:</b> {item.telefono || '-'}</p>
          <p><b>Dirección:</b> {item.direccion || '-'}</p>
          <p><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</p>
          <p><b>Precio unitario:</b> {formatCurrency(item.precioUnitario)}</p>
          <p><b>Subtotal:</b> {formatCurrency(item.subtotal || item.total)}</p>
          <p><b>Flete:</b> {formatCurrency(item.envioMonto || 0)}</p>
          <p><b>Total:</b> {formatCurrency(item.total)}</p>
          <p><b>Método de pago:</b> {formatMetodoPago(item.metodoPago)}</p>
          <p><b>Entrega:</b> {formatTipoEntrega(item.tipoEntrega)}</p>
          <p><b>Medio:</b> {item.tipoEntrega === 'envio' ? formatVehiculoEntrega(item.vehiculoEntrega) : '-'}</p>
          <p><b>Detalle entrega:</b> {item.detalleEntrega || '-'}</p>
          <p><b>Estado:</b> {item.estado}</p>
          <p><b>Observaciones:</b> {item.observaciones || '-'}</p>
        </div>
        <div className="modal-action"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </dialog>
  );
}
