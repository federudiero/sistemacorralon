import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { mapQuerySnapshot } from '../utils/firestoreMappers';
import { MOVIMIENTO_CATEGORIAS } from '../utils/constants';

function inDateRange(item, filters = {}) {
  const d = item.fecha?.toDate ? item.fecha.toDate() : new Date(item.fecha);
  if (filters.fechaDesde) {
    const from = new Date(`${filters.fechaDesde}T00:00:00`);
    if (d < from) return false;
  }
  if (filters.fechaHasta) {
    const to = new Date(`${filters.fechaHasta}T23:59:59`);
    if (d > to) return false;
  }
  return true;
}

export function subscribeMovimientosStock(cuentaId, filters, callback) {
  const q = query(
    collection(db, `cuentas/${cuentaId}/movimientosStock`),
    orderBy('fecha', 'desc'),
    limit(filters?.limit || 300),
  );

  return onSnapshot(q, (snapshot) => {
    let items = mapQuerySnapshot(snapshot);
    if (filters?.tipo) items = items.filter((item) => item.tipo === filters.tipo);
    if (filters?.productoId) items = items.filter((item) => item.productoId === filters.productoId);
    if (filters?.categoria) {
      const categoria = MOVIMIENTO_CATEGORIAS.find((item) => item.value === filters.categoria);
      if (categoria) items = items.filter((item) => categoria.tipos.includes(item.tipo));
    }
    items = items.filter((item) => inDateRange(item, filters));
    callback(items);
  });
}
