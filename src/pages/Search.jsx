import { useNavigate } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { Sorter, applySort } from "../components/Filter";
import { CodeError, DateAddIcon, DeleteIcon, ListIcon, SearchIcon } from "../assets/Icons";
import Popup from "../components/Popup";
import Sheet from "../components/Sheet";
import List from "../components/List";
import data from '../assets/categories.json'
import {
  createSignal,
  createMemo,
  createEffect,
  Show,
  For,
  onMount,
  createUniqueId,
} from "solid-js";

export default function Search() {
  const id = createUniqueId();
  const navigate = useNavigate()
  const { addList } = useLists();
  const { searchProducts, suppliers, categories, updateProduct, deleteProduct } = useProducts();

  let inputREF

  const defaultSort = { key: "PRODUCT", dir: "asc" };

  const [sort, setSort] = createSignal(defaultSort);
  const [input, setInput] = createSignal("");
  const [activeProduct, setActiveProduct] = createSignal(null);


  const searchedProducts = searchProducts(input)
  const sortedProducts = createMemo(() => applySort(searchedProducts(), sort().key, sort().dir));

  let debounce;
  const handleInput = (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => setInput(e.currentTarget.value), 300);
  };

  const handleSaveProduct = async (id, payload) => {
    await updateProduct(id, payload);
    setActiveProduct((p) => (p && p.id === id ? { ...p, ...payload } : p));
  };

  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setActiveProduct(null);
    document.getElementById(id)?.hidePopover?.();
  };

  const createListAndOpen = async () => {
    if (!activeProduct()) return;
    const id = await addList(activeProduct().SUPPLIER);
    navigate(`/list/${id}`, { replace: true });
  };

  onMount(() => inputREF.focus())


  return (
    <>
      <header className="flex sticky">
        <label className="card input-search focus-ring">
          <SearchIcon />
          <input
            ref={inputREF}
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
      <section>
        <List
          items={sortedProducts()}
          emptyTitle="Aucun résultat"
          emptyText={`Aucun résultat pour « ${input()} »`}
        >
          {(p) => (
            <button
              className="unset padding-base"
              popoverTarget={id}
              onClick={() => setActiveProduct(p)}
            >
              {p.PRODUCT}
            </button>
          )}
        </List>
      </section>
      <Sheet
        id={id}
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

  let saveTimeout;
  const updateField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.currentTarget.value }));

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      handleSubmit();
    }, 500);
  };

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
      setTimeout(() => setSuccess(""), 2000);
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
    <>
      <h4 className="padding-small">Information</h4>
      <form className="product-data card">
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
          label="Quantité"
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
          label="Catégorie"
          value={form().CATEGORY}
          onInput={updateField("CATEGORY")}
          options={[props.categories?.(), ...data] || []}
        />

        <Show when={saving()}>
          <p className="info">Enregistrement...</p>
        </Show>
        <Show when={error()}>
          <p className="error">{error()}</p>
        </Show>
        <Show when={success()}>
          <p className="success">{success()}</p>
        </Show>
      </form>
      <h4 className="padding-small">Action</h4>

      <div className="actions card">
        <button
          class="btn ghost full flex padding-base"
          type="button"
          onClick={handleDelete}
          disabled={saving()}
        >
          <DeleteIcon />
          Supprimer l'article
        </button>
        <button
          class="btn ghost full flex padding-base"
          type="button"
        >
          <CodeError />
          Signaler une erreur d'étiquettage
        </button>
        <button
          class="btn ghost full flex padding-base"
          type="button"
        >
          <DateAddIcon />
          Signaler une date d'expiration
        </button>
      </div>
    </>
  );
}


function Field(props) {
  const listId = props.options?.length
    ? `${props.label.replace(/\s+/g, "-").toLowerCase()}-options`
    : undefined;

  return (
    <label className="field column focus-ring">
      <span className="padding-base">{props.label}</span>
      <input
        type={props.type || "text"}
        value={props.value}
        required={props.required}
        min={props.min}
        step={props.step}
        className="ghost padding-base"
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
