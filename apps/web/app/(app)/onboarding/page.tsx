"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { id: 1, label: "Business Profile" },
  { id: 2, label: "Module Activation" },
  { id: 3, label: "Chart of Accounts" },
  { id: 4, label: "Fiscal Year & GST" },
  { id: 5, label: "Opening Balances" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ComplianceOS</h1>
          <p className="text-gray-500">Let&apos;s set up your business in a few steps</p>
        </div>

        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s.id ? "✓" : s.id}
              </div>
              <span className={`ml-2 text-sm ${step >= s.id ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-2 ${step > s.id ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {step === 1 && <BusinessProfileStep onNext={() => setStep(2)} />}
          {step === 2 && <ModuleActivationStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <CoAStep onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <FYGstStep onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <OpeningBalancesStep onComplete={() => router.push("/dashboard")} onBack={() => setStep(4)} />}
        </div>
      </div>
    </div>
  );
}

function BusinessProfileStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Business Profile</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input type="text" className="w-full px-3 py-2 border rounded" placeholder="My Business" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Business Type</label>
          <select className="w-full px-3 py-2 border rounded">
            <option>Sole Proprietorship</option>
            <option>Partnership</option>
            <option>Private Limited</option>
            <option>LLP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PAN</label>
          <input type="text" className="w-full px-3 py-2 border rounded" placeholder="AAAAA9999A" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select className="w-full px-3 py-2 border rounded">
            <option>Maharashtra</option>
            <option>Delhi</option>
            <option>Karnataka</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Continue →</button>
      </div>
    </div>
  );
}

function ModuleActivationStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Module Activation</h2>
      <p className="text-sm text-gray-500">Based on your business type, we recommend enabling the following modules.</p>
      {[
        { name: "Accounting", desc: "Double-entry ledger, chart of accounts, journal entries", recommended: true },
        { name: "Invoicing", desc: "Create and track invoices, manage receivables", recommended: true },
        { name: "Inventory", desc: "Track stock, BOM for manufacturing", recommended: false },
        { name: "Payroll", desc: "Salary processing, TDS deductions", recommended: false },
        { name: "GST Returns", desc: "Generate GSTR-1, GSTR-3B reports", recommended: true },
        { name: "ITR Filing", desc: "Income tax return preparation", recommended: true },
      ].map((mod) => (
        <div key={mod.name} className="flex items-center justify-between p-4 border rounded">
          <div>
            <p className="font-medium text-sm">{mod.name} {mod.recommended && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2">Recommended</span>}</p>
            <p className="text-xs text-gray-500">{mod.desc}</p>
          </div>
          <input type="checkbox" defaultChecked={mod.recommended} className="w-4 h-4" />
        </div>
      ))}
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-sm">← Back</button>
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Continue →</button>
      </div>
    </div>
  );
}

function CoAStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Chart of Accounts</h2>
      <p className="text-sm text-gray-500">We&apos;ll create a standard chart of accounts for your business. You can customize it after setup.</p>
      <div className="p-4 bg-gray-50 rounded text-sm space-y-1">
        <p className="font-medium">Sole Proprietorship (Trading)</p>
        <p className="text-gray-500">Capital, Drawings, Bank, Cash, Debtors, Creditors, Sales, Purchases, GST, Expenses</p>
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-sm">← Back</button>
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Use This Template →</button>
      </div>
    </div>
  );
}

function FYGstStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Fiscal Year & GST Setup</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">FY Start Date</label>
          <input type="date" defaultValue="2026-04-01" className="w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GST Registration</label>
          <select className="w-full px-3 py-2 border rounded">
            <option value="none">Not Registered</option>
            <option value="regular">Regular</option>
            <option value="composition">Composition</option>
          </select>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-sm">← Back</button>
        <button onClick={onNext} className="px-6 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Continue →</button>
      </div>
    </div>
  );
}

function OpeningBalancesStep({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Opening Balances</h2>
      <div className="p-4 bg-green-50 rounded text-sm">
        <p className="text-green-800 font-medium">Starting Fresh?</p>
        <p className="text-green-600">Select this option if this is a new business with no prior accounting data. All opening balances will be ₹0.</p>
      </div>
      <div className="flex items-center gap-3">
        <input type="radio" name="opening" defaultChecked />
        <span className="text-sm">Fresh start — no prior data to import</span>
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 border rounded text-sm">← Back</button>
        <button onClick={onComplete} className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">Complete Setup →</button>
      </div>
    </div>
  );
}
