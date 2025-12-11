import { For, onMount, Show } from "solid-js";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { CheckIcon } from "../assets/Icons";
import { useNavigate, useParams } from "@solidjs/router";
import Popup from "./Popup";

export default function ProductList() {
  const { fetchLists, lists, setListItem } = useLists();
  const { getSupplierProducts } = useProducts()
  const params = useParams();
  const navigate = useNavigate();



  onMount(() => fetchLists());
  const list = () => lists.find((l) => l.id === params.id);



  return (
    <Show when={list()} fallback={"chargement"}>
      <section>
        <header className="flex">
          <h1>{list().SUPPLIER}</h1>
          <Popup title="Options" />
        </header>
        <ul className="list" id="product-list">
          <For each={getSupplierProducts(list().SUPPLIER)}>
            {(product) => (
              <li>
                <label htmlFor={product.id} className="focus-ring">
                  <span className="checkbox-wrapper">
                    <CheckIcon active={list().ITEMS.includes(product.id)} />
                  </span>
                  <input
                    type="checkbox"
                    className="invisible"
                    id={product.id}
                    checked={list().ITEMS.includes(product.id)}
                    onChange={() => setListItem(list().id, product.id)}
                  />
                  {product.PRODUCT}
                </label>
              </li>
            )}
          </For>
        </ul>
      </section>
      <button
        className="btn primary position bottom"
        onClick={() => list() && navigate(`/command/${list().id}`)}
      >
        Commander
      </button>
    </Show>
  );
}
