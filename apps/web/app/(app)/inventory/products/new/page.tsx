// @ts-nocheck
"use client";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/inventory/product-form";

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const response = await fetch("/api/trpc/products.create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: data }),
    });
    if (!response.ok) {
      const json = await response.json();
      throw new Error(json.error?.message ?? "Failed to create product");
    }
    router.push("/inventory/products");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Product</h1>
      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <ProductForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
