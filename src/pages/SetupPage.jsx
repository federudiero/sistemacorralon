import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useAridosSecurity } from '../modules/aridos/hooks/useAridosSecurity';
import { seedAccessConfig, seedSampleData } from '../setup/setupSeeds';

export default function SetupPage() {
  const { user } = useAuth();
  const { cuentaId, cuentaNombre, hasCuenta } = useCuenta();
  const security = useAridosSecurity(cuentaId, user?.email);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSeedAccess() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await seedAccessConfig(cuentaId, user?.email, cuentaNombre);
      setMessage('Cuenta inicializada correctamente. Ya podés administrar este corralón.');
    } catch (err) {
      setError(err.message || 'No se pudo crear el acceso.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedData() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await seedSampleData(cuentaId, user?.email);
      setMessage('Base inicial cargada correctamente. Ya podés empezar a cargar reposición y ventas.');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  }

  if (!hasCuenta) {
    return (
      <div className="page-section">
        <div className="page-section-body space-y-4">
          <h1 className="page-title">Falta definir la cuenta</h1>
          <p className="page-subtitle">Volvé al login y cargá el ID del corralón antes de inicializar la base.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-section">
        <div className="page-section-body space-y-6">
          <div>
            <h1 className="page-title">Inicialización del corralón</h1>
            <p className="page-subtitle">Creá el owner de la cuenta y cargá una base inicial de productos, clientes y proveedores.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="kpi-card"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Email actual</div><div className="mt-2 break-all text-lg font-semibold text-white">{user?.email || '-'}</div></div>
            <div className="kpi-card"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Cuenta ID</div><div className="mt-2 text-lg font-semibold text-white">{cuentaId}</div></div>
            <div className="kpi-card"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Corralón</div><div className="mt-2 text-lg font-semibold text-white">{cuentaNombre || 'Sin nombre comercial'}</div></div>
            <div className="kpi-card"><div className="text-xs uppercase tracking-[0.14em] text-slate-400">Rol</div><div className="mt-2 text-lg font-semibold text-white">{security.role}</div></div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="page-section">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold text-white">Crear owner y configuración base</div>
                  <p className="mt-1 text-sm text-slate-300">Registra esta cuenta, habilita tu usuario y deja lista la estructura inicial.</p>
                </div>
                <button className="btn btn-primary h-11 w-full" onClick={handleSeedAccess} disabled={loading || !user?.email || !cuentaId}>Inicializar cuenta</button>
              </div>
            </div>

            <div className="page-section">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold text-white">Cargar base inicial</div>
                  <p className="mt-1 text-sm text-slate-300">Genera productos de ejemplo por m³ y bolsas, más un cliente y un proveedor para arrancar.</p>
                </div>
                <button className="btn btn-outline h-11 w-full" onClick={handleSeedData} disabled={loading || !user?.email || !cuentaId}>Cargar datos iniciales</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
