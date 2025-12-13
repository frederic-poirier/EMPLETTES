import { useNavigate, useSearchParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { Sorter, applySort } from "../components/Filter";
import {
  createSignal,
  createMemo,
  createEffect,
  Show,
  For,
} from "solid-js";
import { SearchIcon } from "../assets/Icons";
import Popup from "../components/Popup";
import { EmptyState } from "../components/Layout";
import Sheet from "../components/Sheet";
import "../styles/ProductSheet.css";

export default function Search() {
  const navigate = useNavigate()
  const { addList } = useLists();
  const { products, suppliers, categories, updateProduct, deleteProduct } =
    useProducts();

  const defaultSort = { key: "PRODUCT", dir: "asc" };

  const [sort, setSort] = createSignal(defaultSort);
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = createSignal(searchParams.query ?? "");
  const [activeProduct, setActiveProduct] = createSignal(null);


  const query = createMemo(() => (searchParams.query ?? "").trim().toLowerCase());

  const filteredProducts = createMemo(() => {
    const q = query();
    const list = products() ?? [];
    if (!q) return list;
    return list.filter((p) => p.PRODUCT.toLowerCase().includes(q));
  });

  const sortedProducts = createMemo(() => applySort(filteredProducts(), sort().key, sort().dir));

  let debounce;
  const handleInput = (e) => {
    const v = e.currentTarget.value;
    setInput(v);
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      setSearchParams({ query: v || undefined });
    }, 300);
  };

  const handleSaveProduct = async (id, payload) => {
    await updateProduct(id, payload);
    setActiveProduct((p) => (p && p.id === id ? { ...p, ...payload } : p));
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setActiveProduct(null);
    document.getElementById(52)?.hidePopover?.();
  };

  const createListAndOpen = async () => {
    if (!activeProduct()) return;
    const id = await addList(activeProduct().SUPPLIER);
    navigate(`/list/${id}`, { replace: true });
  };


  return (
    <>
      <header className="flex sticky">
        <label className="card input-search focus-ring">
          <SearchIcon />
          <input
            type="text"
            placeholder="Rechercher"
            className="ghost"
            value={input()}
            onInput={handleInput}
          />
          <Popup
            title="Options"
            content={
              <Sorter
                options={[
                  {
                    key: "PRODUCT",
                    label: "Nom du produit",
                    directions: [
                      { dir: "asc", default: true },
                      { dir: "desc" },
                    ],
                  },
                ]}
                activeSort={sort()}
                onSort={(opt, dir) => setSort({ key: opt.key, dir })}
              />
            }
          />
        </label>
      </header>

      <Show
        when={sortedProducts().length > 0}
        fallback={
          <EmptyState title="Aucun résultat">
            Aucun résultat pour « {searchParams.query} »
          </EmptyState>
        }
      >
        <section className="fade-overflow y">
          <ul className="list search-list">
            <For each={sortedProducts()}>
              {(p) => (
                <li>
                  <button
                    className="unset full"
                    popoverTarget={52}
                    onClick={() => setActiveProduct(p)}
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
        title="Fiche produit"
        content={
          <ProductSheet
            product={activeProduct}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            suppliers={suppliers}
            categories={categories}
          />
        }
        footer={
          <button class="btn primary full" onClick={createListAndOpen}>
            Faire une liste pour {activeProduct()?.SUPPLIER}
          </button>
        }
        onClose={() => setActiveProduct(null)}
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
      <h4>{props.label}</h4>
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
