import { useProducts } from "../utils/useProducts";
import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import "../styles/List.css";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import { Filter } from "./Filter";

export default function Supplier(props) {
  const { suppliers } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = createSignal("asc");

  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };

  const filterOptions = [
    { label: "A-Z", value: "asc" },
    { label: "Z-A", value: "desc" },
  ];

  const filterAction = (order) => {
    setSortOrder(order);
  };

  const orderedSuppliers = createMemo(() => {
    const list = suppliers() || [];
    if (sortOrder() === "desc") {
      return [...list].sort((a, b) =>
        b.localeCompare(a, "fr", { sensitivity: "base" })
      );
    }
    return list;
  });

  return (
    <Show when={orderedSuppliers()?.length} fallback={<p>Chargement...</p>}>
      <header>
        <h1>Fournisseur</h1>
        <Filter
          options={filterOptions}
          action={filterAction}
          selected={sortOrder()}
        />
      </header>
      <ul class="list fade-overflow y">
        <For each={orderedSuppliers()}>
          {(s) => (
            <li onClick={() => handleClick(s)}>
              <span>{s}</span>
              <ChevronRight />
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
