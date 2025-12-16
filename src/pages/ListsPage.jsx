import { useLists } from "../utils/useLists";
import { A, useNavigate } from "@solidjs/router";
import { Show, For } from "solid-js";
import { LoadingState, EmptyState } from "../components/Layout";
import { ListCard } from "../components/ListCard"
import { AddIcon } from "../assets/Icons";

export default function ListsPage() {
  const { nonEmpty, loading } = useLists();
  const navigate = useNavigate()

  return (
    <>
      <Show
        when={!loading()}
        fallback={<LoadingState title="Chargement">Chargement des listes</LoadingState>}
      >
        <Show
          when={nonEmpty().length > 0}
          fallback={<EmptyState title="Aucune liste">Aucune liste encore</EmptyState>}
        >
          <div className="container">
            <header className="flex sb">
              <h1>Listes</h1>
              <button
                className="ghost btn flex gap-sm"
                onClick={() => navigate('/list/new')}
              >
                <AddIcon />
                Nouvelle liste
              </button>
            </header>
            <section id="list-page">
              <For each={nonEmpty()}>
                {(list) => <ListCard list={list} />}
              </For>
            </section>
          </div>

        </Show>
      </Show>
    </>
  );
}