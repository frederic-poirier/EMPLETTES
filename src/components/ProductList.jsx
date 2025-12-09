import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { CheckIcon } from "../assets/Icons";
import { useNavigate, useParams } from "@solidjs/router";
import Filter from "./Filter";

export default function ProductList() {
  const { fetchLists, lists, setListItem } = useLists();
  const { getSupplierProducts } = useProducts();
  const params = useParams()
  const navigate = useNavigate()

  const [sortOrder, setSortOrder] = createSignal("asc")
  const [checkedFilter, setCheckedFilter] = createSignal("all")

  onMount(() => fetchLists());
  const list = () => lists.find((l) => l.id === params.id);

  const sortOptions = [
    { label: "A-Z", value: "asc" },
    { label: "Z-A", value: "desc" },
  ]

  const checkedOptions = [
    { label: "Tous", value: "all" },
    { label: "Cochés", value: "checked" },
    { label: "Non cochés", value: "unchecked" },
  ]

  const filterGroups = [
    {
      title: "Ordre alphabétique",
      options: sortOptions,
      selected: sortOrder(),
      action: setSortOrder,
      name: "order-filter",
    },
    {
      title: "État",
      options: checkedOptions,
      selected: checkedFilter(),
      action: setCheckedFilter,
      name: "checked-filter",
    },
  ]

  const orderedProducts = createMemo(() => {
    const items = getSupplierProducts(list()?.SUPPLIER) || []
    const filtered = items.filter((p) => {
      const isChecked = list()?.ITEMS.includes(p.id)
      if (checkedFilter() === "checked") return isChecked
      if (checkedFilter() === "unchecked") return !isChecked
      return true
    })
    return [...filtered].sort((a, b) => {
      const cmp = a.PRODUCT.localeCompare(b.PRODUCT, "fr", { sensitivity: "base" })
      return sortOrder() === "desc" ? -cmp : cmp
    })
  })

return (
    <Show when={list()} fallback={"chargement"}>
      <section className="fade-overflow y">
        <header className="flex">
          <h1>{list().SUPPLIER}</h1>
          <Filter groups={filterGroups} />
        </header>
        <ul className="list" id="product-list">
          <For each={orderedProducts()}>
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
        className="btn primary bottom"
        onClick={() => list() && navigate(`/command/${list().id}`)}
      >
        Commander
      </button>
    </Show>
  );
}
