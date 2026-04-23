// @ts-nocheck
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ITRGSTR3BPage() {
  const params = useParams();
  const returnId = params.returnId as string;
  const financialYear = params.financialYear as string;

  const { data: itrReturn } = api.itrReturns.get.useQuery({ itrReturnId: returnId });

  if (!itrReturn) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ITR return not found</p>
        <Link href={`/itr/returns/${financialYear}/${returnId}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Return
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/itr/returns/${financialYear}/${returnId}`} className="text-sm text-gray-500 hover:underline">
            ← Back to Return
          </Link>
          <h1 className="text-2xl font-bold mt-1">GSTR-3B Summary (Audit Snapshot)</h1>
          <p className="text-sm text-gray-500">{itrReturn.returnType.toUpperCase()} - {itrReturn.assessmentYear}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">GST Summary for ITR Reconciliation</h2>
        <p className="text-sm text-gray-500 mb-6">
          This page shows GSTR-3B summary data for reconciliation with ITR income figures.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Total Turnover (GSTR-3B)</p>
              <p className="text-xl font-bold text-gray-900">₹0</p>
              <p className="text-xs text-gray-400 mt-1">From Table 3.1(a)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Total Tax Liability</p>
              <p className="text-xl font-bold text-gray-900">₹0</p>
              <p className="text-xs text-gray-400 mt-1">From Table 3.1</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-500 mb-1">Total ITC Claimed</p>
              <p className="text-xl font-bold text-gray-900">₹0</p>
              <p className="text-xs text-gray-400 mt-1">From Table 4</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Reconciliation Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">GST turnover vs Book turnover - Pending reconciliation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">GST ITC vs Book purchases - Pending reconciliation</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/gst/reconciliation"
              className="text-blue-600 hover:underline text-sm"
            >
              Go to GST Reconciliation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
