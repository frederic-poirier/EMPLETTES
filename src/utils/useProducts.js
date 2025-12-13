import { createMemo, onMount } from "solid-js";
import * as repo from "../data/products/productsRepo";
import { productsState } from "../data/products/productsStore";
import {
  useAllProducts,
  useProductsBySupplierId,
} from "../data/products/productsSelectors";

export function useProducts() {
  const all = useAllProducts();
  const bySupplierId = useProductsBySupplierId();

  onMount(() => {
    if (!productsState.loaded && !productsState.loading) {
      void repo.fetchAllProducts();
    }
  });

  const suppliers = createMemo(() => {
    const names = all()
      .map((p) => p?.supplierId ?? p?.SUPPLIER)
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    );
  });

  const categories = createMemo(() => {
    const values = all()
      .map((p) => p?.category ?? p?.CATEGORY)
      .filter(Boolean);
    return [...new Set(values)].sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    );
  });

  const getSupplierProducts = (supplier) =>
    createMemo(() => {
      if (!supplier) return [];
      const map = bySupplierId();
      if (map?.[supplier]) return map[supplier];
      return all().filter(
        (p) => (p?.supplierId ?? p?.SUPPLIER) === supplier
      );
    });

  return {
    loading: () => productsState.loading,
    loaded: () => productsState.loaded,
    error: () => productsState.error,

    // data
    all,
    bySupplierId,
    products: all,
    suppliers,
    categories,
    getSupplierProducts,

    // actions
    fetchAll: repo.fetchAllProducts,
    updateProduct: repo.patchProduct,
    deleteProduct: repo.deleteProduct,
  };
}
