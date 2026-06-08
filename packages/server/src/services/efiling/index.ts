import { MockEfilingAdapter } from "./adapters/mock";
import type { EfilingAdapter } from "./adapter";

const ADAPTER_MAP: Record<string, () => EfilingAdapter> = {
  mock: () => new MockEfilingAdapter(),
};

export function createEfilingAdapter(): EfilingAdapter {
  const name = process.env.EFILING_ADAPTER || "mock";
  const factory = ADAPTER_MAP[name];
  if (!factory) throw new Error(`Unknown E-filing adapter: ${name}`);
  return factory();
}
