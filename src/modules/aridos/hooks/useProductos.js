import useCollectionSubscription from './useCollectionSubscription';
import { subscribeProductos } from '../services/productos.service';

export default function useProductos(cuentaId) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeProductos(cuentaId, onData, onError) : () => {}),
    [cuentaId],
  );
}
