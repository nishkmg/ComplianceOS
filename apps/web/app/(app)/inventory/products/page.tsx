// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  hsn: string;
  stock: number;
  unitPrice: number;
  status: "active" | "discontinued";
}

const mockProducts: Product[] = [
  { id: "1", sku: "RM-001", name: "Cotton Yarn 40s", category: "Raw Material", hsn: "5205", stock: 3800, unitPrice: 245, status: "active" },
  { id: "2", sku: "RM-002", name: "Steel Rods 12mm", category: "Raw Material", hsn: "7214", stock: 200, unitPrice: 68, status: "active" },
  { id: "3", sku: "FG-001", name: "Finished Widget A", category: "Finished Good", hsn: "8471", stock: 1500, unitPrice: 1250, status: "active" },
  { id: "4", sku: "RM-004", name: "Packaging Material", category: "Raw Material", hsn: "4819", stock: 0, unitPrice: 35, status: "discontinued" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const filtered = mockProducts.filter((p) => {
    if (stockFilter === "in_stock" && p.stock <= 0) return false;
    if (stockFilter === "out_of_stock" && p.stock > 0) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Product Ledger</h1>
          <p className="font-ui-sm text-ui-sm text-text-mid max-w-2xl">Comprehensive view of all active SKUs, current stock levels, and associated HSN/SAC codes for immediate GST compliance verification.</p>
        </div>
        <Link href="/inventory/products/new" className="inline-flex items-center justify-center gap-2 bg-primary-container text-white px-6 py-3 hover:opacity-90 transition-all group font-ui-sm text-ui-sm whitespace-nowrap no-underline">
          <span>Add New SKU</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border-[0.5px] border-border-subtle">
        <div className="p-4 border-b-[0.5px] border-border-subtle flex flex-wrap gap-4 items-center justify-between bg-[#FBF9F6]">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-light">search</span>
              <input className="pl-10 pr-4 py-2 border-[0.5px] border-border-subtle bg-white text-on-surface font-ui-sm text-ui-sm outline-none focus:border-primary w-64" placeholder="Search SKU or name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="relative">
              <select className="appearance-none pl-4 pr-10 py-2 border-[0.5px] border-border-subtle bg-white text-on-surface font-ui-sm text-ui-sm focus:outline-none focus:border-primary min-w-[140px]" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="">Stock: All</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <button className="font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer border-none bg-transparent">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            More Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold w-32">SKU</th>
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold">Product Name</th>
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold">Category</th>
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold w-24">HSN/SAC</th>
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold text-right w-24">Stock</th>
                <th className="py-3 px-4 border-b-[0.5px] border-border-subtle font-ui-xs text-ui-xs uppercase tracking-widest text-text-mid font-semibold text-right w-40">Unit Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-border-subtle">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono-md text-sm text-amber-text font-medium">{p.sku}</td>
                  <td className="py-3 px-4 font-ui-sm text-on-surface font-medium">{p.name}</td>
                  <td className="py-3 px-4 font-ui-sm text-text-mid">{p.category}</td>
                  <td className="py-3 px-4 font-mono-md text-sm text-text-mid">{p.hsn}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-mono-md text-sm ${p.stock > 0 ? 'text-on-surface' : 'text-red-600'}`}>
                      {p.stock > 0 ? p.stock.toLocaleString('en-IN') : '0'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono-md text-sm text-right">₹{p.unitPrice.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
