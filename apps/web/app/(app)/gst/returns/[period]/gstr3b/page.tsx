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
      { nature: "(c) Other outward supplies (nil rated, exempted)", value: "0.00", igst: "—", cgst: "—", sgst: "—", cess: "—" },
      { nature: "(d) Inward supplies (liable to reverse charge)", value: "0.00", igst: "0.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(e) Non-GST outward supplies", value: "0.00", igst: "—", cgst: "—", sgst: "—", cess: "—" },
    ],
    itc: [
      { nature: "(A) ITC Available (whether in full or part)", igst: "1,26,500.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(1) Import of goods", igst: "0.00", cgst: "—", sgst: "—", cess: "0.00" },
      { nature: "(2) Import of services", igst: "0.00", cgst: "—", sgst: "—", cess: "0.00" },
      { nature: "(3) Inward supplies liable to reverse charge", igst: "0.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(4) Inward supplies from ISD", igst: "0.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
      { nature: "(5) All other ITC", igst: "1,26,500.00", cgst: "0.00", sgst: "0.00", cess: "0.00" },
    ],
    payment: [
      { desc: "Integrated Tax", payable: "2,24,208.00", itc: "1,26,500.00", cash: "97,708.00" },
      { desc: "Central Tax", payable: "0.00", itc: "0.00", cash: "0.00" },
      { desc: "State/UT Tax", payable: "0.00", itc: "0.00", cash: "0.00" },
      { desc: "Cess", payable: "0.00", itc: "0.00", cash: "0.00" },
    ]
  };

  return (
    <div className="space-y-0 text-left">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">GSTR-3B Monthly Summary</p>
          <h1 className="font-display text-display-lg font-semibold text-dark">{monthLabel} {year}</h1>
          <p className="font-ui text-[13px] text-secondary mt-1 max-w-2xl leading-relaxed">Consolidated summary of outward and inward supplies for tax payment. Offset your liabilities using available ITC before finalizing the payment.</p>
        </div>
        <div className="text-right">
          <p className="font-ui text-[11px] text-light uppercase tracking-widest mb-1">Filing Window</p>
          <div className="flex items-center md:justify-end gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-ui text-[13px] font-medium">Ready to Pay</span>
          </div>
          <p className="font-ui text-[11px] text-mid mt-1">Deadline: 20 Oct 2024</p>
        </div>
      </div>

      <div className="space-y-8 max-w-5xl mx-auto">
        {/* 3.1 Outward Supplies */}
        <section>
          <div className="bg-surface border-t-2 border-t-amber border-x border-b border-border rounded-t-md px-4 py-3">
            <h3 className="text-dark font-display text-[14px] font-semibold">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</h3>
          </div>
          <div className="bg-surface border-x border-b border-border shadow-sm overflow-hidden rounded-b-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Nature of Supplies</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">SGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Cess</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {mockData.outward.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark leading-tight">{row.nature}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums">₹ {row.value}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums font-bold text-dark">{row.igst}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">{row.cgst}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">{row.sgst}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-mid">{row.cess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3.2 Inter-state supplies */}
        <section>
          <div className="bg-surface border-t-2 border-t-amber border-x border-b border-border rounded-t-md px-4 py-3">
            <h3 className="text-dark font-display text-[14px] font-semibold">3.2 Of the supplies shown in 3.1 (a) above, details of inter-state supplies made to unregistered persons, composition taxable persons and UIN holders</h3>
          </div>
          <div className="bg-surface border-x border-b border-border shadow-sm overflow-hidden rounded-b-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border"></th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Place of Supply</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Total Taxable Value</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Amount of Integrated Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">Supplies made to Unregistered Persons</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">—</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                </tr>
                <tr className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">Supplies made to Composition Taxable Persons</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">—</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                </tr>
                <tr className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">Supplies made to UIN holders</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">—</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Eligible ITC */}
        <section>
          <div className="bg-surface border-t-2 border-t-amber border-x border-b border-border rounded-t-md px-4 py-3">
            <h3 className="text-dark font-display text-[14px] font-semibold">4. Eligible ITC</h3>
          </div>
          <div className="bg-surface border-x border-b border-border shadow-sm overflow-hidden rounded-b-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Details</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">IGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">CGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">SGST</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Cess</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {mockData.itc.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">{row.nature}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums font-bold text-dark">{row.igst}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">{row.cgst}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-mid">{row.sgst}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-mid">{row.cess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. Values of exempt, nil-rated and non-GST inward supplies */}
        <section>
          <div className="bg-surface border-t-2 border-t-amber border-x border-b border-border rounded-t-md px-4 py-3">
            <h3 className="text-dark font-display text-[14px] font-semibold">5. Values of exempt, nil-rated and non-GST inward supplies</h3>
          </div>
          <div className="bg-surface border-x border-b border-border shadow-sm overflow-hidden rounded-b-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Nature of Supplies</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Inter-State</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Intra-State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">From a supplier under composition scheme, Exempt and Nil rated supply</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                </tr>
                <tr className="hover:bg-surface-muted/50 transition-colors">
                  <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">Non-GST supply</td>
                  <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                  <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums text-dark">₹ 0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6.1 Payment of Tax */}
        <section>
          <div className="bg-surface border-t-2 border-t-amber border-x border-b border-border rounded-t-md px-4 py-3">
            <h3 className="text-dark font-display text-[14px] font-semibold">6.1 Payment of Tax</h3>
          </div>
          <div className="bg-surface border-x border-b border-border shadow-sm overflow-hidden rounded-b-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-muted border-b border-border">
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest border-r border-border">Description</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Tax Payable</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right border-r border-border">Paid through ITC</th>
                  <th className="py-2.5 px-4 font-ui text-[10px] text-light uppercase tracking-widest text-right">Net Cash Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {mockData.payment.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-2.5 px-4 border-r border-border font-ui text-[12px] text-dark">{row.desc}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums font-bold text-dark">₹ {row.payable}</td>
                    <td className="py-2.5 px-4 text-right border-r border-border font-mono text-[12px] tabular-nums text-success">₹ {row.itc}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[12px] tabular-nums font-bold text-danger">₹ {row.cash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary Banner */}
        <div className="bg-surface border border-border rounded-md p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 text-left">
            <h4 className="font-display text-[16px] font-semibold text-dark mb-1">Ready to File Return?</h4>
            <p className="font-ui text-[12px] text-mid">By clicking "File Return", you confirm that the data extracted from your ledger is accurate and you are authorized to sign this return on behalf of the assessee.</p>
          </div>
          <div className="flex gap-3 shrink-0 no-print">
            <button className="px-5 py-2.5 border border-border text-dark font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-surface-muted transition-colors cursor-pointer bg-transparent rounded-md">Generate Challan</button>
            <button className="px-8 py-2.5 bg-amber text-white font-ui text-[12px] font-bold uppercase tracking-widest hover:bg-amber-hover transition-all cursor-pointer border-none shadow-sm rounded-md">File Return →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
