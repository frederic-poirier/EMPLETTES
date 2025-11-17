import { onMount } from "solid-js";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { CheckIcon } from "../assets/Icons";

export default function ProductList(props) {
  const { fetchLists, lists, setListItem } = useLists();
  const { getSupplierProducts } = useProducts();

  onMount(() => fetchLists());
  const list = () => lists.find((l) => l.id === props.id);

  return (
    <Show when={list()} fallback={"chargement"}>
      <ul className="list" id="product-list">
        <For each={getSupplierProducts(list().SUPPLIER)}>
          {(product) => (
            <li>
              <label htmlFor={product.id}>
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
    </Show>
  );
}
