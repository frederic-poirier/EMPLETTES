import { onMount, onCleanup, createEffect } from "solid-js";
import { CloseIcon } from "../assets/Icons";
import "../styles/sheet.css";

export default function Sheet(props) {
  const HEIGHT = window.innerHeight * (props.maxHeightVH / 100);
  const VELOCITY_THRESHOLD = 1;
  const DISTANCE_THRESHOLD = 200;

  let sheetREF, contentREF, backdropREF;

  let dragging = false;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;

  let touchStartY = 0;
  let isTouchDragging = false;

  const root = document.getElementById("root");

  /* ------------------------------------------------------------
   RESET STYLES
  ------------------------------------------------------------ */
  const clearInline = () => {
    if (!sheetREF || !backdropREF) return;

    sheetREF.style.transition = "";
    sheetREF.style.transform = "";
    backdropREF.style.backgroundColor = "";
    backdropREF.style.transition = "";

    if (root) {
      root.style.transform = "";
      root.style.transition = "";
    }
  };

  /* ------------------------------------------------------------
   CALCUL VITESSE
  ------------------------------------------------------------ */
  const computeVelocity = (y) => {
    const t = performance.now();
    velocity = (y - lastY) / (t - lastT);
    lastY = y;
    lastT = t;
  };

  /* ------------------------------------------------------------
   POINTER DOWN
  ------------------------------------------------------------ */
  const onDown = (e) => {
    const isContent = contentREF.contains(e.target);
    const atTop = contentREF.scrollTop <= 0;

    if (isContent && !atTop) return;

    dragging = true;
    startY = e.clientY;
    lastY = startY;
    lastT = performance.now();
    velocity = 0;

    sheetREF.style.transition = "none";
  };

  /* ------------------------------------------------------------
   POINTER MOVE
  ------------------------------------------------------------ */
  const onMove = (e) => {
    if (!dragging) return;
    const delta = e.clientY - startY;
    if (delta < 0) return;

    e.preventDefault();

    const progress = Math.max(Math.min(delta / DISTANCE_THRESHOLD, 1), 0);

    const scale = 0.95 + progress * 0.05;
    const alpha = 0.5 - progress * 0.5;

    sheetREF.style.transform = `translateY(${delta}px)`;
    backdropREF.style.backgroundColor = `rgba(0,0,0,${alpha})`;
    root.style.transform = `scale(${scale})`;

    computeVelocity(e.clientY);
  };

  /* ------------------------------------------------------------
   POINTER UP
  ------------------------------------------------------------ */
  const onUp = () => {
    if (!dragging) return;
    dragging = false;

    const transform = sheetREF.style.transform || "translateY(0px)";
    const currentY = parseFloat(transform.match(/translateY\((.*)px\)/)?.[1] || 0);

    const shouldClose =
      velocity > VELOCITY_THRESHOLD || currentY > DISTANCE_THRESHOLD;

    sheetREF.style.transition = "";

    if (shouldClose) {
      sheetREF.style.transform = `translateY(${HEIGHT}px)`;

      // fermeture officielle du sheet → router doit gérer via props.onClose()
      backdropREF.hidePopover();
      props.onClose?.();
    } else {
      clearInline();
    }
  };

  /* ------------------------------------------------------------
   TOUCH START
  ------------------------------------------------------------ */
  const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
    isTouchDragging = false;
  };

  /* ------------------------------------------------------------
   TOUCH MOVE (corrigé)
  ------------------------------------------------------------ */
  const onTouchMove = (e) => {
    const y = e.touches[0].clientY;
    const delta = y - touchStartY;
    const atTop = contentREF.scrollTop <= 0;

    if (!isTouchDragging) {
      if (contentREF.scrollTop > 0) return;
      if (delta < 0) return;

      if (delta > 0 && atTop) {
        e.preventDefault();
        isTouchDragging = true;
        dragging = true;

        startY = y;
        lastY = y;
        lastT = performance.now();

        sheetREF.style.transition = "none";
      }
    }

    if (isTouchDragging) {
      e.preventDefault();
      const delta2 = y - startY;

      const progress = Math.max(Math.min(delta2 / DISTANCE_THRESHOLD, 1), 0);
      const scale = 0.95 + progress * 0.05;

      sheetREF.style.transform = `translateY(${delta2}px)`;
      root.style.transform = `scale(${scale})`;

      computeVelocity(y);
    }
  };

  const onTouchEnd = () => {
    if (isTouchDragging) onUp();
    isTouchDragging = false;
  };

  /* ------------------------------------------------------------
   MOUNT + CLEANUP
  ------------------------------------------------------------ */
  onMount(() => {
    backdropREF.addEventListener("toggle", clearInline);

    sheetREF.addEventListener("pointerdown", onDown);
    sheetREF.addEventListener("pointermove", onMove);
    sheetREF.addEventListener("pointerup", onUp);

    contentREF.addEventListener("touchstart", onTouchStart, { passive: true });
    contentREF.addEventListener("touchmove", onTouchMove, { passive: false });
    contentREF.addEventListener("touchend", onTouchEnd);

    onCleanup(() => {
      backdropREF.removeEventListener("toggle", clearInline);

      sheetREF.removeEventListener("pointerdown", onDown);
      sheetREF.removeEventListener("pointermove", onMove);
      sheetREF.removeEventListener("pointerup", onUp);

      contentREF.removeEventListener("touchstart", onTouchStart);
      contentREF.removeEventListener("touchmove", onTouchMove);
      contentREF.removeEventListener("touchend", onTouchEnd);
    });
  });

  /* ------------------------------------------------------------
   RENDER
  ------------------------------------------------------------ */
  return (
    <div ref={backdropREF} id={props.id} class="backdrop" popover>
      <div ref={sheetREF} class="sheet" style={{ height: `${props.maxHeightVH}vh` }}>
        <header class="container">
          <h5>{props.title}</h5>
          <button
            class="btn ghost"
            onClick={() => {
              props.onClose?.()
              backdropREF.hidePopover()
            }}
          >
            <CloseIcon />
          </button>
        </header>

        <section
          ref={contentREF}
          class="sheet-content fade-overflow container"
        >
          {props.content}
        </section>

        <footer>{props.footer}</footer>
      </div>
    </div>
  );
}
