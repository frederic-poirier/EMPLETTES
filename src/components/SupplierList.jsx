import { useProducts } from "../utils/useProducts";
import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import "../styles/List.css";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import Filter from "./Filter";

export default function Supplier() {
  const { suppliers, products } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();
  const [sortOrder, setSortOrder] = createSignal("asc");
  const [searchTerm, setSearchTerm] = createSignal("");
  const [countFilter, setCountFilter] = createSignal("all");

  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };

  const sortOptions = [
    { label: "A-Z", value: "asc" },
    { label: "Z-A", value: "desc" },
  ];

  const countOptions = [
    { label: "Tous", value: "all" },
    { label: "1-10 produits", value: "1-10" },
    { label: "11-50 produits", value: "11-50" },
    { label: "50+ produits", value: "50+" },
  ];

  const filterGroups = [
    {
      title: "Ordre alphabétique",
      options: sortOptions,
      selected: sortOrder(),
      action: setSortOrder,
      name: "order-filter",
    },
    {
      title: "Nombre de produits",
      options: countOptions,
      selected: countFilter(),
      action: setCountFilter,
      name: "count-filter",
    },
  ];

  const supplierStats = createMemo(() => {
    const list = suppliers() || [];
    const data = products() || [];
    const counts = data.reduce((acc, p) => {
      if (!p.SUPPLIER) return acc;
      acc[p.SUPPLIER] = (acc[p.SUPPLIER] || 0) + 1;
      return acc;
    }, {});
    return list.map((name) => ({ name, count: counts[name] || 0 }));
  });

  const matchCount = (count) => {
    const range = countFilter();
    if (range === "1-10") return count >= 1 && count <= 10;
    if (range === "11-50") return count >= 11 && count <= 50;
    if (range === "50+") return count > 50;
    return true;
  };

  const orderedSuppliers = createMemo(() => {
    const list = supplierStats() || [];
    const filtered = searchTerm()
      ? list.filter((s) =>
        s.name.toLowerCase().includes(searchTerm().toLowerCase())
      )
      : list;

    const byCount = filtered.filter((s) => matchCount(s.count));

    const sorted =
      sortOrder() === "desc"
        ? [...byCount].sort((a, b) =>
          b.name.localeCompare(a.name, "fr", { sensitivity: "base" })
        )
        : [...byCount].sort((a, b) =>
          a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
        );
    return sorted;
  });

  return (
    <Show when={orderedSuppliers()?.length} fallback={<p>Chargement...</p>}>
      <section className="fade-overflow y">
        <header className="flex">
          <h1>Fournisseur</h1>
          <div class="filter-row">
            <Filter groups={filterGroups} />
          </div>
        </header>
        <ul class="list">
          <For each={orderedSuppliers()}>
            {(s) => (
              <li tabIndex={0} onClick={() => handleClick(s.name)}>
                <div>
                  <span>{s.name}</span>
                  <p class="muted">{s.count} produits</p>
                </div>
                <ChevronRight />
              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
