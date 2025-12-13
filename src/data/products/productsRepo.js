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
  productsState,
  removeProductLocal,
  setAllProducts,
  setProductsError,
  setProductsLoading,
  upsertProductLocal,
} from "./productsStore";

function snapToMap(snap) {
  const map = {};
  snap.forEach((d) => {
    map[d.id] = { id: d.id, ...d.data() };
  });
  return map;
}

export async function fetchAllProducts() {
  if (productsState.loaded || productsState.loading) return;

  setProductsLoading(true);
  try {
    const col = collection(db, "products");
    let snap = null;
    try {
      snap = await getDocsFromCache(col);
    } catch {}

    if (!snap || snap.empty) {
      snap = await getDocsFromServer(col);
    }

    setAllProducts(snapToMap(snap));
  } catch (err) {
    setProductsError(err);
  }
}

export async function saveProduct(product) {
  upsertProductLocal(product);
  const ref = doc(db, "products", product.id);
  await setDoc(ref, product, { merge: true });
}

export async function patchProduct(id, patch) {
  const current = productsState.byId[id];
  if (current) upsertProductLocal({ ...current, ...patch });
  const ref = doc(db, "products", id);
  await updateDoc(ref, patch);
}

export async function deleteProduct(id) {
  removeProductLocal(id);
  const ref = doc(db, "products", id);
  await deleteDoc(ref);
}
