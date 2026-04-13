export default function ResumenOperativoCard({ productos = [] }) {
  const activos = productos.filter((item) => item.activo !== false).length;
  const conStock = productos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) > 0).length;
  const porcentaje = activos ? Math.round((conStock / activos) * 100) : 0;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 rounded-2xl">
      <div className="card-body">
        <h3 className="card-title">Cobertura de stock</h3>
        <progress className="progress progress-primary w-full" value={porcentaje} max="100" />
        <p className="text-xl font-bold">{porcentaje}%</p>
        <p className="text-sm opacity-70">{conStock} productos con stock sobre {activos} activos</p>
      </div>
    </div>
  );
}
