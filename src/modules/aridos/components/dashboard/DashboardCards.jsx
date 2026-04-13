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
