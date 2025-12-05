import { For, Show, createSignal, createUniqueId, onCleanup, onMount } from "solid-js"
import { CloseIcon, FilterIcon } from "../assets/Icons"
import Sheet from "./Sheet"
import "../styles/filter.css"

export default function Filter(props) {
    const popoverId = props.id ?? `filter-${createUniqueId()}`
    const sheetId = `${popoverId}-sheet`
    const triggerId = `${popoverId}-trigger`
    const [isMobile, setIsMobile] = createSignal(
        typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
    )

    const groups = props.groups ?? [
        {
            title: props.title,
            options: props.options,
            selected: props.selected,
            action: props.action,
            name: props.name || "filter-options",
        },
    ]

    let media
    const update = () => setIsMobile(media?.matches ?? false)

    onMount(() => {
        media = window.matchMedia("(max-width: 640px)")
        update()
        media.addEventListener("change", update)
    })

    onCleanup(() => media?.removeEventListener("change", update))

    const openSheet = () => {
        const el = document.getElementById(sheetId)
        el?.showPopover?.()
    }

    const renderGroups = () => (
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
    )

    return (
        <div className="filter-wrapper">
            <button
                id={triggerId}
                className="btn ghost"
                popoverTarget={popoverId}
                onClick={(e) => {
                    if (isMobile()) {
                        e.preventDefault()
                        openSheet()
                    }
                }}
            >
                <FilterIcon />
            </button>
            <Show when={!isMobile()} fallback={

                <Sheet
                    id={sheetId}
                    maxHeightVH={85}
                    title="Filtrer"
                    content={<div className="filter-sheet">{renderGroups()}</div>}
                />
            }>
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
                    {renderGroups()}
                </div>
            </Show >
        </div >
    )
}
