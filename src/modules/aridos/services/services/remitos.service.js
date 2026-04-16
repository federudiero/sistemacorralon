import { doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { REMITO_ESTADOS } from '../utils/constants';
import { subscribeCollection } from './base';

export async function createRemitoDesdeVenta(cuentaId, ventaId, payload, userEmail) {
  const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${ventaId}`);
  const remitoRef = doc(db, `cuentas/${cuentaId}/remitos/venta_${ventaId}`);

  await runTransaction(db, async (tx) => {
    const [ventaSnap, remitoSnap] = await Promise.all([
      tx.get(ventaRef),
      tx.get(remitoRef),
    ]);

    if (!ventaSnap.exists()) throw new Error('Venta inexistente.');
    if (remitoSnap.exists()) throw new Error('La venta ya tiene remito.');

    const venta = ventaSnap.data();
    if (venta.remitoGenerado || venta.remitoId) {
      throw new Error('La venta ya tiene remito.');
    }

    tx.set(remitoRef, {
      fecha: new Date(),
      fechaStr: venta.fechaStr,
      ventaId,
      clienteId: venta.clienteId || '',
      clienteNombre: venta.clienteNombre || '',
      telefono: venta.telefono || '',
      direccion: venta.direccion || '',
      productoId: venta.productoId || '',
      productoNombre: venta.productoNombre || '',
      cantidad: Number(venta.cantidad || 0),
      unidadStock: venta.unidadStock || 'm3',
      pesoBolsaKg: venta.pesoBolsaKg || null,
      estado: REMITO_ESTADOS.PENDIENTE,
      camion: payload?.camion || venta.vehiculoEntrega || '',
      chofer: payload?.chofer || '',
      observaciones: payload?.observaciones || '',
      createdAt: serverTimestamp(),
      createdBy: userEmail || null,
    });

    tx.update(ventaRef, {
      remitoGenerado: true,
      remitoId: remitoRef.id,
      updatedAt: serverTimestamp(),
    });
  });

  return remitoRef.id;
}

export async function updateRemitoEstado(cuentaId, remitoId, estado, userEmail) {
  await updateDoc(doc(db, `cuentas/${cuentaId}/remitos/${remitoId}`), {
    estado,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail || null,
  });
}

export function subscribeRemitos(cuentaId, filters, callback) {
  return subscribeCollection(cuentaId, 'remitos', callback, {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  });
}
