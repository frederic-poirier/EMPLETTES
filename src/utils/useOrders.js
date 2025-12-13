import { onCleanup } from "solid-js";
import { ordersState, setActiveOrder } from "../data/orders/ordersStore";
import * as repo from "../data/orders/ordersRepo";
import {
  useActiveOrder,
  useAllOrders,
  usePendingOrders,
  useReceivedOrders,
} from "../data/orders/ordersSelectors";

export function useOrders() {
  let stopListening = null;

  const all = useAllOrders();
  const pending = usePendingOrders();
  const received = useReceivedOrders();
  const active = useActiveOrder();

  const openOrder = (id) => {
    setActiveOrder(id);
    stopListening?.();
    stopListening = repo.listenToOrder(id);
  };

  onCleanup(() => stopListening?.());

  const createFromList = repo.createOrderFromList;

  return {
    // data
    all,
    pending,
    received,
    active,

    // Ǹtat
    loading: () => ordersState.loading,

    // actions
    fetchAll: repo.fetchOrders,
    open: openOrder,
    createFromList,
    createFromlist: createFromList,
    markReceived: repo.markOrderReceived,
  };
}
