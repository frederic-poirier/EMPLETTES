import { createResource, createMemo } from "solid-js"
import { db } from "../db/firebase"
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import useCache from "./useCache"

const CACHE_VERSION = 3
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

  const [products, { refetch, mutate }] = createResource(fetchProducts)

  const syncCache = (data) => writeCache(CACHE_KEY, CACHE_VERSION, data)

  const suppliers = createMemo(() => {
    const data = products()
    if (!data) return []
    return [...new Set(data.map((p) => p.SUPPLIER)
      .filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "fr", { sensitivity: "base" })
      )
  })

  const categories = createMemo(() => {
    const data = products()
    if (!data) return []
    return [...new Set(data.map((p) => p.CATEGORY)
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

  const updateProduct = async (productId, payload) => {
    if (!productId) throw new Error("Produit introuvable")

    await updateDoc(doc(db, "products", productId), payload)

    let updatedProduct = null
    mutate((prev) => {
      if (!prev) return prev
      const next = prev.map((p) => {
        if (p.id !== productId) return p
        updatedProduct = { ...p, ...payload }
        return updatedProduct
      })
      syncCache(next)
      return next
    })

    return updatedProduct ?? { id: productId, ...payload }
  }

  const deleteProduct = async (productId) => {
    if (!productId) throw new Error("Produit introuvable")

    await deleteDoc(doc(db, "products", productId))

    mutate((prev) => {
      if (!prev) return prev
      const next = prev.filter((p) => p.id !== productId)
      syncCache(next)
      return next
    })
  }

  return {
    products, // Signal de resource
    suppliers, // Memo des suppliers uniques
    categories, // Memo des categories uniques
    getSupplierProducts, // Fonction qui retourne un memo
    refetch,
    updateProduct,
    deleteProduct,
    loading: products.loading,
    error: products.error
  }
}
