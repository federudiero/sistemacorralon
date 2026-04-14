import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';
import { useAridosSecurity } from '../../modules/aridos/hooks/useAridosSecurity';
import { buildAridosNavItems } from '../../modules/aridos/utils/navigation';

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user } = useAuth();
  const { cuentaId, cuentaNombre } = useCuenta();
  const security = useAridosSecurity(cuentaId, user?.email);
  const navItems = buildAridosNavItems(security.permissions);

  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar-panel ${open ? 'is-open' : ''}`}>
        <div className="h-full overflow-hidden page-section xl:sticky xl:top-24 xl:h-fit">
          <div className="flex flex-col h-full page-section-body">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0 p-4 border rounded-3xl border-sky-500/20 bg-sky-500/10">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/80">
                  Cuenta activa
                </div>

                <div className="mt-2 text-xl font-semibold text-white truncate xl:text-2xl">
                  {cuentaNombre || 'Corralón'}
                </div>

                <div className="mt-1 text-sm truncate text-slate-200">
                  {cuentaId || 'Sin ID definido'}
                </div>

                <div className="grid gap-2 mt-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span>Rol</span>
                    <span className="badge-soft">{security.role}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>Usuario</span>
                    <span className="badge-soft max-w-[55%] truncate">
                      {user?.name || 'N/D'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-circle btn-ghost xl:hidden"
                onClick={onClose}
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 xl:hidden">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Accesos rápidos
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/aridos/ventas"
                  onClick={onClose}
                  className="btn btn-primary btn-sm rounded-2xl"
                >
                  Venta
                </NavLink>

                <NavLink
                  to="/aridos/ingresos"
                  onClick={onClose}
                  className="btn btn-outline btn-sm rounded-2xl"
                >
                  Reposición
                </NavLink>

                <NavLink
                  to="/aridos/cierre-caja"
                  onClick={onClose}
                  className="btn btn-outline btn-sm rounded-2xl"
                >
                  Cierre
                </NavLink>

                <NavLink
                  to="/aridos"
                  onClick={onClose}
                  className="btn btn-outline btn-sm rounded-2xl"
                >
                  Dashboard
                </NavLink>
              </div>
            </div>

            <nav className="pr-1 mt-5 space-y-1 overflow-y-auto xl:pr-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center justify-between flex-1 min-w-0 gap-3">
                    <span className="truncate">{item.label}</span>
                    {item.isPrimary ? (
                      <span className="hidden badge-soft sm:inline-flex">rápido</span>
                    ) : null}
                  </div>
                </NavLink>
              ))}

              {!security.hasAccess ? (
                <NavLink
                  to="/setup"
                  onClick={onClose}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  Inicialización
                </NavLink>
              ) : null}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}