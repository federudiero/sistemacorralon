import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { cuentaId, cuentaNombre } = useCuenta();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="app-container py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link to="/aridos" className="text-2xl font-semibold tracking-tight text-white hover:text-primary">
              Sistema Corralón
            </Link>
            <p className="mt-1 text-sm text-slate-400">Operación de áridos y control de stock por cuenta de corralón.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-400">Cuenta activa</div>
              <div className="mt-1 text-sm font-medium text-white">{cuentaNombre || cuentaId || 'Sin cuenta seleccionada'}</div>
              <div className="text-xs text-slate-400">{cuentaId || '-'}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <div className="text-sm font-medium text-white">{user?.name || 'Usuario'}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>

            <button className="btn btn-sm btn-outline h-11 px-5" onClick={logout}>Salir</button>
          </div>
        </div>
      </div>
    </header>
  );
}
