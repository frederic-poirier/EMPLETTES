import { EmptyState } from "./Layout";

export default function List(props) {
    return (
        <ul className="unstyled list">
            <For
                each={props.items}
                fallback={
                    <EmptyState title={props.emptyTitle}>
                        {props.emptyText}
                    </EmptyState>
                }
            >
                {(item) => <li className="focus-ring">{props.children(item)}</li>}
            </For>
        </ul>
    )
}