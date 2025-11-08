// utils/useAuth.js
import { createSignal, onCleanup } from "solid-js";
import { auth } from "../db/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

// On garde un état global (singleton) partagé entre tous les appels :
let _user;
let _loading;
let _error;
let _initialized = false;
let _unsubscribe;

export function useAuth() {
  // Si ce n’est pas encore initialisé, on crée les signaux une seule fois
  if (!_initialized) {
    _user = createSignal(null);
    _loading = createSignal(true);
    _error = createSignal(null);

    const [user, setUser] = _user;
    const [loading, setLoading] = _loading;

    // Un seul listener Firebase
    _unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    _initialized = true;
  }

  const [user, setUser] = _user;
  const [loading] = _loading;
  const [error, setError] = _error;

  onCleanup(() => {
    // Ne pas désabonner le listener global, sinon les autres hooks perdront le user.
    // -> On pourrait ajouter une logique de comptage si tu veux nettoyer quand plus personne n'écoute.
  });

  async function login(email, password) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return { user, loading, error, login, logout };
}
