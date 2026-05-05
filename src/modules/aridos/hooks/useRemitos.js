import useCollectionSubscription from './useCollectionSubscription';
import { subscribeRemitos } from '../services/remitos.service';

export default function useRemitos(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeRemitos(cuentaId, filters, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
