"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

const FEATURES = ["2025-26", "2026-27"];

export default function ItrReturnsListPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-display text-display-lg font-semibold text-dark">ITR Returns</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURES.map(fy => (
          <Link key={fy} href={`/itr/returns/${fy}`} className="block bg-surface border border-border rounded-md p-6 shadow-sm hover:shadow-md transition-shadow no-underline">
            <Icon name="description" className="text-3xl text-amber mb-4" />
            <h3 className="font-ui text-lg font-bold text-dark">FY {fy}</h3>
            <p className="font-ui text-[13px] text-text-mid mt-1">View ITR returns</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
