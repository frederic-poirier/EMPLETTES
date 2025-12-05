import { createSignal, createEffect, Show, For, createMemo } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useProducts } from "../utils/useProducts";
import { useLists } from "../utils/useLists";

import Sheet from "../components/Sheet";
import { SearchIcon } from "../assets/Icons";
import { EmptyState } from "../components/Layout";
import Filter from "../components/Filter";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addList } = useLists();
  const { products } = useProducts();

  const [value, setValue] = createSignal(searchParams.query || "");
  const [product, setProduct] = createSignal(null);
  const [sortOrder, setSortOrder] = createSignal("asc");

  let timeoutID = null;

  createEffect(() => setValue(searchParams.query || ""));

  const cleanQuery = () => (searchParams.query || "").trim().toLowerCase();

  const filterOptions = [
    { label: "A-Z", value: "asc" },
    { label: "Z-A", value: "desc" },
  ];

  const filterAction = (order) => setSortOrder(order);

  const filteredProducts = createMemo(() => {
    const q = cleanQuery();
    if (!q) return products() || [];
    return products()?.filter((p) =>
      p.PRODUCT.toLowerCase().includes(q)
    );
  });

  const orderedProducts = createMemo(() => {
    const list = filteredProducts() || [];
    return [...list].sort((a, b) => {
      const cmp = a.PRODUCT.localeCompare(b.PRODUCT, "fr", { sensitivity: "base" });
      return sortOrder() === "desc" ? -cmp : cmp;
    });
  });

  const handleInput = (e) => {
    const value = e.currentTarget.value;
    setValue(value);

    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      setSearchParams({ query: value });
    }, 300);
  };


  const navigate = useNavigate();

  const createListAndOpen = async () => {
    const p = product();
    if (!p) return;

    const supplier = p.SUPPLIER;

    // 1. crǸer la liste
    const listID = await addList(supplier);

    // 2. fermer la fiche produit
    const el = document.getElementById(52);
    el?.hidePopover();

    navigate(`/list/${listID}`, { replace: true });
  };

  return (
    <section className="fade-overflow y">

      <header>
        <label htmlFor="search" className="card input-search">
          <SearchIcon />
          <input
            id="search"
            type="text"
            placeholder="Rechercher"
            className="ghost"
            onInput={handleInput}
            value={value()}
          />
          <span>{orderedProducts()?.length} results</span>
        </label>
        <Filter options={filterOptions} action={filterAction} selected={sortOrder()} />
      </header>

      <Show when={orderedProducts()?.length > 0} fallback={
        <EmptyState
          title="Aucune résultat"

        >il n'y a aucun résultat pour la recherche "{searchParams.query}"
        </EmptyState>
      }>
        <ul className="list search-list">

          <For each={orderedProducts()}>
            {(p) => (
              <li>
                <button
                  popoverTarget={52}
                  className="unset full"
                  onClick={() => setProduct(p)}
                >
                  {p.PRODUCT}
                </button>
              </li>
            )}
          </For>
        </ul>

      </Show>


      <Sheet
        id={52}
        maxHeightVH={80}
        title="Fiche de produit"
        content={<ProductSheet product={product} />}
        footer={
          <button class="btn primary full" onClick={createListAndOpen}>
            Faire une liste pour {product()?.SUPPLIER}
          </button>
        }
        onClose={() => setProduct(null)}
      />
    </section>
  );
}

function ProductSheet(props) {
  const p = () => props.product();
  return (
    <div className="product-data">
      <p>Nom du produit</p>
      <h5>{p()?.PRODUCT}</h5>

      <p>Nom de la marque</p>
      <h5>{p()?.BRAND}</h5>

      <p>Nom du fournisseur</p>
      <h5>{p()?.SUPPLIER}</h5>

      <p>Code du produit</p>
      <h5>{p()?.SKU || "Unknown"}</h5>
    </div>
  );
}
