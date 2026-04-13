import { formatCurrency } from '../../utils/formatters';

function Card({ title, value, subtitle }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-2xl">
      <div className="card-body">
        <p className="text-sm opacity-70">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle ? <p className="text-xs opacity-60">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function ReportesResumenCards({ resumen = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total ventas" value={formatCurrency(resumen.totalVentas || 0)} />
      <Card title="Cantidad vendida" value={Number(resumen.totalCantidadVendida || 0).toFixed(2)} subtitle="Suma de cantidades según unidad del producto" />
      <Card title="Operaciones" value={resumen.cantidadVentas || 0} />
    </div>
  );
}
