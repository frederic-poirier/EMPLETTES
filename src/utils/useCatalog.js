import { onMount, createMemo } from "solid-js";
import { initCatalog } from "../data/initCatalog";
import { productsState } from "../data/products/productsStore";
import { suppliersState } from "../data/suppliers/suppliersStore";

let initPromise = null;

function initOnce() {
  if (!initPromise) initPromise = initCatalog();
  return initPromise;
}

export function useCatalog() {
  onMount(() => {
    void initOnce();
  });

  const ready = createMemo(() => productsState.loaded && suppliersState.loaded);

  return {
    ready,
    productsLoading: () => productsState.loading,
    suppliersLoading: () => suppliersState.loading,
  };
}
