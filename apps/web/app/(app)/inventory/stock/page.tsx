// @ts-nocheck
"use client";

import { useState, useEffect } from "react";

interface StockItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  totalValue: number;
  averageCost: number;
}

async function fetchStockSummary(): Promise<StockItem[]> {
  const response = await fetch("/api/trpc/stockReports.stockSummary");
  if (!response.ok) return [];
  const json = await response.json();
  return json.result?.data ?? [];
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchStockSummary()
      .then(setStock)
      .finally(() => setLoading(false));
  }, []);

  const totalQuantity = stock.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = stock.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Summary</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{stock.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Quantity</div>
          <div className="text-2xl font-bold text-gray-900">{totalQuantity.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold text-green-600">{formatINR(totalValue)}</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Quantity</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Avg Cost</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stock.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No stock data available
                  </td>
                </tr>
              ) : (
                stock.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-700">{item.sku}</td>
                    <td className="px-4 py-3 text-gray-900">{item.productName}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{item.quantity.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatINR(item.averageCost)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatINR(item.totalValue)}</td>
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
