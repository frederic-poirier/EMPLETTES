import {
  collection,
  query,
  orderBy,
  getDocsFromCache,
  getDocsFromServer,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../db/firebase";
import {
  setListsLoading,
  setAllLists,
  upsertListLocal,
  removeListLocal,
} from "./listsStore";

let activeUnsub = null;

// Fetch toutes les listes (1 fois)
export async function fetchLists() {
  setListsLoading(true);

  const q = query(
    collection(db, "lists"),
    orderBy("UPDATED_AT", "desc")
  );

  let snap;
  try {
    snap = await getDocsFromCache(q);
  } catch {
    snap = await getDocsFromServer(q);
  }

  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  setAllLists(data);
}

// Écouter UNE liste (ouverte)
export function listenToList(listId) {
  if (activeUnsub) activeUnsub();

  const ref = doc(db, "lists", listId);
  activeUnsub = onSnapshot(ref, snap => {
    if (snap.exists()) {
      upsertListLocal({ id: snap.id, ...snap.data() });
    }
  });

  return () => {
    activeUnsub?.();
    activeUnsub = null;
  };
}

// CRUD

export async function createList(list) {
  const ref = doc(collection(db, "lists"));
  const payload = {
    ...list,
    CREATED_AT: serverTimestamp(),
    UPDATED_AT: serverTimestamp(),
  };

  upsertListLocal({ id: ref.id, ...payload });
  await setDoc(ref, payload);

  return ref.id;
}

export async function updateList(listId, patch) {
  upsertListLocal({ id: listId, ...patch });
  await updateDoc(doc(db, "lists", listId), {
    ...patch,
    UPDATED_AT: serverTimestamp(),
  });
}

export async function deleteList(listId) {
  removeListLocal(listId);
  await deleteDoc(doc(db, "lists", listId));
}
