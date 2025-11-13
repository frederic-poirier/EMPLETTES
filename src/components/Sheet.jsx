import { createSignal, onMount, onCleanup } from "solid-js";
import { CloseIcon } from "../assets/Icons";
import "../styles/sheet.css";

export default function Sheet(props) {
  const HEIGHT = window.innerHeight * (props.maxHeightVH / 100);
  const VELOCITY_THRESHOLD = 1;
  const DISTANCE_THRESHOLD = 200;

  let sheetREF, contentREF, backdropREF;
  let lastY = 0;
  let lastT = 0;
  let startY = 0;
  let velocity = 0;
  let dragging = false;
  const root = document.getElementById(`root`);

  const clearInline = () => {
    sheetREF.style.transition = "";
    sheetREF.style.transform = "";
    root.style.transform = ""
  };

  const computeVelocity = (y) => {
    const t = performance.now();
    velocity = (y - lastY) / (t - lastT);
    lastY = y;
    lastT = t;
  };

  const onDown = (e) => {
    if (contentREF.contains(e.target) && contentREF.scrollTop > 0) return;

    dragging = true;
    startY = e.clientY;
    lastY = startY;
    lastT = performance.now();
    velocity = 0;

    sheetREF.style.transition = "none";
  };

  const onMove = (e) => {
    if (!dragging) return;
    const delta = e.clientY - startY;
    console.log(delta);
    if (delta < 0) return;
    e.preventDefault();

    const raw = Math.max(Math.min(delta / DISTANCE_THRESHOLD, 1), 0);
    const clamped = Math.max(Math.min(delta / DISTANCE_THRESHOLD, 1), 0);
    const scale = 0.95 + clamped * 0.05;
    const alpha = Math.round((0.5 - raw * 0.5) * 100) / 100;

    sheetREF.style.transform = `translateY(${delta}px)`;
    backdropREF.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;
    root.style.transform = `scale(${scale})`;
    computeVelocity(e.clientY);
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;

    const shouldClose =
      velocity > VELOCITY_THRESHOLD ||
      parseFloat(sheetREF.style.transform.replace("translateY(", "")) >
        DISTANCE_THRESHOLD;

    sheetREF.style.transition = "";

    if (shouldClose) {
      sheetREF.style.transform = `translateY(${HEIGHT}px)`;
      sheetREF.addEventListener(
        "transitionend",
        () => backdropREF.hidePopover(),
        { once: true },
      );
    } else {
      clearInline();
    }
  };

  const handleToggle = (e) => {
    if (e.newState === "open") clearInline();
      else clearInline()
  };

  // const handleTouchMove = (e) => {
  //   if (!isDown()) return;

  //   const currentY = e.touches[0].clientY;
  //   const deltaY = currentY - touchStartY;
  //   const atTop = contentREF.scrollTop <= 0;

  //   if (deltaY > 0 && atTop) {
  //     e.preventDefault();
  //     return;
  //   }
  // };

  // const handleTouchStart = (e) => {
  //   touchStartY = e.touches[0].clientY;
  // };

  onMount(() => {
    backdropREF.addEventListener("beforetoggle", handleToggle);

    sheetREF.addEventListener("pointerdown", onDown);
    sheetREF.addEventListener("pointermove", onMove);
    sheetREF.addEventListener("pointerup", onUp);

    onCleanup(() => {
      backdropREF.removeEventListener("beforetoggle", handleToggle);
      sheetREF.removeEventListener("pointerdown", onDown);
      sheetREF.removeEventListener("pointermove", onMove);
      sheetREF.removeEventListener("pointerup", onUp);
    });
  });

  // === RENDER ===
  return (
    <div ref={backdropREF} id={props.id} className="backdrop" popover>
      <div
        ref={sheetREF}
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
    </div>
  );
}
