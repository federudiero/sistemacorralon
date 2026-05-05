import { collection, doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { REMITO_ESTADOS, VENTA_ESTADOS } from '../utils/constants';
import { subscribeCollection } from './base';

export async function createRemitoDesdeVenta(cuentaId, ventaId, payload, userEmail) {
  const ventaRef = doc(db, `cuentas/${cuentaId}/ventas/${ventaId}`);
  const remitosRef = collection(db, `cuentas/${cuentaId}/remitos`);
  const remitoRef = doc(remitosRef);
  const contadorRef = doc(db, `cuentas/${cuentaId}/config/remitosCounter`);

  await runTransaction(db, async (tx) => {
    const ventaSnap = await tx.get(ventaRef);
    if (!ventaSnap.exists()) throw new Error('Venta inexistente.');

    const venta = ventaSnap.data();
    if (venta.estado === VENTA_ESTADOS.ANULADA) {
      throw new Error('No se puede generar remito para una venta anulada.');
    }

    if (venta.remitoGenerado || venta.remitoId) {
      throw new Error('La venta ya tiene remito.');
    }

    const contadorSnap = await tx.get(contadorRef);
    const ultimo = contadorSnap.exists() ? contadorSnap.data().ultimo : 0;
    const nuevoNumero = ultimo + 1;
    tx.set(contadorRef, { ultimo: nuevoNumero });

    tx.set(remitoRef, {
      numeroRemito: String(nuevoNumero).padStart(4, '0'),
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
  const validEstados = Object.values(REMITO_ESTADOS);
  if (!validEstados.includes(estado)) {
    throw new Error(`Estado de remito inválido: ${estado}.`);
  }
  await updateDoc(doc(db, `cuentas/${cuentaId}/remitos/${remitoId}`), {
    estado,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail || null,
  });
}

export function subscribeRemitos(cuentaId, filters, callback, onError) {
  return subscribeCollection(cuentaId, 'remitos', callback, {
    orderBy: [{ field: 'fecha', direction: 'desc' }],
    limit: filters?.limit || 100,
  }, onError);
}
