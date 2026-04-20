"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaymentAllocation from "@/components/invoices/payment-allocation";

interface Allocation {
  invoiceId: string;
  allocatedAmount: number;
}

const customerNames = ["Acme Corp", "Beta Ltd", "Gamma Pvt", "Delta Solutions", "Epsilon Industries"];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "online", label: "Online" },
  { value: "cheque", label: "Cheque" },
];

export default function NewPaymentPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const filteredCustomers = customerNames.filter((c) =>
    c.toLowerCase().includes(customerName.toLowerCase()),
  );

  const totalAmount = parseFloat(amount) || 0;
  const totalAllocated = allocations.reduce((s, a) => s + a.allocatedAmount, 0);
  const remaining = totalAmount - totalAllocated;
  const isValid = customerName && totalAmount > 0 && remaining === 0;

  const handleSubmit = () => {
    if (!isValid) return;
    // In production: call payments.create tRPC mutation
    console.log("Recording payment:", { customerName, amount: totalAmount, paymentMethod, referenceNumber, date, notes, allocations });
    router.push("/payments");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Record Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Payment Details */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>

            {/* Customer */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Customer Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setShowCustomerSuggestions(true);
                    setAllocations([]);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
                  placeholder="Enter or select customer"
                  className="w-full px-3 py-2 border rounded text-sm"
                />
                {showCustomerSuggestions && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow max-h-40 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={() => {
                          setCustomerName(c);
                          setShowCustomerSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Amount *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Reference Number */}
            {paymentMethod !== "cash" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Reference Number ({paymentMethod === "cheque" ? "Cheque #" : "Reference"})
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={
                    paymentMethod === "bank" ? "UTR / Transfer ID"
                      : paymentMethod === "online" ? "Transaction ID"
                        : "Cheque Number"
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>
            )}

            {/* Date */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded text-sm"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 border rounded text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right: Allocation */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Allocate to Invoices</h2>

            <PaymentAllocation
              customerName={customerName}
              totalAmount={totalAmount}
              onChange={setAllocations}
            />

            {remaining > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                ₹{remaining.toLocaleString("en-IN")} remains unallocated. Allocate the full amount or adjust the payment total.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/payments")}
              className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid}
              className={`px-4 py-2 text-sm rounded text-white ${isValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}