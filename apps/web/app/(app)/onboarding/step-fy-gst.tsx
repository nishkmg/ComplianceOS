"use client";

import { useState } from "react";
// @ts-ignore - tRPC type collision workaround
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const GST_RATES = [5, 12, 18, 28];

interface StepFyGstProps {
  tenantId: string;
  onComplete: () => void;
}

export function StepFyGst({ tenantId, onComplete }: StepFyGstProps) {
  const [formData, setFormData] = useState({
    fiscalYearStart: "2026-04-01",
    gstRegistration: "regular",
    applicableGstRates: [18],
    itcEligible: true,
    tdsApplicable: true,
  });

  const saveProgress = api.onboarding.saveProgress.useMutation({
    onSuccess: onComplete,
  });

  const handleContinue = async () => {
    await saveProgress.mutateAsync({
      tenantId,
      step: 4,
      data: { fyGst: formData },
    });
  };

  const toggleGstRate = (rate: number) => {
    setFormData((prev) => ({
      ...prev,
      applicableGstRates: prev.applicableGstRates.includes(rate)
        ? prev.applicableGstRates.filter((r) => r !== rate)
        : [...prev.applicableGstRates, rate],
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Fiscal Year & GST Setup</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure your financial year and GST settings
        </p>
      </div>

      <div className="space-y-6 max-w-md">
        <div>
          <Label htmlFor="fyStart">Current Fiscal Year Start</Label>
          <Input
            id="fyStart"
            type="date"
            value={formData.fiscalYearStart}
            onChange={(e) =>
              setFormData({ ...formData, fiscalYearStart: e.target.value })
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Indian FY runs from April 1 to March 31
          </p>
        </div>

        <div>
          <Label>GST Registration Type</Label>
          <Select
            value={formData.gstRegistration}
            onValueChange={(value) =>
              setFormData({ ...formData, gstRegistration: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="composition">Composition Scheme</SelectItem>
              <SelectItem value="none">Not Registered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.gstRegistration !== "none" && (
          <>
            <div>
              <Label>Applicable GST Rates</Label>
              <div className="mt-2 flex gap-2">
                {GST_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => toggleGstRate(rate)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      formData.applicableGstRates.includes(rate)
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>ITC Eligible</Label>
                <p className="text-xs text-gray-500">
                  Can claim Input Tax Credit
                </p>
              </div>
              <Switch
                checked={formData.itcEligible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, itcEligible: checked })
                }
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label>TDS Applicable</Label>
            <p className="text-xs text-gray-500">
              Deduct TDS on specified payments
            </p>
          </div>
          <Switch
            checked={formData.tdsApplicable}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, tdsApplicable: checked })
            }
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleContinue} disabled={saveProgress.isPending}>
          Continue
        </Button>
      </div>
    </div>
  );
}
