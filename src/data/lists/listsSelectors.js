import { createMemo } from "solid-js";
import { listsState } from "./listsStore";

export function useAllLists() {
  return createMemo(() => Object.values(listsState.byId));
}

export function useLatestList() {
  const all = useAllLists();
  return createMemo(() => (all().length ? all()[0] : null));
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
