## Bugs a corriger

- `ImportCSV.jsx`: le bouton "Annuler" appelle `handleReset` qui n'existe pas; recabler vers `handleCancel` ou renommer la fonction.
- `Search.jsx` sheet produit: les champs numeriques acceptent tout et convertissent `NaN` en `null`; ajouter une validation (>= 0) et bloquer la sauvegarde en cas d'erreur.
- `Search.jsx` suppression produit: on supprime le doc produit mais pas les references dans `lists.ITEMS`; nettoyer en cascade ou interdire la suppression si referencee.
- `useProducts`: le cache est mis a jour sur update/delete mais pas restaure en cas d'echec reseau; restaurer l'etat precedent ou refetch pour eviter un cache corrompu.
- Accessibilite du popover filtre: pas de retour de focus ni de focus trap; ameliorer la navigation clavier/mobile.
- Chargement produits: `useProducts` fait un `getDocs` complet de `products` (Search, SupplierInfo, ListsPage, Command). Ajouter des requetes ciblees (par supplier/prefix) ou une pagination pour eviter les full scans et reduire la latence/coût.
