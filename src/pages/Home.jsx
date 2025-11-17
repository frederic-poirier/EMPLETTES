import { A } from "@solidjs/router";
import "../styles/Home.css";

export default function Home() {
  return (
    <>
      <h1>Accueil</h1>
      <section id="home">
        <A href="/lists?new=true" class="card">Faire une nouvelle liste</A>
        <A href="/lists" class="card">Consulter les listes</A>
        <A href="/import" class="card">Importer des produits</A>
        <A href="/search" class="card">Rechercher un article</A>
      </section>
    </>
  );
}
