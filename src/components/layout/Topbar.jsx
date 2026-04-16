import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';
import { useThemeMode } from '../../contexts/ThemeContext';

function getScreenTitle(pathname) {
  if (pathname.startsWith('/aridos/ventas')) return 'Ventas';
  if (pathname.startsWith('/aridos/agenda')) return 'Agenda';
  if (pathname.startsWith('/aridos/ingresos')) return 'Reposición';
  if (pathname.startsWith('/aridos/cierre-caja')) return 'Cierre';
  if (pathname.startsWith('/aridos/productos')) return 'Productos';
  if (pathname.startsWith('/aridos/clientes')) return 'Clientes';
  if (pathname.startsWith('/aridos/proveedores')) return 'Proveedores';
  if (pathname.startsWith('/aridos/movimientos')) return 'Movimientos';
  if (pathname.startsWith('/aridos/remitos')) return 'Remitos';
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

  return (
    <header className="topbar-shell">
      <div className="app-container py-3 md:py-4">
        <div className="topbar-compact-row">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="btn btn-square btn-outline btn-sm topbar-mobile-btn xl:hidden"
              onClick={onOpenMenu}
              aria-label={mobileSidebarOpen ? 'Menú abierto' : 'Abrir menú'}
            >
              ☰
            </button>

            <div className="min-w-0">
              <div className="app-eyebrow">Cuenta activa</div>
              <div className="topbar-screen-title">{screenTitle}</div>
              <p className="topbar-screen-subtitle truncate">
                {cuentaNombre || cuentaId || 'Sin cuenta seleccionada'}
              </p>
            </div>
          </div>

          <div className="topbar-mobile-actions">
            <button
              type="button"
              className="theme-toggle-btn topbar-theme-btn"
              onClick={toggleMode}
              aria-label={mode === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              <span>{mode === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            <button className="btn btn-ghost btn-sm h-10 px-3" onClick={logout}>
              Salir
            </button>
          </div>
        </div>

        <div className="topbar-desktop-row">
          <div className="topbar-info-card user-card">
            <div className="text-xs app-muted-text">Usuario actual</div>
            <div className="mt-1 text-sm font-semibold app-title-text truncate">{user?.name || 'Usuario'}</div>
            <div className="text-xs app-muted-text truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
