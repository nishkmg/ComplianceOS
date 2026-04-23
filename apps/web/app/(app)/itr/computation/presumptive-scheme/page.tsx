// @ts-nocheck
"use client";
import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PresumptiveScheme } from "@complianceos/shared";

const businessTypes = [
  { value: "trading", label: "Trading" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "service", label: "Service" },
  { value: "goods_carriage", label: "Goods Carriage" },
];

const professions = [
  { value: "engineering", label: "Engineering" },
  { value: "architecture", label: "Architecture" },
  { value: "accountancy", label: "Accountancy" },
  { value: "legal", label: "Legal" },
  { value: "medical", label: "Medical" },
  { value: "technical", label: "Technical" },
  { value: "interior_decoration", label: "Interior Decoration" },
];

const Page = function PresumptiveSchemePage() {
  const searchParams = useSearchParams();
  const returnId = searchParams.get("returnId") ?? "";

  const [businessType, setBusinessType] = useState("service");
  const [turnover, setTurnover] = useState<string>("5000000");
  const [profession, setProfession] = useState("");
  const [isProfession, setIsProfession] = useState(false);

  const { data: recommendation } = api.itrComputation.recommendScheme.useQuery(
    {
      businessType,
      turnover: Number(turnover),
      profession: isProfession ? profession : undefined,
    },
    { enabled: !!returnId }
  );

  const schemes = [
    {
      code: PresumptiveScheme.SCHEME_44AD,
      section: "44AD",
      title: "Presumptive Business Income",
      eligibility: "For businesses with turnover ≤ ₹3 crore",
      rate: "6% of turnover (digital receipts) or 8%",
      applicableFor: ["Trading", "Manufacturing", "Service"],
    },
    {
      code: PresumptiveScheme.SCHEME_44ADA,
      section: "44ADA",
      title: "Presumptive Professional Income",
      eligibility: "For specified professions with turnover ≤ ₹75 lakhs",
      rate: "50% of gross receipts deemed as income",
      applicableFor: professions.map((p) => p.label),
    },
    {
      code: PresumptiveScheme.SCHEME_44AE,
      section: "44AE",
      title: "Goods Carriage Business",
      eligibility: "For goods carriage operators (up to 10 vehicles)",
      rate: "₹1,000 per ton per month or ₹7,500 per vehicle per month",
      applicableFor: ["Goods Carriage"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/itr/computation?returnId=${returnId}`} className="text-sm text-gray-500 hover:underline">
            ← Back to Computation
          </Link>
          <h1 className="text-2xl font-bold mt-1">Presumptive Taxation Scheme</h1>
          <p className="text-sm text-gray-500">Select and configure presumptive scheme if applicable</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Business/Profession Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Type</label>
            <select
              value={isProfession ? "profession" : "business"}
              onChange={(e) => setIsProfession(e.target.value === "profession")}
              className="px-3 py-2 border rounded text-sm w-full"
            >
              <option value="business">Business</option>
              <option value="profession">Profession</option>
            </select>
          </div>

          {isProfession ? (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="px-3 py-2 border rounded text-sm w-full"
              >
                <option value="">Select profession</option>
                {professions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-600 mb-2">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="px-3 py-2 border rounded text-sm w-full"
              >
                {businessTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-2">Annual Turnover/Gross Receipts</label>
            <input
              type="number"
              value={turnover}
              onChange={(e) => setTurnover(e.target.value)}
              placeholder="Enter amount"
              className="px-3 py-2 border rounded text-sm w-full"
            />
            <p className="text-xs text-gray-500 mt-1">₹{Number(turnover).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {recommendation && (
        <div className={`rounded-lg shadow p-6 ${recommendation.eligible ? "bg-green-50" : "bg-gray-50"}`}>
          <h3 className="text-lg font-bold mb-2">
            {recommendation.eligible ? "✓ Eligible for Presumptive Scheme" : "Not Eligible for Presumptive Scheme"}
          </h3>
          {recommendation.eligible && (
            <>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Recommended:</strong> Section {recommendation.recommendedScheme.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Deemed Income:</strong> ₹{Number(recommendation.presumptiveIncome).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-gray-500">{recommendation.reasoning}</p>
            </>
          )}
          {!recommendation.eligible && (
            <p className="text-sm text-gray-600">
              Your business/profession does not qualify for presumptive taxation. Please compute income under normal provisions.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {schemes.map((scheme) => (
          <div key={scheme.code} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{scheme.section} - {scheme.title}</h3>
                <p className="text-sm text-gray-500">{scheme.eligibility}</p>
              </div>
              {recommendation?.recommendedScheme === scheme.code && (
                <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                  Recommended
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-gray-600 font-medium">Rate:</span>
                <span className="text-gray-700">{scheme.rate}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-600 font-medium">Applicable For:</span>
                <span className="text-gray-700">{scheme.applicableFor.join(", ")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Benefits of Presumptive Taxation</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>No need to maintain detailed books of account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Simplified computation - deemed income rate applies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>No audit requirement under section 44AB (if conditions met)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Lower compliance burden and faster filing</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
export default function PageWrapper() { return <Suspense><Page /></Suspense>; }
