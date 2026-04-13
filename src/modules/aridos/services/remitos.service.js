import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { REMITO_ESTADOS } from '../utils/constants';
import { subscribeCollection } from './base';

export async function createRemitoDesdeVenta(cuentaId, ventaId, payload, userEmail) {
  const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${ventaId}`);
  const ventaSnap = await getDoc(ventaRef);
  if (!ventaSnap.exists()) throw new Error('Venta inexistente.');
  const venta = ventaSnap.data();
  if (venta.remitoGenerado) throw new Error('La venta ya tiene remito.');

  const ref = await addDoc(collection(db, `cuentas/${cuentaId}/remitos`), {
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

  await updateDoc(ventaRef, {
    remitoGenerado: true,
    remitoId: ref.id,
    updatedAt: serverTimestamp(),
  });

  return ref.id;
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
