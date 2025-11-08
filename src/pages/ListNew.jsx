import { useSearchParams, useNavigate } from "@solidjs/router";
import { createSignal, Show, For, createMemo, onMount } from "solid-js";
import { db } from "../db/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useProducts } from "../utils/useProducts";
import "../styles/list.css"
import SupplierList from "./SupplierList";

export default function ListNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const supplier = () => params.supplier; // ex: ?supplier=Metro

  const { products } = useProducts();
  const [selected, setSelected] = createSignal([]);

  // produits filtrés par fournisseur
  const filtered = createMemo(() =>
    (products() || []).filter((p) => p.fournisseur === supplier()),
  );

  const toggleProduct = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const saveList = async () => {
    if (!supplier() || selected().length === 0) return;

    const newList = {
      supplier_id: supplier(),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      products: selected().map((id) => ({ id, checked: true })),
    };

    const docRef = await addDoc(collection(db, "lists"), newList);
    navigate(`/list/${docRef.id}`);
  };

  return (
    <main>
      <Show when={supplier()} fallback={<SupplierList />}>
      <h1>Liste pour {supplier()}</h1>
        <Show
          when={filtered().length}
          fallback={<p>Aucun produit trouvé pour ce fournisseur.</p>}
        >
          <ul className="list" id="product-list">
            <For each={filtered()}>
              {(product) => (
                <li>
                  <label>
                    <input
                      className="invisible"
                      type="checkbox"
                      checked={selected().includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    {product.description}
                  </label>
                </li>
              )}
            </For>
          </ul>

          <Show when={selected().length > 0}>
            <button onClick={saveList}>Créer la liste</button>
          </Show>
        </Show>
      </Show>
    </main>
  );
}
