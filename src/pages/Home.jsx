import { A, useNavigate } from "@solidjs/router";
import { For, Show, createMemo, onMount } from "solid-js";
import "../styles/Home.css";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import { ListCard } from "./ListsPage";
import { LoadingState } from "../components/Layout";


const actions = [
  { label: "Rechercher un article", to: "/search" },
  { label: "Ajouter des articles", to: "/import" },
  { label: "Créer une nouvelle liste", to: "/list/new" },
];

export default function Home() {
  const navigate = useNavigate();
  const { fetchLists, lists } = useLists();

  onMount(() => fetchLists());
  const latestList = createMemo(() => lists[0]);


  return (
    <div class="home-layout">

      <div className="home-layout-header">
        <h3>Listes</h3>

        <A href="/lists" class="btn ghost small">Voir les listes <ChevronRight /></A>
      </div>
      <Show when={latestList()} fallback={<LoadingState title="Chargement" />}>
        <section className="list-preview">
          <ListCard list={latestList()} />
        </section>
      </Show>

      <div className="home-layout-header">
        <h3>Autre actions</h3>
      </div>
      <section>
        <ul className="unstyled home-actions">
          <For each={actions}>
            {(action) => (
              <li tabIndex={0} className="card action" onClick={() => navigate(action.to)}>
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
