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
  priceErrorsState,
  removePriceErrorLocal,
  setAllPriceErrors,
  setPriceErrorsError,
  setPriceErrorsLoading,
  upsertPriceErrorLocal,
} from "./priceErrorsStore";

function snapToMap(snap) {
  const map = {};
  snap.forEach((d) => {
    map[d.id] = { id: d.id, ...d.data() };
  });
  return map;
}

export async function fetchAllPriceErrors() {
  if (priceErrorsState.loaded || priceErrorsState.loading) return;

  setPriceErrorsLoading(true);
  try {
    const col = collection(db, "priceErrors");
    let snap = null;
    try {
      snap = await getDocsFromCache(col);
    } catch {}

    if (!snap || snap.empty) {
      snap = await getDocsFromServer(col);
    }

    setAllPriceErrors(snapToMap(snap));
  } catch (err) {
    setPriceErrorsError(err);
  }
}

export async function savePriceError(priceError) {
  upsertPriceErrorLocal(priceError);
  const ref = doc(db, "priceErrors", priceError.id);
  await setDoc(ref, priceError, { merge: true });
}

export async function patchPriceError(id, patch) {
  const current = priceErrorsState.byId[id];
  if (current) upsertPriceErrorLocal({ ...current, ...patch });
  const ref = doc(db, "priceErrors", id);
  await updateDoc(ref, patch);
}

export async function deletePriceError(id) {
  removePriceErrorLocal(id);
  const ref = doc(db, "priceErrors", id);
  await deleteDoc(ref);
}

export async function resolvePriceError(id) {
  const resolvedAt = new Date().toISOString();
  await patchPriceError(id, { status: "RESOLVED", resolvedAt });
}
