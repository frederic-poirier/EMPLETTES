import { useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useOrders } from "../utils/useOrders";
import { createMemo, createSignal } from "solid-js";
import { CheckIcon } from "../assets/Icons";
import CopyButton from "../components/CopyButton"

export default function Command() {
  const params = useParams()
  const { open, active } = useLists();
  const { createFromlist } = useOrders();

  open(params.id)

  const [recipient, setRecipient] = createSignal("")
  const [sendMode, setSendMode] = createSignal("email")
  const [columns, setColumns] = createSignal({
    product: true,
    code: true,
  })

  const items = createMemo(() => active()?.items ?? []);
  const exportText = createMemo(() =>
    items().map((i) => {
      const parts = [];
      if (columns().product) parts.push(i.name);
      if (columns().code) parts.push(i.sku || i.productId);
      return `- ${parts.join(" | ")}`;
    })
      .join("\n")
  );

  const subject = createMemo(() =>
    active() ? `Commande ${active().SUPPLIER}` : "Commande"
  );

  const mailtoHref = createMemo(() => {
    const body = `${subject()}\n\n${exportText()}`;
    return `mailto:${encodeURIComponent(recipient())}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(body)}`;
  });

  const smsHref = createMemo(() =>
    `sms:${recipient()}?body=${encodeURIComponent(exportText())}`
  );

  const confirmOrder = async () => {
    if (!active()) return;
    await createFromlist(active());
  };


  return (
    <Show when={active()} fallback={<p className="muted">Liste introuvable</p>}>
      <div className="command-grid fade-overflow y">
        <h1>Commande</h1>

        {/* Destinataire */}
        <label className="send-field">
          <p className="title">Destinataire</p>
          <span className="send-mode-wrapper card focus-ring">
            <input
              className="ghost"
              type={sendMode()}
              value={recipient()}
              placeholder={sendMode() === "email" ? "email@example.com" : "514 123 4567"}
              onInput={(e) => setRecipient(e.currentTarget.value)}
            />
            <select
              value={sendMode()}
              onChange={(e) => setSendMode(e.currentTarget.value)}
            >
              <option value="email">Email</option>
              <option value="tel">SMS</option>
            </select>
          </span>
        </label>

        {/* Tableau */}
        <div className="command-card">
          <table className="command-table">
            <thead>
              <tr>
                <th>Qté</th>
                <th>
                  <label className="column-toggle">
                    <input
                      type="checkbox"
                      checked={columns().product}
                      onChange={(e) =>
                        setColumns(c => ({ ...c, product: e.currentTarget.checked || c.code }))
                      }
                    />
                    Produit <CheckIcon active={columns().product} />
                  </label>
                </th>
                <th>
                  <label className="column-toggle">
                    <input
                      type="checkbox"
                      checked={columns().code}
                      onChange={(e) =>
                        setColumns(c => ({ ...c, code: e.currentTarget.checked || c.product }))
                      }
                    />
                    Code <CheckIcon active={columns().code} />
                  </label>
                </th>
              </tr>
            </thead>

            <tbody>
              <For each={items()}>
                {(i) => (
                  <tr>
                    <td>{i.qty}</td>
                    <td className={!columns().product ? "dimmed" : ""}>{i.name}</td>
                    <td className={!columns().code ? "dimmed" : ""}>{i.sku || i.productId}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex">
        <CopyButton content={exportText()} className="btn ghost small" />
        <Show when={sendMode() === "email"}>
          <a className="btn primary" href={mailtoHref()}>Envoyer l’email</a>
        </Show>
        <Show when={sendMode() === "tel"}>
          <a className="btn primary" href={smsHref()}>Envoyer le SMS</a>
        </Show>
        <button className="btn primary" onClick={confirmOrder}>
          Confirmer la commande
        </button>
      </div>
    </Show>
  );
}