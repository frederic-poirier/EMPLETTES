import { useNavigate, useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, onMount, createSignal } from "solid-js";
import { applySort, Sorter, FilterControl } from "../components/Filter";
import Popup from "../components/Popup";
import { CheckIcon } from "../assets/Icons";
import List from "../components/List";

export default function ProductList() {
  const { fetchLists, lists, setListItem, deleteList } = useLists()
  const { getSupplierProducts } = useProducts()
  const params = useParams()
  const navigate = useNavigate()

  onMount(fetchLists)


  const list = createMemo(() => lists().find((l) => l.id === params.id))
  const products = createMemo(() => getSupplierProducts(list()?.SUPPLIER)?.() ?? [])

  const listItemIds = createMemo(() => {
    const l = list();
    if (!l) return [];
    if (Array.isArray(l.ITEMS)) {
      return l.ITEMS.map((i) =>
        typeof i === "string" ? i : i?.productId ?? i?.id ?? i
      );
    }
    if (Array.isArray(l.items)) {
      return l.items.map((i) =>
        typeof i === "string" ? i : i?.productId ?? i?.id ?? i
      );
    }
    return [];
  });

  const productsWithStatus = createMemo(() => {
    const itemsIds = listItemIds();
    return products().map((p) => ({
      ...p, CHECKED: itemsIds.includes(p.id),
    }))
  })

  const defaultSort = { key: "PRODUCT", dir: "asc" };
  const [activeSort, setActiveSort] = createSignal(defaultSort);
  const [activeFilter, setActiveFilter] = createSignal("ALL");

  const filteredProducts = createMemo(() => {
    const source = productsWithStatus();

    if (activeFilter() === "CHECKED") {
      return source.filter((p) => p.CHECKED);
    }
    if (activeFilter() === "UNCHECKED") {
      return source.filter((p) => !p.CHECKED);
    }
    return source;
  });

  const sortedProducts = createMemo(() =>
    applySort(
      filteredProducts(),
      activeSort().key,
      activeSort().dir
    )
  );

  const handleUncheckAll = () => {
    const current = list();
    if (!current) return;
    listItemIds().forEach((id) => setListItem(current.id, id));
  };

  const handleClearList = () => {
    const current = list();
    if (!current) return;
    if (confirm(`Supprimer la liste "${current.SUPPLIER}" ?`)) {
      deleteList(current.id);
      navigate("/lists");
    }
  };

  const filterContent = (
    <div className="filter-sheet">
      <Sorter
        options={[
          {
            key: "PRODUCT",
            label: "Nom du produit",
            directions: [{ dir: "asc", default: true }, { dir: "desc" }],
          },
        ]}
        activeSort={activeSort()}
        onSort={(opt, dir) => setActiveSort({ key: opt.key, dir })}
      />

      <FilterControl
        filters={[
          { label: "Tous", value: "ALL", default: true },
          { label: "Cochés", value: "CHECKED" },
          { label: "Non cochés", value: "UNCHECKED" },
        ]}
        onChange={setActiveFilter}
      />

      <div className="filter-group">
        <h4 className="filter-label">Actions</h4>
        <div className="flex column gap">
          <button className="btn ghost full" onClick={() => navigate("/import")}>
            Ajouter un article
          </button>
          <button className="btn ghost full" onClick={handleUncheckAll}>
            Décochez tout
          </button>
          <button className="btn ghost full" onClick={handleClearList}>
            Supprimer la liste
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <Show when={list() && sortedProducts()} fallback="Chargement…">
      <section>
        <header className="flex sb">
          <h1>{list().SUPPLIER}</h1>
          <Popup title="Options" content={filterContent} />
        </header>

        <List
          items={sortedProducts()}
          emptyTitle="Aucun produit dans cette liste"
        >
          {(product) => (
            <label className="focus-ring flex padding-base">
              <span className="checkbox-wrapper">
                <CheckIcon active={product.CHECKED} />
              </span>
              <input
                type="checkbox"
                className="invisible"
                checked={product.CHECKED}
                onChange={() =>
                  setListItem(list().id, product.id)
                }
              />
              {product.PRODUCT}
            </label>
          )}
        </List>
      </section>

      <button
        className="btn primary"
        onClick={() => navigate(`/command/${list().id}`)}
      >
        Commander
      </button>
    </Show >
  );
}
