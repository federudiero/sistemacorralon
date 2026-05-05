import useCollectionSubscription from './useCollectionSubscription';
import { subscribeAjustesStock } from '../services/ajustesStock.service';

export default function useAjustesStock(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeAjustesStock(cuentaId, filters, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
