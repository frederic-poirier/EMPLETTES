import { createMemo, createSignal, onMount, Show, For } from "solid-js";
import { useParams, A } from "@solidjs/router";
import "../styles/Command.css";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import CopyButton from "../components/CopyButton";
import { CheckIcon } from "../assets/Icons";

export default function Command() {
  const { fetchLists, lists } = useLists();
  const { products } = useProducts();
  const params = useParams();

  const [selectedColumns, setSelectedColumns] = createSignal({
    product: true,
    code: true,
  });
  const [selectedList, setSelectedList] = createSignal('')
  const [recipient, setRecipient] = createSignal("");
  const [sendMode, setSendMode] = createSignal("email");
  onMount(() => fetchLists());

  const items = createMemo(() => {
    const list = lists.find((l) => l.id === params.id)
    if (!list) return [];
    setSelectedList(list)
    return list.ITEMS.map((id) => products()?.find((p) => p.id === id)).filter(Boolean);
  });

  const exportText = createMemo(() =>
    items()
      .map((p) => {
        const parts = [];
        if (selectedColumns().product) parts.push(p.PRODUCT);
        if (selectedColumns().code) parts.push(p.SKU || p.id);
        return `- ${parts.join(" | ")}`;
      })
      .join("\n")
  );

  const mailtoHref = createMemo(() => {
    const subject = `Commande ${selectedList()?.SUPPLIER || ""}`.trim();
    const heading = subject ? `${subject}\n\n` : "";
    const body = `${heading}${exportText()}`;
    const to = recipient() ? `${encodeURIComponent(recipient())}` : "";
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  const smsHref = createMemo(() => {
    const body = exportText();
    const to = recipient() ? `${recipient()}` : "";
    return `sms:${to}?body=${encodeURIComponent(body)}`;
  });

  return (
    <>
      <Show
        when={selectedList()}
        fallback={<p className="muted">Aucune liste avec des articles.</p>}
      >
        <div className="command-grid fade-overflow y">
          <div>
            <h1>Commande</h1>
            <p>
              <A
                className="command-meta unstyled"
                href={`/list/${selectedList()?.id}`}
              >
                #{selectedList()?.id || "?"}
              </A>
            </p>

          </div>
          <div className="send-form">
            <label className="send-field">
              <h5>Destinataire</h5>
              <span className="send-mode-wrapper card">
                <input
                  className="ghost"
                  type={sendMode()}
                  value={recipient()}
                  placeholder={sendMode() === "email" ? "email@example.com" : "514 123 4567"}
                  onInput={(e) => setRecipient(e.currentTarget.value)}
                />
                <label for="mode-select">
                  <select
                    name="mode ghost"
                    id="mode-select"
                    defaultValue="email"
                    onChange={(e) => setSendMode(e.currentTarget.value)}
                  >
                    <option value="email">Email</option>
                    <option value="tel">SMS</option>
                  </select>
                </label>
              </span>
            </label>
          </div>
          <div>
            <h5>Liste pour {selectedList().SUPPLIER}</h5>
            <div className="command-card">
              <table className="command-table">
                <thead>
                  <tr>
                    <th>
                      Quantité
                    </th>
                    <th>
                      <label className="column-toggle">
                        <input
                          type="checkbox"
                          className="invisible"
                          checked={selectedColumns().product}
                          onChange={(e) =>
                            setSelectedColumns((prev) => {
                              const next = { ...prev, product: e.currentTarget.checked };
                              if (!next.product && !next.code) next.product = true;
                              return next;
                            })
                          }
                        />
                        Produit
                        <span>
                          <CheckIcon active={selectedColumns().product} />
                        </span>
                      </label>
                    </th>
                    <th>
                      <label className="column-toggle">
                        <input
                          type="checkbox"
                          className="invisible"
                          checked={selectedColumns().code}
                          onChange={(e) =>
                            setSelectedColumns((prev) => {
                              const next = { ...prev, code: e.currentTarget.checked };
                              if (!next.product && !next.code) next.code = true;
                              return next;
                            })
                          }
                        />
                        Code
                        <span>
                          <CheckIcon active={selectedColumns().code} />
                        </span>
                      </label>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <For each={items()}>
                    {(p) => (
                      <tr>
                        <td><input type="number" min={1} value={1} className="ghost" /></td>
                        <td className={!selectedColumns().product ? "dimmed" : ""}>{p.PRODUCT}</td>
                        <td className={!selectedColumns().code ? "dimmed" : ""}>{p.SKU || p.id}</td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="send-actions bottom">
          <CopyButton content={exportText()} className="btn ghost small" />
          <Show when={sendMode() === "email"}>
            <a className="btn primary small" href={mailtoHref()}>Envoyer l'email</a>
          </Show>
          <Show when={sendMode() === "tel"}>
            <a className="btn primary small" href={smsHref()}>Envoyer le SMS</a>
          </Show>
        </div>
      </Show>
    </>
  );
}
