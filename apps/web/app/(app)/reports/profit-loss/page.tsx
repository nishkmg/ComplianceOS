"use client";

export default function ProfitLossPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
        <select className="text-sm border rounded px-2 py-1">
          <option value="schedule_iii">Schedule III</option>
          <option value="proprietorship">Proprietorship</option>
        </select>
      </div>
      <p className="text-sm text-gray-500">FY 2026-27 · Apr 2026 to Mar 2027</p>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b"><h2 className="text-lg font-semibold">Revenue from Operations</h2></div>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr><td className="px-6 py-3 text-gray-600 pl-8">Sales Account</td><td className="px-6 py-3 text-right text-gray-900">2,50,000.00</td></tr>
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr><td className="px-6 py-3 font-semibold text-gray-900">Total Revenue</td><td className="px-6 py-3 text-right font-semibold text-gray-900">2,50,000.00</td></tr>
            <tr><td className="px-6 py-3 font-semibold text-gray-900">Gross Profit</td><td className="px-6 py-3 text-right font-semibold text-green-600">1,30,000.00</td></tr>
          </tfoot>
        </table>
        <div className="px-6 py-4 border-t"><h2 className="text-lg font-semibold">Expenses</h2></div>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr><td className="px-6 py-3 text-gray-600 pl-8">Purchase Account</td><td className="px-6 py-3 text-right text-gray-900">1,20,000.00</td></tr>
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr><td className="px-6 py-3 font-bold text-gray-900">Net Profit</td><td className="px-6 py-3 text-right font-bold text-green-600 text-lg">1,30,000.00</td></tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
