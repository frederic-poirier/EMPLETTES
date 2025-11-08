import { createResource, createSignal, createMemo } from "solid-js";
import { db } from "../db/firebase";
import { collection, getDocs } from "firebase/firestore";

const CACHE_KEY = "products_cache_v1";

function toStr(v) {
  if (v === null || v === undefined) return "";
  try {
    return String(v).trim();
  } catch {
    return "";
  }
}

function normalizeProduct(input, idHint) {
  const src = input || {};

  const fournisseurRaw =
    src.fournisseur ?? src.supplier ?? src.SUPPLIER ?? src.Supplier ?? src.FOURNISSEUR ?? src.Fournisseur;
  const descriptionRaw =
    src.description ?? src.DESCRIPTION ?? src.product ?? src.PRODUCT ?? src.nom ?? src.NOM ?? src.name ?? src.NAME;
  const brandRaw = src.brand ?? src.BRAND ?? src.marque ?? src.MARQUE;
  const psuRaw =
    src.psu ?? src.PSU ?? src.sku ?? src.SKU ?? src.barcode ?? src.BARCODE ?? src.article_no ?? src.ARTICLE_NO ?? src.SUPPLIER_PSU;

  const id = idHint ?? src.id ?? src.ID ?? psuRaw ?? (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));

  // Put original fields first, then override with normalized fields
  return {
    ...src,
    id,
    fournisseur: toStr(fournisseurRaw),
    description: toStr(descriptionRaw),
    brand: toStr(brandRaw),
    psu: toStr(psuRaw),
  };
}

function readCache() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const payload = parsed?.products ?? parsed;

    if (Array.isArray(payload)) return payload;
    if (payload && typeof payload === "object") {
      return Object.entries(payload).map(([id, v]) => ({ id, ...v }));
    }
  } catch (e) {
    console.warn("useProducts: cache read failed", e);
  }
  return null;
}

function writeCache(products) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), products })
    );
  } catch (e) {
    console.warn("useProducts: cache write failed", e);
  }
}

export function useProducts() {
  const [invalidateCache, setInvalidateCache] = createSignal(false);

  const fetchProducts = async () => {
    if (!invalidateCache()) {
      const cached = readCache();
      if (Array.isArray(cached) && cached.length >= 0) {
        // Normalize cached items to ensure UI fields exist
        return cached.map((p) => normalizeProduct(p, p.id));
      }
    }

    try {
      const snap = await getDocs(collection(db, "produits"));
      const data = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
      writeCache(data);
      return data;
    } catch (err) {
      console.error("useProducts: Firestore fetch failed", err);
      const fallback = readCache();
      if (Array.isArray(fallback)) {
        return fallback.map((p) => normalizeProduct(p, p.id));
      }
      return [];
    }
  };

  const [products] = createResource(fetchProducts);

  // Fournisseurs dérivés de la ressource
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

