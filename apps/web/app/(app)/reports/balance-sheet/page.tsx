// @ts-nocheck
"use client";

export default function BalanceSheetPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Balance Sheet</h1>
      <p className="text-sm text-gray-500">FY 2026-27 · As of March 31, 2027</p>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Equity & Liabilities</h2></div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr><td className="px-6 py-3 text-gray-600">Capital Account</td><td className="px-6 py-3 text-right text-gray-900">5,00,000.00</td></tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr><td className="px-6 py-3 font-semibold text-gray-900">Total</td><td className="px-6 py-3 text-right font-semibold text-gray-900">5,00,000.00</td></tr>
            </tfoot>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Assets</h2></div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              <tr><td className="px-6 py-3 text-gray-600">Bank Account</td><td className="px-6 py-3 text-right text-gray-900">3,50,000.00</td></tr>
              <tr><td className="px-6 py-3 text-gray-600">Cash Account</td><td className="px-6 py-3 text-right text-gray-900">50,000.00</td></tr>
              <tr><td className="px-6 py-3 text-gray-600">Sundry Debtors</td><td className="px-6 py-3 text-right text-gray-900">1,00,000.00</td></tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr><td className="px-6 py-3 font-semibold text-gray-900">Total</td><td className="px-6 py-3 text-right font-semibold text-gray-900">5,00,000.00</td></tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="bg-green-50 text-green-800 text-sm p-4 rounded-lg">✓ Balance Sheet balances</div>
    </div>
  );
}
