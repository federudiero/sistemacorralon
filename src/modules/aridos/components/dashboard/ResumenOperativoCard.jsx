export default function ResumenOperativoCard({ productos = [] }) {
  const activos = productos.filter((item) => item.activo !== false).length;
  const conStock = productos.filter((item) => Number(item.stockActual || item.stockTotalM3 || 0) > 0).length;
  const porcentaje = activos ? Math.round((conStock / activos) * 100) : 0;

  return (
    <div className="kpi-card space-y-2">
      <h3 className="font-semibold app-title-text">Cobertura de stock</h3>
      <progress className="progress progress-primary w-full" value={porcentaje} max="100" />
      <p className="text-xl font-bold app-title-text">{porcentaje}%</p>
      <p className="text-sm app-muted-text">{conStock} productos con stock sobre {activos} activos</p>
    </div>
  );
}
