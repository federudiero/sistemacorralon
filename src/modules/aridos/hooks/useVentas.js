import useCollectionSubscription from './useCollectionSubscription';
import { subscribeVentas } from '../services/ventas.service';

export default function useVentas(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeVentas(cuentaId, filters, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
