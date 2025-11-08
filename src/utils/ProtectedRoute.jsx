// utils/ProtectedRoute.jsx
import { Navigate } from "@solidjs/router";
import { useAuth } from "../utils/useAuth";

export function ProtectedRoute(props) {
  const { user, loading } = useAuth();
  if (loading()) return <p>Chargement...</p>;
  return user() ? props.children : <Navigate href="/login" />;
}
