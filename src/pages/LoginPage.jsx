import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useThemeMode } from '../contexts/ThemeContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { cuentaId, cuentaNombre, setCuenta } = useCuenta();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/aridos';

  const [form, setForm] = useState({
    name: '',
    email: '',
    cuentaId: cuentaId || '',
    cuentaNombre: cuentaNombre || '',
  });
  const [error, setError] = useState('');

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      if (!String(form.cuentaId || '').trim()) {
        throw new Error('Ingresá el ID del corralón o cuenta.');
      }

      setCuenta({ cuentaId: form.cuentaId, cuentaNombre: form.cuentaNombre });
      login({ name: form.name, email: form.email });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo iniciar.');
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
            <span className="auth-brand">Software multi-corralón</span>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
                Cada corralón entra con su propia cuenta y administra productos, reposición y ventas.
              </h1>
              <p className="max-w-2xl text-sm md:text-base text-slate-300">
                Modelo pensado para áridos a granel, bolsas y ventas por retiro o envío.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Productos</div><div className="mt-2 text-lg font-semibold text-white">m³, unidad y bolsa</div><div className="mt-1 text-sm text-slate-300">Rango de bolsas de 1 a 25 kg.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Reposición</div><div className="mt-2 text-lg font-semibold text-white">Batea, big bag y chasis</div><div className="mt-1 text-sm text-slate-300">Ingreso directo al stock del producto.</div></div>
            <div className="auth-kpi"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Ventas</div><div className="mt-2 text-lg font-semibold text-white">Retiro o envío</div><div className="mt-1 text-sm text-slate-300">Con remitos y movimientos auditados.</div></div>
          </div>
        </section>

        <section className="auth-card">
          <div className="space-y-2">
            <div className="text-sm font-medium uppercase tracking-[0.14em] text-slate-400">Acceso</div>
            <h2 className="text-2xl font-semibold text-white md:text-3xl">Ingresar al sistema</h2>
            <p className="text-sm text-slate-300">Indicá el corralón que vas a administrar y tus datos de acceso.</p>
          </div>

          {error ? <div className="mt-6 alert alert-error">{error}</div> : null}

          <form className="mt-6 space-y-4 md:space-y-5" onSubmit={handleSubmit}>
            <label className="w-full form-control"><span className="field-label">ID del corralón / cuenta</span><input className="h-12 input input-bordered" name="cuentaId" value={form.cuentaId} onChange={handleChange} placeholder="aridos-cajus" autoComplete="off" /></label>
            <label className="w-full form-control"><span className="field-label">Nombre comercial</span><input className="h-12 input input-bordered" name="cuentaNombre" value={form.cuentaNombre} onChange={handleChange} placeholder="Áridos Cajus" /></label>
            <label className="w-full form-control"><span className="field-label">Nombre</span><input className="h-12 input input-bordered" name="name" value={form.name} onChange={handleChange} placeholder="Administrador / Operador" /></label>
            <label className="w-full form-control"><span className="field-label">Email</span><input className="h-12 input input-bordered" name="email" value={form.email} onChange={handleChange} placeholder="admin@corralon.com" autoComplete="email" /></label>
            <button type="submit" className="w-full h-12 text-base btn btn-primary">Entrar</button>
          </form>
        </section>
      </div>
    </div>
  );
}
