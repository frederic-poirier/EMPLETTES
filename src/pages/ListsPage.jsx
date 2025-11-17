import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, onMount, createEffect, Show, For } from "solid-js";

import "../styles/List.css";
import Sheet from "../components/Sheet";
import ProductList from "../components/ProductList";
import SupplierList from "../components/SupplierList";

export default function ListsPage() {
  const { fetchLists, lists } = useLists();
  const { products } = useProducts();

  const [searchParams, setSearchParams] = useSearchParams();

  const [sheetRoute, setSheetRoute] = createSignal(null);
  const navigate = useNavigate()

  const SheetID = "list-sheet";

  onMount(() => fetchLists());

  createEffect(() => {
    const id = searchParams.id;
    const isNew = searchParams.new === "true";

    if (id) return setSheetRoute({ page: "products", listID: id });
    if (isNew) return setSheetRoute({ page: "supplier", listID: null });

    setSheetRoute(null);
  });

  createEffect(() => {
    const el = document.getElementById(SheetID);
    if (!el) return;

    if (sheetRoute()) requestAnimationFrame(() => el.showPopover())
    else el.hidePopover();
  });

  const openExistingList = (id) => setSearchParams({ id });
  const openNewList = () => setSearchParams({ new: true });
  const closeSheet = () => navigate('/lists')


  function command(listID, lists, products) {
    // Trouver la liste
    const list = lists.find((l) => l.id === listID);
    if (!list) return "#";

    const supplier = list.SUPPLIER;

    // Construire le corps du message
    const lines = list.ITEMS.map((id) => {
      const p = products.find((prod) => prod.id === id);
      return p ? `• ${p.PRODUCT}` : null;
    }).filter(Boolean);

    const body =
      `Bonjour,\n\nVoici la commande pour ${supplier} :\n\n` +
      lines.join("\n") +
      `\n\nMerci.`;

    const subject = `Liste pour ${supplier}`;
    return `mailto:fredm@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const list = () => lists?.find(l => l.id === sheetRoute()?.listID);
  const disabled = () => !list() || list().ITEMS.length === 0;


  return (
    <>
      <h1>Listes</h1>
      <section className="overflow" id="list-page">
        <Show when={() => lists?.length} fallback={LoadingState}>
          <Show when={lists.some((l) => l.STATUS !== "EMPTY")} fallback={EmptyState}>
            <For each={lists}>
              {(list) =>
                list.STATUS !== "EMPTY" && (
                  <button
                    className="unset card list-item"
                    popoverTarget={SheetID}
                    onClick={() => openExistingList(list.id)}
                  >
                    <header>
                      <p>Mise à jour {formatUpdatedAt(list.UPDATED_AT)}</p>
                      <h3>Liste pour {list.SUPPLIER}</h3>
                    </header>

                    <hr />

                    <p className="list-demo-header">
                      <span>Produits</span>
                      <span>{list.ITEMS.length}</span>
                    </p>

                    <ul className="list-demo">
                      <For each={list.ITEMS.slice(0, 6)}>
                        {(item) => (
                          <li>{products()?.find((p) => p.id === item)?.PRODUCT}</li>
                        )}
                      </For>
                    </ul>
                  </button>
                )
              }
            </For>
          </Show>
        </Show>
      </section>

      <button class="btn primary" onClick={openNewList} popoverTarget={SheetID}>
        Nouvelle liste
      </button>

      {/* ------------------------------------------------------------ */}
      {/* SHEET */}
      {/* ------------------------------------------------------------ */}
      <Sheet
        id={SheetID}
        maxHeightVH={80}
        title={
          sheetRoute()?.page === "supplier"
            ? "Choisir un fournisseur"
            : "Produits"
        }
        onClose={closeSheet}
        content={
          sheetRoute()?.page === "supplier" ? (
            <SupplierList
              onSelect={(listID) => {
                setSearchParams({ id: listID });
              }}
            />
          ) : sheetRoute()?.page === "products" ? (
            <ProductList id={sheetRoute()?.listID} />
          ) : null
        }
        footer={
          sheetRoute()?.page === "products" ? (
            <a
              class={`btn full primary ${disabled() ? "disabled" : ""}`}
              href={disabled() ? undefined : command(list().id, lists, products() || [])}
            >
              Commander
            </a>
          ) : null
        }
      />
    </>
  );
}

function LoadingState() {
  return <h1>CHARGEMENT…</h1>;
}

function EmptyState() {
  return <h1 className="card empty">Aucune liste encore</h1>
}

function formatUpdatedAt(ts) {
  if (!ts) return "—";
  if (typeof ts.seconds === "number") return timeAgo(ts.seconds * 1000);
  if (ts.toMillis) return timeAgo(ts.toMillis());
  return "—";
}

function timeAgo(timestamp) {
  const now = Date.now();
  const diff = timestamp - now;

  const units = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];

  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });

  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms || unit === "second") {
      const value = Math.round(diff / ms);
      return rtf.format(value, unit);
    }
  }
}
