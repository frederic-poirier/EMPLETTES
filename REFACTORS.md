## Pistes de refactor

- Extraire un `useSort`/`useFilter` pour mutualiser le tri/filtrage (logique actuelle dupliquee dans Search et autres pages).
- Factoriser un composant `ProductForm` avec validation centralisee (montants/quantites) pour reutiliser dans le sheet Search et d'autres ecrans.
- Unifier la gestion de cache produits: exposer `clearCache` + `refetch` dans un hook dedie et documenter la strategie de versioning.
- Normaliser les ids popover/sheet (actuellement `52` en dur) via `createUniqueId` et une petite factory.
- Centraliser les libelles (success/erreur/labels) dans un mini module i18n pour supprimer les chaines en dur.
- Modeliser la base: creer une collection `suppliers` avec metadata (nom, contact, tags) et lier `products` par `supplierId` (plus de strings libres). De meme, ajouter une collection `users` pour stocker roles/prefs et securiser les regles Firestore.
- Optimiser les requetes: passer par des requetes ciblees (ex: `where("SUPPLIER","==",x)` ou recherche prefixe) au lieu de charger tous les produits, ajouter des index Firestore et une pagination ou infinite scroll pour Search.
- Deplacer le mapping supplier->produits (SupplierInfo) vers une requete Firestore ciblee ou un cache memoise pour eviter de filtrer en memoire a chaque rendu.

## Audit fichiers (fragmentation / composants a extraire)

- `App.jsx`: router declaratif dans le composant; extraire la config de routes dans un module pour partager les guards, les layouts et faciliter les tests.
- `components/Layout.jsx`: verifier la surcharge de responsibilites (header/context); si logique header/menu se complexifie, isoler un `HeaderBar` et un provider pour les titres/actions.
- `components/Popup.jsx`: popover + fallback sheet, bouton et header integres; scinder en `Popover` (logic) + `FilterTrigger` (UI) pour reutiliser ailleurs.
- `components/Filter.jsx`: `Sorter` + `Filter` + utils dans le meme fichier; separer utils (applySort/inferType) et composants radio/checkbox pour reutilisation et tests.
- `components/Sheet.jsx`: si d'autres feuilles apparaissent, isoler la logique popover/focus dans un hook et laisser le composant purement presentational.
- `components/ProductList.jsx` / `components/SupplierList.jsx`: rapprocher la logique de recuperation (useLists/useProducts) et la presentation; scinder en container + liste statique pour reemployer l'affichage simple.
- `components/SupplierInfo.jsx`: melange de calculs et de rendu table; extraire un helper de calcul stats fournisseur et des sous-composants `SupplierStatsTable`/`TopBrandsTable`.
- `components/Search.jsx` (si encore utilisee en dehors de page Search): dedoubler le champ de recherche en composant generique reutilisable (input + debounce).
- `pages/Search.jsx`: tres charge (recherche, tri, sheet, edition, suppression). Decouper en `SearchHeader` (input + Sorter), `ResultsList`, et `ProductSheet` autonome (idealement dans `components/ProductSheet.jsx`) partageable avec List/Command.
- `pages/ImportCSV.jsx`: gros composant stateful; extraire `useCsvImport` (parse + batch) et des sous-composants `Dropzone`, `PreviewTable`, `ProgressPane`. Penser a un composant `CsvUploader` reutilisable.
- `pages/Command.jsx`: le bloc d'export (toggles colonnes, copier/email/SMS) pourrait devenir un `CommandExport` + un `SendForm` reutilisable; la table des items peut etre un composant `CommandTable`.
- `pages/ListsPage.jsx` / `pages/ListEditor.jsx`: verifier si la logique liste/selection peut passer dans un hook `useListSelection` pour reemploi.
- `pages/Home.jsx`: la carte derniere liste et les actions peuvent devenir des petits composants (`LatestListCard`, `ActionList`) pour garder Home fin.
- `utils/useProducts.jsx`: actuellement service + cache + derivations; separer en couche service Firestore (fetch/update/delete), couche cache et hook de vue. Ajouter un contexte produits pour eviter les `getDocs` repetes.
- `utils/useLists.jsx`: beaucoup de responsabilites (fetch, listen, muter). Decouper en service Firestore, store (createStore) et helpers pour mieux tester et partager (ex: setListItem/deleteList).
- `utils/useAuth.js`: verifier si les effets auth peuvent passer dans un contexte dedié pour eviter de re-instancier la logique dans chaque composant.
- `styles/*.css`: regrouper tokens/variables dans un fichier theme et scinder les styles component-scoped (Sheet, Filter, Command) pour preparer un theming ou CSS Modules.
