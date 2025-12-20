import { useNavigate, useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, onMount, createSignal, createEffect } from "solid-js";
import { applySort, Sorter, FilterControl } from "../components/Filter";
import Popup from "../components/Popup";
import { CheckIcon } from "../assets/Icons";
import List from "../components/List";
import { LoadingState, Container, ContainerHeading, ContainerFooter } from "../components/Layout";

export default function ProductList() {
  const { fetchLists, lists, setListItem, deleteList } = useLists()
  const { getSupplierProducts } = useProducts()
  const params = useParams()
  const navigate = useNavigate()

  onMount(fetchLists)
  const list = createMemo(() => lists().find((l) => l.id === params?.id))
  const products = createMemo(() => getSupplierProducts(list()?.SUPPLIER)?.() ?? [])

  const checkedIds = createMemo(() => {
    const l = list();
    if (!l) return new Set();

    const raw =
      Array.isArray(l.ITEMS)
        ? l.ITEMS
        : Array.isArray(l.items)
          ? l.items
          : [];

    return new Set(
      raw.map((i) =>
        typeof i === "string"
          ? i
          : i?.productId ?? i?.id ?? i
      )
    );
  });

  const defaultSort = { key: "PRODUCT", dir: "asc" };
  const [activeSort, setActiveSort] = createSignal(defaultSort);
  const [activeFilter, setActiveFilter] = createSignal("ALL");

  const filteredProducts = createMemo(() => {
    const source = products();
    const checked = checkedIds();

    if (activeFilter() === "CHECKED") {
      return source.filter((p) => checked.has(p.id));
    }

    if (activeFilter() === "UNCHECKED") {
      return source.filter((p) => !checked.has(p.id));
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
    <Show when={list() && sortedProducts()} fallback={
      <LoadingState title="Chargement de la liste..." />
    }>
      <Container>
        <ContainerHeading title={list().SUPPLIER}>
          <Popup title="Options" content={filterContent} />
        </ContainerHeading>

        <List
          items={sortedProducts()}
          emptyTitle="Aucun produit dans cette liste"
        >
          {(product) => {
            const checked = () => checkedIds().has(product.id);
            const bg = () => checked() ? "bg-neutral-200/50 dark:bg-neutral-700" : "";
            return (
              <label className="p-2 flex items-start gap-3">
                <span className={`border border-neutral-200 dark:border-neutral-700 ${bg()} rounded mt-1`}>
                  <CheckIcon active={checked()} />
                </span>

                <input
                  className="sr-only"
                  type="checkbox"
                  checked={checked()}
                  onChange={() =>
                    setListItem(list().id, product.id)
                  }
                />

                {product.PRODUCT}
              </label>
            );
          }}
        </List>

        <ContainerFooter>
          <button
            className="p-2 mt-2 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => navigate(`/command/${list().id}`)}
          >
            Commander
          </button>
        </ContainerFooter>
      </Container>
    </Show >

  );
}
