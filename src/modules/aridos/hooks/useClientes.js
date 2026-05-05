import useCollectionSubscription from './useCollectionSubscription';
import { subscribeClientes } from '../services/clientes.service';

export default function useClientes(cuentaId) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeClientes(cuentaId, onData, onError) : () => {}),
    [cuentaId],
  );
}
