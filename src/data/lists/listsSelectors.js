import { createMemo } from "solid-js";
import { listsState } from "./listsStore";

export function useAllLists() {
  return createMemo(() => Object.values(listsState.byId));
}

export function useLatestList() {
  const nonEmpty = useNonEmptyLists();
  return createMemo(() => {
    if (!nonEmpty().length) return null;
    // Sort by UPDATED_AT descending
    return [...nonEmpty()].sort((a, b) => {
      const aTime = a.UPDATED_AT?.toMillis?.() ?? a.UPDATED_AT ?? 0;
      const bTime = b.UPDATED_AT?.toMillis?.() ?? b.UPDATED_AT ?? 0;
      return bTime - aTime;
    })[0];
  });
}

export function useActiveList() {
  return createMemo(() =>
    listsState.activeId ? listsState.byId[listsState.activeId] : null
  );
}

export function useNonEmptyLists() {
  const all = useAllLists();
  return createMemo(() =>
    all().filter((l) => {
      const count = l.items?.length ?? l.ITEMS?.length ?? 0;
      return count > 0;
    })
  );
}

export function listStats(list) {
  if (!list) return null;

  const items = list.items ?? list.ITEMS ?? [];
  const total = items.length;
  const checked = items.filter((i) => i.checked || i.CHECKED).length;

  return { total, checked };
}
