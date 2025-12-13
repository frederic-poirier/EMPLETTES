import { useProducts } from "../utils/useProducts";
import { useNavigate } from "@solidjs/router";
import { For, Show, createEffect, createSignal } from "solid-js";
import "../styles/List.css";
import { useLists } from "../utils/useLists";
import { ChevronRight } from "../assets/Icons";
import Popup from "./Popup";
import { Sorter, applySort } from "./Filter";

export default function Supplier() {
  const { suppliers } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();
  const [sortedSuppliers, setSortedSuppliers] = createSignal([]);
  const [currentSort, setCurrentSort] = createSignal(null);

  const sortedOptions = [
    {
      key: "name",
      label: "Nom du fournisseur",
      directions: [
        { dir: "asc", default: true },
        { dir: "desc" }
      ]
    }
  ];

  const supplierItems = () => (suppliers() || []).map((name) => ({ name }));

  const defaultSort = (() => {
    const opt = sortedOptions.find((o) => o.directions.some((d) => d.default)) || sortedOptions[0];
    const dir = opt?.directions?.find((d) => d.default)?.dir || opt?.directions?.[0]?.dir;
    return opt && dir ? { opt, key: opt.key, dir } : null;
  })();

  createEffect(() => {
    const base = supplierItems();
    const active = currentSort() || defaultSort;
    const key = active?.key || active?.opt?.key;

    if (!active || !key) {
      setSortedSuppliers(base);
      return;
    }

    setSortedSuppliers(applySort(base, key, active.dir));
  });


  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };


  return (
    <Show when={sortedSuppliers()?.length} fallback={<p>Chargement...</p>}>
      <section className="fade-overflow y">
        <header className="flex">
          <h1>Fournisseur</h1>
          <div class="filter-row">
            <Popup
              title="Trier"
              content={
                <Sorter
                  options={sortedOptions}
                  list={supplierItems()}
                  setList={setSortedSuppliers}
                  activeSort={currentSort() || defaultSort}
                  name="supplier-sorter"
                  onSort={(opt, dir) => setCurrentSort({ opt, key: opt.key, dir })}
                />
              }
            />
          </div>
        </header>
        <ul class="list">
          <For each={sortedSuppliers()}>
            {(s) => (
              <li>
                <button className="flex sb ghost btn full" onClick={() => handleClick(s.name)}>
                  <span>{s.name}</span>
                  <ChevronRight />
                </button>

              </li>
            )}
          </For>
        </ul>
      </section>
    </Show>
  );
}
