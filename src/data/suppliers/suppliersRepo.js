import { collection, getDocsFromCache, getDocsFromServer } from "firebase/firestore";
import { db } from "../../db/firebase";
import {
  suppliersState,
  setAllSuppliers,
  setSuppliersLoading,
  setSuppliersError,
} from "./suppliersStore";

function snapToMap(snap) {
  const map = {};
  snap.forEach((d) => {
    map[d.id] = { id: d.id, ...d.data() };
  });
  return map;
}

export async function fetchAllSuppliers() {
  if (suppliersState.loaded || suppliersState.loading) return;

  setSuppliersLoading(true);
  try {
    const col = collection(db, "suppliers");

    let snap = null;
    try {
      snap = await getDocsFromCache(col);
    } catch {}

    if (!snap || snap.empty) {
      snap = await getDocsFromServer(col);
    }

    setAllSuppliers(snapToMap(snap));
  } catch (err) {
    setSuppliersError(err);
  }
}
