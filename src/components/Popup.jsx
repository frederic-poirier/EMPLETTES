import { For, Show, createSignal, createUniqueId, onCleanup, onMount } from "solid-js"
import { CloseIcon, FilterIcon } from "../assets/Icons"
import Sheet from "./Sheet"
import "../styles/filter.css"

export default function Popup(props) {
    const popoverId = props.id ?? `popup-${createUniqueId()}`
    const sheetId = `${popoverId}-sheet`
    const triggerId = `${popoverId}-trigger`
    const [isMobile, setIsMobile] = createSignal(
        typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
    )

    const groups = props.groups ?? []

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
                                    <li className="focus-ring">
                                        <Show when={!option.onClick} fallback={
                                            <button
                                                type="button"
                                                className="btn ghost full popup"
                                                onClick={option.onClick}
                                            >
                                                {option.label}
                                            </button>
                                        }>
                                            <label className="checkbox-option">
                                                <input
                                                    type="radio"
                                                    name={group.name}
                                                    checked={group.selected === option.value}
                                                    onChange={() => group.action(option.value)}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        </Show>
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
                    title="Options"
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
                        <h3>Options</h3>
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
            </Show>
        </div>
    )
}