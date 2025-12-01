import { A, useNavigate } from "@solidjs/router";
import { For, Show, createMemo, createSignal, onMount } from "solid-js";
import "../styles/Home.css";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { ChevronRight, SearchIcon } from "../assets/Icons";

let timeoutID = null;

const actions = [
  { label: "Rechercher un article", to: "/search" },
  { label: "Ajouter des articles", to: "/import" },
  { label: "Créer une nouvelle liste", to: "/list/new" },
];

export default function Home() {
  const navigate = useNavigate();
  const { fetchLists, lists } = useLists();
  const { products } = useProducts();

  onMount(() => fetchLists());

  const latestList = createMemo(() => {
    if (!lists || lists.length === 0) return null;
    return [...lists].sort(
      (a, b) => (b.UPDATED_AT?.seconds ?? 0) - (a.UPDATED_AT?.seconds ?? 0)
    )[0];
  });

  const latestItems = createMemo(() => {
    const list = latestList();
    if (!list) return [];
    return list.ITEMS.slice(0, 4)
      .map((id) => products()?.find((p) => p.id === id))
      .filter(Boolean);
  });

  const updatedAt = createMemo(() => {
    const ts = latestList()?.UPDATED_AT;
    if (!ts) return null;
    const ms = ts.seconds ? ts.seconds * 1000 : ts.toMillis ? ts.toMillis() : null;
    if (!ms) return null;
    const diff = Date.now() - ms;
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return "Maintenant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    const days = Math.round(hours / 24);
    return `Il y a ${days} j`;
  });

  return (
    <div class="home-layout">
      <div className="home-layout-header">
        <h3>Listes</h3>
        <A href="/lists" class="btn ghost small">Voir les listes <ChevronRight /></A>
      </div>
      <section class="home-list" onClick={() => latestList() && navigate(`/list/${latestList().id}`)}>
        <header>
          <h5>{latestList() ? latestList().SUPPLIER : "Aucune liste"}</h5>
          <div class="home-list-meta">
            <span>{latestList() ? `${latestList().ITEMS.length} articles` : "0 article"}</span>
            <span>{updatedAt() || "—"}</span>
          </div>
        </header>
        <div class="home-list-stack">
          <div class="home-list-body">
            <For each={latestItems()}>
              {(item) => <div class="home-chip">{item.PRODUCT}</div>}
            </For>
            <Show when={!latestList()}>
              <p class="muted">Aucun élément.</p>
            </Show>
          </div>
        </div>
      </section>

      <div className="home-layout-header">
        <h3>Autre actions</h3>
      </div>
      <section>
        <ul className="unstyled home-actions">
          <For each={actions}>
            {(action) => (
              <li className="card action" onClick={() => navigate(action.to)}>
                <span>{action.label}</span>
                <ChevronRight />
              </li>
            )}
          </For>
        </ul>
      </section>
    </div>
  );
}
