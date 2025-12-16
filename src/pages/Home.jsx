import { A, useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { useLists } from "../utils/useLists";
import { AddIcon, ChevronRight } from "../assets/Icons";
import { ListCard } from "../components/ListCard";
import { EmptyState, LoadingState } from "../components/Layout";
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
    <section className="container">
      <h1>Accueil</h1>
      <h4 className="padding-small flex sb">Dernière liste

        <A href="/lists" class="chevron-link btn ghost flex small">Voir les listes<ChevronRight /></A>
      </h4>
      <section className="list-preview">
        <Show
          when={!loading() && latest()}
          fallback={
            <section className="list-preview card">
              {loading()
              ? <LoadingState title="Chargement">
                <p>Préparation de votre dernière liste...</p>
              </LoadingState>
              : <EmptyState title="Aucune liste récente">
                <A className="flex small" href="/list/new">
                  <AddIcon className="small" />
                  Créer une liste
                </A>
              </EmptyState>}
            </section>
          }
        >
          <ListCard list={latest()} />
        </Show >
      </section>


      <h4 className="padding-small">Autre actions</h4>
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
    </section>
  );
}
