import { onMount } from "solid-js";
import * as repo from "../data/expirations/expirationsRepo";
import { expirationsState } from "../data/expirations/expirationsStore";
import {
  useAllExpirations,
  useSortedExpirations,
  useExpiredItems,
  useUpcomingExpirations,
} from "../data/expirations/expirationsSelectors";

export function useExpirations() {
  const all = useAllExpirations();
  const sorted = useSortedExpirations();
  const expired = useExpiredItems();
  const upcoming = useUpcomingExpirations();

  onMount(() => {
    if (!expirationsState.loaded && !expirationsState.loading) {
      void repo.fetchAllExpirations();
    }
  });

  return {
    // state
    loading: () => expirationsState.loading,
    loaded: () => expirationsState.loaded,
    error: () => expirationsState.error,

    // data
    all,
    sorted,
    expired,
    upcoming,

    // actions
    fetchAll: repo.fetchAllExpirations,
    save: repo.saveExpiration,
    update: repo.patchExpiration,
    remove: repo.deleteExpiration,
  };
}
