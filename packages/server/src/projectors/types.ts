// @ts-nocheck
import type { Database } from "../../../db/src/index";

export interface Projector {
  name: string;
  handles: string[];
  process(db: Database, event: any): Promise<void>;
}
