import { createSignal, createEffect, Show, For } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { useProducts } from "../utils/useProducts";
import { useLists } from "../utils/useLists";

import Sheet from "../components/Sheet";
import { SearchIcon } from "../assets/Icons";

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addList } = useLists();
    const { products } = useProducts();

    const [value, setValue] = createSignal(searchParams.query || "");
    const [product, setProduct] = createSignal(null);

    let timeoutID = null;

    createEffect(() => setValue(searchParams.query || ""));

    const cleanQuery = () => (searchParams.query || "").trim().toLowerCase();

    const filteredProducts = () => {
        const q = cleanQuery();
        if (!q) return products() || [];
        return products()?.filter((p) =>
            p.PRODUCT.toLowerCase().includes(q)
        );
    };

    const handleInput = (e) => {
        const value = e.currentTarget.value;
        setValue(value);

        clearTimeout(timeoutID);
        timeoutID = setTimeout(() => {
            setSearchParams({ query: value });
        }, 300);
    };

    /* ------------------------------------------------------------
       ACTION DU FOOTER : créer une liste et ouvrir automatiquement
       le Sheet "Produits" via ?id=LISTID
    ------------------------------------------------------------ */
    const navigate = useNavigate();

    const createListAndOpen = async () => {
        const p = product();
        if (!p) return;

        const supplier = p.SUPPLIER;

        // 1. créer la liste
        const listID = await addList(supplier);

        // 2. fermer la fiche produit
        const el = document.getElementById(52);
        el?.hidePopover();

        // 3. aller à /lists?id=LISTID
        navigate(`/lists?id=${listID}`, { replace: true });
    };

    return (
        <>
            <h1>Rechercher un article</h1>

            <label htmlFor="search" className="card input-search">
                <SearchIcon />
                <input
                    id="search"
                    type="text"
                    placeholder="Rechercher"
                    className="ghost"
                    onInput={handleInput}
                    value={value()}
                />
                <span>{filteredProducts()?.length} results</span>
            </label>

            <ul className="list search-list">
                <For each={filteredProducts()?.slice(0, 50)}>
                    {(p) => (
                        <li>
                            <button
                                popoverTarget={52}
                                className="unset full"
                                onClick={() => setProduct(p)}
                            >
                                {p.PRODUCT}
                            </button>
                        </li>
                    )}
                </For>
            </ul>

        
                <Sheet
                    id={52}
                    maxHeightVH={80}
                    title="Fiche de produit"
                    content={<ProductSheet product={product} />}
                    footer={
                        <button class="btn primary full" onClick={createListAndOpen}>
                            Faire une liste pour {product()?.SUPPLIER}
                        </button>
                    }
                    onClose={() => setProduct(null)}
                />
        </>
    );
}

/* ------------------------------------------------------------
   Composant fiche produit
------------------------------------------------------------ */
function ProductSheet(props) {
    const p = () => props.product();
    return (
        <div className="product-data">
            <p>Nom du produit</p>
            <h5>{p()?.PRODUCT}</h5>

            <p>Nom de la marque</p>
            <h5>{p()?.BRAND}</h5>

            <p>Nom du fournisseur</p>
            <h5>{p()?.SUPPLIER}</h5>

            <p>Code du produit</p>
            <h5>{p()?.SKU || "Unknown"}</h5>
        </div>
    );
}
