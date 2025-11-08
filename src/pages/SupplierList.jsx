import { A } from "@solidjs/router";
import { useProducts } from "../utils/useProducts";
import { For, Show } from "solid-js";
import "../styles/List.css"

export default function Supplier() {
  const { supplier } = useProducts();

  return (
    <>
      <h1>Fournisseur</h1>
      <Show when={supplier().length} fallback={<p>Chargement...</p>}>
        <ul className="list">
          <For each={supplier()}>
            {(s) => (
              <li>
                <A href={`/list/new?supplier=${encodeURIComponent(s)}`}>
                  {s}
                </A>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" /></svg>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </>
  );
}
