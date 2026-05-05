import useCollectionSubscription from './useCollectionSubscription';
import { subscribeIngresosCamion } from '../services/ingresosCamion.service';

export default function useIngresosCamion(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData, onError) => (cuentaId ? subscribeIngresosCamion(cuentaId, filters, onData, onError) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
