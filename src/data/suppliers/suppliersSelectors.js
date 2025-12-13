import { createMemo } from "solid-js";
import { suppliersState } from "./suppliersStore";

// Tous les fournisseurs
export function useAllSuppliers() {
  return createMemo(() =>
    Object.values(suppliersState.byId)
  );
}
