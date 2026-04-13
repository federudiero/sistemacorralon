import useCollectionSubscription from './useCollectionSubscription';
import { subscribeAjustesStock } from '../services/ajustesStock.service';

export default function useAjustesStock(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeAjustesStock(cuentaId, filters, onData) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
