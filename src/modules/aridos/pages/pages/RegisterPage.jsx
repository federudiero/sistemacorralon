import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useThemeMode } from '../contexts/ThemeContext';

export default function RegisterPage() {
  const { register, isAuthenticated, isInitializing } = useAuth();
  const { setCuenta } = useCuenta();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/aridos';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cuentaId: '',
    cuentaNombre: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('La confirmación de contraseña no coincide.');
      return;
    }

    setSaving(true);

    try {
      const sessionUser = await register(form);
      setCuenta({
        cuentaId: sessionUser?.cuentaId,
        cuentaNombre: sessionUser?.cuentaNombre,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo crear el usuario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <span className="auth-brand">Sistema Corralón</span>
        <button type="button" className="theme-toggle-btn" onClick={toggleMode}>
          <span className="text-base">{mode === 'dark' ? '☀️' : '🌙'}</span>
          <span>{mode === 'dark' ? 'Claro' : 'Oscuro'}</span>
        </button>
      </div>

      <div className="auth-grid">
        <section className="auth-hero">
          <div className="space-y-6">
            <span className="auth-brand">Alta inicial</span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
                Creá el usuario owner del corralón y dejá la cuenta vinculada desde el inicio.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                El registro crea el usuario en Firebase Auth, su perfil operativo y la vinculación con la cuenta.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Usuario</div><div className="mt-2 text-lg font-semibold text-white">Owner inicial</div><div className="mt-1 text-sm text-slate-300">Queda listo para administrar la cuenta.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Cuenta</div><div className="mt-2 text-lg font-semibold text-white">Creación segura</div><div className="mt-1 text-sm text-slate-300">No permite tomar una cuenta que ya tenga otro owner.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Acceso</div><div className="mt-2 text-lg font-semibold text-white">Perfil + vínculo</div><div className="mt-1 text-sm text-slate-300">También crea la relación del usuario con el corralón.</div></div>
          </div>
        </section>

        <section className="auth-card">
          <div className="space-y-2">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">Registro</div>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">Crear usuario owner</h2>
            <p className="text-sm text-slate-300">
              Usalo solo para el alta inicial de una cuenta nueva o para adoptar una cuenta vieja que todavía no tenga owner vinculado.
            </p>
          </div>

          {error ? <div className="mt-6 alert alert-error">{error}</div> : null}

          <form className="mt-6 space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <label className="w-full form-control">
              <span className="field-label">ID del corralón / cuenta</span>
              <input
                className="h-12 input input-bordered"
                name="cuentaId"
                value={form.cuentaId}
                onChange={handleChange}
                placeholder="aridos-cajus"
                autoComplete="off"
                disabled={saving || isInitializing}
              />
            </label>

            <label className="w-full form-control">
              <span className="field-label">Nombre comercial</span>
              <input
                className="h-12 input input-bordered"
                name="cuentaNombre"
                value={form.cuentaNombre}
                onChange={handleChange}
                placeholder="Áridos Cajus"
                disabled={saving || isInitializing}
              />
            </label>

            <label className="w-full form-control">
              <span className="field-label">Nombre</span>
              <input
                className="h-12 input input-bordered"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Administrador / Operador"
                disabled={saving || isInitializing}
              />
            </label>

            <label className="w-full form-control">
              <span className="field-label">Email</span>
              <input
                className="h-12 input input-bordered"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@corralon.com"
                autoComplete="email"
                disabled={saving || isInitializing}
              />
            </label>

            <label className="w-full form-control">
              <span className="field-label">Contraseña</span>
              <input
                type="password"
                className="h-12 input input-bordered"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                disabled={saving || isInitializing}
              />
            </label>

            <label className="w-full form-control">
              <span className="field-label">Confirmar contraseña</span>
              <input
                type="password"
                className="h-12 input input-bordered"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                disabled={saving || isInitializing}
              />
            </label>

            <button type="submit" className="w-full h-12 text-base btn btn-primary" disabled={saving || isInitializing}>
              {saving || isInitializing ? 'Creando...' : 'Crear usuario'}
            </button>
          </form>

          <div className="pt-5 mt-6 border-t border-base-300/70 text-sm text-slate-300">
            ¿Ya tenés usuario?{' '}
            <Link to="/login" className="font-medium link link-hover text-primary">
              Ir al login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
