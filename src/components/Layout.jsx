import { A } from "@solidjs/router";
import { Show, createSignal } from "solid-js";
import { useAuth } from "../utils/useAuth";
import { LogoutIcon, SearchIcon, SpinnerIcon } from "../assets/Icons";
import CopyButton from "./CopyButton";
import Sheet from "./Sheet";
import "../styles/Layout.css";
import FullpagePopup from "./FullpagePopup";
import Search from "../pages/Search";

export default function Layout(props) {
  const { user, loading, logout } = useAuth();
  const email = () => user()?.email || "Anonyme";
  const uid = () => user()?.uid || "";
  const initial = () => email().charAt(0).toUpperCase();
  const accountSheetId = "account-sheet";
  const [isSearchOpen, setIsSearchOpen] = createSignal(false);

  const openAccountSheet = () =>
    document.getElementById(accountSheetId)?.showPopover?.();

  const closeAccountSheet = () =>
    document.getElementById(accountSheetId)?.hidePopover?.();

  const logoutAndClose = () => {
    closeAccountSheet();
    logout?.();
  };

  const toggleSearch = () => setIsSearchOpen((prev) => !prev);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <>
      <header>
        <nav className="container">
          <A href="/home" class="brand">
            Emplettes
          </A>
          <button
            type="button"
            className="btn ghost"
            aria-pressed={isSearchOpen()}
            aria-label={isSearchOpen() ? "Fermer la recherche" : "Ouvrir la recherche"}
            onClick={toggleSearch}
          >
            <SearchIcon />
          </button>
          <Show when={!loading()}>
            <Show when={user()}>
              <button
                type="button"
                aria-label="Compte"
                class="avatar-button"
                onClick={openAccountSheet}
              >
                <span id="avatar" title={email()}>
                  {initial()}
                </span>
              </button>
              <Sheet
                id={accountSheetId}
                title="Compte"
                content={
                  <>
                    <p className="title">Courriel</p>
                    <div class="account-field">
                      <span>{email()}</span>
                      <CopyButton content={email()} />
                    </div>

                    <p className="title">Identifiant</p>
                    <div class="account-field">
                      <span class="mono">{uid() || "Non defini"}</span>
                      <CopyButton content={uid()} />
                    </div>
                  </>
                }
                footer={
                  <button
                    class="btn subtle full logout-btn"
                    onClick={logoutAndClose}
                  >
                    <LogoutIcon />
                    <span>Deconnexion</span>
                  </button>
                }
                onClose={closeAccountSheet}
              />
            </Show>
          </Show>
        </nav>
      </header>
      <main
        className={`container view-transition ${
          isSearchOpen() ? "with-fullpage-popup" : ""
        }`}
      >
        <div className="page-content">{props.children}</div>
        <Show when={isSearchOpen()}>
          <FullpagePopup>
            <Search onClose={closeSearch} />
          </FullpagePopup>
        </Show>
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
