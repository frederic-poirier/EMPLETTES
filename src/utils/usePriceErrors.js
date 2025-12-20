import { onMount } from "solid-js";
import * as repo from "../data/priceErrors/priceErrorsRepo";
import { priceErrorsState } from "../data/priceErrors/priceErrorsStore";
import {
  useAllPriceErrors,
  usePendingPriceErrors,
  useResolvedPriceErrors,
  usePriceErrorsByType,
} from "../data/priceErrors/priceErrorsSelectors";

export function usePriceErrors() {
  const all = useAllPriceErrors();
  const pending = usePendingPriceErrors();
  const resolved = useResolvedPriceErrors();
  const byType = usePriceErrorsByType();

  onMount(() => {
    if (!priceErrorsState.loaded && !priceErrorsState.loading) {
      void repo.fetchAllPriceErrors();
    }
  });

  return {
    // state
    loading: () => priceErrorsState.loading,
    loaded: () => priceErrorsState.loaded,
    error: () => priceErrorsState.error,

    // data
    all,
    pending,
    resolved,
    byType,

    // actions
    fetchAll: repo.fetchAllPriceErrors,
    report: repo.savePriceError,
    update: repo.patchPriceError,
    resolve: repo.resolvePriceError,
    remove: repo.deletePriceError,
  };
}
