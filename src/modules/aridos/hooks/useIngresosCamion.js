import useCollectionSubscription from './useCollectionSubscription';
import { subscribeIngresosCamion } from '../services/ingresosCamion.service';

export default function useIngresosCamion(cuentaId, filters = {}) {
  return useCollectionSubscription(
    (onData) => (cuentaId ? subscribeIngresosCamion(cuentaId, filters, onData) : () => {}),
    [cuentaId, JSON.stringify(filters)],
  );
}
