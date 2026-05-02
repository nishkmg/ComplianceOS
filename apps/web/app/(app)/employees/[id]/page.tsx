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
      <div className="flex items-center gap-2 font-ui text-[10px] text-light uppercase tracking-widest mb-6">
        <Link className="hover:text-primary transition-colors no-underline" href="/employees">Employees</Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-dark">{mockEmployee.name}</span>
      </div>

      {/* Employee Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="font-ui text-[10px] uppercase tracking-widest text-amber font-bold mb-2">Employee Profile</p>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-display text-display-lg font-semibold text-dark">{mockEmployee.name}</h1>
            <span className="inline-flex items-center px-2 py-0.5 border border-green-200 text-success font-ui text-[10px] uppercase tracking-widest bg-success-bg rounded-md">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
              Active
            </span>
          </div>
          <p className="text-[13px] text-secondary font-ui mt-1">{mockEmployee.role}, {mockEmployee.department}</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Icon name="edit" className="text-[18px]" /> Edit Profile
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Icon name="download" className="text-[18px]" /> Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-[0.5px] border-border mb-8 flex gap-8">
        <button className="border-b-2 border-amber text-amber font-ui text-[13px] font-bold pb-3 px-1 border-none bg-transparent cursor-pointer">Profile</button>
        <button className="border-b-2 border-transparent text-mid hover:text-dark font-ui text-[13px] pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Salary Structure</button>
        <button className="border-b-2 border-transparent text-mid hover:text-dark font-ui text-[13px] pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Payslips</button>
        <button className="border-b-2 border-transparent text-mid hover:text-dark font-ui text-[13px] pb-3 px-1 transition-colors border-none bg-transparent cursor-pointer">Compliance</button>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Salary Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border p-8 shadow-sm">
            <h3 className="font-ui text-sm font-medium font-bold text-dark uppercase tracking-wider text-[11px] text-light mb-6">Current Salary Structure (Monthly)</h3>
            <div className="space-y-4">
              {[
                { label: "Basic Salary", value: mockEmployee.salary.basic },
                { label: "HRA", value: mockEmployee.salary.hra },
                { label: "Conveyance Allowance", value: mockEmployee.salary.conveyance },
                { label: "Special Allowance", value: mockEmployee.salary.special },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-stone-50">
                  <span className="font-ui text-[13px] text-mid">{item.label}</span>
                  <span className="font-mono text-dark">₹ {formatIndianNumber(item.value)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-4 bg-surface-muted px-4 mt-4 font-bold">
                <span className="font-ui text-[13px] uppercase tracking-widest text-xs">Gross Earnings</span>
                <span className="font-mono text-lg">₹ {formatIndianNumber(mockEmployee.salary.gross)}</span>
              </div>
            </div>
          </div>

          {/* Payslip History */}
          <div className="bg-surface border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-surface-muted border-b border-border flex justify-between items-center">
              <h3 className="font-ui text-sm font-medium font-bold text-dark">Recent Payslips</h3>
              <Link href="#" className="text-ui-xs text-primary font-bold uppercase tracking-wider no-underline hover:underline">View All</Link>
            </div>
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-stone-100 font-ui text-[13px]">
                {mockPayslips.map((p, i) => (
                  <tr key={i} className="hover:bg-surface-muted/50 transition-colors">
                    <td className="py-4 px-6 font-bold">{p.month}</td>
                    <td className="py-4 px-6 text-mid">{p.date}</td>
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
          <div className="bg-surface border border-border p-6 border-t-2 border-t-amber">
            <h3 className="font-ui text-[10px] text-light uppercase tracking-widest mb-6">Statutory Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-light uppercase mb-1">PAN Number</p>
                <p className="font-mono font-bold text-dark">{mockEmployee.compliance.pan}</p>
              </div>
              <div>
                <p className="text-[10px] text-light uppercase mb-1">UAN Number</p>
                <p className="font-mono font-bold text-dark">{mockEmployee.compliance.uan}</p>
              </div>
              <div>
                <p className="text-[10px] text-light uppercase mb-1">ESI Identification</p>
                <p className="font-mono font-bold text-dark">{mockEmployee.compliance.esi}</p>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-success font-bold uppercase text-[10px] tracking-widest">
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
