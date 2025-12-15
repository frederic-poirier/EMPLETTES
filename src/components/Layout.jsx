import { A } from "@solidjs/router";
import { Show, Switch, Match, createSignal } from "solid-js";
import { useAuth } from "../utils/useAuth";
import {
  CloseIcon,
  MenuIcon,
  SearchIcon,
  ChevronRight,
  LogoutIcon,
} from "../assets/Icons";
import Search from "../pages/Search";
import '../styles/Layout.css'

export default function Layout(props) {
  const [mode, setMode] = createSignal(null);

  const toggle = (next) => setMode((prev) => (prev === next ? null : next));
  const close = () => setMode(null);

  return (
    <>
      <header className="layout-header">
        <nav class="container">
          <A href="/home" class="brand" onClick={close}>
            Emplettes
          </A>

          <button class="btn ghost" onClick={() => toggle("search")}>
            <Show when={mode() === "search"} fallback={<SearchIcon />}>
              <CloseIcon />
            </Show>
          </button>

          <button
            class="btn ghost"
            aria-pressed={mode() === "menu"}
            onClick={() => toggle("menu")}
          >
            <Show when={mode() === "menu"} fallback={<MenuIcon />}>
              <CloseIcon />
            </Show>
          </button>
        </nav>
      </header>

      <main class="container">
        <Switch>
          <Match when={mode() === "search"}>
            <div class="animate-entry">
              <Search onClose={close} />
            </div>
          </Match>

          <Match when={mode() === "menu"}>
            <div class="animate-entry">
              <Menu onClose={close} />
            </div>
          </Match>

          <Match when={!mode()}>
            <div class="animate-entry">
              {props.children}
            </div>
          </Match>
        </Switch>
      </main>
    </>
  );
}



export function EmptyState(props) {
  return (
    <section className="full-height state">
      <h3>{props.title}</h3>
      <p>{props.children}</p>
    </section>
  );
}

export function LoadingState(props) {
  return (
    <section className="full-height state">
      <SpinnerIcon />
      <h3>{props.title}</h3>
      <p>{props.children}</p>
    </section>
  );
}




function Menu(props) {
  const { user, logout } = useAuth();

  const links = [
    { label: "Ajouter des articles", to: "/import" },
    { label: "Créer une nouvelle liste", to: "/list/new" },
    { label: "Voir les listes", to: "/lists" },
  ];

  const handleLogout = () => {
    logout?.();
    props.onClose();
  };

  return (
    <>
      <h4>Menu</h4>

      <ul class="unstyled menu-links">
        <For each={links}>
          {(item) => (
            <li>
              <A
                href={item.to}
                class="flex menu-action unstyled"
                onClick={props.onClose}
              >
                <h3>{item.label}</h3>
                <ChevronRight />
              </A>
            </li>
          )}
        </For>
      </ul>

      <div class="menu-auth">
        <Show
          when={user()}
          fallback={
            <A class="btn subtle full" href="/login" onClick={props.onClose}>
              Connexion
            </A>
          }
        >
          <button class="btn subtle flex" onClick={handleLogout}>
            <LogoutIcon />
            Déconnexion
          </button>
        </Show>
      </div>
    </>
  );
}
