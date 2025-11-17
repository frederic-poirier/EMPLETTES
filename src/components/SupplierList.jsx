import { useProducts } from "../utils/useProducts";
import { A, useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import "../styles/List.css";
import { useLists } from "../utils/useLists";

export default function Supplier(props) {
  const { suppliers } = useProducts();
  const { addList } = useLists();

  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    props.onSelect(listID); // <<< on passe l'info au flux
  };

  return (
      <Show when={suppliers()?.length} fallback={<p>Chargement…</p>}>
        <ul class="list">
          <For each={suppliers()}>
            {(s) => (
              <li onClick={() => handleClick(s)}>
                <span>{s}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 -960 960 960"
                  width="24px"
                  fill="#e3e3e3"
                >
                  <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
                </svg>
              </li>
            )}
          </For>
        </ul>
      </Show>
  );
}
