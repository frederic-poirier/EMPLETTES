import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js";
import { AddIcon } from "../assets/Icons";
import { ContainerHeading, EmptyState, Container } from "../components/Layout";
import QuantitySelector from "../components/QuantitySelector";
import Sheet from "../components/Sheet";
import List from "../components/List";
import { useProducts } from "../utils/useProducts";
import { useExpirations } from "../utils/useExpirations";

export default function Expirations() {
    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);

    const { all } = useProducts();
    const { sorted: sortedExpirations, save, update, remove } = useExpirations();

    const [form, setForm] = createSignal({
        productId: "",
        productInput: "",
        date: todayISO,
        quantity: 1,
    });
    const [error, setError] = createSignal("");

    const products = createMemo(() =>
        [...all()].sort((a, b) => (a.PRODUCT || "").localeCompare(b.PRODUCT || "", "fr", { sensitivity: "base" }))
    );

    const productById = createMemo(() => {
        const map = {};
        for (const p of products()) {
            map[p.id] = p;
        }
        return map;
    });

    const selectedProduct = createMemo(() => productById()[form().productId]);

    const isFormValid = createMemo(() =>
        form().productId && form().date && form().quantity >= 1
    );

    const productLabel = (p) => `${p.PRODUCT}${p.SUPPLIER ? ` · ${p.SUPPLIER}` : ""}`;

    const openSheet = () => {
        document.getElementById("add-expiration-sheet")?.showPopover();
    };

    const closeSheet = () => {
        setForm({ productId: "", productInput: "", date: todayISO, quantity: 1 });
        setError("");
    };

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        setError("");

        const current = form();
        if (!current.productId || !current.date) {
            setError("Choisissez un produit et une date.");
            return;
        }

        const qty = Number(current.quantity) || 1;

        const entry = {
            productId: current.productId,
            id: createUniqueId(),
            productName: selectedProduct()?.PRODUCT || "Produit inconnu",
            supplier: selectedProduct()?.SUPPLIER || "",
            date: current.date,
            quantity: qty,
            createdAt: new Date().toISOString(),
        };

        save(entry);
        closeSheet();
        document.getElementById("add-expiration-sheet")?.hidePopover();
    };

    const handleProductInput = (value) => {
        setForm((prev) => ({ ...prev, productInput: value }));

        const match = products().find((p) => productLabel(p).toLowerCase() === value.toLowerCase());
        if (match) {
            setForm((prev) => ({ ...prev, productId: match.id }));
            return;
        }

        const partial = products().find((p) => productLabel(p).toLowerCase().includes(value.toLowerCase()));
        setForm((prev) => ({ ...prev, productId: partial?.id ?? "" }));
    };

    const formatDateLabel = (date) => {
        const d = new Date(date);
        const todayDate = new Date(todayISO);
        const diffTime = d - todayDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `Expiré (${Math.abs(diffDays)}j)`;
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Demain";
        if (diffDays < 7) return `${diffDays} jours`;
        return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    };

    return (
        <Container>
            <ContainerHeading title="Alertes de péremption">
                <button
                    onClick={openSheet}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    <AddIcon className="w-5 h-5 fill-current" /> Ajouter
                </button>
            </ContainerHeading>

            <Show
                when={sortedExpirations().length > 0}
                fallback={
                    <EmptyState title="Aucune alerte">
                        <p className="text-neutral-500">
                            Appuyez sur "Ajouter" pour enregistrer une date limite.
                        </p>
                    </EmptyState>
                }
            >
                <List items={sortedExpirations()}>
                    {(entry) => {
                        const isPast = new Date(entry.date) < today;
                        return (
                            <div className={`flex items-center gap-3 py-3 ${isPast ? "bg-red-900/20 -mx-2 px-2 rounded-xl" : ""}`}>
                                <div className={`w-24 text-sm font-medium shrink-0 ${isPast ? "text-red-400" : "text-neutral-400"}`}>
                                    {formatDateLabel(entry.date)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white">{entry.productName}</p>
                                    <p className="text-neutral-500 text-xs">{entry.supplier || "Fournisseur inconnu"}</p>
                                </div>
                                <QuantitySelector
                                    value={entry.quantity}
                                    onChange={(v) => v === 0 ? remove(entry.id) : update(entry.id, { quantity: v })}
                                    min={0}
                                    size="sm"
                                />
                            </div>
                        );
                    }}
                </List>
            </Show>

            <Sheet
                id="add-expiration-sheet"
                title="Ajouter une alerte"
                maxHeightVH={70}
                onClose={closeSheet}
                content={
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400">Produit</label>
                            <input
                                list="products-list-sheet"
                                className="w-full py-3 px-4 bg-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                                placeholder="Rechercher un produit..."
                                value={form().productInput}
                                onInput={(e) => handleProductInput(e.currentTarget.value)}
                            />
                            <datalist id="products-list-sheet">
                                <For each={products()}>{(p) => <option value={productLabel(p)} />}</For>
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400">Date de péremption</label>
                            <div className="flex items-center gap-4">
                                <label className="relative cursor-pointer flex items-center justify-center w-16 h-16 rounded-xl bg-neutral-700">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-white leading-none">
                                            {new Date(form().date).getDate()}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 uppercase">
                                            {new Date(form().date).toLocaleDateString("fr-FR", { month: "short" })}
                                        </span>
                                    </div>
                                    <input
                                        type="date"
                                        value={form().date}
                                        onInput={(e) => setForm((prev) => ({ ...prev, date: e.currentTarget.value }))}
                                        className="inset-0 absolute opacity-0 cursor-pointer"
                                        onClick={(e) => e.currentTarget.showPicker?.()}
                                    />
                                </label>
                                <p className="text-neutral-500 text-sm">
                                    Appuyez pour changer la date
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400">Quantité</label>
                            <div className="flex items-center gap-4">
                                <QuantitySelector
                                    value={form().quantity}
                                    onChange={(v) => setForm((f) => ({ ...f, quantity: v }))}
                                    min={1}
                                    size="md"
                                    showBackground
                                />
                                <p className="text-neutral-500 text-sm">
                                    {form().quantity === 1 ? "article" : "articles"}
                                </p>
                            </div>
                        </div>

                        <Show when={error()}>
                            <p className="text-sm text-red-400">{error()}</p>
                        </Show>
                    </form>
                }
                footer={
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                        className={`w-full py-3 rounded-xl font-medium transition-colors ${isFormValid()
                                ? "bg-amber-600 text-white hover:bg-amber-700"
                                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                            }`}
                    >
                        Ajouter l'alerte
                    </button>
                }
            />
        </Container>
    );
}
