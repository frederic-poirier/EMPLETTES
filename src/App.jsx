import { Show } from "solid-js";
import { Router, Route, Navigate } from "@solidjs/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import ImportCSV from "./pages/ImportCSV";
import { useAuth } from "./utils/useAuth";
import { useCatalog } from "./utils/useCatalog";

import { ProtectedRoute } from "./components/ProtectedRoute";
import Supplier from "./pages/SupplierList";
import ProductList from "./pages/ProductList";
import ListsPage from "./pages/ListsPage";
import Command from "./pages/Command";
import Expirations from "./pages/Expirations";
import PriceErrors from "./pages/PriceErrors";


export default function App() {
  const { user, loading } = useAuth();
  useCatalog(); // kick off initial data fetch (products + suppliers)

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
        <Route
          path="/peremptions"
          component={() => (
            <ProtectedRoute>
              <Expirations />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/erreurs-prix"
          component={() => (
            <ProtectedRoute>
              <PriceErrors />
            </ProtectedRoute>
          )}
        />
        <Route path="/command">
          <Route
            path=":id?"
            component={() => (
              <ProtectedRoute>
                <Command />
              </ProtectedRoute>
            )}
          />
        </Route>

        <Route path="/list">
          <Route path=":id" component={ProductList} />
          <Route path="new" component={Supplier} />
        </Route>

      </Show>
    </Router>
  );
}
