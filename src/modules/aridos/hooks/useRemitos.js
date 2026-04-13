import useCollectionSubscription from './useCollectionSubscription';
import { subscribeRemitos } from '../services/remitos.service';

export default function useRemitos(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeRemitos(cuentaId, filters, onData) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
