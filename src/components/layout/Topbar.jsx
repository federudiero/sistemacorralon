import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';
import { useThemeMode } from '../../contexts/ThemeContext';

function getScreenTitle(pathname) {
  if (pathname.startsWith('/aridos/ventas')) return 'Ventas';
  if (pathname.startsWith('/aridos/ingresos')) return 'Reposición';
  if (pathname.startsWith('/aridos/cierre-caja')) return 'Cierre';
  if (pathname.startsWith('/aridos/productos')) return 'Productos';
  if (pathname.startsWith('/aridos/clientes')) return 'Clientes';
  if (pathname.startsWith('/aridos/movimientos')) return 'Movimientos';
  if (pathname.startsWith('/aridos/reportes')) return 'Reportes';
  if (pathname.startsWith('/aridos')) return 'Dashboard';
  return 'Sistema Corralón';
}

export default function Topbar({ onOpenMenu, mobileSidebarOpen }) {
  const { user, logout } = useAuth();
  const { cuentaId, cuentaNombre } = useCuenta();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const screenTitle = getScreenTitle(location.pathname);
  const isVentas = location.pathname.startsWith('/aridos/ventas');

  return (
    <header className="topbar-shell">
      <div className="py-3 app-container md:py-4">
        <div className="topbar-compact-row">
          <div className="flex items-center min-w-0 gap-3">
            <button
              type="button"
              className="btn btn-square btn-outline btn-sm topbar-mobile-btn xl:hidden"
              onClick={onOpenMenu}
              aria-label={mobileSidebarOpen ? 'Menú abierto' : 'Abrir menú'}
            >
              ☰
            </button>

            <div className="min-w-0">
              <div className="topbar-screen-title">{screenTitle}</div>
              <p className="hidden topbar-screen-subtitle sm:block">
                {cuentaNombre || cuentaId || 'Sin cuenta seleccionada'}
              </p>
            </div>
          </div>

          <div className="topbar-mobile-actions">
            {!isVentas ? (
              <Link to="/aridos/ventas" className="h-10 px-3 btn btn-primary btn-sm xl:hidden">
                + Venta
              </Link>
            ) : null}

            <button
              type="button"
              className="theme-toggle-btn topbar-theme-btn"
              onClick={toggleMode}
              aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span>{mode === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            <button className="h-10 px-2 btn btn-ghost btn-sm sm:px-3" onClick={logout}>
              Salir
            </button>
          </div>
        </div>

        <div className="hidden topbar-desktop-row md:flex">
          <div className="topbar-info-card user-card">
            <div className="text-sm font-medium text-white truncate">{user?.name || 'Usuario'}</div>
            <div className="text-xs truncate text-slate-400">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}