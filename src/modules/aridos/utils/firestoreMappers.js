export function mapDoc(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

export function mapQuerySnapshot(snapshot) {
  return snapshot.docs.map(mapDoc);
}
