import useCollectionSubscription from './useCollectionSubscription';
import { subscribeMovimientosStock } from '../services/movimientosStock.service';

export default function useMovimientosStock(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeMovimientosStock(cuentaId, filters, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
