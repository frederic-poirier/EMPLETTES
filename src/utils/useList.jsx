import { createSignal } from "solid-js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  writeBatch,
  query,
  where,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "../db/firebase";
import { useAuth } from "./useAuth";

export function useLists({ scopeByUser = true } = {}) {
  const { user } = useAuth?.() ?? {};
  const [loading, setLoading] = createSignal(false);

  const getLists = async () => {
    setLoading(true);
    try {
      const base = collection(db, "lists");
      const q =
        scopeByUser && user?.()
          ? query(
              base,
              where("ownerUid", "==", user().uid),
              orderBy("updatedAt", "desc"),
            )
          : query(base, orderBy("updatedAt", "desc"));

      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const v = d.data();
        return {
          id: d.id,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          productCount: v.productCount ?? 0,
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const getList = async (listID) => {
    setLoading(true);
    try {
      const headREF = doc(db, "lists", listID);
      const headSnap = await getDoc(headREF);
      if (!headSnap.exists()) return null;

      const itemsSnap = await getDocs(collection(db, "lists", listID, "items"));
      const productIDs = itemsSnap.docs.map((d) => d.id);
      const meta = headSnap.data();

      return {
        id: listID,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        productCount: meta.productCount ?? productIDs.length,
        products: productIDs,
      };
    } finally {
      setLoading(false);
    }
  };

  const addList = async () => {
    const ref = doc(collection(db, "lists"));
    await setDoc(ref, {
      ownerUid: scopeByUser && user?.() ? user().uid : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      productCount: 0,
    });
    return { id: ref.id };
  };

  const setList = async (listId, productId) => {
    const listRef = doc(db, "lists", listId);
    const itemRef = doc(db, "lists", listId, "items", productId);

    await runTransaction(db, async (tx) => {
      const itemSnap = await tx.get(itemRef);
      const listSnap = await tx.get(listRef);
      if (!listSnap.exists()) throw new Error("Liste introuvable");

      if (itemSnap.exists()) {
        // remove
        tx.delete(itemRef);
        tx.update(listRef, {
          updatedAt: serverTimestamp(),
          productCount: increment(-1),
        });
      } else {
        // add
        tx.set(itemRef, { productId, addedAt: serverTimestamp() });
        tx.update(listRef, {
          updatedAt: serverTimestamp(),
          productCount: increment(1),
        });
      }
    });
  };

  const delList = async (listId) => {
    const itemsCol = collection(db, "lists", listId, "items");
    const itemsSnap = await getDocs(itemsCol);

    const batches = [];
    let batch = writeBatch(db);
    let ops = 0;

    for (const d of itemsSnap.docs) {
      batch.delete(d.ref);
      ops++;
      if (ops >= 450) {
        // marge sous la limite 500
        batches.push(batch.commit());
        batch = writeBatch(db);
        ops = 0;
      }
    }
    batches.push(batch.commit());
    await Promise.all(batches);

    // supprime le doc principal
    await deleteDoc(doc(db, "lists", listId));
  };

  return {
    loading,
    getLists,
    getList,
    addList,
    setList,
    delList,
  };
}
