import { For } from "solid-js";
import { CheckIcon } from "../assets/Icons";
import { createMemo, createSignal, onMount, Show } from "solid-js";
import { A, useParams } from "@solidjs/router";
import "../styles/Command.css";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";

import CopyButton from "../components/CopyButton";
export default function Command() {
  const params = useParams();
  const { lists, fetchLists } = useLists();
  const { products } = useProducts();

  const [recipient, setRecipient] = createSignal("");
  const [sendMode, setSendMode] = createSignal("email");
  const [cols, setCols] = createSignal({ product: true, code: true });

  onMount(fetchLists);

  const list = createMemo(() => lists.find((l) => l.id === params.id));

  const items = createMemo(() =>
    list()
      ? list().ITEMS.map((id) => products()?.find((p) => p.id === id)).filter(Boolean)
      : []
  );

  const toggle = (key) => (v) => {
    const next = { ...cols(), [key]: v };
    if (!next.product && !next.code) next[key] = true;
    setCols(next);
  };

  // TEXT EXPORT ONLY (compatible mailto)
  const exportText = createMemo(() =>
    items()
      .map((p) => {
        const out = [];
        if (cols().product) out.push(p.PRODUCT);
        if (cols().code) out.push(p.SKU || p.id);
        return out.join(" | ");
      })
      .join("\n")
  );

  const mailHref = createMemo(() => {
    const to = encodeURIComponent(recipient() || "");
    return `mailto:${to}?subject=Commande&body=${encodeURIComponent(exportText())}`;
  });

  const smsHref = createMemo(() =>
    `sms:${recipient() || ""}?body=${encodeURIComponent(exportText())}`
  );

  return (
    <Show when={list()} fallback={<p class="muted">Aucune liste avec des articles.</p>}>

      <div class="command-grid fade-overflow y">
        <div>
          <h1>Commande</h1>
          <p>
            <A href={`/list/${list().id}`} class="command-meta unstyled">
              Liste #{list().id}
            </A>
          </p>
          <h3 class="label">{list().SUPPLIER}</h3>
        </div>

        {/* Recipient */}
        <div class="send-form">
          <h5>Destinataire</h5>
          <span class="send-mode-wrapper card">
            <input
              class="ghost"
              type={sendMode()}
              value={recipient()}
              placeholder={sendMode() === "email" ? "email@example.com" : "514 123 4567"}
              onInput={(e) => setRecipient(e.currentTarget.value)}
            />
            <select value={sendMode()} onChange={(e) => setSendMode(e.currentTarget.value)}>
              <option value="email">Email</option>
              <option value="tel">SMS</option>
            </select>
          </span>
        </div>

        <div>
          <h5>Liste</h5>

          <div class="columns" style="display:flex; gap:1rem;">
            <QuantityColumn items={items} />

            <Column
              label="Produit"
              items={items}
              enabled={() => cols().product}
              onToggle={toggle("product")}
              render={(p) => p.PRODUCT}
            />

            <Column
              label="Code"
              items={items}
              enabled={() => cols().code}
              onToggle={toggle("code")}
              render={(p) => p.SKU || p.id}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div class="send-actions bottom">
        <CopyButton content={exportText()} class="btn ghost small" />

        <Show when={sendMode() === "email"}>
          <a class="btn primary small" href={mailHref()}>
            Envoyer l'email
          </a>
        </Show>

        <Show when={sendMode() === "tel"}>
          <a class="btn primary small" href={smsHref()}>
            Envoyer le SMS
          </a>
        </Show>
      </div>

    </Show>
  );
}


function Column(props) {
  return (
    <table class="command-col">
      <thead>
        <tr>
          <th>
            <label class="column-toggle">
              <input
                type="checkbox"
                class="invisible"
                checked={props.enabled()}
                onChange={(e) => props.onToggle(e.currentTarget.checked)}
              />
              {props.label}
              <CheckIcon active={props.enabled()} />
            </label>
          </th>
        </tr>
      </thead>

      <tbody>
        <For each={props.items()}>
          {(item) => (
            <tr>
              <td class={!props.enabled() ? "dimmed" : ""}>
                {props.render(item)}
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}

function QuantityColumn(props) {
  return (
    <table class="command-col">
      <thead>
        <tr>
          <th>Quantité</th>
        </tr>
      </thead>

      <tbody>
        <For each={props?.items()}>
          {() => (
            <tr>
              <td>
                <input type="number" value={1} min={1} class="ghost" />
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}