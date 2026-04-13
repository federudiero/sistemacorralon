import useCollectionSubscription from './useCollectionSubscription';
import { subscribeBateas } from '../services/bateas.service';

export default function useBateas(cuentaId) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeBateas(cuentaId, onData) : () => {}),
    [cuentaId],
  );
}
