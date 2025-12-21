import { useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useOrders } from "../utils/useOrders";
import { createMemo, createSignal, For, Show, createEffect } from "solid-js";
import { productsState } from "../data/products/productsStore";
import CopyButton from "../components/CopyButton";
import QuantitySelector from "../components/QuantitySelector";
import { SendIcon } from "../assets/Icons";
import { Container, ContainerFooter, ContainerHeading } from "../components/Layout";
import List from "../components/List";

export default function Command() {
  const params = useParams();
  const { open, active } = useLists();
  const { createFromlist } = useOrders();

  createEffect(() => {
    const id = params?.id;
    if (id) open(id);
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
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, value) }));
  };

  const visibleProducts = createMemo(() =>
    products().filter((p) => getQty(p.id) > 0)
  );

  const orderItems = createMemo(() =>
    visibleProducts().map((p) => ({
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

  const sendAction = () => {
    const mode = () => sendMode();
    if (recipient().trim() === "") return "#";
    if (mode() === "email") return mailtoHref();
    else if (mode() === "tel") return smsHref();
  }

  return (
    <Show when={active()} fallback={<p className="text-neutral-500 text-center py-12">Liste introuvable</p>}>
      <Container>
        <ContainerHeading title={"Commande pour " + active().SUPPLIER} />
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 divide-x divide-neutral-200 dark:divide-neutral-700 p-1 rounded-xl">
          <input
            type={sendMode() === "email" ? "email" : "tel"}
            value={recipient()}
            placeholder={sendMode() === "email" ? "email@example.com" : "514 123 4567"}
            onInput={(e) => setRecipient(e.currentTarget.value)}
            className="flex-1 px-3 py-2"
          />
          <select
            value={sendMode()}
            onChange={(e) => setSendMode(e.currentTarget.value)}
            className="mx-3 py-2"
          >
            <option value="email">Email</option>
            <option value="tel">SMS</option>
          </select>
        </div>
        <List items={visibleProducts()} emptyTitle="Aucun produit sélectionné">
          {(product) => (
            <div className="group flex items-center gap-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 dark:text-white truncate">{product.PRODUCT ?? product.name}</p>
                <Show when={product.SKU || product.BRAND}>
                  <p className="text-xs text-neutral-400 truncate">{[product.BRAND, product.SKU].filter(Boolean).join(" · ")}</p>
                </Show>
              </div>
              <QuantitySelector
                value={getQty(product.id)}
                onChange={(v) => setQty(product.id, v)}
                min={0}
                size="sm"
              />
            </div>
          )}
        </List>

        <ContainerFooter>
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 divide-x divide-neutral-200 dark:divide-neutral-700 p-2 px-3 rounded-xl">
              <CopyButton className="pr-3" content={exportText()} />
              <a href={sendAction()} class={`${sendAction() === '#' ? 'pointer-events-none opacity-50' : ''}`}>Envoyer</a>
            </div>
            <button
              className="p-2 px-3 disabled:opacity-50 disabled:pointer-events-none bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              onClick={confirmOrder}
              disabled={visibleProducts().length === 0}
            >
              Confirmer la commande
            </button>
          </div>
        </ContainerFooter>

      </Container>
    </Show>
  );
}