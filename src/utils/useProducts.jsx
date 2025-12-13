import { createSignal, createMemo, onCleanup } from "solid-js";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../db/firebase";

const [products, setProducts] = createSignal([]);
let initialized = false;

export function useProducts() {
  if (!initialized) {
    initialized = true;

    const unsub = onSnapshot(
      collection(db, "products"),
      (snap) => {
        setProducts(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      }
    );

    onCleanup(() => unsub());
  }

  /* ───────────── Selectors ───────────── */

  const suppliers = createMemo(() =>
    [...new Set(products().map((p) => p.SUPPLIER).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  );

  const categories = createMemo(() =>
    [...new Set(products().map((p) => p.CATEGORY).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
  );

  const getSupplierProducts = (supplier) =>
    createMemo(() =>
      supplier
        ? products().filter((p) => p.SUPPLIER === supplier)
        : []
    );

  /* ───────────── Mutations ───────────── */

  const updateProduct = async (id, payload) => {
    if (!id) throw new Error("Produit introuvable");
    await updateDoc(doc(db, "products", id), payload);
  };

  const deleteProduct = async (id) => {
    if (!id) throw new Error("Produit introuvable");
    await deleteDoc(doc(db, "products", id));
  };

  return {
    products,
    suppliers,
    categories,
    getSupplierProducts,
    updateProduct,
    deleteProduct,
  };
}
