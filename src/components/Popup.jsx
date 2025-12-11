import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { CloseIcon, FilterIcon } from "../assets/Icons";
import Sheet from "./Sheet";
import "../styles/filter.css";

export default function Popup(props) {
  const [isMobile, setIsMobile] = createSignal(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 640px)").matches
      : false,
  );

  let popupREF;
  let media;
  const id = crypto.randomUUID();
  const popoverId = props.id || id;
  const sheetId = `${popoverId}-sheet`;
  const update = () => setIsMobile(media?.matches ?? false);
  const openSheet = () => document.getElementById(sheetId)?.showPopover?.();

  onMount(() => {
    media = window.matchMedia("(max-width: 640px)");
    update();
    media.addEventListener("change", update);
  });

  onCleanup(() => media?.removeEventListener("change", update));

  return (
    <div className="filter-wrapper">
      <button
        className="btn ghost"
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
        <div ref={popupREF} id={popoverId} className="popup card" popover>
          <header class="flex">
            <h3>{props.title}</h3>
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
