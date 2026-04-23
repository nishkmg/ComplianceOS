// @ts-nocheck
"use client";

export default function CashFlowPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cash Flow Statement</h1>
      <p className="text-sm text-gray-500">FY 2026-27 · Indirect Method</p>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr className="bg-gray-50"><td className="px-6 py-3 font-semibold text-gray-900">A. Cash from Operating Activities</td><td className="px-6 py-3 text-right text-gray-900">1,50,000.00</td></tr>
            <tr><td className="px-6 py-3 text-gray-600 pl-8">Net Profit</td><td className="px-6 py-3 text-right text-gray-600">1,30,000.00</td></tr>
            <tr className="bg-gray-50"><td className="px-6 py-3 font-semibold text-gray-900">B. Cash from Investing Activities</td><td className="px-6 py-3 text-right text-gray-900">0.00</td></tr>
            <tr className="bg-gray-50"><td className="px-6 py-3 font-semibold text-gray-900">C. Cash from Financing Activities</td><td className="px-6 py-3 text-right text-gray-900">0.00</td></tr>
          </tbody>
          <tfoot className="bg-blue-50 border-t">
            <tr><td className="px-6 py-3 font-bold text-gray-900">Net Cash Flow (A + B + C)</td><td className="px-6 py-3 text-right font-bold text-gray-900">1,50,000.00</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
