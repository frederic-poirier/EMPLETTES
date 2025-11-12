import { collection, setDoc, serverTimestamp, getDocs, onSnapshot, arrayUnion, updateDoc, arrayRemove, doc } from "firebase/firestore"
import { db } from "../db/firebase"
import { createStore } from "solid-js/store"
import { createSignal, onMount, onCleanup } from "solid-js"

const [lists, setLists] = createStore([])
const [loading, setLoading] = createSignal(false)
let stopListener = null
let refCount = 0

function listREF(supplier) {
  return {
    SUPPLIER: supplier,
    ITEMS: [],
    STATUS: "EMPTY",
    CREATED_AT: Date.now(),
    UPDATED_AT: Date.now(),
  }
}

async function fetchLists() {
  if (lists.length > 0) return lists
  setLoading(true)
  try {
    const snap = await getDocs(collection(db, "lists"))
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    setLists(data)
    return data
  } catch (e) {
    console.error("fetchLists failed", e)
    return lists
  } finally {
    setLoading(false)
  }
}

async function addList(supplier) {
  const sameSupplierList = lists.find((l) => l.SUPPLIER === supplier)
  if (sameSupplierList) return sameSupplierList.id

  const emptyList = lists.find((l) => l.STATUS === "EMPTY" && !l.SYNCING)
  if (emptyList) {
    setLists((l) => l.id === emptyList.id, {
      SUPPLIER: supplier,
      UPDATED_AT: Date.now(),
      SYNCING: true,
    })

    try {
      const ref = doc(db, "lists", emptyList.id)
      await setDoc(ref, {
        ...emptyList,
        SUPPLIER: supplier,
        UPDATED_AT: Date.now(),
      })
      setLists((l) => l.id === emptyList.id, "SYNCING", false)
    } catch (e) {
      console.error("update existing emptyList failed", e)
      setLists((l) => l.id === emptyList.id, {
        SUPPLIER: null,
        SYNCING: false,
      })
    }

    return emptyList.id
  }

  const ref = doc(collection(db, "lists"))
  const newList = { id: ref.id, ...listREF(supplier), SYNCING: true }
  setLists((prev) => [...prev, newList])

  try {
    await setDoc(ref, newList)
    setLists((l) => l.id === ref.id, "SYNCING", false)
  } catch (e) {
    console.error("addList failed", e)
    setLists((prev) => prev.filter((l) => l.id !== ref.id))
  }

  return ref.id
}

async function setListItem(listID, productID) {
  const list = lists.find((l) => l.id === listID)
  if (!list) return console.warn("Liste introuvable", listID)

  const ITEMS = list.ITEMS || []
  const hasItem = ITEMS.includes(productID)
  const newItems = hasItem
    ? ITEMS.filter((i) => i !== productID)
    : [...ITEMS, productID]
  const newStatus = newItems.length === 0 ? "EMPTY" : "ACTIVE"

  setLists((l) => l.id === listID, { ITEMS: newItems, STATUS: newStatus })

  try {
    await updateDoc(doc(db, "lists", listID), {
      ITEMS: hasItem ? arrayRemove(productID) : arrayUnion(productID),
      STATUS: newStatus,
      UPDATED_AT: serverTimestamp(),
    })
  } catch (e) {
    console.error("setListItem failed", e)
    setLists((l) => l.id === listID, { ITEMS, STATUS: list.STATUS })
  }
}

function listenLists() {
  const unsub = onSnapshot(collection(db, "lists"), (snapshot) => {
    const remote = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    setLists((current) => {
      const merged = []
      for (const doc of remote) {
        const local = current.find((l) => l.id === doc.id)
        merged.push(local ? { ...local, ...doc, SYNCING: false } : doc)
      }
      for (const local of current) {
        const exists = remote.some((r) => r.id === local.id)
        if (!exists && local.SYNCING === true) merged.push(local)
      }
      return merged
    })
  })
  return unsub
}

function listen() {
  refCount++
  if (refCount === 1 && !stopListener) {
    stopListener = listenLists()
  }
}

function stop() {
  refCount--
  if (refCount === 0 && stopListener) {
    stopListener()
    stopListener = null
  }
}

export function useLists() {
  onMount(() => listen())
  onCleanup(() => stop())
  return { lists, loading, fetchLists, addList, setListItem }
}
