import { useLists } from "../utils/useLists";
import { A } from "@solidjs/router";
import { Show, For } from "solid-js";
import { LoadingState, EmptyState } from "../components/Layout";
import { ListCard } from "../components/ListCard"

export default function ListsPage() {
  const { nonEmpty, loading } = useLists();

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
          <div>
            <h1>Listes</h1>
            <section id="list-page">
              <For each={nonEmpty()}>
                {(list) => <ListCard list={list} />}
              </For>
            </section>
          </div>

          <A href="/list/new" class="btn primary bottom">
            Nouvelle liste
          </A>
        </Show>
      </Show>
    </>
  );
}