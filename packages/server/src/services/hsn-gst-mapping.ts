// packages/server/src/services/hsn-gst-mapping.ts
import { eq, and, or, like, sql } from "drizzle-orm";
import * as _db from "../../../db/src/index";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface HsnEntry {
  rate: number;
  description: string;
}

let cache: Map<string, { entry: HsnEntry; expiresAt: number }> | null = null;
let cacheInitPromise: Promise<void> | null = null;

function isCacheValid(): boolean {
  if (!cache) return false;
  const now = Date.now();
  for (const [, v] of cache) {
    if (now < v.expiresAt) return true;
  }
  return false;
}

async function ensureCache(): Promise<void> {
  if (cache && isCacheValid()) return;
  if (cacheInitPromise) return cacheInitPromise;

  cacheInitPromise = (async () => {
    try {
      const rows = await _db.db
        .select({
          code: _db.hsnMaster.code,
          description: _db.hsnMaster.description,
          gstRate: _db.hsnMaster.gstRate,
          effectiveTo: _db.hsnMaster.effectiveTo,
        })
        .from(_db.hsnMaster)
        .where(
          and(
            sql`${_db.hsnMaster.effectiveFrom} <= CURRENT_DATE`,
            or(
              sql`${_db.hsnMaster.effectiveTo} IS NULL`,
              sql`${_db.hsnMaster.effectiveTo} >= CURRENT_DATE`,
            ),
          ),
        );

      const now = Date.now();
      cache = new Map();
      for (const row of rows) {
        const rate = row.gstRate ? Number(row.gstRate) : 18;
        cache!.set(row.code, {
          entry: { rate, description: row.description },
          expiresAt: now + CACHE_TTL_MS,
        });
        // Also cache 6-digit HSN codes by 4-digit prefix
        if (row.code.length >= 6 && !cache!.has(row.code.slice(0, 4))) {
          cache!.set(row.code.slice(0, 4), {
            entry: { rate, description: row.description },
            expiresAt: now + CACHE_TTL_MS,
          });
        }
      }
    } finally {
      cacheInitPromise = null;
    }
  })();

  return cacheInitPromise;
}

function getFromCache(hsnCode: string): HsnEntry | null {
  if (!cache) return null;
  const now = Date.now();
  const cached = cache.get(hsnCode);
  if (cached && now < cached.expiresAt) return cached.entry;
  return null;
}

export async function getGstRateForHsn(hsnCode: string): Promise<number> {
  // Check cache first
  const cached = getFromCache(hsnCode);
  if (cached) return cached.rate;

  await ensureCache();

  // Retry from cache after init
  const afterInit = getFromCache(hsnCode);
  if (afterInit) return afterInit.rate;

  // Fallback: try 4-digit prefix
  const prefix4 = hsnCode.slice(0, 4);
  const prefixCached = getFromCache(prefix4);
  if (prefixCached) return prefixCached.rate;

  return 18; // Default GST rate
}

export async function getHsnDescription(hsnCode: string): Promise<string | null> {
  const cached = getFromCache(hsnCode);
  if (cached) return cached.description;

  await ensureCache();

  const afterInit = getFromCache(hsnCode);
  if (afterInit) return afterInit.description;

  return null;
}

export async function searchHsn(
  searchTerm: string,
  limit = 10,
): Promise<Array<{ hsnCode: string; description: string; gstRate: number }>> {
  await ensureCache();

  const results: Array<{ hsnCode: string; description: string; gstRate: number }> = [];

  if (cache) {
    const search = searchTerm.toLowerCase();
    let count = 0;
    for (const [code, { entry }] of cache) {
      if (count >= limit) break;
      if (code.length !== 4 && code.length !== 8) continue; // Only exact codes
      if (
        code.includes(searchTerm) ||
        entry.description.toLowerCase().includes(search)
      ) {
        results.push({ hsnCode: code, description: entry.description, gstRate: entry.rate });
        count++;
      }
    }
    return results;
  }

  // Fallback to DB query
  const rows = await _db.db
    .select({
      code: _db.hsnMaster.code,
      description: _db.hsnMaster.description,
      gstRate: _db.hsnMaster.gstRate,
    })
    .from(_db.hsnMaster)
    .where(
      and(
        or(
          like(_db.hsnMaster.code, `%${searchTerm}%`),
          like(_db.hsnMaster.description, `%${searchTerm}%`),
        ),
        and(
          sql`${_db.hsnMaster.effectiveFrom} <= CURRENT_DATE`,
          or(
            sql`${_db.hsnMaster.effectiveTo} IS NULL`,
            sql`${_db.hsnMaster.effectiveTo} >= CURRENT_DATE`,
          ),
        ),
      ),
    )
    .limit(limit);

  return rows.map((r) => ({
    hsnCode: r.code,
    description: r.description,
    gstRate: r.gstRate ? Number(r.gstRate) : 18,
  }));
}
