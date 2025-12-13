import { onMount } from "solid-js";
import { suppliersState } from "../data/suppliers/suppliersStore";
import * as repo from "../data/suppliers/suppliersRepo";
import { useAllSuppliers } from "../data/suppliers/suppliersSelectors";

export function useSuppliers() {
  const all = useAllSuppliers();

  onMount(() => {
    if (!suppliersState.loaded && !suppliersState.loading) {
      void repo.fetchAllSuppliers();
    }
  });

  return {
    // Ǹtat
    loading: () => suppliersState.loading,
    loaded: () => suppliersState.loaded,
    error: () => suppliersState.error,

    // data
    all,

    // actions
    fetchAll: repo.fetchAllSuppliers,
  };
}
