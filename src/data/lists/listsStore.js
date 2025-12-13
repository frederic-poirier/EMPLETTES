import { createStore, reconcile } from "solid-js/store";

export const [listsState, setListsState] = createStore({
    byId: {},
    loading: false,
    loaded: false,
    activeId: null,
})

export function setListsLoading(v) {
  setListsState("loading", v);
}

export function setAllLists(listsArray) {
  const map = {};
  for (const l of listsArray) {
    map[l.id] = l;
  }
  setListsState("byId", reconcile(map));
  setListsState({ loading: false, loaded: true });
}

export function upsertListLocal(list) {
  setListsState("byId", list.id, list);
}

export function removeListLocal(id) {
  setListsState("byId", id, undefined);
}

export function setActiveList(id) {
  setListsState("activeId", id);
}
