import {
  collection,
  deleteDoc,
  doc,
  getDocsFromCache,
  getDocsFromServer,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../db/firebase";
import {
  expirationsState,
  removeExpirationLocal,
  setAllExpirations,
  setExpirationsError,
  setExpirationsLoading,
  upsertExpirationLocal,
} from "./expirationsStore";

function snapToMap(snap) {
  const map = {};
  snap.forEach((d) => {
    map[d.id] = { id: d.id, ...d.data() };
  });
  return map;
}

export async function fetchAllExpirations() {
  if (expirationsState.loaded || expirationsState.loading) return;

  setExpirationsLoading(true);
  try {
    const col = collection(db, "expirations");
    let snap = null;
    try {
      snap = await getDocsFromCache(col);
    } catch {}

    if (!snap || snap.empty) {
      snap = await getDocsFromServer(col);
    }

    setAllExpirations(snapToMap(snap));
  } catch (err) {
    setExpirationsError(err);
  }
}

export async function saveExpiration(expiration) {
  upsertExpirationLocal(expiration);
  const ref = doc(db, "expirations", expiration.id);
  await setDoc(ref, expiration, { merge: true });
}

export async function patchExpiration(id, patch) {
  const current = expirationsState.byId[id];
  if (current) upsertExpirationLocal({ ...current, ...patch });
  const ref = doc(db, "expirations", id);
  await updateDoc(ref, patch);
}

export async function deleteExpiration(id) {
  removeExpirationLocal(id);
  const ref = doc(db, "expirations", id);
  await deleteDoc(ref);
}
