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
          <div className="flex h-full flex-col page-section-body sidebar-panel-body">
            <div className="flex items-start justify-between gap-3">
              <div className="app-account-card flex-1 min-w-0">
                <div className="app-eyebrow">Cuenta activa</div>
                <div className="app-account-title">{cuentaNombre || 'Corralón'}</div>
                <div className="app-account-meta">{cuentaId || 'Sin ID definido'}</div>

                <div className="mt-4 grid gap-2.5 text-sm">
                  <div className="app-account-row">
                    <span className="app-muted-text">Rol</span>
                    <span className="app-chip">{security.role}</span>
                  </div>

                  <div className="app-account-row">
                    <span className="app-muted-text">Usuario</span>
                    <span className="app-chip max-w-[62%] truncate">{user?.name || 'N/D'}</span>
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

            <div className="mt-5 app-nav-shell">
              <div className="app-eyebrow px-1">Navegación</div>

              <nav className="mt-3 space-y-1 overflow-y-auto pr-1 xl:pr-0">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}

              </nav>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
