import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { useAuth } from "../utils/useAuth";
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
