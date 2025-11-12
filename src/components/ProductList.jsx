import { createEffect, createSignal, onMount } from "solid-js";
import { useLists } from "../utils/useLists";
import { useParams } from "@solidjs/router";
import { useProducts } from "../utils/useProducts";


export default function ProductList(props) {
  const { fetchLists, lists, setListItem } = useLists()
  const { getSupplierProducts } = useProducts()

  onMount(() => { fetchLists() })


  const list = () => lists.find((l) => l.id === props.id)

  return (
    <Show when={list()} fallback={"chargement"}>
      <h1>Liste pour {list().SUPPLIER}</h1>
      <ul className="list fade-overflow" id="product-list">
        <For each={getSupplierProducts(list().SUPPLIER)}>
          {(product) => (
            <li>
              <label htmlFor={product.id}>
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
    </Show >
  )
}