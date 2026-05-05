import useCollectionSubscription from './useCollectionSubscription';
import { subscribeProveedores } from '../services/proveedores.service';

export default function useProveedores(cuentaId) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeProveedores(cuentaId, onData, onError) : () => {}),
    [cuentaId],
  );
}
