import { createSignal, createEffect, Show, For, createUniqueId } from "solid-js";
import { CodeError, DateAddIcon, DeleteIcon, SearchIcon } from "../assets/Icons";
import { FilterSorterGroup } from "../components/FilterSorterGroup";
import { useNavigate } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useData } from "../utils/useData";
import { useProducts } from "../utils/useProducts";
import { SearchInput } from "../components/Inputs";
import { Container } from "../components/Layout";
import Popup from "../components/Popup";
import Sheet from "../components/Sheet";
import List from "../components/List";
import data from '../assets/categories.json'

export default function Search() {
  const id = createUniqueId();
  const navigate = useNavigate()
  const { addList } = useLists();
  const { suppliers, categories, updateProduct, deleteProduct, products } = useProducts();
  const { result, operations, setOperations } = useData(products);
  const searchConfig = { sort: [
    { label: "Nom de produit en ordre alphabétique", key: "PRODUCT", default: true },
    { label: "Nom de produit en ordre inverse", key: "PRODUCT", dir: "desc" },
    { label: "Fournisseur en ordre alphabétique", key: "SUPPLIER" },
    { label: "Fournisseur en ordre inverse", key: "SUPPLIER", dir: "desc" },
  ] }

  const [activeProduct, setActiveProduct] = createSignal(null);

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



  return (
    <Container>
      <header className="flex items-center gap-4">
        <SearchInput
          setOperations={setOperations}
          key={["PRODUCT", "SUPPLIER"]}
          debounceTime={300}
        />
        <Popup
          title="Options"
          content={
            <FilterSorterGroup
              config={searchConfig}
              operations={operations}
              setOperations={setOperations}
            />
          }
        />
      </header>
      <section>
        <List
          items={result()}
          emptyTitle="Aucun résultat"
          emptyText="Aucun produit ne correspond à votre recherche."
        >
          {(p) => (
            <button
              class="p-2 w-full text-left"
              popoverTarget={id}
              onClick={() => setActiveProduct(p)}
            >
              <h4 class="text-xs text-neutral-400 dark:text-neutral-500 py-1">{p.SUPPLIER}</h4>
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
          <button class="bg-white text-neutral-950 w-full rounded-lg p-2 text-center" onClick={createListAndOpen}>
            Faire une liste pour {activeProduct()?.SUPPLIER}
          </button>
        }
        onClose={() => setActiveProduct(null)}
      />
    </Container>
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
      <h4 className="text-neutral-400 text-sm my-2 font-semibold">Information</h4>
      <form className="mb-6 rounded-xl">
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
          options={[
            ...(props.categories?.() ?? []),
            ...data,
          ]}
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
      <h4 className="dark:text-neutral-400 my-2 text-sm font-semibold">Action</h4>

      <div className="flex-col">
        <button
          class="flex py-3 border-t border-y-neutral-100 dark:border-y-neutral-700 w-full gap-2"
          type="button"
          onClick={handleDelete}
          disabled={saving()}
        >
          <DeleteIcon />
          Supprimer l'article
        </button>
        <button
          class="flex py-3 border-t border-y-neutral-100 dark:border-y-neutral-700 w-full gap-2"
          type="button"
          disabled
        >
          <CodeError />
          Signaler une erreur d'étiquettage
        </button>
        <button
          class="flex py-3 border-t border-y-neutral-100 dark:border-y-neutral-700 w-full gap-2"
          type="button"
          disabled
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
    <label className="flex flex-col md:flex-row  gap-0.5 my-1 pt-2 border-t border-neutral-100 dark:border-neutral-700">
      <h4 className="text-xs md:text-sm md:flex-1 text-neutral-400">{props.label}</h4>
      <input
        type={props.type || "text"}
        value={props.value}
        required={props.required}
        min={props.min}
        step={props.step}
        placeholder="Inconnu"
        list={listId}
        className=" w-full md:flex-2"
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
