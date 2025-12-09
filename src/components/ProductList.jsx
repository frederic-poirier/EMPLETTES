import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { CheckIcon, ChevronRight } from "../assets/Icons";
import { useNavigate, useParams } from "@solidjs/router";
import Popup from "./Popup";
import SupplierInfo from "./SupplierInfo";

export default function ProductList() {
  const { fetchLists, lists, setListItem, deleteList } = useLists();
  const { getSupplierProducts } = useProducts();
  const params = useParams()
  const navigate = useNavigate()

  const [sortOrder, setSortOrder] = createSignal("asc")
  const [checkedFilter, setCheckedFilter] = createSignal("all")

  onMount(() => fetchLists());
  const list = () => lists.find((l) => l.id === params.id);

  const handleAddProduct = () => {
    // Navigation vers la page d'importation ou un formulaire d'ajout
    navigate("/import");
  };

  const handleUncheckAll = () => {
    const currentList = list();
    if (!currentList) return;

    // Décocher tous les articles
    currentList.ITEMS.forEach((itemId) => {
      setListItem(currentList.id, itemId);
    });
  };

  const handleClearList = () => {
    const currentList = list();
    if (!currentList) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer la liste "${currentList.SUPPLIER}" ?`)) {
      deleteList(currentList.id);
      navigate("/lists");
    }
  };

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
      <section>
        <header className="flex">
          <h1>{list().SUPPLIER}</h1>
          <Popup groups={[
            ...filterGroups,
            {
              title: "Actions",
              name: "actions",
              options: [
                { label: "Ajouter un article", onClick: handleAddProduct },
                { label: "Décochez tout", onClick: handleUncheckAll },
                { label: "Supprimer la liste", onClick: handleClearList },
              ],
            },
          ]} />
        </header>
        <details open className="focus-ring">
          <summary className="title flex">
            <ChevronRight />
            Information
            </summary>
          <SupplierInfo list={list} />
        </details>
        <details open className="focus-ring">
          <summary className="title flex focus-ring">
                        <ChevronRight />

              Liste de produit ({orderedProducts().length} articles)
                          </summary>

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
            </details>

    
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
