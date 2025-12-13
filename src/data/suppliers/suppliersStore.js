import { createStore, reconcile } from "solid-js/store";

export const [suppliersState, setSuppliersState] = createStore({
  byId: {},
  loading: false,
  loaded: false,
  error: null,
  loadedAt: 0,
});

export function setSuppliersLoading(v) {
  setSuppliersState("loading", v);
}

export function setSuppliersError(err) {
  setSuppliersState({
    loading: false,
    error: err?.message ?? String(err),
  });
}

export function setAllSuppliers(mapById) {
  setSuppliersState("byId", reconcile(mapById));
  setSuppliersState({
    loading: false,
    loaded: true,
    error: null,
    loadedAt: Date.now(),
  });
}
