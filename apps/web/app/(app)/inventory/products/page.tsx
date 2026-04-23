// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  name: string;
  hsnCode: string;
  gstRate: string | null;
  isActive: boolean;
}

async function fetchProducts(search?: string, page = 1, pageSize = 20): Promise<{ products: Product[]; page: number; pageSize: number }> {
  const input = JSON.stringify({ search, page, pageSize });
  const response = await fetch(`/api/trpc/products.list?input=${encodeURIComponent(input)}`);
  if (!response.ok) return { products: [], page, pageSize };
  const json = await response.json();
  return json.result?.data ?? { products: [], page, pageSize };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProducts(search || undefined, page)
      .then((data) => {
        setProducts(data.products);
        setPage(data.page);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-normal text-dark">Products</h1>
          <p className="font-ui text-[12px] text-light mt-1">Manage inventory items</p>
        </div>
        <Link href="/inventory/products/new" className="filter-tab active">New Product</Link>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search by name, SKU, or HSN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field font-ui w-full max-w-md"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 font-ui text-light">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table table-dense">
            <thead>
              <tr>
                <th className="font-ui text-[10px] uppercase tracking-wide">SKU</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">Name</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">HSN Code</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">GST Rate</th>
                <th className="font-ui text-[10px] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center font-ui text-[13px] text-light">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-hairline hover:bg-surface-muted">
                    <td className="font-mono text-[13px] text-dark px-4 py-3">{product.sku}</td>
                    <td className="font-ui text-[13px] text-dark px-4 py-3">{product.name}</td>
                    <td className="font-mono text-[13px] text-mid px-4 py-3">{product.hsnCode}</td>
                    <td className="font-ui text-[13px] text-mid px-4 py-3">{product.gstRate ? `${product.gstRate}%` : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-[10px] uppercase tracking-wide rounded ${product.isActive ? "bg-success text-white" : "bg-lighter text-mid"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
