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
    setSendingReset(true);

    try {
      await resetPassword(form.email);
      setNotice('Te enviamos un email para recuperar la contraseña. Revisá también spam o promociones.');
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

      <div className="auth-grid">
        <section className="auth-hero">
          <div className="space-y-6">
            <span className="auth-brand">Acceso por usuario</span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
                Ingresá con tu email y contraseña. La cuenta del corralón se carga sola.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                El alta del usuario queda separada del acceso. Cada usuario mantiene asociada su cuenta y su perfil.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Ingreso</div><div className="mt-2 text-lg font-semibold text-white">Email + contraseña</div><div className="mt-1 text-sm text-slate-300">Sin volver a cargar la cuenta manualmente.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Cuenta</div><div className="mt-2 text-lg font-semibold text-white">Asociada al usuario</div><div className="mt-1 text-sm text-slate-300">Se restaura al iniciar sesión.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Recuperación</div><div className="mt-2 text-lg font-semibold text-white">Reset por email</div><div className="mt-1 text-sm text-slate-300">Podés pedir cambio de contraseña desde esta pantalla.</div></div>
          </div>
        </section>

        <section className="auth-card">
          <div className="space-y-2">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">Acceso</div>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">Iniciar sesión</h2>
            <p className="text-sm text-slate-300">
              Entrá con el usuario ya registrado. Si la cuenta es vieja y todavía no quedó vinculada, después podés sincronizarla en Setup.
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

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="btn btn-link btn-sm px-0"
                onClick={handleResetPassword}
                disabled={saving || isInitializing || sendingReset}
              >
                {sendingReset ? 'Enviando...' : 'Olvidé mi contraseña'}
              </button>
            </div>

            <button type="submit" className="w-full h-12 text-base btn btn-primary" disabled={saving || isInitializing || sendingReset}>
              {saving || isInitializing ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <div className="pt-5 mt-6 border-t border-base-300/70 text-sm text-slate-300">
            ¿Todavía no tenés usuario?{' '}
            <Link to="/registro" className="font-medium link link-hover text-primary">
              Crear usuario
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
