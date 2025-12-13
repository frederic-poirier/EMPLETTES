import { createStore, reconcile } from "solid-js/store";

export const [productsState, setProductsState] = createStore({
  byId: {},
  loading: false,
  loaded: false,
  error: null,
  loadedAt: 0,
});

export function setProductsLoading(v) {
  setProductsState("loading", v);
}

export function setProductsError(err) {
  setProductsState({
    loading: false,
    error: err?.message ?? String(err),
  });
}

export function setAllProducts(mapById) {
  setProductsState("byId", reconcile(mapById));
  setProductsState({
    loading: false,
    loaded: true,
    error: null,
    loadedAt: Date.now(),
  });
}

export function upsertProductLocal(product) {
  if (!product?.id) return;
  setProductsState("byId", product.id, product);
}

export function removeProductLocal(id) {
  setProductsState("byId", id, undefined);
}
