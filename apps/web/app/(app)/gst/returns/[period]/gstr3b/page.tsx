"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

const months = [
  { value: 1, label: "April" },
  { value: 2, label: "May" },
  { value: 3, label: "June" },
  { value: 4, label: "July" },
  { value: 5, label: "August" },
  { value: 6, label: "September" },
  { value: 7, label: "October" },
  { value: 8, label: "November" },
  { value: 9, label: "December" },
  { value: 10, label: "January" },
  { value: 11, label: "February" },
  { value: 12, label: "March" },
];

interface GSTR3BData {
  outwardSupplies: {
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    totalValue: string;
  };
  inwardSuppliesITC: {
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    totalITC: string;
  };
  netPayable: {
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    totalPayable: string;
  };
  interestLateFee: {
    interest: string;
    lateFee: string;
    total: string;
  };
}

export default function GSTR3BDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);

  const [isPaying, setIsPaying] = useState(false);
  const [isFiling, setIsFiling] = useState(false);

  const { data: returnData } = api.gstReturns.get.useQuery(
    { returnId: "" },
    { enabled: false }
  );

  // Mock data for demonstration
  const mockData: GSTR3BData = {
    outwardSupplies: {
      taxableValue: "1000000",
      igstAmount: "180000",
      cgstAmount: "0",
      sgstAmount: "0",
      cessAmount: "10000",
      totalValue: "1190000",
    },
    inwardSuppliesITC: {
      igstAmount: "103500",
      cgstAmount: "9000",
      sgstAmount: "9000",
      cessAmount: "5000",
      totalITC: "126500",
    },
    netPayable: {
      igstAmount: "76500",
      cgstAmount: "-9000",
      sgstAmount: "-9000",
      cessAmount: "5000",
      totalPayable: "63500",
    },
    interestLateFee: {
      interest: "0",
      lateFee: "500",
      total: "500",
    },
  };

  const handlePayment = async () => {
    setIsPaying(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPaying(false);
    alert("Payment initiated. Challan generated.");
  };

  const handleFileReturn = async () => {
    const arn = prompt("Enter ARN (Acknowledgement Reference Number):");
    if (!arn) return;

    setIsFiling(true);
    try {
      // In real implementation, would call actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Return filed successfully. ARN: ${arn}`);
    } catch (error) {
      console.error("Failed to file return:", error);
      alert("Failed to file return");
    } finally {
      setIsFiling(false);
    }
  };

  const hasTaxDue = Number(mockData.netPayable.totalPayable) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GSTR-3B Detail</h1>
          <p className="text-sm text-gray-500">
            {months.find((m) => m.value === month)?.label} {year} - Summary Return
          </p>
        </div>
        <div className="flex gap-2">
          {hasTaxDue && (
            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {isPaying ? "Processing..." : "Pay Tax Due"}
            </button>
          )}
          <button
            onClick={handleFileReturn}
            disabled={isFiling}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isFiling ? "Filing..." : "File Return"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">GSTR-3B Summary</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b-2">
            <tr>
              <th className="px-4 py-3 text-left text-gray-500 font-medium">Details</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Cess</th>
              <th className="px-4 py-3 text-right text-gray-500 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr className="bg-blue-50">
              <td className="px-4 py-3 font-semibold">3.1 Outward Supplies</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.outwardSupplies.igstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.outwardSupplies.cgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.outwardSupplies.sgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.outwardSupplies.cessAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right font-medium">₹{Number(mockData.outwardSupplies.totalValue).toLocaleString("en-IN")}</td>
            </tr>
            <tr className="bg-green-50">
              <td className="px-4 py-3 font-semibold">4. Eligible ITC</td>
              <td className="px-4 py-3 text-right text-green-600">₹{Number(mockData.inwardSuppliesITC.igstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right text-green-600">₹{Number(mockData.inwardSuppliesITC.cgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right text-green-600">₹{Number(mockData.inwardSuppliesITC.sgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right text-green-600">₹{Number(mockData.inwardSuppliesITC.cessAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right font-medium text-green-600">₹{Number(mockData.inwardSuppliesITC.totalITC).toLocaleString("en-IN")}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold">5.1 Net Tax Payable</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.netPayable.igstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.netPayable.cgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.netPayable.sgstAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right">₹{Number(mockData.netPayable.cessAmount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 text-right font-medium">₹{Number(mockData.netPayable.totalPayable).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-600">6. Interest & Late Fee</td>
              <td className="px-4 py-3 text-right text-gray-600">-</td>
              <td className="px-4 py-3 text-right text-gray-600">-</td>
              <td className="px-4 py-3 text-right text-gray-600">-</td>
              <td className="px-4 py-3 text-right text-gray-600">-</td>
              <td className="px-4 py-3 text-right font-medium text-gray-600">₹{Number(mockData.interestLateFee.total).toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
          <tfoot className="bg-gray-100 border-t-2">
            <tr>
              <td className="px-4 py-3 font-bold">Net Payable (After ITC)</td>
              <td className={`px-4 py-3 text-right font-bold ${Number(mockData.netPayable.igstAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(mockData.netPayable.igstAmount) >= 0 ? "₹" : "-₹"}{Math.abs(Number(mockData.netPayable.igstAmount)).toLocaleString("en-IN")}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${Number(mockData.netPayable.cgstAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(mockData.netPayable.cgstAmount) >= 0 ? "₹" : "-₹"}{Math.abs(Number(mockData.netPayable.cgstAmount)).toLocaleString("en-IN")}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${Number(mockData.netPayable.sgstAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(mockData.netPayable.sgstAmount) >= 0 ? "₹" : "-₹"}{Math.abs(Number(mockData.netPayable.sgstAmount)).toLocaleString("en-IN")}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${Number(mockData.netPayable.cessAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                {Number(mockData.netPayable.cessAmount) >= 0 ? "₹" : "-₹"}{Math.abs(Number(mockData.netPayable.cessAmount)).toLocaleString("en-IN")}
              </td>
              <td className={`px-4 py-3 text-right font-bold text-lg ${hasTaxDue ? "text-red-600" : "text-green-600"}`}>
                {hasTaxDue ? "₹" : "-₹"}{Math.abs(Number(mockData.netPayable.totalPayable)).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {hasTaxDue && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-orange-600 text-xl">⚠</div>
            <div>
              <h3 className="font-semibold text-orange-800">Tax Payment Required</h3>
              <p className="text-sm text-orange-700 mt-1">
                Total tax payable: <strong>₹{Math.abs(Number(mockData.netPayable.totalPayable)).toLocaleString("en-IN")}</strong>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Please make the payment before filing your return to avoid interest and late fees.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Verification</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="verify1" className="rounded" />
            <label htmlFor="verify1" className="text-sm text-gray-700">
              I have verified all the details furnished above
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="verify2" className="rounded" />
            <label htmlFor="verify2" className="text-sm text-gray-700">
              I am aware of the liability for prosecution in case of false information
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
