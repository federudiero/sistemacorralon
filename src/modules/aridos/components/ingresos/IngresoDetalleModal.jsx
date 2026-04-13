import { formatCurrency, formatDateTime, formatQuantity } from '../../utils/formatters';

export default function IngresoDetalleModal({ item, open, onClose }) {
  if (!open || !item) return null;
  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Detalle de reposición</h3>
        <div className="mt-4 space-y-2 text-sm">
          <p><b>Fecha:</b> {formatDateTime(item.fecha)}</p>
          <p><b>Proveedor:</b> {item.proveedorNombre}</p>
          <p><b>Producto:</b> {item.productoNombre}</p>
          <p><b>Presentación:</b> {item.presentacionIngreso || '-'}</p>
          <p><b>Cantidad:</b> {formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</p>
          <p><b>Costo unitario:</b> {formatCurrency(item.costoUnitario)}</p>
          <p><b>Costo total:</b> {formatCurrency(item.costoTotal)}</p>
          <p><b>Patente:</b> {item.patente || '-'}</p>
          <p><b>Chofer:</b> {item.chofer || '-'}</p>
          <p><b>Remito:</b> {item.remitoNumero || '-'}</p>
          <p><b>Detalle logístico:</b> {item.detalleLogistico || '-'}</p>
          <p><b>Observaciones:</b> {item.observaciones || '-'}</p>
        </div>
        <div className="modal-action"><button className="btn" onClick={onClose}>Cerrar</button></div>
      </div>
    </dialog>
  );
}
