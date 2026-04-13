import { formatCurrency } from '../../utils/formatters';

export default function VentasHoyCard({ monto = 0, cantidad = 0 }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-2xl">
      <div className="card-body">
        <h3 className="card-title">Ventas de hoy</h3>
        <p className="text-2xl font-bold">{formatCurrency(monto)}</p>
        <p className="opacity-70">{Number(cantidad || 0).toFixed(2)} unidades de stock vendidas</p>
      </div>
    </div>
  );
}
