import useCollectionSubscription from './useCollectionSubscription';
import { subscribeProductos } from '../services/productos.service';

export default function useProductos(cuentaId) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeProductos(cuentaId, onData) : () => {}),
    [cuentaId],
  );
}
