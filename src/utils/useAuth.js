import { createSignal, onCleanup } from "solid-js";
import { auth } from "../db/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import useCache from "./useCache";

const UID_CACHE_KEY = "AUTH_UID_CACHE_V1";
const UID_CACHE_VERSION = 1;

let _user;
let _loading;
let _error;
let _initialized = false;
let _unsubscribe;

export function useAuth() {
  const { readCache, writeCache, clearCache } = useCache(Infinity); // Pas de TTL pour uid

  if (!_initialized) {
    _user = createSignal(null);
    _loading = createSignal(true);
    _error = createSignal(null);

    const [user, setUser] = _user;
    const [loading, setLoading] = _loading;

    // Charger le uid depuis le cache au démarrage
    const cachedUid = readCache(UID_CACHE_KEY, UID_CACHE_VERSION);
    if (cachedUid) {
      setUser({ uid: cachedUid }); // User partiel pour démarrage rapide
      setLoading(false); // On peut commencer à utiliser l'app
    }

    _unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        // Sauvegarder le uid en cache
        writeCache(UID_CACHE_KEY, UID_CACHE_VERSION, u.uid);
      } else {
        // Nettoyer le cache au logout
        clearCache(UID_CACHE_KEY);
      }
    });

    _initialized = true;
  }

  const [user, setUser] = _user;
  const [loading] = _loading;
  const [error, setError] = _error;

  async function login(email, password) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(e.message);
    }
  }

  async function logout() {
    const { clearCache } = useCache();
    clearCache(UID_CACHE_KEY);
    await signOut(auth);
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    uid: user()?.uid || null, // 🔥 Accès direct au uid
  };
}
