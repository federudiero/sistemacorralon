import { formatCurrency, formatDateTime, formatMovimientoTipo, formatQuantity } from '../../utils/formatters';

export default function MovimientosTable({ items = [] }) {
  return (
    <div className="page-section">
      <div className="page-section-body">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Detalle de movimientos</h3>
          <span className="badge-soft">{items.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Monto</th><th>Referencia</th><th>Detalle</th><th>Usuario</th></tr></thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.fecha)}</td>
                  <td>{formatMovimientoTipo(item.tipo)}</td>
                  <td>{item.productoNombre || '-'}</td>
                  <td>{formatQuantity(item.cantidad, item.unidadStock, item.pesoBolsaKg)}</td>
                  <td>{item.montoTotal ? formatCurrency(item.montoTotal) : '-'}</td>
                  <td>{item.referenciaTipo || '-'}</td>
                  <td>{item.detalleLogistico || item.motivo || '-'}</td>
                  <td>{item.usuarioEmail || '-'}</td>
                </tr>
              )) : <tr><td colSpan="8" className="text-center text-slate-400">No hay movimientos para los filtros seleccionados.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
