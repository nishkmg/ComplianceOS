import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { showToast } from "@/lib/toast";
import { api } from "@/lib/api";

type Utils = ReturnType<typeof api.useUtils>;

export type ListOp<TListData> = {
  cancel: () => Promise<void>;
  getData: () => TListData | undefined;
  setData: (updater: (old: TListData | undefined) => TListData | undefined) => void;
  invalidate: () => Promise<void>;
};

export type OptimisticConfig<TVars, TListData, TReal> = {
  list: (utils: Utils) => ListOp<TListData>;
  buildOptimistic: (vars: TVars) => { tempId: string; row: unknown };
  applyOptimistic: (current: TListData, row: unknown) => TListData;
  replaceOptimistic: (current: TListData, tempId: string, real: TReal) => TListData;
  extraInvalidations?: (utils: Utils) => Array<() => Promise<unknown>>;
  successMessage: string;
  redirectTo?: (real: TReal) => string | undefined;
  refetchOnSuccess?: boolean;
  errorMessageFallback?: string;
};

export function useOptimisticCreate<TVars, TListData, TReal>(
  mutateAsyncRef: { mutateAsync: (vars: TVars) => Promise<TReal> },
  config: OptimisticConfig<TVars, TListData, TReal>,
) {
  const utils = api.useUtils();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const mutateRef = useRef(mutateAsyncRef.mutateAsync);
  useEffect(() => {
    mutateRef.current = mutateAsyncRef.mutateAsync;
  }, [mutateAsyncRef.mutateAsync]);

  const run = useCallback(
    async (vars: TVars): Promise<TReal | undefined> => {
      if (savingRef.current) return undefined;
      savingRef.current = true;
      setSaving(true);
      const list = config.list(utils);
      const { tempId, row } = config.buildOptimistic(vars);
      const previous = list.getData();
      await list.cancel();
      list.setData((old) => (old ? config.applyOptimistic(old, row) : old));
      try {
        const real = await mutateRef.current(vars);
        list.setData((old) =>
          old ? config.replaceOptimistic(old, tempId, real) : old,
        );
        const extras = config.extraInvalidations?.(utils) ?? [];
        if (extras.length) await Promise.all(extras.map((fn) => fn()));
        await list.invalidate();
        if (config.refetchOnSuccess ?? true) router.refresh();
        showToast.success(config.successMessage);
        const to = config.redirectTo?.(real);
        if (to) router.push(to);
        return real;
      } catch (err) {
        list.setData(() => previous);
        const msg = err instanceof Error ? err.message : (config.errorMessageFallback ?? "Operation failed");
        showToast.error(msg);
        throw err;
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [config, utils, router],
  );

  return { run, saving };
}
