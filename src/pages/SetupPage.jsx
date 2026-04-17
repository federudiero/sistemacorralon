import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCuenta } from '../contexts/CuentaContext';
import { useAridosSecurity } from '../modules/aridos/hooks/useAridosSecurity';
import { seedAccessConfig, seedSampleData } from '../setup/setupSeeds';

function formatRoleLabel(role) {
  switch (role) {
    case 'admin_full':
      return 'Administrador principal';
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
      setMessage('La cuenta quedó verificada correctamente. Si el estado no cambia al instante, recargá la pantalla.');
    } catch (err) {
      setError(err?.message || 'No se pudo verificar el acceso de la cuenta.');
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
      setMessage('Los datos de ejemplo se cargaron correctamente. Ya podés recorrer el circuito completo del sistema.');
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
          <h1 className="page-title">Falta definir la cuenta</h1>
          <p className="page-subtitle">
            Volvé al inicio de sesión y confirmá el ID del corralón antes de continuar.
          </p>
        </div>
      </div>
    );
  }

  const ready = security.hasAccess && !security.loading;

  return (
    <div className="space-y-6">
      <div className="page-section">
        <div className="page-section-body space-y-6">
          <div className="space-y-2">
            <div className="app-eyebrow">Configuración inicial</div>
            <h1 className="page-title">Preparar la cuenta para empezar</h1>
            <p className="page-subtitle">
              Desde acá confirmás que la cuenta quedó lista y, si todavía está vacía, cargás una base de ejemplo para recorrer el sistema.
            </p>
          </div>

          <div className={`app-status-banner ${ready ? 'is-success' : 'is-warning'}`}>
            <div>
              <div className="app-eyebrow !mb-2">Estado actual</div>
              <div className="text-base font-semibold app-title-text">
                {security.loading
                  ? 'Verificando acceso...'
                  : ready
                    ? 'La cuenta ya está lista para empezar.'
                    : 'Todavía falta confirmar el acceso de la cuenta.'}
              </div>
              <p className="mt-2 text-sm app-soft-text">
                {security.loading
                  ? 'Estamos revisando el perfil y los permisos del usuario actual.'
                  : ready
                    ? 'Ya podés pasar directo a productos, reposición, ventas, agenda y reportes.'
                    : 'Usá “Verificar cuenta” una sola vez si el usuario entró bien pero la cuenta todavía figura sin permisos.'}
              </p>
            </div>
            <span className="app-chip">{security.loading ? 'Verificando' : formatRoleLabel(security.role)}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="kpi-card">
              <div className="app-eyebrow">Usuario</div>
              <div className="mt-2 text-lg font-semibold app-title-text break-all">{user?.email || '-'}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Cuenta</div>
              <div className="mt-2 text-lg font-semibold app-title-text">{cuentaId}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Nombre comercial</div>
              <div className="mt-2 text-lg font-semibold app-title-text">{cuentaNombre || 'Sin nombre comercial'}</div>
            </div>
            <div className="kpi-card">
              <div className="app-eyebrow">Rol detectado</div>
              <div className="mt-2 text-lg font-semibold app-title-text">
                {security.loading ? 'Cargando...' : formatRoleLabel(security.role)}
              </div>
            </div>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="page-section">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold app-title-text">Verificar cuenta</div>
                  <p className="mt-1 text-sm app-soft-text">
                    Confirma la vinculación del usuario principal con la cuenta y actualiza el acceso básico si hace falta.
                  </p>
                </div>
                <ul className="app-bullet-list">
                  <li>Usalo solo si entrás al sistema pero alguna pantalla sigue figurando sin acceso.</li>
                  <li>No borra datos ni modifica ventas, stock, clientes o productos.</li>
                </ul>
                <button
                  className="btn btn-primary h-11 w-full"
                  onClick={handleRepairAccess}
                  disabled={loading || security.loading || !user?.email || !cuentaId}
                >
                  Verificar cuenta
                </button>
              </div>
            </div>

            <div className="page-section">
              <div className="page-section-body space-y-4">
                <div>
                  <div className="text-sm font-semibold app-title-text">Cargar datos de ejemplo</div>
                  <p className="mt-1 text-sm app-soft-text">
                    Carga una base simple para demo o pruebas: productos, un cliente y un proveedor de ejemplo.
                  </p>
                </div>
                <ul className="app-bullet-list">
                  <li>Recomendado para demos, pruebas internas o cuentas nuevas.</li>
                  <li>Si ya cargaste tus datos reales, no hace falta volver a usarlo.</li>
                </ul>
                <button
                  className="btn btn-outline h-11 w-full"
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
