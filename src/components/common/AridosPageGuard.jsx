import AridosGate from '../../modules/aridos/security/AridosGate';
import { useAuth } from '../../contexts/AuthContext';
import { useCuenta } from '../../contexts/CuentaContext';

export default function AridosPageGuard({ PageComponent, section, action }) {
  const { user } = useAuth();
  const { cuentaId } = useCuenta();

  return (
    <AridosGate cuentaId={cuentaId} currentUserEmail={user?.email} section={section} action={action}>
      {(security) => (
        <PageComponent
          cuentaId={cuentaId}
          currentUserEmail={user?.email}
          security={security}
        />
      )}
    </AridosGate>
  );
}
