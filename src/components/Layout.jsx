import { A } from "@solidjs/router";
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
          <A href="/home">Emplettes</A>
          <Show when={!loading()}>
            <Show when={user()}>
              <A href="/account">
                <span id="avatar">{initial()}</span>
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
