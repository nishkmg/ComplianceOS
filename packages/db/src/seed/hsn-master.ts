import { db } from "../index";
import { hsnMaster } from "../schema";
import hsnMasterData from "./hsn-master.json" with { type: "json" };

export async function seedHsnMaster(): Promise<void> {
  const records = (hsnMasterData as Array<{
    code: string;
    description: string;
    gstRate: number;
    effectiveFrom: string;
    effectiveTo: string | null;
  }>).map((r) => ({
    code: r.code,
    description: r.description,
    gstRate: String(r.gstRate),
    effectiveFrom: r.effectiveFrom,
    effectiveTo: r.effectiveTo,
  }));

  await db.insert(hsnMaster).values(records).onConflictDoNothing({ target: hsnMaster.code });
}
