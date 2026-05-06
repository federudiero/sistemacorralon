import { formatCurrency } from '../../utils/formatters';

export default function VentasHoyCard({ monto = 0, cantidad = 0 }) {
  return (
    <div className="kpi-card space-y-1">
      <h3 className="font-semibold app-title-text">Ventas de hoy</h3>
      <p className="text-2xl font-bold app-title-text">{formatCurrency(monto)}</p>
      <p className="app-muted-text">{Number(cantidad || 0).toFixed(2)} unidades de stock vendidas</p>
    </div>
  );
}
