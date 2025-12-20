import { useNavigate } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, createSignal } from "solid-js";
import { applySort, Sorter } from "../components/Filter";
import Popup from "../components/Popup";
import { ChevronRight } from "../assets/Icons";
import List from "../components/List";
import { Container, ContainerHeading, EmptyState } from "../components/Layout";

export default function Supplier() {
  const { suppliers } = useProducts();
  const { addList } = useLists();
  const navigate = useNavigate();

  const supplierItems = createMemo(
    () => (suppliers() ?? []).map((name => ({ name })))
  )

  const defaultSort = { key: "name", dir: "asc" };
  const sortOptions = [{
    key: "name",
    label: "Nom du fournisseur",
    directions: [
      { dir: "asc", default: true },
      { dir: "desc" },
    ],
  }];
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
    <Show
      when={sortedSuppliers().length}
      fallback={<EmptyState title="Aucun fournisseur">Aucun fournisseur disponible.</EmptyState>}
    >
      <Container>
        <ContainerHeading title="Fournisseurs">
          <Popup
            title="Trier"
            content={
              <Sorter
                options={sortOptions}
                activeSort={activeSort()}
                onSort={(opt, dir) => setActiveSort({ key: opt.key, dir })}
              />
            }
          />
        </ContainerHeading>
        <List items={sortedSuppliers()}>
          {(s) => (
            <button
              className="py-2 w-full text-left flex justify-between items-center"
              onClick={() => handleClick(s.name)}
            >
              <span>{s.name}</span>
              <ChevronRight />
            </button>
          )}
        </List>
      </Container>
    </Show>
  );
}
