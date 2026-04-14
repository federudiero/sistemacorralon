import useCollectionSubscription from './useCollectionSubscription';
import { subscribeVentasAgenda } from '../services/ventas.service';

export default function useVentasAgenda(cuentaId, range = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeVentasAgenda(cuentaId, range, onData) : () => {}),
    [cuentaId, JSON.stringify(range)],
  );
}
