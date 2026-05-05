import useCollectionSubscription from './useCollectionSubscription';
import { subscribeVentasAgenda } from '../services/ventas.service';

export default function useVentasAgenda(cuentaId, range = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeVentasAgenda(cuentaId, range, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(range)],
  );
}
