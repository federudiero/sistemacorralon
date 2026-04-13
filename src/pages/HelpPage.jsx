export default function HelpPage() {
  return (
    <div className="page-section">
      <div className="page-section-body space-y-4">
        <h1 className="page-title">Guía rápida</h1>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Ingresá con tu usuario operativo.</li>
          <li>Inicializá acceso y datos base si el sistema todavía está vacío.</li>
          <li>Cargá productos, bateas, proveedores y clientes.</li>
          <li>Registrá ingresos, ventas y ajustes según la operación diaria.</li>
          <li>Usá movimientos y reportes para seguimiento y control.</li>
        </ol>
      </div>
    </div>
  );
}
