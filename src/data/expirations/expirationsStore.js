import { createStore, reconcile } from "solid-js/store";

export const [expirationsState, setExpirationsState] = createStore({
  byId: {},
  loading: false,
  loaded: false,
  error: null,
  loadedAt: 0,
});

export function setExpirationsLoading(v) {
  setExpirationsState("loading", v);
}

export function setExpirationsError(err) {
  setExpirationsState({
    loading: false,
    error: err?.message ?? String(err),
  });
}

export function setAllExpirations(mapById) {
  setExpirationsState("byId", reconcile(mapById));
  setExpirationsState({
    loading: false,
    loaded: true,
    error: null,
    loadedAt: Date.now(),
  });
}

export function upsertExpirationLocal(expiration) {
  if (!expiration?.id) return;
  setExpirationsState("byId", expiration.id, expiration);
}

export function removeExpirationLocal(id) {
  setExpirationsState("byId", id, undefined);
}
