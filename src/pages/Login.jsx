import { createSignal, Show } from "solid-js";
import { useAuth } from "../utils/useAuth";
import { useNavigate } from "@solidjs/router";
import "../styles/Login.css";

export default function Login() {
  const { login, user, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email(), password());
    if (!error()) navigate("/home", { replace: true });
  };

  return (
    <>
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} id="form-login">
        <input
          type="email"
          placeholder="Email"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <button type="submit">Se connecter</button>
        <Show when={error()}>
          <p className="error">{error()}</p>
        </Show>
      </form>
    </>
  );
}
