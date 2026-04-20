"use client";

export default function TrialBalancePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trial Balance</h1>
      <p className="text-sm text-gray-500">FY 2026-27 · As of today</p>
      <div className="bg-white rounded-lg shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr><th className="px-6 py-3 text-left text-gray-500 font-medium">Account</th><th className="px-6 py-3 text-right text-gray-500 font-medium">Debit (₹)</th><th className="px-6 py-3 text-right text-gray-500 font-medium">Credit (₹)</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="px-6 py-3 text-gray-600">Bank Account</td><td className="px-6 py-3 text-right text-gray-900">3,50,000.00</td><td className="px-6 py-3 text-right text-gray-600">—</td></tr>
            <tr className="border-b"><td className="px-6 py-3 text-gray-600">Capital Account</td><td className="px-6 py-3 text-right text-gray-600">—</td><td className="px-6 py-3 text-right text-gray-900">5,00,000.00</td></tr>
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr><td className="px-6 py-3 font-semibold text-gray-900">Total</td><td className="px-6 py-3 text-right font-semibold text-gray-900">3,50,000.00</td><td className="px-6 py-3 text-right font-semibold text-gray-900">3,50,000.00</td></tr>
          </tfoot>
        </table>
        <div className="px-6 py-3 bg-green-50 text-green-800 text-sm">✓ Trial Balance is in agreement</div>
      </div>
    </div>
  );
}
