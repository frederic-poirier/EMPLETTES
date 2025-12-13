import { onCleanup, onMount } from "solid-js";
import { listsState, setActiveList, upsertListLocal } from "../data/lists/listsStore";
import * as repo from "../data/lists/listsRepo";

import {
  useAllLists,
  useActiveList,
  useLatestList,
  useNonEmptyLists,
} from "../data/lists/listsSelectors";

export function useLists() {
  let stopListening = null;

  const lists = useAllLists();
  const active = useActiveList();
  const latest = useLatestList();
  const nonEmpty = useNonEmptyLists();

  onMount(() => {
    if (!listsState.loaded && !listsState.loading) {
      void repo.fetchLists();
    }
  });

  const fetchLists = repo.fetchLists;

  const addList = async (supplier) => {
    const existing = Object.values(listsState.byId).find(
      (l) => l?.SUPPLIER === supplier
    );
    if (existing) return existing.id;

    return repo.createList({
      SUPPLIER: supplier,
      ITEMS: [],
      STATUS: "EMPTY",
    });
  };

  const setListItem = async (listId, productId) => {
    const list = listsState.byId[listId];
    if (!list) return;

    const items = list.ITEMS ?? [];
    const hasItem = items.includes(productId);
    const nextItems = hasItem
      ? items.filter((id) => id !== productId)
      : [...items, productId];
    const nextStatus = nextItems.length === 0 ? "EMPTY" : "ACTIVE";

    // Optimistic update
    upsertListLocal({
      ...list,
      ITEMS: nextItems,
      STATUS: nextStatus,
    });

    await repo.updateList(listId, {
      ITEMS: nextItems,
      STATUS: nextStatus,
    });
  };

  const open = async (id) => {
    setActiveList(id);
    stopListening?.();
    stopListening = repo.listenToList(id);
  };

  onCleanup(() => stopListening?.());

  return {
    // état
    loading: () => listsState.loading,

    // data (memos)
    lists,
    active,
    latest,
    nonEmpty,

    // actions
    fetchAll: repo.fetchLists,
    fetchLists,
    addList,
    setListItem,
    open,
    create: repo.createList,
    update: repo.updateList,
    remove: repo.deleteList,
    deleteList: repo.deleteList,
  };
}
