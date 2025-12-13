import { For, Show, onMount, createMemo, createSignal, createEffect } from "solid-js";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { CheckIcon } from "../assets/Icons";
import { useNavigate, useParams } from "@solidjs/router";
import Popup from "./Popup";
import { Filter as FilterControl, Sorter, applySort } from "./Filter";

export default function ProductList() {
  const { fetchLists, lists, setListItem, deleteList } = useLists();
  const { getSupplierProducts } = useProducts();
  const params = useParams();
  const navigate = useNavigate();

  const defaultSort = { key: "PRODUCT", dir: "asc" };
  const [activeSort, setActiveSort] = createSignal(defaultSort);
  const [filteredProducts, setFilteredProducts] = createSignal([]);
  const [sortedProducts, setSortedProducts] = createSignal([]);


  onMount(() => fetchLists());
  const list = () => lists.find((l) => l.id === params.id);

  const handleAddProduct = () => navigate("/import");

  const handleUncheckAll = () => {
    const current = list();
    if (!current) return;
    current.ITEMS.forEach((itemId) => setListItem(current.id, itemId));
  };

  const handleClearList = () => {
    const current = list();
    if (!current) return;
    if (confirm(`Supprimer la liste "${current.SUPPLIER}" ?`)) {
      deleteList(current.id);
      navigate("/lists");
    }
  };

  const productsWithStatus = createMemo(() => {
    const items = getSupplierProducts(list()?.SUPPLIER) || [];
    const itemIds = list()?.ITEMS || [];
    console.log(items())
    return items().map((p) => ({ ...p, CHECKED: itemIds.includes(p.id) }));
  });

  const filters = [
    { label: "Tous", key: "CHECKED", fn: () => true, default: true },
    { label: "Cochés", key: "CHECKED", fn: (v) => v === true },
    { label: "Non cochés", key: "CHECKED", fn: (v) => v !== true },
  ];

  const sorterOptions = [
    {
      key: "PRODUCT",
      label: "Nom du produit",
      directions: [
        { dir: "asc", default: true },
        { dir: "desc" },
      ],
    },
  ];

  // Appliquer les filtres par défaut dès que la source change
  createEffect(() => {
    const source = productsWithStatus();
    setFilteredProducts(source);
  });

  // Appliquer le tri courant sur la liste filtrée
  createEffect(() => {
    const base = filteredProducts();
    const sort = activeSort() || defaultSort;
    setSortedProducts(applySort(base, sort.key, sort.dir));
  });

  const filterContent = (
    <div className="filter-sheet">
      <Sorter
        options={sorterOptions}
        list={filteredProducts()}
        setList={setSortedProducts}
        activeSort={activeSort()}
        name="product-sorter"
        onSort={(opt, dir) => setActiveSort({ key: opt.key, dir })}
      />

      <FilterControl
        filters={filters}
        list={productsWithStatus()}
        setList={setFilteredProducts}
      />

      <div className="filter-group">
        <h4 className="filter-label">Actions</h4>
        <div className="flex column gap">
          <button className="btn ghost full" type="button" onClick={handleAddProduct}>
            Ajouter un article
          </button>
          <button className="btn ghost full" type="button" onClick={handleUncheckAll}>
            Décochez tout
          </button>
          <button className="btn ghost full" type="button" onClick={handleClearList}>
            Supprimer la liste
          </button>
        </div>
      </div>
    </div>
  );



  return (
    <Show when={list()} fallback={"chargement"}>
      <section>
        <header className="flex">
          <h1>{list().SUPPLIER}</h1>
          <Popup title="Options" content={filterContent} />
        </header>
        <ul className="list" id="product-list">
          <For each={sortedProducts()}>
            {(product) => (
              <li>
                <label htmlFor={product.id} className="focus-ring">
                  <span className="checkbox-wrapper">
                    <CheckIcon active={list()?.ITEMS?.includes(product.id)} />
                  </span>
                  <input
                    type="checkbox"
                    className="invisible"
                    id={product.id}
                    checked={list()?.ITEMS?.includes(product.id)}
                    onChange={() => list() && setListItem(list().id, product.id)}
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
