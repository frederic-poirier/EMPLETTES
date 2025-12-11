import { createSignal, createEffect, Show, For, createMemo } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useProducts } from "../utils/useProducts";
import { useLists } from "../utils/useLists";

import Popup from "../components/Popup";
import Sheet from "../components/Sheet";
import { Sorter, applySort } from "../components/Filter";
import { SearchIcon } from "../assets/Icons";
import { EmptyState } from "../components/Layout";
import "../styles/ProductSheet.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addList } = useLists();
  const { products, suppliers, categories, updateProduct, deleteProduct } = useProducts();

  const [value, setValue] = createSignal(searchParams.query || "");
  const [product, setProduct] = createSignal(null);

  const [sortedProducts, setSortedProducts] = createSignal([]);
  const [currentSort, setCurrentSort] = createSignal(null);

  const sortedOptions = [
    {
      key: "PRODUCT",
      label: "Nom du produit",
      directions: [
        { dir: "asc", default: true },
        { dir: "desc" }
      ]
    },
    {
      key: "SUPPLIER",
      label: "Fournisseur",
      directions: [
        { dir: "asc" },
        { dir: "desc" }
      ]
    },
  ];

  const defaultSort = (() => {
    const opt = sortedOptions.find((o) => o.directions.some((d) => d.default)) || sortedOptions[0];
    const dir = opt?.directions?.find((d) => d.default)?.dir || opt?.directions?.[0]?.dir;
    return opt && dir ? { opt, dir } : null;
  })();

  createEffect(() => setValue(searchParams.query || ""));

  const cleanQuery = () => (searchParams.query || "").trim().toLowerCase();

  const filteredProducts = createMemo(() => {
    const q = cleanQuery();
    if (!q) return products() || [];
    return products()?.filter((p) =>
      p.PRODUCT.toLowerCase().includes(q)
    );
  });

  createEffect(() => {
    const base = filteredProducts();

    const active = currentSort() || defaultSort;
    if (!active) {
      setSortedProducts(base);
      return;
    }

    const { opt, dir } = active;
    const sorted = applySort(base, opt.key, dir);
    setSortedProducts(sorted);
  });

  let timeoutID = null;
  const handleInput = (e) => {
    const value = e.currentTarget.value;
    setValue(value);

    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      setSearchParams({ query: value });
    }, 300);
  };

  const navigate = useNavigate();

  const handleSaveProduct = async (id, payload) => {
    const updated = await updateProduct(id, payload);
    if (updated) {
      setProduct((p) => (p && p.id === id ? { ...p, ...updated } : p));
    }
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setProduct(null);
    document.getElementById(52)?.hidePopover?.();
  };

  const createListAndOpen = async () => {
    if (!product()) return;

    const listID = await addList(product().SUPPLIER);
    const el = document.getElementById(52);
    el?.hidePopover();

    navigate(`/list/${listID}`, { replace: true });
  };

  return (
    <>
      <header className="flex">
        <label htmlFor="search" className="card input-search focus-ring">
          <SearchIcon />
          <input
            id="search"
            type="text"
            placeholder="Rechercher"
            className="ghost"
            onInput={handleInput}
            value={value()}
          />
          <span>{sortedProducts()?.length}&nbsp;results</span>
        </label>

        <Popup
          title="Trier"
          content={
            <Sorter
              options={sortedOptions}
              list={sortedProducts()}
              setList={setSortedProducts}
              activeSort={currentSort() || defaultSort}
              name="search-sorter"
              onSort={(opt, dir) => setCurrentSort({ opt, dir })}
            />
          }
        />
      </header>

      <Show when={sortedProducts()?.length > 0} fallback={
        <EmptyState
          title="Aucune résultat"
        >
          il n'y a aucun résultat pour la recherche "{searchParams.query}"
        </EmptyState>
      }>
        <section className="fade-overflow y">
          <ul className="list search-list">
            <For each={sortedProducts()}>
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
        </section>
      </Show>

      <Sheet
        id={52}
        title="Fiche de produit"
        content={
          <ProductSheet
            product={product}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            suppliers={suppliers}
            categories={categories}
          />
        }
        footer={
          <button class="btn primary full" onClick={createListAndOpen}>
            Faire une liste pour {product()?.SUPPLIER}
          </button>
        }
        onClose={() => setProduct(null)}
      />
    </>
  );
}


function ProductSheet(props) {
  const p = () => props.product();
  const [form, setForm] = createSignal(buildForm(p()));
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");

  createEffect(() => {
    setForm(buildForm(p()));
    setError("");
    setSuccess("");
  });

  const updateField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.currentTarget.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!p()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = buildPayload(form());
      await props.onSave?.(p().id, payload);
      setSuccess("Enregistré");
    } catch (err) {
      console.error("Product update failed", err);
      setError("Impossible d'enregistrer les modifications.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!p()) return;
    const confirmed = window.confirm?.("Supprimer ce produit ?");
    if (confirmed === false) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await props.onDelete?.(p().id);
    } catch (err) {
      console.error("Product delete failed", err);
      setError("Suppression impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="product-data" onSubmit={handleSubmit}>
      <Field
        label="Nom du produit"
        value={form().PRODUCT}
        onInput={updateField("PRODUCT")}
        required
      />
      <Field
        label="Nom de la marque"
        value={form().BRAND}
        onInput={updateField("BRAND")}
      />
      <Field
        label="Nom du fournisseur"
        value={form().SUPPLIER}
        onInput={updateField("SUPPLIER")}
        options={props.suppliers?.() || []}
      />
      <Field
        label="Code du produit"
        value={form().SKU}
        onInput={updateField("SKU")}
      />

      <Field
        label="Quantite"
        type="number"
        min="0"
        step="1"
        value={form().QUANTITY}
        onInput={updateField("QUANTITY")}
      />
      <Field
        label="Prix de vente"
        type="number"
        min="0"
        step="0.01"
        value={form().SELL_PRICE}
        onInput={updateField("SELL_PRICE")}
      />
      <Field
        label="Prix de revient"
        type="number"
        min="0"
        step="0.01"
        value={form().COST_PRICE}
        onInput={updateField("COST_PRICE")}
      />
      <Field
        label="Categorie"
        value={form().CATEGORY}
        onInput={updateField("CATEGORY")}
        options={props.categories?.() || []}
      />

      <Show when={error()}>
        <p className="error">{error()}</p>
      </Show>
      <Show when={success()}>
        <p className="success">{success()}</p>
      </Show>

      <div className="flex gap">
        <button class="btn subtle" type="submit" disabled={saving()}>
          {saving() ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          class="btn subtle"
          type="button"
          onClick={handleDelete}
          disabled={saving()}
        >
          Supprimer l'article
        </button>
      </div>
    </form>
  );
}

function Field(props) {
  const listId = props.options?.length
    ? `${props.label.replace(/\s+/g, "-").toLowerCase()}-options`
    : undefined;

  return (
    <label className="field column">
      <span>{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        required={props.required}
        min={props.min}
        step={props.step}
        className="ghost"
        onInput={props.onInput}
        placeholder="Inconnu"
        list={listId}
      />
      <Show when={props.options?.length}>
        <datalist id={listId}>
          <For each={props.options}>
            {(option) => <option value={option} />}
          </For>
        </datalist>
      </Show>
    </label>
  );
}

function buildForm(product) {
  return {
    PRODUCT: product?.PRODUCT ?? "",
    BRAND: product?.BRAND ?? "",
    SUPPLIER: product?.SUPPLIER ?? "",
    SKU: product?.SKU ?? "",
    QUANTITY: product?.QUANTITY ?? "",
    SELL_PRICE: product?.SELL_PRICE ?? "",
    COST_PRICE: product?.COST_PRICE ?? "",
    CATEGORY: product?.CATEGORY ?? "",
  };
}

function buildPayload(form) {
  const toNumber = (value) => {
    if (value === "" || value == null) return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  return {
    PRODUCT: (form.PRODUCT || "").trim(),
    BRAND: (form.BRAND || "").trim(),
    SUPPLIER: (form.SUPPLIER || "").trim(),
    SKU: (form.SKU || "").trim(),
    QUANTITY: toNumber(form.QUANTITY),
    SELL_PRICE: toNumber(form.SELL_PRICE),
    COST_PRICE: toNumber(form.COST_PRICE),
    CATEGORY: (form.CATEGORY || "").trim() || null,
  };
}
