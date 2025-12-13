import { Show } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import ImportCSV from "./pages/ImportCSV";
import { useAuth } from "./utils/useAuth";

import { ProtectedRoute } from "./utils/ProtectedRoute";
import Supplier from "./components/SupplierList";
import ProductList from "./components/ProductList";
import ListsPage from "./pages/ListsPage";
import Search from './pages/Search'
import Command from "./pages/Command";


export default function App() {
  const { user, loading } = useAuth();

  return (
    <Router root={Layout}>
      <Show when={!loading()} fallback={<p>Chargement...</p>}>
        <Route
          path="/"
          component={() =>
            user() ? <Navigate href="/home" /> : <Navigate href="/login" />
          }
        />
        <Route path="/login" component={Login} />
        <Route
          path="/home"
          component={() => (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/lists"
          component={() => (
            <ProtectedRoute>
              <ListsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/import"
          component={() => (
            <ProtectedRoute>
              <ImportCSV />
            </ProtectedRoute>
          )}
        />
        <Route path="/command">
          <Route
            path="/:id?"
            component={() => (
              <ProtectedRoute>
                <Command />
              </ProtectedRoute>
            )}
          />
        </Route>
        <Route path="/list">
          <Route path="/:id" component={ProductList} />
          <Route path="/new" component={Supplier} />
        </Route>
      </Show>
    </Router>
  );
}
