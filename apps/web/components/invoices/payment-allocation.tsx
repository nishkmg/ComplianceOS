"use client";

import { useState, useEffect } from "react";

interface InvoiceForAllocation {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  outstandingAmount: number;
  allocatedAmount: number;
}

interface Allocation {
  invoiceId: string;
  allocatedAmount: number;
}

interface PaymentAllocationProps {
  customerName: string;
  totalAmount: number;
  onChange: (allocations: Allocation[]) => void;
}

export default function PaymentAllocation({
  customerName,
  totalAmount,
  onChange,
}: PaymentAllocationProps) {
  const [invoices, setInvoices] = useState<InvoiceForAllocation[]>([]);
  const [allocations, setAllocations] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  // Mock outstanding invoices — in production, fetch from receivables router
  useEffect(() => {
    if (!customerName) {
      setInvoices([]);
      return;
    }
    setLoading(true);
    // Simulate fetching outstanding invoices for customer
    setTimeout(() => {
      const mockInvoices: InvoiceForAllocation[] = [
        { id: "inv-1", invoiceNumber: "INV-2026-27-001", date: "2026-04-01", dueDate: "2026-04-15", outstandingAmount: 118000, allocatedAmount: 0 },
        { id: "inv-2", invoiceNumber: "INV-2026-27-002", date: "2026-04-05", dueDate: "2026-04-20", outstandingAmount: 59000, allocatedAmount: 0 },
        { id: "inv-3", invoiceNumber: "INV-2026-27-003", date: "2026-04-10", dueDate: "2026-04-25", outstandingAmount: 82600, allocatedAmount: 0 },
      ];
      setInvoices(mockInvoices);
      setLoading(false);
    }, 300);
  }, [customerName]);

  const updateAllocation = (invoiceId: string, amount: number) => {
    setAllocations((prev) => {
      const next = new Map(prev);
      if (amount <= 0) next.delete(invoiceId);
      else next.set(invoiceId, amount);
      return next;
    });
  };

  const autoAllocate = () => {
    let remaining = totalAmount;
    const sorted = [...invoices].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
    const newAllocations = new Map<string, number>();

    for (const inv of sorted) {
      if (remaining <= 0) break;
      const allocate = Math.min(remaining, inv.outstandingAmount);
      if (allocate > 0) {
        newAllocations.set(inv.id, allocate);
        remaining -= allocate;
      }
    }

    setAllocations(newAllocations);
  };

  const totalAllocated = Array.from(allocations.values()).reduce((s, a) => s + a, 0);
  const remaining = totalAmount - totalAllocated;

  // Notify parent whenever allocations change
  useEffect(() => {
    const result = Array.from(allocations.entries())
      .filter(([, amt]) => amt > 0)
      .map(([invoiceId, allocatedAmount]) => ({ invoiceId, allocatedAmount }));
    onChange(result);
  }, [allocations, onChange]);

  if (!customerName) {
    return (
      <div className="p-6 text-center text-gray-400 border-2 border-dashed rounded-lg">
        Select a customer to allocate payment
      </div>
    );
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading invoices...</div>;
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 border-2 border-dashed rounded-lg">
        No outstanding invoices for {customerName}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Outstanding Invoices</h3>
        <button
          type="button"
          onClick={autoAllocate}
          className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border"
        >
          Auto-allocate (FIFO)
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-gray-500 font-medium text-xs">Invoice #</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium text-xs">Date</th>
              <th className="px-3 py-2 text-left text-gray-500 font-medium text-xs">Due Date</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium text-xs">Outstanding</th>
              <th className="px-3 py-2 text-right text-gray-500 font-medium text-xs">Allocate</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices.map((inv) => {
              const currentAlloc = allocations.get(inv.id) ?? 0;
              const isFull = currentAlloc >= inv.outstandingAmount;
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-blue-600">{inv.invoiceNumber}</td>
                  <td className="px-3 py-2 text-gray-600">{inv.date}</td>
                  <td className="px-3 py-2 text-gray-600">{inv.dueDate}</td>
                  <td className="px-3 py-2 text-right text-gray-900">
                    ₹{inv.outstandingAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      max={inv.outstandingAmount}
                      step="0.01"
                      value={currentAlloc || ""}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        updateAllocation(inv.id, Math.min(val, inv.outstandingAmount));
                      }}
                      className="w-28 px-2 py-1 text-right text-sm border rounded"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="bg-gray-50 rounded-lg p-4 w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-medium">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Allocated</span>
            <span className="font-medium text-blue-600">₹{totalAllocated.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Remaining</span>
            <span className={`font-semibold ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
              ₹{remaining.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}