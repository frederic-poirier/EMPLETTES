import { createMemo } from "solid-js";
import { priceErrorsState } from "./priceErrorsStore";

// All price errors
export function useAllPriceErrors() {
  return createMemo(() => Object.values(priceErrorsState.byId));
}

// Pending errors (not resolved)
export function usePendingPriceErrors() {
  const all = useAllPriceErrors();

  return createMemo(() =>
    all()
      .filter((e) => e.status === "PENDING")
      .sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)),
  );
}

// Resolved errors
export function useResolvedPriceErrors() {
  const all = useAllPriceErrors();

  return createMemo(() =>
    all()
      .filter((e) => e.status === "RESOLVED")
      .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt)),
  );
}

// Errors grouped by type
export function usePriceErrorsByType() {
  const all = useAllPriceErrors();

  return createMemo(() => {
    const map = {};
    for (const e of all()) {
      const type = e.errorType ?? "other";
      (map[type] ??= []).push(e);
    }
    return map;
  });
}
