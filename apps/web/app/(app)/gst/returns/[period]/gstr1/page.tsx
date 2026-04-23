// @ts-nocheck
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

interface GSTR1Data {
  b2bInvoices: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    gstin: string;
    partyName: string;
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
    totalTaxAmount: string;
  }>;
  b2cLarge: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
  }>;
  b2cSmall: Array<{
    placeOfSupply: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
  }>;
  exports: Array<{
    invoiceNumber: string;
    invoiceDate: string;
    portCode: string;
    shippingBillNumber: string;
    shippingBillDate: string;
    taxableValue: string;
  }>;
  creditDebitNotes: Array<{
    noteNumber: string;
    noteDate: string;
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    gstin: string;
    taxableValue: string;
    igstAmount: string;
    cgstAmount: string;
    sgstAmount: string;
    cessAmount: string;
  }>;
}

export default function GSTR1DetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);

  const [activeTable, setActiveTable] = useState<"b2b" | "b2cLarge" | "b2cSmall" | "exports" | "cdn">("b2b");

  const { data: returnData, isLoading } = api.gstReturns.get.useQuery(
    { returnId: "" },
    { enabled: false }
  );

  // Mock data for demonstration
  const mockData: GSTR1Data = {
    b2bInvoices: [
      {
        invoiceNumber: "INV-2026-27-001",
        invoiceDate: "2026-04-15",
        gstin: "27AABCU9603R1ZM",
        partyName: "Acme Corp",
        placeOfSupply: "27-Maharashtra",
        taxableValue: "100000",
        igstAmount: "0",
        cgstAmount: "9000",
        sgstAmount: "9000",
        cessAmount: "0",
        totalTaxAmount: "18000",
      },
      {
        invoiceNumber: "INV-2026-27-002",
        invoiceDate: "2026-04-18",
        gstin: "29AABCT1234R1Z5",
        partyName: "TechStart Ltd",
        placeOfSupply: "29-Karnataka",
        taxableValue: "50000",
        igstAmount: "9000",
        cgstAmount: "0",
        sgstAmount: "0",
        cessAmount: "0",
        totalTaxAmount: "9000",
      },
    ],
    b2cLarge: [
      {
        invoiceNumber: "INV-2026-27-003",
        invoiceDate: "2026-04-20",
        placeOfSupply: "27-Maharashtra",
        taxableValue: "250000",
        igstAmount: "0",
        cgstAmount: "22500",
        sgstAmount: "22500",
        cessAmount: "0",
      },
    ],
    b2cSmall: [
      {
        placeOfSupply: "27-Maharashtra",
        taxableValue: "50000",
        igstAmount: "0",
        cgstAmount: "4500",
        sgstAmount: "4500",
        cessAmount: "0",
      },
    ],
    exports: [
      {
        invoiceNumber: "EXP-2026-27-001",
        invoiceDate: "2026-04-22",
        portCode: "INBOM1",
        shippingBillNumber: "SB123456",
        shippingBillDate: "2026-04-21",
        taxableValue: "500000",
      },
    ],
    creditDebitNotes: [
      {
        noteNumber: "CN-001",
        noteDate: "2026-04-25",
        originalInvoiceNumber: "INV-2026-27-001",
        originalInvoiceDate: "2026-04-15",
        gstin: "27AABCU9603R1ZM",
        taxableValue: "10000",
        igstAmount: "0",
        cgstAmount: "900",
        sgstAmount: "900",
        cessAmount: "0",
      },
    ],
  };

  const handleExportJSON = () => {
    let dataToExport;
    switch (activeTable) {
      case "b2b":
        dataToExport = mockData.b2bInvoices;
        break;
      case "b2cLarge":
        dataToExport = mockData.b2cLarge;
        break;
      case "b2cSmall":
        dataToExport = mockData.b2cSmall;
        break;
      case "exports":
        dataToExport = mockData.exports;
        break;
      case "cdn":
        dataToExport = mockData.creditDebitNotes;
        break;
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${activeTable}_${months.find((m) => m.value === month)?.label}_${year}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GSTR-1 Detail</h1>
          <p className="text-sm text-gray-500">
            {months.find((m) => m.value === month)?.label} {year} - Outward Supplies
          </p>
        </div>
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Export JSON
        </button>
      </div>

      <div className="border-b">
        <nav className="flex gap-4 overflow-x-auto">
          {[
            { id: "b2b", label: "B2B Invoices", count: mockData.b2bInvoices.length },
            { id: "b2cLarge", label: "B2C Large", count: mockData.b2cLarge.length },
            { id: "b2cSmall", label: "B2C Small", count: mockData.b2cSmall.length },
            { id: "exports", label: "Exports", count: mockData.exports.length },
            { id: "cdn", label: "Credit/Debit Notes", count: mockData.creditDebitNotes.length },
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
        {activeTable === "b2b" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">GSTIN</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Party Name</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Place of Supply</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.b2bInvoices.map((inv, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.gstin}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.partyName}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.placeOfSupply}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.sgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-medium">₹{Number(inv.totalTaxAmount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "b2cLarge" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Place of Supply</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.b2cLarge.map((inv, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.placeOfSupply}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.sgstAmount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "b2cSmall" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Place of Supply</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.b2cSmall.map((inv, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{inv.placeOfSupply}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(inv.sgstAmount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "exports" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Port Code</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Shipping Bill #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">SB Date</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.exports.map((exp, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{exp.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.invoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.portCode}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.shippingBillNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{exp.shippingBillDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(exp.taxableValue).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTable === "cdn" && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Note #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Original Invoice #</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">Original Date</th>
                <th className="px-4 py-3 text-left text-gray-500 font-medium">GSTIN</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">Taxable Value</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">IGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">CGST</th>
                <th className="px-4 py-3 text-right text-gray-500 font-medium">SGST</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockData.creditDebitNotes.map((note, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{note.noteNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{note.noteDate}</td>
                  <td className="px-4 py-3 text-gray-600">{note.originalInvoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{note.originalInvoiceDate}</td>
                  <td className="px-4 py-3 text-gray-600">{note.gstin}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(note.taxableValue).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(note.igstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(note.cgstAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{Number(note.sgstAmount).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
