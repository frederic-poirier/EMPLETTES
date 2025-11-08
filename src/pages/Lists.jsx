import { useLists } from "../utils/useList";
import { A } from "@solidjs/router";

export default function Lists() {
  const { getLists, loading } = useLists();

  return (
    <>
      <h1>Listes</h1>
      <section>
        <Show when={!loading} fallback={"chargement"}>
          <Show when={getLists().length} fallback={"Not list yet"}>
            beaucoup de liste
          </Show>
        </Show>
      </section>
      <button><A href="/list/new">Ajouté une nouvelle liste</A></button>
    </>
  );
}
