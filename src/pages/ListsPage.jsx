import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { A, useNavigate } from "@solidjs/router";
import { onMount, Show, For, createMemo } from "solid-js";
import { LoadingState, EmptyState } from "../components/Layout";
import "../styles/List.css";

export default function ListsPage() {
  const { fetchLists, lists } = useLists();
  onMount(() => fetchLists());
  const filteredList = createMemo(() => (lists || []).filter((l) => (l.ITEMS?.length ?? 0) > 0));

  return (
    <>
      <Show when={filteredList()} fallback={<LoadingState title="Chargement">Chargement des listes</LoadingState>}>
        <Show when={filteredList().length > 0} fallback={<EmptyState title="Aucune liste">Aucune liste encore</EmptyState>}>
          <div className="fade-overflow y">
            <h1>Listes</h1>
            <section id="list-page" >
              <For each={filteredList()}>
                {(list) => <ListCard list={list} />}
              </For>
            </section >
          </div>

          <A href="/list/new" class="btn primary bottom">
            Nouvelle liste
          </A>
        </Show>
      </Show >
    </>
  );
}

export function ListCard(props) {
  const { products } = useProducts();
  const navigate = useNavigate()

  function formatUpdatedAt(ts) {
    if (!ts) return "—";
    if (typeof ts.seconds === "number") return timeAgo(ts.seconds * 1000);
    if (ts.toMillis) return timeAgo(ts.toMillis());
    return "—";
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


  return (
    <button
      className="unset card list-item"
      onClick={() => navigate(`/list/${props.list.id}`)}
    >

      <header>
        <p>Mise à jour {formatUpdatedAt(props.list.UPDATED_AT)}</p>
        <h2>
          {props.list.SUPPLIER}
        </h2>
      </header>

      <hr />


      <ul className="list-demo unstyled">
        <For each={props.list.ITEMS.slice(0, 5)}>
          {(item) => (
            <li>{products()?.find((p) => p.id === item)?.PRODUCT}</li>
          )}
        </For>
      </ul>
    </button>
  )
}
