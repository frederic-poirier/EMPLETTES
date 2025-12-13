import { fetchAllProducts } from "./products/productsRepo";
import { fetchAllSuppliers } from "./suppliers/suppliersRepo";

export async function initCatalog() {
  await Promise.all([fetchAllProducts(), fetchAllSuppliers()]);
}
