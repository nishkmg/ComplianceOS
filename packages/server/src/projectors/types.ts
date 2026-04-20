import type { Database } from "@complianceos/db";

export interface Projector {
  name: string;
  handles: string[];
  process(db: Database, event: any): Promise<void>;
}
