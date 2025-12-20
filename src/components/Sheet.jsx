import { onMount, onCleanup } from "solid-js";
import { CloseIcon } from "../assets/Icons";
import '../styles/sheet.css'

export default function Sheet(props) {
  const HEIGHT = window.innerHeight * (props.maxHeightVH / 100);
  const VELOCITY_THRESHOLD = 1;
  const DISTANCE_THRESHOLD = 100;

  let sheetREF, contentREF;

  let dragging = false;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  let velocity = 0;

  let touchStartY = 0;
  let isTouchDragging = false;
  const root = document.getElementById("root");

  const clearInline = () => {
    if (sheetREF) {
      sheetREF.style.transition = "";
      sheetREF.style.transform = "";
    }
    if (root) {
      root.style.transform = "";
      root.style.transition = "";
      root.style.opacity = "";
      root.style.filter = "";
    }
  };

  const computeVelocity = (y) => {
    const t = performance.now();
    velocity = (y - lastY) / (t - lastT);
    lastY = y;
    lastT = t;
  };

  const getCurrentY = () => {
    const transform = sheetREF.style.transform || "translateY(0px)";
    return parseFloat(transform.match(/translateY\((.*)px\)/)?.[1] || 0);
  };

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

  const onMove = (e) => {
    if (!dragging) return;
    const delta = e.clientY - startY;
    e.preventDefault();

    if (delta < 0) return;

    const progress = Math.max(Math.min(delta / DISTANCE_THRESHOLD, 1), 0);

    const scale = 0.95 + progress * 0.05;
    const alpha = 0.5 + progress * 0.5;
    const blur = 2 - progress * 2;

    sheetREF.style.transform = `translateY(${delta}px)`;
    root.style.opacity = alpha;
    root.style.transform = `scale(${scale})`;
    root.style.filter = `blur(${blur}px)`;

    computeVelocity(e.clientY);
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;

    const shouldClose =
      velocity > VELOCITY_THRESHOLD || getCurrentY() > DISTANCE_THRESHOLD;

    sheetREF.style.transition = "";

    if (shouldClose) {
      sheetREF.style.transform = `translateY(${HEIGHT}px)`;
      sheetREF.hidePopover();
      props.onClose?.();
    } else {
      clearInline();
    }
  };

  const onTouchStart = (e) => {
    touchStartY = e.touches[0].clientY;
    isTouchDragging = false;
  };

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
      const alpha = 0.5 + progress * 0.5;
      const blur = 2 - progress * 2;

      sheetREF.style.transform = `translateY(${delta2}px)`;
      root.style.transform = `scale(${scale})`;
      root.style.opacity = alpha;
      root.style.filter = `blur(${blur}px)`;

      computeVelocity(y);
    }
  };

  const onTouchEnd = () => {
    if (isTouchDragging) onUp();
    isTouchDragging = false;
  };

  onMount(() => {
    const onToggle = () => clearInline();

    sheetREF.addEventListener("toggle", onToggle);
    sheetREF.addEventListener("pointerdown", onDown);
    sheetREF.addEventListener("pointermove", onMove);
    sheetREF.addEventListener("pointerup", onUp);

    contentREF.addEventListener("touchstart", onTouchStart, { passive: true });
    contentREF.addEventListener("touchmove", onTouchMove, { passive: false });
    contentREF.addEventListener("touchend", onTouchEnd);

    onCleanup(() => {
      sheetREF.removeEventListener("toggle", onToggle);
      sheetREF.removeEventListener("pointerdown", onDown);
      sheetREF.removeEventListener("pointermove", onMove);
      sheetREF.removeEventListener("pointerup", onUp);

      contentREF.removeEventListener("touchstart", onTouchStart);
      contentREF.removeEventListener("touchmove", onTouchMove);
      contentREF.removeEventListener("touchend", onTouchEnd);
    });
  });

  return (
    <div
      popover
      ref={sheetREF}
      id={props.id}
      className="
        starting:opacity-0 starting:translate-y-full 
        not-open:opacity-0 not-open:translate-y-full 
        transition-all ease-in-out transition-discrete 
        inset-x-0 top-auto fixed w-full rounded-t-2xl px-4 py-2
        dark:bg-neutral-800 dark:text-white sheet"
      style={{ height: `${props.maxHeightVH}vh` }}
    >
      <header class="flex items-center max-w-5xl mx-auto justify-between mb-6 mt-4 relative">
        <div className="absolute rounded-full h-1 w-12 dark:bg-neutral-700 -top-6/12 left-6/12 -translate-x-6/12" />
        <h3>{props.title}</h3>
        <button
          onClick={() => {
            props.onClose?.();
            sheetREF.hidePopover();
          }}
        >
          <CloseIcon />
        </button>
      </header>

      <section className="max-w-5xl mx-auto max-h-[70vh] overflow-y-auto" ref={contentREF}>
        {props.content}
      </section>

      <footer className="pb-4  mt-2 max-w-5xl mx-auto">{props.footer}</footer>
    </div>
  );
}
