import { createMemo } from "solid-js";
import { productsState } from "./productsStore";

// Tous les produits
export function useAllProducts() {
  return createMemo(() => Object.values(productsState.byId));
}

// Produits groupés par supplierId
export function useProductsBySupplierId() {
  const all = useAllProducts();

  return createMemo(() => {
    const map = {};
    for (const p of all()) {
      const sID = p?.supplierId ?? p?.SUPPLIER ?? "UNKNOWN";
      (map[sID] ??= []).push(p);
    }
    return map;
  });
}
