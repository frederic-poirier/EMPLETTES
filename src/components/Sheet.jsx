import { createSignal, onMount, onCleanup } from "solid-js"
import { CloseIcon } from "../assets/Icons"
import "../styles/sheet.css"

export default function Sheet(props) {
    // === CONSTANTS ===
    const WINDOW_HEIGHT = window.innerHeight
    const POSITIONS = {
        FULL: WINDOW_HEIGHT * (props.maxHeightVH / 100),
        HIDE: WINDOW_HEIGHT,
    }
    const VELOCITY_THRESHOLD = 1
    const DISTANCE_THRESHOLD = 200
    const BACKDROP_MAX_OPACITY = 0.75
    const BODY_MIN_SCALE = 0.95

    let sheetREF
    let contentREF
    let frame = null

    const [offset, setOffset] = createSignal(0)
    const [startY, setStartY] = createSignal(0)
    const [isDown, setIsDown] = createSignal(false)
    const [velocity, setVelocity] = createSignal(0)

    let lastY = 0
    let lastTime = 0
    let touchStartY = 0

    // Le wrapper qui scale
    const root = document.getElementById("root")

    const progress = () =>
        Math.min(Math.max(offset() / POSITIONS.FULL, 0), 1)

    // === VISUAL EFFECTS (RAF) ===
    const applyVisualEffect = () => {
        if (frame) return
        frame = requestAnimationFrame(() => {
            frame = null
            const p = progress()
            root.style.transform = `scale(${BODY_MIN_SCALE + (1 - BODY_MIN_SCALE) * p})`
            sheetREF.style.transform = `translateY(${offset()}px)`
            sheetREF.style.setProperty(
                "--backdrop-opacity",
                `${BACKDROP_MAX_OPACITY * (1 - p)}`
            )
        })
    }

    // RESET quand fermé
    const resetVisualEffects = () => {
        root.style.transform = ""
        sheetREF.style.setProperty("--backdrop-opacity", "0")
        sheetREF.style.transform = ""
        sheetREF.style.transition = ""

    }

    // STATE = OPEN (full)
    const setOpenState = () => {
        root.style.transform = `scale(${BODY_MIN_SCALE})`
        sheetREF.style.setProperty("--backdrop-opacity", `${BACKDROP_MAX_OPACITY}`)
        setOffset(0)
    }

    // === POINTER TRACKING ===
    const updateVelocity = (currentY, currentTime) => {
        const dy = currentY - lastY
        const dt = currentTime - lastTime

        if (dt > 0) setVelocity(dy / dt)

        lastY = currentY
        lastTime = currentTime
    }

    // === HANDLERS ===
    const pointerDOWN = (e) => {
        const isContent = contentREF.contains(e.target)
        const atTop = contentREF.scrollTop <= 0

        if (isContent && !atTop) {
            setIsDown(false)
            return
        }

        setIsDown(true)

        const y = e.clientY
        const t = performance.now()

        setStartY(y)
        setOffset(0)
        lastY = y
        lastTime = t
        setVelocity(0)
    }

    const pointerMOVE = (e) => {
        if (!isDown() || !sheetREF.matches(":popover-open")) return

        const y = e.clientY
        const delta = y - startY()

        if (delta < 0) return
        e.preventDefault()

        setOffset(delta)
        updateVelocity(y, performance.now())

        applyVisualEffect()
    }

    const pointerUP = () => {
        setIsDown(false)

        const shouldClose =
            velocity() > VELOCITY_THRESHOLD ||
            offset() > DISTANCE_THRESHOLD

        if (shouldClose) closeWithAnimation()
        else {
            setOffset(0)
            applyVisualEffect()
        }
    }

    // === ANIMATION ===
    const closeWithAnimation = () => {
        sheetREF.classList.add("closing")

        const handleEnd = () => {
            sheetREF.removeEventListener("transitionend", handleEnd)
            sheetREF.classList.remove("closing")
            resetVisualEffects()
            sheetREF.hidePopover()
        }

        sheetREF.addEventListener("transitionend", handleEnd)
    }

    const handleToggle = (ev) => {
        if (ev.newState === "open") setOpenState()
        else if (ev.newState === "closed") {
            resetVisualEffects()
            setOffset(0)
        }
    }

    const handleTouchMove = (e) => {
        if (!isDown()) return

        const currentY = e.touches[0].clientY
        const deltaY = currentY - touchStartY
        const atTop = contentREF.scrollTop <= 0

        if (deltaY > 0 && atTop) {
            e.preventDefault()
            return
        }
    }

    const handleTouchStart = (e) => {
        touchStartY = e.touches[0].clientY
    }

    // === LIFECYCLE ===
    onMount(() => {
        const handlePointerMove = (e) => pointerMOVE(e)

        sheetREF.addEventListener("pointerdown", pointerDOWN)
        sheetREF.addEventListener("pointerup", pointerUP)
        sheetREF.addEventListener("beforetoggle", handleToggle)
        sheetREF.addEventListener("pointermove", handlePointerMove, { passive: false })

        contentREF.addEventListener("touchstart", handleTouchStart, { passive: true })
        contentREF.addEventListener("touchmove", handleTouchMove, { passive: false })

        onCleanup(() => {
            sheetREF.removeEventListener("pointerdown", pointerDOWN)
            sheetREF.removeEventListener("pointerup", pointerUP)
            sheetREF.removeEventListener("beforetoggle", handleToggle)
            sheetREF.removeEventListener("pointermove", handlePointerMove)

            contentREF.removeEventListener("touchstart", handleTouchStart)
            contentREF.removeEventListener("touchmove", handleTouchMove)
        })
    })

    // === RENDER ===
    return (
        <div
            ref={sheetREF}
            popover
            id={props.id}
            class="sheet"
            style={{ height: `${props.maxHeightVH}vh` }}
        >
            <header>
                <h5>{props.title}</h5>
                <button class="btn ghost" popoverTarget={props.id}>
                    <CloseIcon />
                </button>
            </header>

            <section ref={contentREF} className="sheet-content">
                {props.content}
            </section>

            <footer>{props.footer}</footer>
        </div>
    )
}
