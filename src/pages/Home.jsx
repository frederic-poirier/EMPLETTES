import { A, useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import { ListCard } from "../components/ListCard";
import { LoadingState } from "../components/Layout";
import "../styles/Home.css";



const actions = [
  { label: "Rechercher un article", to: "/search" },
  { label: "Ajouter des articles", to: "/import" },
  { label: "Créer une nouvelle liste", to: "/list/new" },
];

export default function Home() {
  const navigate = useNavigate();
  const { latest, loading } = useLists();

  return (
    <>
      <div className="title flex sb">
        <h3>Dernière liste</h3>

        <A href="/lists" class="chevron-link btn ghost flex">Voir les listes<ChevronRight /></A>
      </div>
      <Show
        when={!loading() && latest()}
        fallback={
          loading()
            ? <LoadingState title="Chargement" />
            : <p className="muted">Aucune liste r\u00e9cente</p>
        }
      >
        <section className="list-preview">
          <ListCard list={latest()} />
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
