import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuth } from "../utils/useAuth";
import { SpinnerIcon } from '../assets/Icons'
import "../styles/Layout.css";


export default function Layout(props) {
  const { user, loading } = useAuth();
  const email = () => user()?.email || "Anonyme";
  const initial = () => email().charAt(0).toUpperCase();
  return (
    <>
      <header>
        <nav className="container">
          <A href="/home" class="brand">Emplettes</A>
          <Show when={!loading()}>
            <Show when={user()}>
              <A href="/account" aria-label="Compte">
                <span id="avatar" title={email()}>{initial()}</span>
              </A>
            </Show>
          </Show>

        </nav>
      </header>
      <main className="container">
        {props.children}
      </main>
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