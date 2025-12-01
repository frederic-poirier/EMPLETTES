import { createMemo, createSignal, onMount, Show, For } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import "../styles/Command.css";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import CopyButton from "../components/CopyButton";

const formatEmailBody = (supplier, text) =>
  `Commande ${supplier || ""}\n\n${text}`;

export default function Command() {
  const { fetchLists, lists } = useLists();
  const { products } = useProducts();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [view, setView] = createSignal("name");
  const [selected, setSelected] = createSignal(params.id || searchParams.id || "");

  onMount(() => fetchLists());

  const availableLists = createMemo(() =>
    (lists || []).filter((l) => (l.ITEMS?.length ?? 0) > 0)
  );

  const selectedList = createMemo(() => {
    const id = selected();
    if (!id && availableLists().length) return availableLists()[0];
    return availableLists().find((l) => l.id === id);
  });

  const items = createMemo(() => {
    const list = selectedList();
    if (!list) return [];
    return list.ITEMS.map((id) => products()?.find((p) => p.id === id)).filter(Boolean);
  });

  const compiledText = createMemo(() => {
    const text = items()
      .map((p) => (view() === "code" ? p.SKU || p.id : p.PRODUCT))
      .join("\n");
    return text;
  });

  const mailtoHref = createMemo(() => {
    const subject = `Commande ${selectedList()?.SUPPLIER || ""}`.trim();
    const body = formatEmailBody(selectedList()?.SUPPLIER, compiledText());
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  return (
    <section className="command-page">
      <header className="command-header">
        <h1>Commande</h1>
      </header>

      <Show
        when={selectedList()}
        fallback={<p className="muted">Aucune liste avec des articles.</p>}
      >
        <div>
          <div className="command-card-header">
            <div>
              <h3>{items().length} {view() === "code" ? "Codes produit" : "Produits"}</h3>
            </div>
            <div className="command-actions">
              <div className="segment">
                <button
                  className={view() === "name" ? "active" : ""}
                  onClick={() => setView("name")}
                >
                  Produits
                </button>
                <button
                  className={view() === "code" ? "active" : ""}
                  onClick={() => setView("code")}
                >
                  Codes
                </button>
              </div>
            </div>
          </div>
          <div className="command-text card">
            <div className="command-text-action">
              <h5>{selectedList()?.SUPPLIER}</h5>
              <CopyButton content={compiledText()} className="btn subtle small" />
              <a className="btn subtle" href={mailtoHref()}>
                Email
              </a>
            </div>
            <pre>{compiledText()}</pre>
          </div>
        </div>
      </Show>
    </section>
  );
}
