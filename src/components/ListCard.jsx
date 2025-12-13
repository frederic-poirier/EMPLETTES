import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";
import { timeAgo } from "../utils/useTime";

export function ListCard(props) {
    const navigate = useNavigate();
    const list = () => props.list;
    const items = () => list().ITEMS ?? list().items ?? [];


    return (
        <button
            className="unset card list-item"
            onClick={() => navigate(`/list/${list().id}`)}
        >
            <header>
                <p>Mise à jour {timeAgo(list().UPDATED_AT)}</p>
                <h2>{list().SUPPLIER}</h2>
            </header>

            <hr />

            <ul className="list-demo unstyled">
                <For each={items().slice(0, 5)}>
                    {(item) => <li>{item.name ?? item.PRODUCT ?? item}</li>}
                </For>
            </ul>
        </button>
    );
}
