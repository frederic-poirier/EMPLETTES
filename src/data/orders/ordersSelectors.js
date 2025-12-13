import { createMemo } from "solid-js";
import { ordersState } from "./ordersStore";

// Toutes les commandes
export function useAllOrders() {
  return createMemo(() => Object.values(ordersState.byId));
}

// Commandes en attente
export function usePendingOrders() {
  const all = useAllOrders();
  return createMemo(() => all().filter((o) => o.status === "PENDING"));
}

// Commandes reçues
export function useReceivedOrders() {
  const all = useAllOrders();
  return createMemo(() => all().filter((o) => o.status === "RECEIVED"));
}

// Commande active
export function useActiveOrder() {
  return createMemo(() =>
    ordersState.activeId ? ordersState.byId[ordersState.activeId] : null
  );
}
