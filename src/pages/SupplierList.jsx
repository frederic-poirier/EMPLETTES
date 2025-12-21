import { useNavigate } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, createSignal } from "solid-js";
import { useData } from "../utils/useData";
import { FilterSorterGroup } from "../components/FilterSorterGroup";
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

  const supplierConfig = {
    sort: [
      { label: "Nom (A-Z)", key: "name", dir: "asc", default: true },
      { label: "Nom (Z-A)", key: "name", dir: "desc" },
    ]
  };
  const { result, operations, setOperations } = useData(supplierItems);



  const handleClick = async (supplier) => {
    const listID = await addList(supplier);
    navigate(`/list/${listID}`);
  };

  return (
    <Show
      when={result().length}
      fallback={<EmptyState title="Aucun fournisseur">Aucun fournisseur disponible.</EmptyState>}
    >
      <Container>
        <ContainerHeading title="Fournisseurs">
          <Popup
            title="Options"
            content={
              <FilterSorterGroup
                config={supplierConfig}
                operations={operations}
                setOperations={setOperations}
              />
            }
          />
        </ContainerHeading>
        <List items={result()}>
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
