"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/empty-state";

export default function ItrPaymentPage() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-40">
      <h1 className="font-ui text-display-lg font-semibold text-dark">ITR Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <Icon name="account_balance" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark">Advance Tax</h3>
          <p className="font-ui text-[13px] text-text-mid mt-1">Quarterly advance tax payment tracking.</p>
        </div>
        <div className="bg-surface border border-border rounded-md p-6 shadow-sm">
          <Icon name="receipt" className="text-3xl text-amber mb-4" />
          <h3 className="font-ui text-lg font-bold text-dark">Self Assessment Tax</h3>
          <p className="font-ui text-[13px] text-text-mid mt-1">Self assessment tax payment for filed returns.</p>
        </div>
      </div>
    </div>
  );
}
