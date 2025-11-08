import { createResource, createSignal, createMemo } from "solid-js";
import { db } from "../db/firebase";
import { collection, getDocs } from "firebase/firestore";

const CACHE_KEY = "products_cache_v1";

export function useProducts() {
  const [invalidateCache, setInvalidateCache] = createSignal(false);

  const fetchProducts = async () => {
    if (!invalidateCache()) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.products?.length) {
          return parsed.products;
        }
      }
    }

    const snap = await getDocs(collection(db, "produits"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        products: data,
      }),
    );

    return data;
  };

  const [products] = createResource(fetchProducts);

  // ✅ Distributeurs dérivés de la resource
  const supplier = createMemo(() => {
    const data = products();
    if (!data) return []; // encore en chargement
    const seen = new Set();
    for (const p of data) {
      if (p.fournisseur) seen.add(p.fournisseur);
    }
    return Array.from(seen).sort((a, b) =>
      a.localeCompare(b, "fr", { sensitivity: "base" })
    );
  });

  const getSupplier = () => supplier();

  return { products, getSupplier, supplier, invalidateCache, setInvalidateCache };
}
