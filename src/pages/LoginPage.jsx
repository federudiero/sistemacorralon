import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useThemeMode } from '../contexts/ThemeContext';

export default function LoginPage() {
  const { login, resetPassword, isAuthenticated, isInitializing } = useAuth();
  const { setCuenta } = useCuenta();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/aridos';

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  if (!isInitializing && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const sessionUser = await login(form);
      setCuenta({
        cuentaId: sessionUser?.cuentaId,
        cuentaNombre: sessionUser?.cuentaNombre,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    setError('');
    setNotice('');

    try {
      setSendingReset(true);
      await resetPassword(form.email);
      setNotice('Te enviamos un email para restablecer la contraseña.');
    } catch (err) {
      setError(err.message || 'No se pudo enviar el email de recuperación.');
    } finally {
      setSendingReset(false);
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

      <div className="auth-grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="auth-hero md:block">
          <div className="space-y-6">
            <span className="auth-brand">Acceso operativo</span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight app-title-text md:text-5xl">
                Entrá rápido y retomá el trabajo del día desde cualquier celular.
              </h1>
              <p className="max-w-2xl text-sm md:text-base app-soft-text">
                La cuenta del corralón se recupera automáticamente y el usuario entra directo al panel operativo.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="auth-kpi">
              <div className="app-eyebrow">Acceso</div>
              <div className="mt-2 text-lg font-semibold app-title-text">Email y contraseña</div>
              <div className="mt-1 text-sm app-soft-text">Sin volver a cargar la cuenta manualmente.</div>
            </div>
            <div className="auth-kpi">
              <div className="app-eyebrow">Cuenta</div>
              <div className="mt-2 text-lg font-semibold app-title-text">Restauración automática</div>
              <div className="mt-1 text-sm app-soft-text">Al iniciar, se recupera el corralón asociado al usuario.</div>
            </div>
            <div className="auth-kpi">
              <div className="app-eyebrow">Soporte</div>
              <div className="mt-2 text-lg font-semibold app-title-text">Recuperación por email</div>
              <div className="mt-1 text-sm app-soft-text">Podés restablecer la contraseña sin tocar configuración técnica.</div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="space-y-2">
            <div className="app-eyebrow">Ingreso</div>
            <h2 className="text-2xl font-semibold app-title-text md:text-3xl">Iniciar sesión</h2>
            <p className="text-sm app-soft-text">
              Entrá con tu usuario actual. Si todavía no existe, primero creá la cuenta principal.
            </p>
          </div>

          {error ? <div className="mt-6 alert alert-error">{error}</div> : null}
          {notice ? <div className="mt-6 alert alert-success">{notice}</div> : null}

          <form className="mt-6 space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <label className="w-full form-control">
              <span className="field-label">Email</span>
              <input
                className="h-12 input input-bordered"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@corralon.com"
                autoComplete="email"
                disabled={saving || isInitializing || sendingReset}
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
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={saving || isInitializing || sendingReset}
              />
            </label>

            <button type="submit" className="w-full h-12 text-base btn btn-primary" disabled={saving || isInitializing || sendingReset}>
              {saving || isInitializing ? 'Ingresando...' : 'Entrar al sistema'}
            </button>
          </form>

          <button
            type="button"
            className="mt-4 btn btn-link px-0 text-sm normal-case"
            onClick={handleResetPassword}
            disabled={saving || isInitializing || sendingReset}
          >
            {sendingReset ? 'Enviando…' : 'Recuperar contraseña'}
          </button>

          <div className="auth-note-card mt-6">
            <div className="text-sm font-semibold app-title-text">Primera vez</div>
            <p className="mt-1 text-sm app-soft-text">
              Si todavía no existe el usuario principal del corralón, crealo una sola vez y después entrá normalmente.
            </p>
          </div>

          <div className="pt-5 mt-6 border-t border-base-300/70 text-sm app-soft-text">
            ¿Todavía no tenés usuario?{' '}
            <Link to="/registro" className="font-medium link link-hover text-primary">
              Crear cuenta principal
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
