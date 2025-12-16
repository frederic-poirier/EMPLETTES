import { useNavigate } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, createSignal } from "solid-js";
import { applySort, Sorter } from "../components/Filter";
import Popup from "../components/Popup";
import { ChevronRight } from "../assets/Icons";
import List from "../components/List";
import "../styles/List.css"

export default function Supplier() {
  const { suppliers } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();

  const supplierItems = createMemo(
    () => (suppliers() ?? []).map((name => ({ name })))
  )

  // FIX
  const defaultSort = { key: "name", dir: "asc" };
  const [activeSort, setActiveSort] = createSignal(defaultSort);


  const sortedSuppliers = createMemo(() =>
    applySort(
      supplierItems(),
      activeSort().key,
      activeSort().dir
    )
  );

  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };

  return (
    <Show when={sortedSuppliers().length} fallback={<p>Chargement…</p>}>
      <section className="container">
        <header className="flex sb">
          <h1>Fournisseurs</h1>

          <Popup
            title="Trier"
            content={
              <Sorter
                options={[
                  {
                    key: "name",
                    label: "Nom du fournisseur",
                    directions: [
                      { dir: "asc", default: true },
                      { dir: "desc" },
                    ],
                  },
                ]}
                activeSort={activeSort()}
                onSort={(opt, dir) =>
                  setActiveSort({ key: opt.key, dir })
                }
              />
            }
          />
        </header>
        <List items={sortedSuppliers()}>
          {(s) => (
            <button
              className="flex sb ghost btn full padding-base"
              onClick={() => handleClick(s.name)}
            >
              <span>{s.name}</span>
              <ChevronRight />
            </button>
          )}
        </List>
      </section>
    </Show>
  );
}
