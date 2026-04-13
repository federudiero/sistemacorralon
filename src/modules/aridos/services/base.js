import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';
import { mapDoc, mapQuerySnapshot } from '../utils/firestoreMappers';

export function cuentaPath(cuentaId) {
  return `cuentas/${cuentaId}`;
}

export function cuentaDocRef(cuentaId) {
  return doc(db, cuentaPath(cuentaId));
}

export function subcollectionRef(cuentaId, name) {
  return collection(db, `${cuentaPath(cuentaId)}/${name}`);
}

export function docRef(cuentaId, name, id) {
  return doc(db, `${cuentaPath(cuentaId)}/${name}/${id}`);
}

export function configRef(cuentaId, id) {
  return doc(db, `${cuentaPath(cuentaId)}/config/${id}`);
}

export async function getById(cuentaId, collectionName, id) {
  const snap = await getDoc(docRef(cuentaId, collectionName, id));
  if (!snap.exists()) return null;
  return mapDoc(snap);
}

export async function createDoc(cuentaId, collectionName, payload) {
  const ref = await addDoc(subcollectionRef(cuentaId, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateById(cuentaId, collectionName, id, payload) {
  await updateDoc(docRef(cuentaId, collectionName, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeCollection(cuentaId, collectionName, callback, options = {}) {
  const constraints = [];
  if (options.where) {
    options.where.forEach((entry) => constraints.push(where(entry.field, entry.op, entry.value)));
  }
  if (options.orderBy) {
    options.orderBy.forEach((entry) => constraints.push(orderBy(entry.field, entry.direction || 'desc')));
  }
  if (options.limit) {
    constraints.push(limit(options.limit));
  }

  const q = constraints.length
    ? query(subcollectionRef(cuentaId, collectionName), ...constraints)
    : subcollectionRef(cuentaId, collectionName);

  return onSnapshot(q, (snapshot) => callback(mapQuerySnapshot(snapshot)));
}

export async function fetchCollection(cuentaId, collectionName, options = {}) {
  const constraints = [];
  if (options.where) {
    options.where.forEach((entry) => constraints.push(where(entry.field, entry.op, entry.value)));
  }
  if (options.orderBy) {
    options.orderBy.forEach((entry) => constraints.push(orderBy(entry.field, entry.direction || 'desc')));
  }
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  const q = constraints.length
    ? query(subcollectionRef(cuentaId, collectionName), ...constraints)
    : subcollectionRef(cuentaId, collectionName);
  const snapshot = await getDocs(q);
  return mapQuerySnapshot(snapshot);
}

export async function upsertConfig(cuentaId, id, payload) {
  await setDoc(configRef(cuentaId, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
