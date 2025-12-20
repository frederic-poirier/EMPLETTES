import { createStore, reconcile } from "solid-js/store";

export const [priceErrorsState, setPriceErrorsState] = createStore({
  byId: {},
  loading: false,
  loaded: false,
  error: null,
  loadedAt: 0,
});

export function setPriceErrorsLoading(v) {
  setPriceErrorsState("loading", v);
}

export function setPriceErrorsError(err) {
  setPriceErrorsState({
    loading: false,
    error: err?.message ?? String(err),
  });
}

export function setAllPriceErrors(mapById) {
  setPriceErrorsState("byId", reconcile(mapById));
  setPriceErrorsState({
    loading: false,
    loaded: true,
    error: null,
    loadedAt: Date.now(),
  });
}

export function upsertPriceErrorLocal(priceError) {
  if (!priceError?.id) return;
  setPriceErrorsState("byId", priceError.id, priceError);
}

export function removePriceErrorLocal(id) {
  setPriceErrorsState("byId", id, undefined);
}
