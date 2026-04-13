import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';
import { useAridosSecurity } from '../../modules/aridos/hooks/useAridosSecurity';
import { buildAridosNavItems } from '../../modules/aridos/utils/navigation';

export default function Sidebar() {
  const { user } = useAuth();
  const { cuentaId, cuentaNombre } = useCuenta();
  const security = useAridosSecurity(cuentaId, user?.email);
  const navItems = buildAridosNavItems(security.permissions);

  return (
    <aside className="page-section h-fit xl:sticky xl:top-24">
      <div className="page-section-body">
        <div className="rounded-3xl border border-sky-500/20 bg-sky-500/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-100/80">Cuenta activa</div>
          <div className="mt-2 text-2xl font-semibold text-white">{cuentaNombre || 'Corralón'}</div>
          <div className="mt-1 text-sm text-slate-200">{cuentaId || 'Sin ID definido'}</div>
          <div className="mt-4 grid gap-2 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3"><span>Rol</span><span className="badge-soft">{security.role}</span></div>
            <div className="flex items-center justify-between gap-3"><span>Usuario</span><span className="badge-soft">{user?.name || 'N/D'}</span></div>
          </div>
        </div>

        <nav className="mt-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {!security.hasAccess ? (
            <NavLink to="/setup" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              Inicialización
            </NavLink>
          ) : null}
        </nav>
      </div>
    </aside>
  );
}
