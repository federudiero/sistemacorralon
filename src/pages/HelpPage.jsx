export default function HelpPage() {
  return (
    <div className="page-section">
      <div className="page-section-body space-y-5">
        <div>
          <div className="app-eyebrow">Guía rápida</div>
          <h1 className="page-title">Recorrido sugerido</h1>
          <p className="page-subtitle">
            Este orden ayuda a mostrar el sistema con un circuito real y a validar que todo quede listo para trabajar.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="mobile-data-card">
            <div className="mobile-data-card-title">1. Confirmar la cuenta</div>
            <p className="mt-2 text-sm app-soft-text">
              Confirmá que el usuario entra bien y que el nombre del corralón aparece correctamente en el panel principal.
            </p>
          </div>

          <div className="mobile-data-card">
            <div className="mobile-data-card-title">2. Cargar base de ejemplo</div>
            <p className="mt-2 text-sm app-soft-text">
              Si la cuenta está vacía, cargá productos, un proveedor y un cliente de ejemplo para recorrer la demo.
            </p>
          </div>

          <div className="mobile-data-card">
            <div className="mobile-data-card-title">3. Registrar reposición</div>
            <p className="mt-2 text-sm app-soft-text">
              Ingresá stock para que las ventas ya impacten sobre cantidades y costo actual.
            </p>
          </div>

          <div className="mobile-data-card">
            <div className="mobile-data-card-title">4. Registrar una venta</div>
            <p className="mt-2 text-sm app-soft-text">
              Probá una venta completa, con retiro o envío, para validar el flujo diario desde el celular.
            </p>
          </div>

          <div className="mobile-data-card">
            <div className="mobile-data-card-title">5. Revisar agenda y movimientos</div>
            <p className="mt-2 text-sm app-soft-text">
              Verificá que la agenda marque la fecha operativa y que el movimiento de stock quede registrado.
            </p>
          </div>

          <div className="mobile-data-card">
            <div className="mobile-data-card-title">6. Cerrar y reportar</div>
            <p className="mt-2 text-sm app-soft-text">
              Mirá cierre, remitos y reportes para confirmar que el circuito completo quedó coherente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
