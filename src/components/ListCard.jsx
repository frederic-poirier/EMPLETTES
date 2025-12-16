import { useNavigate } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { timeAgo } from "../utils/useTime";
import { ChevronRight } from "../assets/Icons";
import { productsState } from "../data/products/productsStore";

export function ListCard(props) {
    const navigate = useNavigate();
    const list = () => props.list;
    const itemIds = () => list().ITEMS ?? list().items ?? [];
    const count = () => itemIds().length;

    // Resolve product IDs to product objects
    const resolvedItems = createMemo(() => {
        return itemIds()
            .map((id) => productsState.byId[id])
            .filter(Boolean);
    });

    const getProductName = (product) => {
        return product?.PRODUCT ?? product?.name ?? "Article";
    };

    return (
        <button
            className="list-card ghost full padding-base card flex col gap-base"
            onClick={() => navigate(`/list/${list().id}`)}
        >
            <div className="list-card-header flex sb full">
                <h3>{list().SUPPLIER}
                    <p className="list-card-time">{timeAgo(list().UPDATED_AT)}</p>
                </h3>
                <div className="list-card-meta">
                    <span className="list-card-count">{count()}</span>
                    <ChevronRight />
                </div>

            </div>


            <Show when={resolvedItems().length > 0}>
                <ul className="list-card-items unstyled">
                    <For each={resolvedItems().slice(0, 3)}>
                        {(product) => (
                            <li>{getProductName(product)}</li>
                        )}
                    </For>
                    <Show when={count() > 3}>
                        <li className="list-card-more">+{count() - 3} autres</li>
                    </Show>
                </ul>
            </Show>
        </button>
    );
}
