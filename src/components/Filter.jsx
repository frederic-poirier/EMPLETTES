import { For, Show, createUniqueId } from "solid-js"
import { CloseIcon, FilterIcon } from "../assets/Icons"
import "../styles/filter.css"

export default function Filter(props) {
    const popoverId = props.id ?? `filter-${createUniqueId()}`
    const triggerId = `${popoverId}-trigger`

    const groups = props.groups ?? [
        {
            title: props.title,
            options: props.options,
            selected: props.selected,
            action: props.action,
            name: props.name || "filter-options",
        },
    ]

    return (
        <div className="filter-wrapper">
            <button
                id={triggerId}
                className="btn ghost"
                popoverTarget={popoverId}
            >
                <FilterIcon />
            </button>
            <div
                id={popoverId}
                className="filter-popover card"
                popover
                anchor={triggerId}
            >
                <header>
                    <h5>Filtrer</h5>
                    <button
                        className="btn ghost filter-popup"
                        popoverTarget={popoverId}
                        popoverTargetAction="hide"
                    >
                        <CloseIcon />
                    </button>
                </header>
                <section className="filter-groups">
                    <For each={groups}>
                        {(group) => (
                            <div className="filter-group">
                                <Show when={group.title}>
                                    <p className="filter-label">{group.title}</p>
                                </Show>
                                <ul className="unstyled">
                                    <For each={group.options}>
                                        {(option) => (
                                            <li>
                                                <label className="checkbox-option">
                                                    <input
                                                        type="radio"
                                                        name={group.name}
                                                        checked={group.selected === option.value}
                                                        onChange={() => group.action(option.value)}
                                                    />
                                                    <span>{option.label}</span>
                                                </label>
                                            </li>
                                        )}
                                    </For>
                                </ul>
                            </div>
                        )}
                    </For>
                </section>
            </div>
        </div>
    )
}
