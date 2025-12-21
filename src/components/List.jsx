import { EmptyState } from "./Layout";

export default function List(props) {
    return (
        <ul className="unstyled list divide-y divide-neutral-200 dark:divide-neutral-800">
            <For
                each={props.items}
                fallback={
                    <EmptyState title={props.emptyTitle}>
                        {props.emptyText}
                    </EmptyState>
                }
            >
                {(item) => <li>{props.children(item)}</li>}
            </For>
        </ul>
    )
}