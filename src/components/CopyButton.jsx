import { createSignal, Show } from "solid-js";

export default function CopyButton(props) {
  const [clicked, setClicked] = createSignal(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(props.content || "");
      setClicked(true);
      setTimeout(() => setClicked(false), 1200);
    } catch (err) {
      setClicked(false);
    }
  };

  return (
    <button onClick={handleClick} className={props.className || "ghost"}>
      <Show
        when={!clicked()}
        fallback={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#e3e3e3"
          >
            <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
          </svg>
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20px"
          viewBox="0 -960 960 960"
          width="20px"
          fill="#e3e3e3"
        >
          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
        </svg>
      </Show>
    </button>
  );
}
