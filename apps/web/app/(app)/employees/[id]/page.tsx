"use client";

import { useState } from "react";
import { Icon } from '@/components/ui/icon';
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatIndianNumber } from "@/lib/format";
import { api } from "@/lib/api";

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const mockEmployee = {
    name: "Rahul Sharma",
    code: "EMP-2024-001",
    role: "Senior Analyst",
    department: "Compliance Department",
    status: "Active",
    joiningDate: "15 Jan 2024",
    salary: {
      basic: 45000,
      hra: 18000,
      conveyance: 5000,
      special: 12000,
      gross: 80000,
    },
    compliance: {
      pan: "ABCDE1234F",
      uan: "100987654321",
      esi: "2012345678",
      status: "Verified",
    }
  };

  const mockPayslips = [
    { month: "September 2024", gross: 80000, net: 72450, status: "Paid", date: "30 Sep 2024" },
    { month: "August 2024", gross: 80000, net: 72450, status: "Paid", date: "31 Aug 2024" },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/employees">Employees</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface">{mockEmployee.name}</span>
      </div>

      {/* Employee Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-display-xl text-display-xl text-on-surface tracking-tight">{mockEmployee.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 border border-green-200 text-green-700 font-ui-xs text-[10px] uppercase tracking-widest bg-green-50 rounded-sm">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
              Active
            </span>
          </div>
          <p className="font-ui-md text-ui-md text-text-mid">{mockEmployee.role}, {mockEmployee.department}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 border-[0.5px] border-on-surface text-on-surface font-ui-sm text-xs rounded-sm hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer bg-transparent">
            <Icon name="edit" className="text-[18px]" /> Edit Profile
          </button>
          <button className="px-5 py-2 bg-primary-container text-white font-ui-sm text-xs rounded-sm hover:bg-primary transition-colors flex items-center gap-2 border-none shadow-sm cursor-pointer">
            <Icon name="download" className="text-[18px]" /> Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-[0.5px] border-border-subtle mb-8 flex gap-8">
        <button className="border-b-2 border-primary-container text-primary-container font-ui-sm font-bold pb-3 px-1 border-none bg-transparent cursor-pointer">Profile</button>
        <button className="border-b-2 border-transparent text-text-mid hover:text-on-surface font-ui-sm pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Salary Structure</button>
        <button className="border-b-2 border-transparent text-text-mid hover:text-on-surface font-ui-sm pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Payslips</button>
        <button className="border-b-2 border-transparent text-text-mid hover:text-on-surface font-ui-sm pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Compliance</button>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Salary Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border-[0.5px] border-border-subtle p-8 shadow-sm">
            <h3 className="font-ui-md font-bold text-on-surface uppercase tracking-wider text-[11px] text-text-light mb-6">Current Salary Structure (Monthly)</h3>
            <div className="space-y-4">
              {[
                { label: "Basic Salary", value: mockEmployee.salary.basic },
                { label: "HRA", value: mockEmployee.salary.hra },
                { label: "Conveyance Allowance", value: mockEmployee.salary.conveyance },
                { label: "Special Allowance", value: mockEmployee.salary.special },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-stone-50">
                  <span className="font-ui-sm text-text-mid">{item.label}</span>
                  <span className="font-mono text-on-surface">₹ {formatIndianNumber(item.value)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-4 bg-stone-50 px-4 mt-4 font-bold">
                <span className="font-ui-sm uppercase tracking-widest text-xs">Gross Earnings</span>
                <span className="font-mono text-lg">₹ {formatIndianNumber(mockEmployee.salary.gross)}</span>
              </div>
            </div>
          </div>

          {/* Payslip History */}
          <div className="bg-white border-[0.5px] border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-stone-50 border-b border-border-subtle flex justify-between items-center">
              <h3 className="font-ui-md font-bold text-on-surface">Recent Payslips</h3>
              <Link href="#" className="text-ui-xs text-primary font-bold uppercase tracking-wider no-underline hover:underline">View All</Link>
            </div>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-stone-100 font-ui-sm">
                {mockPayslips.map((p, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{p.month}</td>
                    <td className="py-4 px-6 text-text-mid">{p.date}</td>
                    <td className="py-4 px-6 font-mono text-right">₹ {formatIndianNumber(p.net)}</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-primary hover:text-amber-stitch border-none bg-transparent cursor-pointer font-bold uppercase text-[10px] tracking-widest">Download PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Statutory Info */}
        <div className="space-y-6">
          <div className="bg-white border-[0.5px] border-border-subtle p-6 border-t-2 border-t-primary-container">
            <h3 className="font-ui-xs text-[10px] text-text-light uppercase tracking-widest mb-6">Statutory Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-text-light uppercase mb-1">PAN Number</p>
                <p className="font-mono font-bold text-on-surface">{mockEmployee.compliance.pan}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-light uppercase mb-1">UAN Number</p>
                <p className="font-mono font-bold text-on-surface">{mockEmployee.compliance.uan}</p>
              </div>
              <div>
                <p className="text-[10px] text-text-light uppercase mb-1">ESI Identification</p>
                <p className="font-mono font-bold text-on-surface">{mockEmployee.compliance.esi}</p>
              </div>
              <div className="pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-green-700 font-bold uppercase text-[10px] tracking-widest">
                  <Icon name="verified" className="text-sm" />
                  KYC Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
