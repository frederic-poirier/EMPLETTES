import { useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useOrders } from "../utils/useOrders";
import { createMemo, createSignal, For, Show, onMount } from "solid-js";
import { productsState } from "../data/products/productsStore";
import CopyButton from "../components/CopyButton";
import "../styles/Command.css";

export default function Command() {
  const params = useParams();
  const { open, active } = useLists();
  const { createFromlist } = useOrders();

  onMount(() => {
    if (params.id) open(params.id);
  });

  const [quantities, setQuantities] = createSignal({});
  const [recipient, setRecipient] = createSignal("");
  const [sendMode, setSendMode] = createSignal("email");

  const itemIds = createMemo(() => active()?.ITEMS ?? active()?.items ?? []);

  const products = createMemo(() => {
    return itemIds()
      .map((id) => productsState.byId[id])
      .filter(Boolean);
  });

  const getQty = (productId) => quantities()[productId] ?? 1;

  const setQty = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  const totalItems = createMemo(() =>
    products().reduce((sum, p) => sum + getQty(p.id), 0)
  );

  const orderItems = createMemo(() =>
    products().map((p) => ({
      id: p.id,
      name: p.PRODUCT ?? p.name,
      sku: p.SKU ?? p.sku ?? "",
      brand: p.BRAND ?? p.brand ?? "",
      qty: getQty(p.id),
    }))
  );

  const exportText = createMemo(() =>
    orderItems()
      .map((i) => i.qty + "x " + i.name + (i.sku ? " (" + i.sku + ")" : ""))
      .join("\n")
  );

  const subject = createMemo(() =>
    active() ? "Commande " + active().SUPPLIER : "Commande"
  );

  const mailtoHref = createMemo(() => {
    const body = subject() + "\n\n" + exportText();
    return "mailto:" + encodeURIComponent(recipient()) + "?subject=" + encodeURIComponent(subject()) + "&body=" + encodeURIComponent(body);
  });

  const smsHref = createMemo(() =>
    "sms:" + recipient() + "?body=" + encodeURIComponent(exportText())
  );

  const confirmOrder = async () => {
    if (!active()) return;
    await createFromlist({
      ...active(),
      items: orderItems(),
    });
  };

  return (
    <Show when={active()} fallback={<p className="muted">Liste introuvable</p>}>
      <section className="container layout">
        <header>
          <h4 className="order-label">Commande </h4>
          <h1 className="margin-none">{active().SUPPLIER}</h1>
        </header>
        <label className="flex sb">
          <input
            className="ghost full"
            type={sendMode() === "email" ? "email" : "tel"}
            value={recipient()}
            placeholder={sendMode() === "email" ? "email@example.com" : "514 123 4567"}
            onInput={(e) => setRecipient(e.currentTarget.value)}
          />
          <label className="" for="sendmode">
            <select
              id="sendmode"
              className="ghost"
              value={sendMode()}
              onChange={(e) => setSendMode(e.currentTarget.value)}
            >
              <option value="email">Email</option>
              <option value="tel">SMS</option>
            </select>
          </label>
        </label>
        <ul className="order-items unstyled">
          <For each={products()} fallback={<li className="empty">Aucun produit</li>}>
            {(product) => (
              <li className="order-item">
                <div className="item-info">{product.PRODUCT ?? product.name}</div>
                <div className="item-qty">
                  <button
                    className="ghost"
                    onClick={() => setQty(product.id, getQty(product.id) - 1)}
                    disabled={getQty(product.id) <= 1}
                  >−</button>
                  <span>{getQty(product.id)}</span>
                  <button
                    className="ghost"
                    onClick={() => setQty(product.id, getQty(product.id) + 1)}
                  >+</button>
                </div>
              </li>
            )}
          </For>
        </ul>
        <footer>
          <div className="flex sb">
            <div className="flex card">
              <CopyButton content={exportText()} className="padding-base ghost btn" />
              <Show when={sendMode() === "email"}>
                <hr />
                <a className="ghost btn padding-base" href={sendMode() ? mailtoHref() : smsHref()}>Envoyer</a>
              </Show>
            </div>
            <button className="btn primary padding-base" onClick={confirmOrder}>Confirmer</button>
          </div>
        </footer>
      </section>
    </Show>
  );
}