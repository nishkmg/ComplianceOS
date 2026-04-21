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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/inventory/products/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          New Product
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, SKU, or HSN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">HSN Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">GST Rate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{product.hsnCode}</td>
                    <td className="px-4 py-3 text-gray-600">{product.gstRate ? `${product.gstRate}%` : "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
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
