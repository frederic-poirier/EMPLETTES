import { useLists } from "../utils/useLists";
import { A, useNavigate } from "@solidjs/router";
import { Show, For, createMemo } from "solid-js";
import { LoadingState, EmptyState, ContainerHeading, Container } from "../components/Layout";
import { AddIcon, ChevronRight } from "../assets/Icons";
import { timeAgo } from "../utils/useTime";
import { productsState } from "../data/products/productsStore";
import List from "../components/List";

export default function ListsPage() {
  const { nonEmpty, loading } = useLists();
  const navigate = useNavigate();

  return (
    <Container gap="4">
      <Show
        when={!loading()}
        fallback={
          <LoadingState title="Chargement en cours">
            <p className="text-sm text-neutral-500">Veuillez patienter quelques instants.</p>
          </LoadingState>
        }
      >
        <Show
          when={nonEmpty().length > 0}
          fallback={
            <EmptyState title="Aucune liste créée">
              <p className="text-center max-w-[50ch] text-sm text-neutral-400">
                Vous n'avez pas encore créé de liste d'emplettes. Commencez dès maintenant en
                <A href="/list/new" class="mx-1 underline hover:text-neutral-900 dark:hover:text-white">créant votre première liste</A>
                pour organiser vos achats ou
                <A href="/" class="mx-1 underline hover:text-neutral-900 dark:hover:text-white">retournez au menu.</A>
              </p>
            </EmptyState>
          }
        >
          <ContainerHeading title="Listes">
            <button
              onClick={() => navigate("/list/new")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-400 *:fill-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:*:fill-neutral-900 dark:hover:*:fill-white"
            >
              <AddIcon /> Créer une liste
            </button>
          </ContainerHeading>

          <List items={nonEmpty()}>
            {(item) => <ListRow list={item} />}
          </List>
        </Show>
      </Show>
    </Container>
  );
}

function ListRow(props) {
  const navigate = useNavigate();
  const list = () => props.list;
  const itemIds = () => list().ITEMS ?? list().items ?? [];
  const count = () => itemIds().length;

  const resolvedItems = createMemo(() =>
    itemIds()
      .map((id) => productsState.byId[id])
      .filter(Boolean)
  );

  const preview = createMemo(() =>
    resolvedItems()
      .slice(0, 3)
      .map((p) => p?.PRODUCT ?? p?.name ?? "Article")
      .join(", ")
  );

  return (
    <button
      onClick={() => navigate(`/list/${list().id}`)}
      className="group w-full flex items-center gap-4 py-4 text-left hover:bg-neutral-800/50 transition-colors"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 text-white text-lg">
        {count()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{list().SUPPLIER}</p>
          <p className="text-xs text-neutral-600">{timeAgo(list().UPDATED_AT)}</p>
        </div>
        <Show when={preview()}>
          <p className="text-sm text-neutral-500 truncate mt-0.5">
            {preview()}{count() > 3 ? ` +${count() - 3}` : ""}
          </p>
        </Show>
      </div>

      {/* Arrow */}
      <ChevronRight className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
    </button>
  );
}