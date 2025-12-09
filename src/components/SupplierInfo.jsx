import { createMemo, createUniqueId } from "solid-js";
import { useProducts } from "../utils/useProducts";
import Sheet from "./Sheet";
import "../styles/SupplierInfo.css";

export default function SupplierInfo({ list, onAddProduct, onClearList, onUncheckAll }) {
    const { products } = useProducts();
    const sheetId = `supplier-actions-${createUniqueId()}`;

    const supplierStats = createMemo(() => {
        if (!list() || !products()) return null;

        const supplier = list().SUPPLIER;
        const supplierProducts = products().filter((p) => p.SUPPLIER === supplier);
        const checkedCount = list().ITEMS.length;
        const totalCount = supplierProducts.length;

        // Brands (entreprises) avec le plus de produits
        const brandStats = {};
        supplierProducts.forEach((p) => {
            const brand = p.BRAND || "Non spécifié";
            brandStats[brand] = (brandStats[brand] || 0) + 1;
        });

        const topBrands = Object.entries(brandStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([brand, count]) => ({ brand, count }));

        // Dernière commande (date de mise à jour la plus récente)
        const lastOrderDate = list().UPDATED_AT
            ? new Date(
                typeof list().UPDATED_AT === "number"
                    ? list().UPDATED_AT
                    : list().UPDATED_AT.seconds * 1000
            )
            : null;

        return {
            supplier,
            totalCount,
            checkedCount,
            topBrands,
            lastOrderDate,
        };
    });

    const formatDate = (date) => {
        if (!date) return "Pas encore commandé";
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Aujourd'hui";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hier";
        } else {
            return date.toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    };

    const openSheet = () => document.getElementById(sheetId)?.showPopover?.();
    const closeSheet = () => document.getElementById(sheetId)?.hidePopover?.();

    return (
        <section >

            <div className="supplier-info__tables">
                <div className="command-card">
                    <table className="command-table supplier-table">
                        <thead>
                            <tr>
                                <th colSpan={2}>Statistiques</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total produits cochés / total</td>
                                <td className="numeric">
                                    {supplierStats()?.checkedCount}/{supplierStats()?.totalCount}
                                </td>
                            </tr>
                            <tr>
                                <td>Dernière commande</td>
                                <td className="numeric">{formatDate(supplierStats()?.lastOrderDate)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="command-card">
                    <table className="command-table supplier-table">
                        <thead>
                            <tr>
                                <th>Marque</th>
                                <th className="numeric"># Produits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplierStats()?.topBrands.length > 0 ? (
                                supplierStats()?.topBrands.map((brand) => (
                                    <tr key={brand.brand}>
                                        <td>{brand.brand}</td>
                                        <td className="numeric">{brand.count}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="muted">Aucune marque disponible</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

           
        </section>
    );
}
