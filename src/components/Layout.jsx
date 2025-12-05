import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuth } from "../utils/useAuth";
import { LogoutIcon, SpinnerIcon } from "../assets/Icons";
import CopyButton from "./CopyButton";
import Sheet from "./Sheet";
import "../styles/Layout.css";


export default function Layout(props) {
  const { user, loading, logout } = useAuth();
  const email = () => user()?.email || "Anonyme";
  const uid = () => user()?.uid || "";
  const initial = () => email().charAt(0).toUpperCase();
  const accountSheetId = "account-sheet";

  const openAccountSheet = () =>
    document.getElementById(accountSheetId)?.showPopover?.();

  const closeAccountSheet = () =>
    document.getElementById(accountSheetId)?.hidePopover?.();

  const logoutAndClose = () => {
    closeAccountSheet();
    logout?.();
  };

  return (
    <>
      <header>
        <nav className="container">
          <A href="/home" class="brand">Emplettes</A>
          <Show when={!loading()}>
            <Show when={user()}>
              <button
                type="button"
                aria-label="Compte"
                class="avatar-button"
                onClick={openAccountSheet}
              >
                <span id="avatar" title={email()}>{initial()}</span>
              </button>
            </Show>
          </Show>

        </nav>
      </header>
      <main className="container view-transition">
        {props.children}
      </main>

      <Show when={user()}>
        <Sheet
          id={accountSheetId}
          maxHeightVH={65}
          title="Compte"
          content={
            <div class="account-sheet">
              <div class="account-row">
                <p>Courriel</p>
                <div class="account-field">
                  <span>{email()}</span>
                  <CopyButton content={email()} />
                </div>
              </div>

              <div class="account-row">
                <p>Identifiant</p>
                <div class="account-field">
                  <span class="mono">{uid() || "Non defini"}</span>
                  <CopyButton content={uid()} />
                </div>
              </div>

              <button class="btn subtle full logout-btn" onClick={logoutAndClose}>
                <LogoutIcon />
                <span>Deconnexion</span>
              </button>
            </div>
          }
          onClose={closeAccountSheet}
        />
      </Show>
    </>
  );
}


export function EmptyState(props) {
  return (
    <section className="full-height state">
      <h5>{props.title}</h5>
      <p>{props.children}</p>
    </section>
  )
}

export function LoadingState(props) {
  return (
    <section className="full-height state">
      <SpinnerIcon />
      <h5>{props.title}</h5>
      <p>{props.children}</p>
    </section>
  )
}
