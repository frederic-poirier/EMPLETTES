import { useLists } from "../utils/useLists";
import { A } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import "../styles/List.css"
import { useProducts } from "../utils/useProducts";
import { EditIcon, AddIcon } from "../assets/Icons";
import Sheet from "../components/Sheet";
import ProductList from "../components/ProductList";

export default function ListsPage() {
  const { fetchLists, lists } = useLists()
  const { products } = useProducts()
  const [selectedList, setSelectedList] = createSignal()
  const SheetID = 32
  onMount(() => fetchLists())

  return (
    <>
      <h1>Listes</h1>
      <section className="overflow" id="list-page">
        <Show
          when={() => lists.ITEMS?.length}
          fallback={LoadingState}
        >
          <For each={lists}>
            {(list) => list.STATUS !== "EMPTY" &&
              <button className="unset card list-item" popoverTarget={SheetID} onClick={() => setSelectedList(list.id)}>
                <header>
                  <p>Mise à jour {formatUpdatedAt(list.UPDATED_AT)}</p>
                  <h3>Liste pour {list.SUPPLIER}</h3>
                </header>
                <hr />
                <p className="list-demo-header"><span>Produits</span><span>{list.ITEMS.length}</span></p>
                <ul className="list-demo">
                  <For each={list.ITEMS.slice(0, 6)}>
                    {(item) => <li>{products()?.find((p) => p.id === item).PRODUCT}</li>}
                  </For>
                </ul>
              </button>
            }
          </For>
        </Show>
        <Sheet
          id={SheetID}
          maxHeightVH={80}
          title="List modal"
          content={<ProductList id={selectedList()} />}
        />
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <p>Aucune liste enregistré encore</p>
  )
}

function LoadingState() {
  return (
    <h1>CHARGEMENT</h1>
  )
}

function formatUpdatedAt(ts) {
  if (!ts) return "—"

  // Firestore Timestamps : { seconds, nanoseconds }
  if (typeof ts.seconds === "number") {
    return timeAgo(ts.seconds * 1000)
  }

  // serverTimestamp pending
  if (ts.toMillis) {
    return timeAgo(ts.toMillis())
  }

  return "—"
}


function timeAgo(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;

  const units = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === "second") {
      const value = Math.round(diff / ms);
      return rtf.format(value, unit);
    }
  }
}
