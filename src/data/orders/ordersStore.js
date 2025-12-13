import { createStore, reconcile } from "solid-js/store";

export const [ordersState, setOrdersState] = createStore({
  byId: {},       // { [orderId]: order }
  loading: false,
  loaded: false,
  activeId: null, // order ouverte (ex: vérification réception)
});

export function setOrdersLoading(v) {
  setOrdersState("loading", v);
}

export function setAllOrders(ordersArray) {
  const map = {};
  for (const o of ordersArray) {
    map[o.id] = o;
  }
  setOrdersState("byId", reconcile(map));
  setOrdersState({ loading: false, loaded: true });
}

export function upsertOrderLocal(order) {
  setOrdersState("byId", order.id, order);
}

export function removeOrderLocal(id) {
  setOrdersState("byId", id, undefined);
}

export function setActiveOrder(id) {
  setOrdersState("activeId", id);
}
