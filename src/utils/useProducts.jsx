import { createResource, createMemo } from "solid-js"
import { db } from "../db/firebase"
import { collection, getDocs } from "firebase/firestore"
import useCache from "./useCache"

const CACHE_VERSION = 2
const CACHE_KEY = `products_cache_v${CACHE_VERSION}`

export function useProducts() {
  const { readCache, writeCache } = useCache(false)

  const fetchProducts = async () => {
    const cached = readCache(CACHE_KEY, CACHE_VERSION)
    if (cached) return cached

    try {
      const snap = await getDocs(collection(db, "products"))
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      writeCache(CACHE_KEY, CACHE_VERSION, data)
      return data
    } catch (err) {
      console.error(err)
      const fallback = readCache(CACHE_KEY, CACHE_VERSION)
      return fallback || []
    }
  }

  const [products, { refetch }] = createResource(fetchProducts)

  const suppliers = createMemo(() => {
    const data = products()
    if (!data) return []
    return [...new Set(data.map((p) => p.SUPPLIER)
      .filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "fr", { sensitivity: "base" })
      )
  })

  // 🔥 Retourne directement un memo (synchrone)
  const getSupplierProducts = (supplier) => {
    const data = products()
    if (!data || !supplier) return []
    return data.filter((p) => p.SUPPLIER === supplier)
  }

  return {
    products, // Signal de resource
    suppliers, // Memo des suppliers uniques
    getSupplierProducts, // Fonction qui retourne un memo
    refetch,
    loading: products.loading,
    error: products.error
  }
}