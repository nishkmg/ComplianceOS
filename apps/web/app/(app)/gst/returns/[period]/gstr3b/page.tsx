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

export default function GSTR3BDetailPage() {
  const params = useParams();
  const [monthStr, yearStr] = (params.period as string).split("-");
  const month = Number(monthStr);
  const year = Number(yearStr);
  const monthLabel = months.find(m => m.value === month)?.label || "September";

  const mockData = {
    outward: [
      { nature: "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)", value: "12,45,600.00", igst: "2,24,208.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(b) Outward taxable supplies (zero rated)", value: "0.00", igst: "0.00", cgst: "—", sgst: "—", cess: "0.00" },
    ],
    itc: [
      { nature: "(A) ITC Available (whether in full or part)", igst: "1,26,500.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(1) Import of goods", igst: "0.00", cgst: "—", sgst: "—", cess: "0.00" },
    ],
    payment: [
      { desc: "Integrated Tax", payable: "2,24,208.00", itc: "1,26,500.00", cash: "97,708.00" },
      { desc: "Central Tax", payable: "0.00", itc: "0.00", cash: "0.00" },
      { desc: "State/UT Tax", payable: "0.00", itc: "0.00", cash: "0.00" },
    ]
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[0.5px] border-border-subtle pb-8">
        <div>
          <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-2">GSTR-3B Monthly Summary</p>
          <h1 className="font-display-xl text-display-xl text-on-surface">{monthLabel} {year}</h1>
          <p className="font-ui-sm text-text-mid mt-2 max-w-2xl leading-relaxed">Consolidated summary of outward and inward supplies for tax payment. Offset your liabilities using available ITC before finalizing the payment.</p>
        </div>
        <div className="text-right">
          <p className="font-ui-xs text-text-light uppercase tracking-widest mb-1">Filing Window</p>
          <div className="flex items-center md:justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-ui-sm font-medium">Ready to Pay</span>
          </div>
          <p className="font-ui-xs text-text-mid mt-1">Deadline: 20 Oct 2024</p>
        </div>
      </div>

      <div className="space-y-12 max-w-5xl mx-auto">
        {/* 3.1 Outward Supplies */}
        <section>
          <div className="bg-stone-900 p-4 border-l-4 border-l-primary-container mb-6">
            <h3 className="text-white font-ui-sm font-bold uppercase tracking-widest text-xs">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</h3>
          </div>
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">Nature of Supplies</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">Total Taxable Value</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">IGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">CGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">SGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Cess</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[12px]">
                {mockData.outward.map((row, i) => (
                  <tr key={i} className="hover:bg-section-muted/30 transition-colors">
                    <td className="py-4 px-6 border-r-[0.5px] border-border-subtle font-ui-sm text-on-surface leading-tight">{row.nature}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">₹ {row.value}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle font-bold text-on-surface">{row.igst}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">{row.cgst}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">{row.sgst}</td>
                    <td className="py-4 px-6 text-right">{row.cess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Eligible ITC */}
        <section>
          <div className="bg-stone-900 p-4 border-l-4 border-l-green-600 mb-6">
            <h3 className="text-white font-ui-sm font-bold uppercase tracking-widest text-xs">4. Eligible ITC</h3>
          </div>
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">Details</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">IGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">CGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">SGST</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Cess</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[12px]">
                {mockData.itc.map((row, i) => (
                  <tr key={i} className="hover:bg-section-muted/30 transition-colors">
                    <td className="py-4 px-6 border-r-[0.5px] border-border-subtle font-ui-sm text-on-surface">{row.nature}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle font-bold text-green-700">{row.igst}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">{row.cgst}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle">{row.sgst}</td>
                    <td className="py-4 px-6 text-right">{row.cess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6.1 Payment of Tax */}
        <section>
          <div className="bg-stone-900 p-4 border-l-4 border-l-blue-600 mb-6">
            <h3 className="text-white font-ui-sm font-bold uppercase tracking-widest text-xs">6.1 Payment of Tax</h3>
          </div>
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b-[0.5px] border-border-subtle">
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest border-r-[0.5px] border-border-subtle">Description</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">Tax Payable</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right border-r-[0.5px] border-border-subtle">Paid through ITC</th>
                  <th className="py-3 px-6 font-ui-xs text-text-light uppercase tracking-widest text-right">Net Cash Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-border-subtle font-mono text-[12px]">
                {mockData.payment.map((row, i) => (
                  <tr key={i} className="hover:bg-section-muted/30 transition-colors">
                    <td className="py-4 px-6 border-r-[0.5px] border-border-subtle font-ui-sm text-on-surface">{row.desc}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle font-bold text-on-surface">{row.payable}</td>
                    <td className="py-4 px-6 text-right border-r-[0.5px] border-border-subtle text-green-700">{row.itc}</td>
                    <td className="py-4 px-6 text-right font-bold text-red-700">₹ {row.cash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Verification & Filing */}
        <div className="bg-section-amber border-[0.5px] border-border-subtle p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1 text-left">
            <h4 className="font-ui-md font-bold text-on-surface mb-2">Ready to File Return?</h4>
            <p className="font-ui-sm text-text-mid">By clicking "File Return", you confirm that the data extracted from your ledger is accurate and you are authorized to sign this return on behalf of the assessee.</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <button className="px-6 py-3 border border-on-surface text-on-surface font-ui-sm font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer bg-transparent">Generate Challan</button>
            <button className="px-8 py-3 bg-[#C8860A] text-white font-ui-sm font-bold uppercase tracking-widest hover:bg-amber-700 transition-all cursor-pointer border-none shadow-sm">File Return →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
