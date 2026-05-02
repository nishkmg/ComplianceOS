"use client";

import { useState, useMemo } from "react";
import { api } from "@/lib/api";
// @ts-ignore
import { PaymentAllocationInputSchema } from "@complianceos/shared";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  grandTotal: number;
  status: "sent" | "partially_paid" | "paid";
  amountPaid: number;
  outstandingAmount: number;
}

interface Allocation {
  invoiceId: string;
  allocatedAmount: number;
}

interface PaymentAllocationProps {
  onSuccess?: () => void;
}

export function PaymentAllocation({ onSuccess }: PaymentAllocationProps) {
  const [customerName, setCustomerName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank" | "online" | "cheque">("online");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const { data: customerData, isLoading: isLoadingCustomer }: any = api.receivables.customer.useQuery(
    { customerName },
    { enabled: customerName.length > 0 }
  );

  const outstandingInvoices: Invoice[] = customerData?.outstandingInvoices ?? [];

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, a) => sum + a.allocatedAmount, 0),
    [allocations]
  );

  const remainingAmount = useMemo(
    () => (typeof paymentAmount === "number" ? paymentAmount - totalAllocated : 0),
    [paymentAmount, totalAllocated]
  );

  const isAllocationValid = totalAllocated <= (typeof paymentAmount === "number" ? paymentAmount : 0) + 0.01;

  const recordPayment: any = api.payments.record.useMutation();
  const allocatePayment: any = api.payments.allocate.useMutation();

  const handleAutoAllocate = () => {
    if (!outstandingInvoices.length || typeof paymentAmount !== "number") return;

    const sortedInvoices = [...outstandingInvoices].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let remaining = paymentAmount;
    const newAllocations: Allocation[] = [];

    for (const invoice of sortedInvoices) {
      if (remaining <= 0.01) break;

      const allocateToInvoice = Math.min(invoice.outstandingAmount, remaining);
      newAllocations.push({
        invoiceId: invoice.id,
        allocatedAmount: Math.round(allocateToInvoice * 100) / 100,
      });
      remaining -= allocateToInvoice;
    }

    setAllocations(newAllocations);
  };

  const handleAllocationChange = (invoiceId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setAllocations((prev) => {
      const existing = prev.find((a) => a.invoiceId === invoiceId);
      if (amount <= 0.01 && !existing) return prev;
      if (amount <= 0.01) return prev.filter((a) => a.invoiceId !== invoiceId);
      if (existing) {
        return prev.map((a) => (a.invoiceId === invoiceId ? { ...a, allocatedAmount: amount } : a));
      }
      return [...prev, { invoiceId, allocatedAmount: amount }];
    });
  };

  const handleGetAllocationValue = (invoiceId: string) => {
    const allocation = allocations.find((a) => a.invoiceId === invoiceId);
    return allocation?.allocatedAmount?.toString() ?? "";
  };

  const handleSubmit = async () => {
    if (!customerName || !paymentAmount || allocations.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    if (!isAllocationValid) {
      alert("Total allocations cannot exceed payment amount");
      return;
    }

    setIsRecording(true);
    try {
      const result = await recordPayment.mutateAsync({
        date: paymentDate,
        customerName,
        amount: typeof paymentAmount === "number" ? paymentAmount : 0,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        allocations: allocations.map((a) => ({
          invoiceId: a.invoiceId,
          allocatedAmount: a.allocatedAmount,
        })),
        notes: undefined,
      });

      await allocatePayment.mutateAsync({
        paymentId: result.id,
        allocations: allocations.map((a) => ({
          invoiceId: a.invoiceId,
          allocatedAmount: a.allocatedAmount,
        })),
      });

      alert("Payment recorded and allocated successfully!");
      setCustomerName("");
      setPaymentAmount("");
      setAllocations([]);
      setReferenceNumber("");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to record payment:", error);
      alert("Failed to record payment. Please try again.");
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-mid mb-2">Customer Name *</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-mid mb-2">Payment Date *</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-mid mb-2">Payment Amount *</label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value ? parseFloat(e.target.value) : "")}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-mid mb-2">Payment Method *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "cash" | "bank" | "online" | "cheque")}
              className="px-3 py-2 border rounded text-sm w-full"
            >
              <option value="online">Online</option>
              <option value="bank">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-mid mb-2">Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Transaction ID, Cheque No., etc."
              className="px-3 py-2 border rounded text-sm w-full"
            />
          </div>
        </div>
      </div>

      {customerName && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Outstanding Invoices</h2>
            {customerData && (
              <span className="text-sm text-mid">
                Total Outstanding:{" "}
                <span className="font-bold text-dark">
                  ₹{customerData.totalOutstanding.toLocaleString("en-IN")}
                </span>
              </span>
            )}
          </div>

          {isLoadingCustomer ? (
            <p className="text-sm text-mid">Loading invoices...</p>
          ) : outstandingInvoices.length === 0 ? (
            <p className="text-sm text-mid">No outstanding invoices for this customer.</p>
          ) : (
            <div className="space-y-3">
              <table className="w-full text-sm">
                <thead className="bg-section-muted border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-mid font-medium">Invoice No.</th>
                    <th className="px-4 py-3 text-left text-mid font-medium">Date</th>
                    <th className="px-4 py-3 text-right text-mid font-medium">Total</th>
                    <th className="px-4 py-3 text-right text-mid font-medium">Outstanding</th>
                    <th className="px-4 py-3 text-right text-mid font-medium">Allocate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {outstandingInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-section-muted">
                      <td className="px-4 py-3">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-mid">{invoice.date}</td>
                      <td className="px-4 py-3 text-right text-mid">
                        ₹{invoice.grandTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-dark">
                        ₹{invoice.outstandingAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={handleGetAllocationValue(invoice.id)}
                          onChange={(e) => handleAllocationChange(invoice.id, e.target.value)}
                          placeholder="0.00"
                          min="0"
                          max={invoice.outstandingAmount}
                          step="0.01"
                          className="px-2 py-1 border rounded text-sm w-28 text-right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAutoAllocate}
                  disabled={!paymentAmount || typeof paymentAmount !== "number"}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Auto-allocate (Oldest First)
                </button>
                <button
                  onClick={() => setAllocations([])}
                  className="px-4 py-2 bg-gray-200 text-dark text-sm rounded hover:bg-gray-300"
                >
                  Clear Allocations
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(allocations.length > 0 || typeof paymentAmount === "number") && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Allocation Summary</h2>
            <div className="text-right">
              <div className="text-sm text-mid">
                Payment: ₹{typeof paymentAmount === "number" ? paymentAmount.toLocaleString("en-IN") : "0.00"}
              </div>
              <div className="text-sm text-mid">
                Allocated: ₹{totalAllocated.toLocaleString("en-IN")}
              </div>
              <div className={`text-sm font-medium ${remainingAmount > 0.01 ? "text-orange-600" : "text-success"}`}>
                Unallocated: ₹{Math.max(0, remainingAmount).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {!isAllocationValid && (
            <div className="mb-4 p-3 bg-danger-bg border border-danger/20 rounded text-sm text-danger">
              Total allocations (₹{totalAllocated.toLocaleString("en-IN")}) exceed payment amount (₹
              {typeof paymentAmount === "number" ? paymentAmount.toLocaleString("en-IN") : "0.00"})
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={
                isRecording ||
                !customerName ||
                !paymentAmount ||
                allocations.length === 0 ||
                !isAllocationValid
              }
              className="px-6 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecording ? "Recording..." : "Record Payment"}
            </button>
            <button
              onClick={() => {
                setAllocations([]);
                setPaymentAmount("");
                setReferenceNumber("");
              }}
              className="px-6 py-2 bg-gray-200 text-dark text-sm rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
