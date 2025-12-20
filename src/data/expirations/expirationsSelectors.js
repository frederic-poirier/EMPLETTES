import { createMemo } from "solid-js";
import { expirationsState } from "./expirationsStore";

// All expirations
export function useAllExpirations() {
  return createMemo(() => Object.values(expirationsState.byId));
}

// Expirations sorted by date (ascending)
export function useSortedExpirations() {
  const all = useAllExpirations();

  return createMemo(() =>
    [...all()].sort((a, b) => new Date(a.date) - new Date(b.date)),
  );
}

// Expired items (date < today)
export function useExpiredItems() {
  const all = useAllExpirations();
  const today = new Date().toISOString().slice(0, 10);

  return createMemo(() => all().filter((e) => e.date < today));
}

// Upcoming expirations (not yet expired)
export function useUpcomingExpirations() {
  const all = useAllExpirations();
  const today = new Date().toISOString().slice(0, 10);

  return createMemo(() =>
    all()
      .filter((e) => e.date >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
  );
}
