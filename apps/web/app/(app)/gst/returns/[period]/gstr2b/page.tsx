"use client";

import { useParams } from "next/navigation";
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

interface GSTR2BData {
  purchasesGoods: Array<{
    gstin: string;
    partyName: string;
    invoiceNumber: string;
    invoiceDate: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    eligibleI tc: string;
    ineligibleI tc: string;
  }>;
  purchasesServices: Array<{
    gstin: string;
    partyName: string;
    invoiceNumber: string;
    invoiceDate: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    eligibleI tc: string;
    ineligibleI tc: string;
  }>;
  imports: Array<{
    importType: "goods" | "services";
    portCode: string;
    shippingBillNumber: string;
    shippingBillDate: string;
    taxableValue: string;
    igstAmount: string;
    cessAmount: string;
    eligibleI tc: string;
  }>;
  itcEligible: {
    totalEligible: string;
    igstEligible: string;
    cgstEligible: string;
    sgstEligible: string;
    cessEligible: string;
  };
}

export default function GSTR2BDetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);

  const [activeTable, setActiveTable] = useState<"goods" | "services" | "imports" | "itc">("goods");

  const { data: returnData } = api.gstReturns.get.useQuery(
    { returnId: "" },
    { enabled: false }
  );

  // Mock data for demonstration
  const mockData: GSTR2BData = {
    purchasesGoods: [
      {
        gstin: "27AABCU9603R1ZM",
        partyName: "Acme Suppliers",
        invoiceNumber: "SUP-001",
        invoiceDate: "2026-04-10",
        taxableValue: "100000",
        igstAmount: "0",
        cgstAmount: "9000",
        sgstAmount: "9000",
        cessAmount: "0",
        eligibleI tc: "18000",
        ineligibleI tc: "0",
      },
      {
        gstin: "29AABCT1234R1Z5",
        partyName: "Tech Components",
        invoiceNumber: "SUP-002",
        invoiceDate: "2026-04-12",
        taxableValue: "50000",
        igstAmount: "9000",
        cgstAmount: "0",
        sgstAmount: "0",
        cessAmount: "0",
        eligibleI tc: "9000",
        ineligibleI tc: "0",
      },
    ],
    purchasesServices: [
      {
        gstin: "27AABCS5678R1Z1",
        partyName: "Cloud Services Ltd",
        invoiceNumber: "SRV-001",
        invoiceDate: "2026-04-15",
        taxableValue: "25000",
        igstAmount: "4500",
        cgstAmount: "0",
        sgstAmount: "0",
        cessAmount: "0",
        eligibleI tc: "4500",
        ineligibleI tc: "0",
      },
    ],
    imports: [
      {
        importType: "goods",
        portCode: "INBOM1",
        shippingBillNumber: "SB789012",
        shippingBillDate: "2026-04-20",
        taxableValue: "500000",
        igstAmount: "90000",
        cessAmount: "5000",
        eligibleI tc: "95000",
      },
    ],
    itcEligible: {
      totalEligible: "126500",
      igstEligible: "103500",
      cgstEligible: "9000",
      sgstEligible: "9000",
      cessEligible: "5000",
    },
  };

  const reconciliationStatus = "reconciled";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GSTR-2B Detail</h1>
          <p className="text-sm text-gray-500">
            {months.find((m) => m.value === month)?.label} {year} - Input Tax Credit
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full capitalize ${
            reconciliationStatus === "reconciled" ? "bg-green-100 text-green-800" :
            reconciliationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {reconciliationStatus === "reconciled" ? "✓ Reconciled" : 
             reconciliationStatus === "pending" ? "⚠ Pending" : "✗ Mismatch"}
          </span>
        </div>
      </div>

      <div className="border-b">
        <nav className="flex gap-4 overflow-x-auto">
          {[
            { id: "goods", label: "Purchases (Goods)", count: mockData.purchasesGoods.length },
            { id: "services", label: "Purchases (Services)", count: mockData.purchasesServices.length },
            { id: "imports", label: "Imports", count: mockData.imports.length },
            { id: "itc", label: "ITC Summary", count: 1 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTable(tab.id as typeof activeTable)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTable === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTable === "goods" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">GSTIN</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Party Name</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Eligible ITC</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Ineligible ITC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.purchasesGoods.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{item.gstin}</td>
                  <td className="px-4 py-3 font-medium">{item.partyName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{item.invoiceDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.sgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">₹{Number(item.eligibleI tc).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{Number(item.ineligibleI tc).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "services" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">GSTIN</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Party Name</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Eligible ITC</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Ineligible ITC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.purchasesServices.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{item.gstin}</td>
                  <td className="px-4 py-3 font-medium">{item.partyName}</td>
                  <td className="px-4 py-3 text-gray-600">{item.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{item.invoiceDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.sgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">₹{Number(item.eligibleI tc).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-red-600">₹{Number(item.ineligibleI tc).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "imports" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Port Code</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Shipping Bill #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">SB Date</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Cess</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Eligible ITC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.imports.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 capitalize">{item.importType}</td>
                  <td className="px-4 py-3 text-gray-600">{item.portCode}</td>
                  <td className="px-4 py-3 text-gray-600">{item.shippingBillNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{item.shippingBillDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(item.cessAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">₹{Number(item.eligibleI tc).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "itc" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">ITC Eligibility Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Total Eligible ITC</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{Number(mockData.itcEligible.totalEligible).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">IGST Eligible</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{Number(mockData.itcEligible.igstEligible).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">CGST Eligible</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{Number(mockData.itcEligible.cgstEligible).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">SGST Eligible</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{Number(mockData.itcEligible.sgstEligible).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Cess Eligible</p>
                <p className="text-xl font-bold text-blue-600">
                  ₹{Number(mockData.itcEligible.cessEligible).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
