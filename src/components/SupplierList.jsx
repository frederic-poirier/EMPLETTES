import { useProducts } from "../utils/useProducts";
import { useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import "../styles/List.css";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import Popup from "./Popup";

export default function Supplier() {
  const { suppliers } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();
  

  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };


  return (
    <Show when={suppliers()?.length} fallback={<p>Chargement...</p>}>
      {console.log(suppliers())}
      <section className="fade-overflow y">
        <header className="flex">
          <h1>Fournisseur</h1>
          <div class="filter-row">
            <Popup 
              title="Trier"
              content="hey beaucoup de content ici :)"
            />
          </div>
        </header>
        <ul class="list">
          <For each={suppliers()}>
            {(s) => (
              <li tabIndex={0} onClick={() => handleClick(s)}>
                <div>
                  <span>{s}</span>
                </div>
                <ChevronRight />
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
