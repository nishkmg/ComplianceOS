// Session-level store for products created during this session.
// Survives SPA navigation; resets on full page reload.

export interface StoredProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  hsn: string;
  stock: number;
  unitPrice: number;
  status: "active" | "discontinued";
}

let products: StoredProduct[] = [];

export function addProduct(p: StoredProduct): void {
  products.push(p);
}

export function getProducts(): StoredProduct[] {
  return products;
}

export function skuExists(sku: string, excludeSku?: string): boolean {
  return products.some(
    (p) => p.sku.toLowerCase() === sku.toLowerCase() && p.sku !== excludeSku
  );
}
