import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useAridosSecurity } from '../modules/aridos/hooks/useAridosSecurity';
import { seedAccessConfig, seedSampleData } from '../setup/setupSeeds';

function formatRoleLabel(role) {
  switch (role) {
    case 'admin_full':
      return 'Administrador completo';
    case 'admin':
      return 'Administrador';
    case 'operador':
      return 'Operador';
    case 'vendedor':
      return 'Vendedor';
    case 'solo_lectura':
      return 'Solo lectura';
    default:
      return 'Sin acceso';
  }
}

export default function SetupPage() {
  const { user } = useAuth();
  const { cuentaId, cuentaNombre, hasCuenta } = useCuenta();
  const security = useAridosSecurity(cuentaId, user?.email);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleRepairAccess() {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await seedAccessConfig(cuentaId, user?.email, cuentaNombre, user?.name);
      setMessage('El acceso de la cuenta quedó actualizado. Si el rol no cambió, recargá la pantalla.');
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el acceso de la cuenta.');
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
      setMessage('La base inicial se cargó correctamente. Ya podés empezar a trabajar.');
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  }

  if (!hasCuenta) {
    return (
      <div className="page-section">
        <div className="page-section-body space-y-4">
          <div className="app-eyebrow">Preparación inicial</div>
          <h1 className="page-title">Falta definir la cuenta</h1>
          <p className="page-subtitle">
            Volvé al login y cargá el ID del corralón antes de continuar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-section">
        <div className="page-section-body space-y-6">
          <div>
            <div className="app-eyebrow">Preparación inicial</div>
            <h1 className="page-title">Dejá listo el sistema para empezar</h1>
            <p className="page-subtitle">
              Desde acá verificás el acceso actual y cargás una base simple para arrancar sin perder tiempo.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="kpi-card">
              <div className="app-eyebrow">Usuario</div>
              <div className="mt-2 break-all text-base font-semibold app-title-text">{user?.email || '-'}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Cuenta ID</div>
              <div className="mt-2 text-base font-semibold app-title-text">{cuentaId}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Corralón</div>
              <div className="mt-2 text-base font-semibold app-title-text">{cuentaNombre || 'Sin nombre comercial'}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Acceso actual</div>
              <div className="mt-2 text-base font-semibold app-title-text">
                {security.loading ? 'Cargando...' : formatRoleLabel(security.role)}
              </div>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="page-section app-soft-panel">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold app-title-text">Actualizar acceso</div>
                  <p className="mt-1 text-sm app-muted-text">
                    Usalo si el usuario ya ingresó pero todavía no quedó vinculado correctamente a la cuenta.
                  </p>
                </div>
                <button
                  className="btn btn-primary h-12 w-full"
                  onClick={handleRepairAccess}
                  disabled={loading || security.loading || !user?.email || !cuentaId}
                >
                  Verificar acceso de la cuenta
                </button>
              </div>
            </div>

            <div className="page-section app-soft-panel">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold app-title-text">Cargar base inicial</div>
                  <p className="mt-1 text-sm app-muted-text">
                    Genera productos, un cliente y un proveedor para que el cliente pueda probar el flujo real.
                  </p>
                </div>
                <button
                  className="btn btn-outline h-12 w-full"
                  onClick={handleSeedData}
                  disabled={loading || security.loading || !security.hasAccess || !user?.email || !cuentaId}
                >
                  Cargar datos de ejemplo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
