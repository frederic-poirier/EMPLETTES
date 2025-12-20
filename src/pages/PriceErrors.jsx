import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js";
import { Container, ContainerHeading, EmptyState } from "../components/Layout";
import List from "../components/List";
import Sheet from "../components/Sheet";
import { AddIcon } from "../assets/Icons";
import { useProducts } from "../utils/useProducts";
import { usePriceErrors } from "../utils/usePriceErrors";

const ERROR_TYPES = [
    { value: "wrong_price", label: "Prix incorrect" },
    { value: "missing_tag", label: "Étiquette manquante" },
    { value: "damaged_tag", label: "Étiquette endommagée" },
    { value: "other", label: "Autre" },
];

const getErrorTypeLabel = (value) =>
    ERROR_TYPES.find((t) => t.value === value)?.label ?? value;

export default function PriceErrors() {
    const { all: allProducts } = useProducts();
    const { pending, resolved, report, resolve, remove } = usePriceErrors();

    const [sheetOpen, setSheetOpen] = createSignal(false);
    const [form, setForm] = createSignal({
        productId: "",
        productInput: "",
        errorType: "wrong_price",
        description: "",
    });
    const [error, setError] = createSignal("");
    const [showResolved, setShowResolved] = createSignal(false);

    const products = createMemo(() =>
        [...allProducts()].sort((a, b) =>
            (a.PRODUCT || "").localeCompare(b.PRODUCT || "", "fr", { sensitivity: "base" })
        )
    );

    const productById = createMemo(() => {
        const map = {};
        for (const p of products()) {
            map[p.id] = p;
        }
        return map;
    });

    const selectedProduct = createMemo(() => productById()[form().productId]);

    const productLabel = (p) => `${p.PRODUCT}${p.SUPPLIER ? ` · ${p.SUPPLIER}` : ""}`;

    const isFormValid = createMemo(() => form().productId);

    const openSheet = () => {
        setSheetOpen(true);
        document.getElementById("add-error-sheet")?.showPopover();
    };

    const closeSheet = () => {
        setSheetOpen(false);
        setForm({ productId: "", productInput: "", errorType: "wrong_price", description: "" });
        setError("");
    };

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        setError("");

        const current = form();
        if (!current.productId) {
            setError("Choisissez un produit.");
            return;
        }

        const entry = {
            id: createUniqueId(),
            productId: current.productId,
            productName: selectedProduct()?.PRODUCT || "Produit inconnu",
            supplier: selectedProduct()?.SUPPLIER || "",
            errorType: current.errorType,
            description: current.description.trim(),
            status: "PENDING",
            reportedAt: new Date().toISOString(),
            resolvedAt: null,
        };

        report(entry);
        closeSheet();
        document.getElementById("add-error-sheet")?.hidePopover();
    };

    const handleProductInput = (value) => {
        setForm((prev) => ({ ...prev, productInput: value }));

        const match = products().find(
            (p) => productLabel(p).toLowerCase() === value.toLowerCase()
        );
        if (match) {
            setForm((prev) => ({ ...prev, productId: match.id }));
            return;
        }

        const partial = products().find((p) =>
            productLabel(p).toLowerCase().includes(value.toLowerCase())
        );
        setForm((prev) => ({ ...prev, productId: partial?.id ?? "" }));
    };

    return (
        <Container>
            <ContainerHeading title="Erreurs d'étiquettes">
                <button
                    onClick={openSheet}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    <AddIcon className="w-5 h-5 fill-current" /> Signaler
                </button>
            </ContainerHeading>

            <Show
                when={pending().length > 0}
                fallback={
                    <EmptyState title="Aucune erreur signalée">
                        <p className="text-neutral-500">
                            Appuyez sur "Signaler" pour ajouter une erreur.
                        </p>
                    </EmptyState>
                }
            >
                <List items={pending()}>
                    {(entry) => (
                        <div className="flex items-center gap-3 py-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white">{entry.productName}</p>
                                <p className="text-neutral-500 text-sm">
                                    {getErrorTypeLabel(entry.errorType)}
                                    <Show when={entry.description}>
                                        <span className="text-neutral-600"> · {entry.description}</span>
                                    </Show>
                                </p>
                            </div>
                            <button
                                className="text-sm text-green-500 hover:text-green-400 transition-colors"
                                onClick={() => resolve(entry.id)}
                            >
                                ✓
                            </button>
                        </div>
                    )}
                </List>
            </Show>

            <Show when={resolved().length > 0}>
                <div className="space-y-2">
                    <button
                        className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
                        onClick={() => setShowResolved(!showResolved())}
                    >
                        {showResolved() ? "▾" : "▸"} Résolus ({resolved().length})
                    </button>

                    <Show when={showResolved()}>
                        <List items={resolved()}>
                            {(entry) => (
                                <div className="flex items-center gap-3 py-2 opacity-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                                    <span className="flex-1 text-sm text-neutral-500 line-through">
                                        {entry.productName}
                                    </span>
                                    <button
                                        className="text-xs text-neutral-600 hover:text-red-400 transition-colors"
                                        onClick={() => remove(entry.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </List>
                    </Show>
                </div>
            </Show>

            <Sheet
                id="add-error-sheet"
                title="Signaler une erreur"
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
                            <label className="text-sm text-neutral-400">Type d'erreur</label>
                            <div className="grid grid-cols-2 gap-2">
                                <For each={ERROR_TYPES}>
                                    {(type) => (
                                        <button
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, errorType: type.value }))}
                                            className={`py-2 px-3 rounded-xl text-sm transition-colors ${form().errorType === type.value
                                                    ? "bg-red-600 text-white"
                                                    : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    )}
                                </For>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-neutral-400">Note (optionnel)</label>
                            <textarea
                                className="w-full py-3 px-4 bg-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 resize-none"
                                placeholder="Détails supplémentaires..."
                                rows={2}
                                value={form().description}
                                onInput={(e) => setForm((prev) => ({ ...prev, description: e.currentTarget.value }))}
                            />
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
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                            }`}
                    >
                        Signaler l'erreur
                    </button>
                }
            />
        </Container>
    );
}
