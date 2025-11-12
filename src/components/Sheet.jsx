import { createSignal, onMount, onCleanup } from "solid-js"
import { CloseIcon } from "../assets/Icons"
import "../styles/sheet.css"

export default function Sheet(props) {
    const windowHeight = window.innerHeight
    const POS = {
        FULL: windowHeight * (props.maxHeightVH / 100),
        HIDE: windowHeight,
    }

    let sheetREF

    const [offset, setOffset] = createSignal(0)
    const [startY, setStartY] = createSignal(0)
    const [isDown, setIsDown] = createSignal(false)
    const [velocity, setVelocity] = createSignal(0)

    let lastY = 0
    let lastTime = 0

    const progress = () => Math.min(Math.max(offset() / POS.FULL, 0), 1)

    // ---- VISUAL EFFECTS ----
    function applyVisualEffect() {
        const p = progress()

        // BACKDROP
        const backdropOpacity = 0.5 * (1 - p)
        sheetREF.style.setProperty("--backdrop-opacity", `${backdropOpacity}`)

        // SCALE BODY
        const scale = 0.95 + (1 - 0.95) * p
        document.body.style.transform = `scale(${scale})`
    }

    function pointerDOWN(e) {
        setIsDown(true)

        const y = e.clientY
        const t = performance.now()

        setStartY(y)
        setOffset(0)

        lastY = y
        lastTime = t

        setVelocity(0)
    }

    function pointerMOVE(e) {
        if (!isDown()) return
        if (!sheetREF.matches(":popover-open")) return

        const y = e.clientY
        const t = performance.now()

        const delta = y - startY()
        if (delta < 0) return

        setOffset(delta)

        const dy = y - lastY
        const dt = t - lastTime

        if (dt > 0) setVelocity(dy / dt)

        lastY = y
        lastTime = t

        applyVisualEffect()
    }

    function pointerUP() {
        setIsDown(false)
        const v = velocity()
        const dist = offset()
        const threshold = 200

        if (v > 1 || dist > threshold) {
            closeWithAnimation()
            return
        }

        // Snap FULL
        setOffset(0)
        applyVisualEffect()
    }

    // ---- CLOSING ANIMATION ----
    function closeWithAnimation() {
        // activer l'animation custom
        sheetREF.classList.add("closing")

        // reset les effets
        document.body.style.transform = "scale(1)"
        sheetREF.style.setProperty("--backdrop-opacity", "0")

        const handler = () => {
            sheetREF.removeEventListener("transitionend", handler)
            sheetREF.classList.remove("closing")
            sheetREF.hidePopover()
        }

        sheetREF.addEventListener("transitionend", handler)
    }

    // ---- TOGGLE OPEN/CLOSE ----
    function handleToggle(ev) {
        if (ev.newState === "open") {
            document.body.style.transform = "scale(0.95)"
            sheetREF.style.setProperty("--backdrop-opacity", "0.5")
            setOffset(0)
        }

        if (ev.newState === "closed") {
            document.body.style.transform = ""
            sheetREF.style.setProperty("--backdrop-opacity", "0")
            setOffset(0)
        }
    }

    // ---- MOUNT / CLEANUP ----
    onMount(() => {
        const el = sheetREF

        el.addEventListener("pointerdown", pointerDOWN)
        el.addEventListener("pointermove", pointerMOVE)
        el.addEventListener("pointerup", pointerUP)
        el.addEventListener("beforetoggle", handleToggle)

        onCleanup(() => {
            el.removeEventListener("pointerdown", pointerDOWN)
            el.removeEventListener("pointermove", pointerMOVE)
            el.removeEventListener("pointerup", pointerUP)
            el.removeEventListener("beforetoggle", handleToggle)
        })
    })

    // ---- STYLE DYNAMIQUE ----
    const style = () => ({
        height: props.maxHeightVH + "vh",
        transform: isDown() ? `translateY(${offset()}px)` : null,
        transition: isDown() ? "none" : undefined
    })

    return (
        <>
            <div
                ref={el => (sheetREF = el)}
                popover
                id={props.id}
                style={style()}
                class="sheet"
            >
                <header>
                    <h5>{props.title}</h5>
                    <button className="btn ghost" popoverTarget="sheet">
                        <CloseIcon />
                    </button>
                </header>
                <section>{props.content}</section>
                <footer>{props.footer}</footer>
            </div>
        </>
    )
}
