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

export default function DashboardCards({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card title="Productos" value={data?.productosCount || 0} />
      <Card title="Ventas hoy" value={formatCurrency(data?.ventasHoyMonto || 0)} subtitle={`${Number(data?.ventasHoyCantidad || 0).toFixed(2)} unidades de stock vendidas`} />
      <Card title="Reposición hoy" value={`${Number(data?.ingresosHoyCantidad || 0).toFixed(2)}`} subtitle="Cantidad cargada en stock" />
      <Card title="Stock crítico" value={data?.stockCritico?.length || 0} subtitle="Productos por debajo del mínimo" />
    </div>
  );
}
