import {
  collection,
  query,
  where,
  orderBy,
  getDocsFromCache,
  getDocsFromServer,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../db/firebase";
import {
  setOrdersLoading,
  setAllOrders,
  upsertOrderLocal,
} from "./ordersStore";

let activeUnsub = null;

// Fetch orders (cache-first)
export async function fetchOrders() {
  setOrdersLoading(true);

  const q = query(
    collection(db, "orders"),
    orderBy("orderedAt", "desc")
  );

  let snap;
  try {
    snap = await getDocsFromCache(q);
  } catch {
    snap = await getDocsFromServer(q);
  }

  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  setAllOrders(data);
}

// Écouter UNE order (ex: écran réception)
export function listenToOrder(orderId) {
  activeUnsub?.();

  const ref = doc(db, "orders", orderId);
  activeUnsub = onSnapshot(ref, snap => {
    if (snap.exists()) {
      upsertOrderLocal({ id: snap.id, ...snap.data() });
    }
  });

  return () => {
    activeUnsub?.();
    activeUnsub = null;
  };
}

// Créer une order depuis une list
export async function createOrderFromList(list) {
  const ref = doc(collection(db, "orders"));

  const payload = {
    supplierId: list.supplierId,
    status: "PENDING",
    items: list.items.map(i => ({
      productId: i.productId,
      name: i.name,
      brand: i.brand,
      sku: i.sku,
      qty: i.qty,
    })),
    orderedAt: serverTimestamp(),
    receivedAt: null,
  };

  upsertOrderLocal({ id: ref.id, ...payload });
  await setDoc(ref, payload);

  return ref.id;
}

// Marquer reçue (validation réception)
export async function markOrderReceived(orderId) {
  upsertOrderLocal({
    id: orderId,
    status: "RECEIVED",
    receivedAt: new Date(),
  });

  await updateDoc(doc(db, "orders", orderId), {
    status: "RECEIVED",
    receivedAt: serverTimestamp(),
  });
}
