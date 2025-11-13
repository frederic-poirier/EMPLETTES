import { createSignal, onMount, onCleanup } from "solid-js";
import { CloseIcon } from "../assets/Icons";
import "../styles/sheet.css";

export default function Sheet(props) {
  const HEIGHT = window.innerHeight * (props.maxHeightVH / 100);
  const VELOCITY_THRESHOLD = 1;
  const DISTANCE_THRESHOLD = 200;
  const root = document.getElementById(`root`);

  let sheetREF, contentREF, backdropREF;
  let lastY = 0;
  let lastT = 0;
  let startY = 0;
  let velocity = 0;
  let dragging = false;
  let touchStartY = 0;
  let isTouchDragging = false;

  const clearInline = () => {
    sheetREF.style.transition = "";
    sheetREF.style.transform = "";
    backdropREF.style.backgroundColor = "";
    root.style.transform = "";
  };

  const resetAllStyles = () => {
    clearInline();
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
    else clearInline();
  };

  const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
    isTouchDragging = false;
  };

  const onTouchMove = (e) => {
    const current = e.touches[0].clientY;
    const delta = current - touchStartY;

    const atTop = contentREF.scrollTop <= 0;

    if (delta > 0 && atTop) {
      // Vers le bas + scrollTop = 0 → activer drag
      e.preventDefault(); // IMPORTANT
      isTouchDragging = true;

      dragging = true;
      startY = current;
      lastY = startY;
      lastT = performance.now();

      sheetREF.style.transition = "none";
    }

    if (isTouchDragging) {
      const delta = current - startY;
      sheetREF.style.transform = `translateY(${delta}px)`;
      computeVelocity(current);

      // background scale
      const raw = Math.max(Math.min(delta / DISTANCE_THRESHOLD, 1), 0);
      const scale = 0.95 + raw * 0.05;
      root.style.transform = `scale(${scale})`;
    }
  };

  const onTouchEnd = () => {
    if (isTouchDragging) {
      onUp(); // réutilise ton logique pointerUp !
    }
    isTouchDragging = false;
  };

  onMount(() => {
    backdropREF.addEventListener("beforetoggle", handleToggle);
    backdropREF.addEventListener("toggle", resetAllStyles);

    sheetREF.addEventListener("pointerdown", onDown);
    sheetREF.addEventListener("pointermove", onMove);
    sheetREF.addEventListener("pointerup", onUp);

    contentREF.addEventListener("touchstart", onTouchStart, { passive: true });
    contentREF.addEventListener("touchmove", onTouchMove, { passive: false }); // obligé
    contentREF.addEventListener("touchend", onTouchEnd);

    onCleanup(() => {
      backdropREF.removeEventListener("beforetoggle", handleToggle);
      backdropREF.removeEventListener("toggle", resetAllStyles);

      sheetREF.removeEventListener("pointerdown", onDown);
      sheetREF.removeEventListener("pointermove", onMove);
      sheetREF.removeEventListener("pointerup", onUp);

      contentREF.removeEventListener("touchstart", onTouchStart);
      contentREF.removeEventListener("touchmove", onTouchMove); // obligé
      contentREF.removeEventListener("touchend", onTouchEnd);
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
