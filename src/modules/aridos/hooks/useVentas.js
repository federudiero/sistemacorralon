import useCollectionSubscription from './useCollectionSubscription';
import { subscribeVentas } from '../services/ventas.service';

export default function useVentas(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeVentas(cuentaId, filters, onData) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
