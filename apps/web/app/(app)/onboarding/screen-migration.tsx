"use client";

import { useState } from "react";
import { showToast } from "@/lib/toast";
import { Icon } from "@/components/ui/icon";
import { api } from "@/lib/api";
import { MIGRATION_SOURCES, MIGRATION_UPLOAD_TYPES } from "@/lib/constants";

interface ScreenMigrationProps {
  tenantId: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function ScreenMigration({ tenantId, onComplete, onBack }: ScreenMigrationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState<string>("");
  const [uploadTypes, setUploadTypes] = useState<Set<string>>(new Set());
  const saveProgress = api.onboarding.saveProgress.useMutation();

  const toggleUploadType = (type: string) => {
    const next = new Set(uploadTypes);
    uploadTypes.has(type) ? next.delete(type) : next.add(type);
    setUploadTypes(next);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await saveProgress.mutateAsync({
        step: 12,
        data: {
          migration: {
            source: source || undefined,
            uploadTypes: source ? Array.from(uploadTypes) : undefined,
          },
        },
      });
      showToast.success("Migration preferences saved");
      onComplete();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 text-left">
      <div>
        <h1 className="font-ui text-display-xl text-on-surface mb-3">
          Import & Migration
        </h1>
        <p className="font-ui text-sm font-medium text-ui-md text-text-mid max-w-2xl leading-relaxed">
          Migrate data from your existing accounting software or start fresh.
        </p>
      </div>

      {/* Source Selection */}
      <section className="space-y-4">
        <div className="border-b-[0.5px] border-border pb-2">
          <h2 className="font-ui text-lg font-bold text-on-surface">Migration Source</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            onClick={() => setSource("")}
            className={`p-4 border-[0.5px] rounded-md transition-colors cursor-pointer ${
              source === "" ? "bg-amber-50 border-amber shadow-sm" : "bg-surface border-border hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${source === "" ? "border-amber" : "border-stone-300"}`}>
                {source === "" && <div className="w-2 h-2 rounded-full bg-amber" />}
              </div>
              <span className="font-ui text-[13px] font-bold text-on-surface">Start Fresh</span>
            </div>
          </div>
          {MIGRATION_SOURCES.map((s) => (
            <div
              key={s.value}
              onClick={() => setSource(s.value)}
              className={`p-4 border-[0.5px] rounded-md transition-colors cursor-pointer ${
                source === s.value ? "bg-amber-50 border-amber shadow-sm" : "bg-surface border-border hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${source === s.value ? "border-amber" : "border-stone-300"}`}>
                  {source === s.value && <div className="w-2 h-2 rounded-full bg-amber" />}
                </div>
                <span className="font-ui text-[13px] font-bold text-on-surface">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload Types */}
      {source && (
        <section className="space-y-4 animate-in">
          <div className="border-b-[0.5px] border-border pb-2">
            <h2 className="font-ui text-lg font-bold text-on-surface">What to Import</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MIGRATION_UPLOAD_TYPES.map((t) => (
              <label
                key={t.value}
                className={`flex items-center gap-3 p-4 border-[0.5px] rounded-md transition-colors cursor-pointer ${
                  uploadTypes.has(t.value) ? "bg-amber-50 border-amber" : "bg-surface border-border hover:bg-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={uploadTypes.has(t.value)}
                  onChange={() => toggleUploadType(t.value)}
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${uploadTypes.has(t.value) ? "bg-amber border-amber" : "border-stone-300"}`}>
                  {uploadTypes.has(t.value) && <Icon name="check" className="text-white text-[16px]" />}
                </div>
                <span className="font-ui text-[13px] font-bold text-on-surface">{t.label}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-between items-center mt-6 pt-8 border-t border-border">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="font-ui text-[13px] text-text-mid hover:text-on-surface transition-colors flex items-center gap-1.5 border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              Back
            </button>
          )}
        </div>
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="bg-amber text-white font-ui text-[13px] text-ui-sm py-3 px-8 rounded-md hover:bg-amber-hover transition-colors flex items-center gap-2 group shadow-sm border-none cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Continue"}
          <Icon name="arrow_forward" className="text-[18px] group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
