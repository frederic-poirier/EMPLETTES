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
    <>
      <div className="title flex sb">
        <h3>Dernière liste</h3>

      <A href="/lists" class="chevron-link btn ghost flex">Voir les listes<ChevronRight /></A>
      </div>
      <Show when={latestList()} fallback={<LoadingState title="Chargement" />}>
        <section className="list-preview">
          <ListCard list={latestList()} />
        </section>
      </Show>

      <div className="title">
        <h3>Autre actions</h3>
      </div>
      <section>
        <ul className="unstyled">
          <For each={actions}>
            {(action) => (
              <li>
                <button className="card flex action" onClick={() => navigate(action.to)}>
                  <span>{action.label}</span>
                  <ChevronRight />
                </button>
              </li>
            )}
          </For>
        </ul>
      </section>
    </>
  );
}
