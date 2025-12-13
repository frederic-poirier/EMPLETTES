import { A } from "@solidjs/router";
import { For, Show, createSignal } from "solid-js";
import { useAuth } from "../utils/useAuth";
import {
  ChevronRight,
  CloseIcon,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  SpinnerIcon,
} from "../assets/Icons";
import "../styles/Layout.css";
import Search from "../pages/Search";

export default function Layout(props) {
  const { user, loading, logout } = useAuth();
  const [mode, setMode] = createSignal(null);

  const menuLinks = [
    { label: "Ajouter des articles", to: "/import" },
    { label: "Cr\u00e9er une nouvelle liste", to: "/list/new" },
    { label: "Voir les listes", to: "/lists" },
  ];


  const toggleSearch = () =>
    setMode(mode() === "search" ? null : "search");

  const toggleMenu = () =>
    setMode(mode() === "menu" ? null : "menu");

  const closeMode = () => setMode(null);

  const handleLogout = () => {
    logout?.();
    closeMode();
  };

  return (
    <>
      <header>
        <nav className="container">
          <A href="/home" class="brand" onClick={closeMode}>
            Emplettes
          </A>
          <button onClick={toggleSearch} className="btn ghost">
            <Show when={mode() === "search"} fallback={<SearchIcon />}>
              <CloseIcon />
            </Show>
          </button>
          <button
            onClick={toggleMenu}
            className="btn ghost"
            aria-pressed={mode() === "menu"}
            aria-label="Menu"
          >
            <Show when={mode() === "menu"} fallback={<MenuIcon />}>
              <CloseIcon />
            </Show>
          </button>
        </nav>
      </header>
      <main className="container">
        <Show when={mode() !== null}>
          <div className="top-content">
            <Show when={mode() === "search"}>
              <Search onClose={closeMode} />
            </Show>
            <Show when={mode() === "menu"}>
              <h4>Menu</h4>
              <ul className="unstyled menu-links">
                <For each={menuLinks}>
                  {(item) => (
                    <li>
                      <A
                        href={item.to}
                        class=" flex  unstyled menu-action"
                        onClick={closeMode}
                      >
                        <h3>{item.label}</h3>
                        <ChevronRight />
                      </A>
                    </li>
                  )}
                </For>
              </ul>
              <div className="menu-auth">
                <Show
                  when={user()}
                  fallback={
                    <A class="btn subtle full" href="/login" onClick={closeMode}>
                      Connexion
                    </A>
                  }
                >
                  <button
                    class="btn subtle full logout-btn"
                    type="button"
                    onClick={handleLogout}
                  >

                    <LogoutIcon />
                    Déconnexion
                  </button>
                </Show>
              </div>
            </Show>
          </div>
        </Show>
        {props.children}
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
