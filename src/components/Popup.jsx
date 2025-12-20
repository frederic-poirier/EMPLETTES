import { Show, createSignal, createUniqueId, onCleanup, onMount } from "solid-js";
import { CloseIcon, FilterIcon } from "../assets/Icons";
import Sheet from "./Sheet";

export default function Popup(props) {
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false,
  );

  let buttonREF;
  let popupREF;
  let media;
  const id = createUniqueId();
  const popoverId = props.id || id;
  const sheetId = `${popoverId}-sheet`;

  const updatePosition = () => {
    if (!buttonREF || !popupREF) return;

    const rect = buttonREF.getBoundingClientRect();
    const popupWidth = popupREF.offsetWidth;
    const padding = 8;

    // Align popup right edge with button right edge
    let x = rect.right - popupWidth;

    // Clamp to viewport bounds
    x = Math.max(padding, Math.min(x, window.innerWidth - popupWidth - padding));

    setPosition({ x, y: rect.bottom });
  };

  const handleMediaChange = () => setIsMobile(media?.matches ?? false);
  const handleToggle = (e) => {
    const newState = e.newState === 'open';
    setIsVisible(newState);
    if (newState) updatePosition();
  };

  const openSheet = () => document.getElementById(sheetId)?.showPopover?.();

  onMount(() => {
    media = window.matchMedia("(max-width: 640px)");
    handleMediaChange();
    media.addEventListener("change", handleMediaChange);

    if (popupREF) popupREF.addEventListener("toggle", handleToggle);

    const handleReposition = () => isVisible() && updatePosition();
    window.addEventListener("resize", handleReposition);

    onCleanup(() => {
      media?.removeEventListener("change", handleMediaChange);
      popupREF?.removeEventListener("toggle", handleToggle);
      window.removeEventListener("resize", handleReposition);
    });
  });

  return (
    <div>
      <button
        ref={buttonREF}
        popoverTarget={popoverId}
        onClick={(e) => {
          if (isMobile()) {
            e.preventDefault();
            openSheet();
          }
        }}
      >
        <FilterIcon />
      </button>
      <Show
        when={!isMobile()}
        fallback={
          <Sheet
            id={sheetId}
            title={props.title}
            content={props.content}
            footer={props.footer}
            onClose={props.onClose}
          />
        }
      >
        <div
          popover
          ref={popupREF}
          id={popoverId}
          style={{
            top: `${position().y + 8}px`,
            left: `${position().x}px`,
            margin: 0,
          }}
          className="absolute shadow-lg dark:text-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-3 rounded-xl starting:scale-95 starting:opacity-95 transition ease-in-out origin-top-right"
        >
          <header class="flex justify-between items-center ">
            <h3 className="font-semibold">{props.title}</h3>
            <button
              class="btn ghost"
              onClick={() => {
                props.onClose?.();
                popupREF.hidePopover();
              }}
            >
              <CloseIcon />
            </button>
          </header>

          <section class="content">{props.content}</section>

          <footer>{props.footer}</footer>
        </div>
      </Show>
    </div>
  );
}
