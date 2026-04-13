import useCollectionSubscription from './useCollectionSubscription';
import { subscribeMovimientosStock } from '../services/movimientosStock.service';

export default function useMovimientosStock(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeMovimientosStock(cuentaId, filters, onData) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
