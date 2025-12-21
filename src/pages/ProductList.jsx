import { useNavigate, useParams } from "@solidjs/router";
import { useLists } from "../utils/useLists";
import { useProducts } from "../utils/useProducts";
import { createMemo, onMount } from "solid-js";
import { useData } from "../utils/useData";
import { FilterSorterGroup } from "../components/FilterSorterGroup";
import Popup from "../components/Popup";
import { CheckIcon } from "../assets/Icons";
import List from "../components/List";
import { LoadingState, Container, ContainerHeading, ContainerFooter } from "../components/Layout";

export default function ProductList() {
  const { fetchLists, lists, setListItem, deleteList } = useLists()
  const { getSupplierProducts } = useProducts()
  const params = useParams()
  const navigate = useNavigate()

  onMount(fetchLists)
  const list = createMemo(() => lists().find((l) => l.id === params?.id))
  const products = createMemo(() => getSupplierProducts(list()?.SUPPLIER)?.() ?? [])

  const checkedIds = createMemo(() => {
    const l = list();
    if (!l) return new Set();
    const raw = Array.isArray(l.ITEMS) ? l.ITEMS : Array.isArray(l.items) ? l.items : [];
    return new Set(
      raw.map((i) => (typeof i === "string" ? i : i?.productId ?? i?.id ?? i))
    );
  });

  const listConfig = {
    sort: [
      { label: "Nom (A-Z)", key: "PRODUCT", default: true },
      { label: "Nom (Z-A)", key: "PRODUCT", dir: "desc" },
    ],
    filter: [
      {
        label: "Cochés",
        key: "id",
        filter: (id) => checkedIds().has(id)
      },
      {
        label: "Non cochés",
        key: "id",
        filter: (id) => !checkedIds().has(id)
      }
    ]
  };

  const { result, operations, setOperations } = useData(products);

  const handleUncheckAll = () => {
    const current = list();
    if (!current) return;
    checkedIds().forEach((id) => setListItem(current.id, id));
  };

  const handleClearList = () => {
    const current = list();
    if (!current) return;
    if (confirm(`Supprimer la liste "${current.SUPPLIER}" ?`)) {
      deleteList(current.id);
      navigate("/lists");
    }
  };

  const filterContent = (
    <div className="grid gap-3">
      <FilterSorterGroup
        config={listConfig}
        operations={operations}
        setOperations={setOperations}
      />

      <div>
        <h4 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mb-2">
          Actions</h4>
        <div className="flex flex-col gap-1 ">
          <button className="text-left bg-neutral-50 dark:bg-neutral-700/50 p-1 pr-3 rounded-lg" onClick={() => navigate("/import")}>
            Ajouter un article
          </button>
          <button className="text-left bg-neutral-50 dark:bg-neutral-700/50 p-1 pr-3 rounded-lg" onClick={handleUncheckAll}>
            Décochez tout
          </button>
          <button className="text-left bg-neutral-50 dark:bg-neutral-700/50 p-1 pr-3 rounded-lg" onClick={handleClearList}>
            Supprimer la liste
          </button>
        </div>
      </div>
    </div >
  );


  return (
    <Show when={list() && result()} fallback={
      <LoadingState title="Chargement de la liste..." />
    }>
      <Container>
        <ContainerHeading title={list().SUPPLIER}>
          <Popup title="Options" content={filterContent} />
        </ContainerHeading>

        <List
          items={result()}
          emptyTitle="Aucun produit dans cette liste"
          emptyText="Essayez de modifier vos filtres."
        >
          {(product) => {
            const checked = () => checkedIds().has(product.id);
            const bg = () => checked() ? "bg-neutral-200/50 dark:bg-neutral-700" : "";
            return (
              <label className="p-2 flex items-start gap-3">
                <span className={`border border-neutral-200 dark:border-neutral-700 ${bg()} rounded mt-1`}>
                  <CheckIcon active={checked()} />
                </span>

                <input
                  className="sr-only"
                  type="checkbox"
                  checked={checked()}
                  onChange={() =>
                    setListItem(list().id, product.id)
                  }
                />

                {product.PRODUCT}
              </label>
            );
          }}
        </List>

        <ContainerFooter>
          <button
            className="p-2 mt-2 w-full rounded-lg disabled:opacity-50 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            onClick={() => navigate(`/command/${list().id}`)}
            disabled={checkedIds().size === 0}
          >
            Commander
          </button>
        </ContainerFooter>
      </Container>
    </Show >

  );
} 
