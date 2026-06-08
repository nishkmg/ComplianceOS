import { MockGspAdapter } from "./adapters/mock";
import type { GspAdapter } from "./adapter";

const ADAPTER_MAP: Record<string, () => GspAdapter> = {
  mock: () => new MockGspAdapter(),
  // cleartax: () => new ClearTaxAdapter(),  // future
  // iris: () => new IrisAdapter(),          // future
};

export function createGspAdapter(): GspAdapter {
  const name = process.env.GSP_ADAPTER || "mock";
  const factory = ADAPTER_MAP[name];
  if (!factory) throw new Error(`Unknown GSP adapter: ${name}`);
  return factory();
}
