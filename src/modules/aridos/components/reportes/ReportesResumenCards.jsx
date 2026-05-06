import { formatCurrency } from '../../utils/formatters';

function Card({ title, value, subtitle }) {
  return (
    <div className="kpi-card">
      <p className="text-sm app-muted-text">{title}</p>
      <p className="text-2xl font-bold app-title-text mt-1">{value}</p>
      {subtitle ? <p className="text-xs app-muted-text mt-1">{subtitle}</p> : null}
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
