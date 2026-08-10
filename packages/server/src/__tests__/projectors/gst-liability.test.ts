import { describe, it, expect, vi } from "vitest";

vi.mock("../../../db/src/index", () => {
  const t = () =>
    new Proxy(
      {},
      { get: (_, p) => (p === "then" ? undefined : t()) },
    );
  return new Proxy(
    {},
    { get: (_, p) => (p === "then" || p === "db" ? undefined : t()) },
  );
});

import { gstLiabilityProjector } from "../../projectors/gst-liability";

function createMockDb(results: any[][] = []): {
  db: any;
  inserts: any[];
  pushResult: (r: any[]) => void;
} {
  const inserts: any[] = [];
  const selectResults: any[][] = [...results];
  let selectIdx = 0;

  function q(): any {
    const self: any = {};
    self.limit = vi.fn(() => Promise.resolve(selectResults[selectIdx++] ?? []));
    self.innerJoin = vi.fn(() => self);
    self.orderBy = vi.fn(() => self);
    self.groupBy = vi.fn(() => self);
    self.where = vi.fn(() => self);
    self.then = vi.fn((r: any) =>
      Promise.resolve(selectResults[selectIdx++] ?? []).then(r),
    );
    self.catch = vi.fn();
    return self;
  }

  return {
    db: {
      insert: vi.fn((tbl: any) => ({
        values: vi.fn((vals: any) => {
          inserts.push({ table: tbl, values: vals });
          // thenable so `await db.insert(...).values(...)` settles
          return {
            onConflictDoUpdate: vi.fn(),
            then: vi.fn((r: any) => Promise.resolve({}).then(r)),
            catch: vi.fn(),
          };
        }),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
      select: vi.fn(() => ({ from: vi.fn(() => q()) })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
      })),
    },
    inserts,
    pushResult: (r: any[]) => selectResults.push(r),
  };
}

const TENANT = "tenant-1";
const ACTOR = "actor-1";

describe("gst-liability projector", () => {
  describe("invoice_posted", () => {
    it("creates IGST liability for interstate supply", async () => {
      const { db, inserts } = createMockDb();

      await gstLiabilityProjector.process(db, {
        tenantId: TENANT,
        aggregateId: "inv-1",
        aggregateType: "invoice",
        eventType: "invoice_posted",
        sequence: 1n,
        actorId: ACTOR,
        createdBy: ACTOR,
        payload: {
          supplierState: "TN",
          recipientState: "KA",
          fiscalYear: "2026-27",
          invoice: {
            date: "2026-07-15",
            invoiceNumber: "INV-001",
            lines: [{ igstAmount: "180", cgstAmount: "0", sgstAmount: "0", cessAmount: "0" }],
            customerState: "KA",
          },
        },
      });

      const igstInserts = inserts.filter(
        (i) => i.values.taxType === "igst",
      );
      expect(igstInserts).toHaveLength(1);
      expect(igstInserts[0].values.taxPayable).toBe("180");
      expect(igstInserts[0].values.liabilityType).toBe("output_tax");
    });

    it("creates CGST+SGST for intrastate supply", async () => {
      const { db, inserts } = createMockDb();

      await gstLiabilityProjector.process(db, {
        tenantId: TENANT,
        aggregateId: "inv-2",
        aggregateType: "invoice",
        eventType: "invoice_posted",
        sequence: 2n,
        actorId: ACTOR,
        createdBy: ACTOR,
        payload: {
          supplierState: "TN",
          recipientState: "TN",
          fiscalYear: "2026-27",
          invoice: {
            date: "2026-07-15",
            invoiceNumber: "INV-002",
            lines: [{ igstAmount: "0", cgstAmount: "90", sgstAmount: "90", cessAmount: "0" }],
            customerState: "TN",
          },
        },
      });

      const cgst = inserts.filter((i) => i.values.taxType === "cgst");
      const sgst = inserts.filter((i) => i.values.taxType === "sgst");
      expect(cgst).toHaveLength(1);
      expect(sgst).toHaveLength(1);
      expect(cgst[0].values.taxPayable).toBe("90");
      expect(sgst[0].values.taxPayable).toBe("90");
    });

    it("reverses liability on voided invoice", async () => {
      const { db, inserts } = createMockDb();

      await gstLiabilityProjector.process(db, {
        tenantId: TENANT,
        aggregateId: "inv-1",
        aggregateType: "invoice",
        eventType: "invoice_voided",
        sequence: 3n,
        actorId: ACTOR,
        createdBy: ACTOR,
        payload: {
          supplierState: "TN",
          recipientState: "KA",
          fiscalYear: "2026-27",
          invoice: {
            date: "2026-07-15",
            invoiceNumber: "INV-001",
            lines: [{ igstAmount: "180", cgstAmount: "0", sgstAmount: "0", cessAmount: "0" }],
            customerState: "KA",
          },
        },
      });

      const igst = inserts.filter((i) => i.values.taxType === "igst");
      expect(igst).toHaveLength(1);
      expect(igst[0].values.taxPayable).toBe("-180");
    });
  });

  describe("gstr3b_generated", () => {
    it("creates return liability from GSTR-3B", async () => {
      const { db, inserts } = createMockDb([
        // First select: gstConfig
        [{ stateCode: "TN" }],
        // Second select: gstReturnLines
        [
          {
            placeOfSupply: "KA",
            igstAmount: "5000",
            cgstAmount: "0",
            sgstAmount: "0",
            cessAmount: "200",
          },
          {
            placeOfSupply: "TN",
            igstAmount: "0",
            cgstAmount: "2500",
            sgstAmount: "2500",
            cessAmount: "0",
          },
        ],
      ]);

      await gstLiabilityProjector.process(db, {
        tenantId: TENANT,
        aggregateId: "gstr3b-1",
        aggregateType: "gst_return",
        eventType: "gstr3b_generated",
        sequence: 4n,
        actorId: ACTOR,
        createdBy: ACTOR,
        payload: {
          aggregateId: "gstr3b-1",
          return: {
            taxPeriodMonth: "07",
            taxPeriodYear: "2026",
            fiscalYear: "2026-27",
            returnNumber: "RET-001",
            interestAmount: "100",
            penaltyAmount: "50",
          },
        },
      });

      const igst = inserts.filter((i) => i.values.taxType === "igst");
      const cgst = inserts.filter((i) => i.values.taxType === "cgst");
      const sgst = inserts.filter((i) => i.values.taxType === "sgst");
      const cess = inserts.filter((i) => i.values.taxType === "cess");

      expect(igst).toHaveLength(1);
      expect(igst[0].values.taxPayable).toBe("5000");
      expect(igst[0].values.liabilityType).toBe("return_liability");
      expect(igst[0].values.interestPayable).toBe("100");
      expect(igst[0].values.penaltyPayable).toBe("50");

      expect(cgst).toHaveLength(1);
      expect(cgst[0].values.taxPayable).toBe("2500");

      expect(sgst).toHaveLength(1);
      expect(sgst[0].values.taxPayable).toBe("2500");

      expect(cess).toHaveLength(1);
      expect(cess[0].values.taxPayable).toBe("200");
    });

    it("splits UT territory as CGST+UTGST", async () => {
      const { db, inserts } = createMockDb([
        [{ stateCode: "delhi" }],
        [
          {
            placeOfSupply: "delhi",
            igstAmount: "0",
            cgstAmount: "90",
            sgstAmount: "90",
            cessAmount: "0",
          },
        ],
      ]);

      await gstLiabilityProjector.process(db, {
        tenantId: TENANT,
        aggregateId: "gstr3b-2",
        aggregateType: "gst_return",
        eventType: "gstr3b_generated",
        sequence: 5n,
        actorId: ACTOR,
        createdBy: ACTOR,
        payload: {
          aggregateId: "gstr3b-2",
          return: {
            taxPeriodMonth: "07",
            taxPeriodYear: "2026",
            fiscalYear: "2026-27",
            returnNumber: "RET-002",
            interestAmount: "0",
            penaltyAmount: "0",
          },
        },
      });

      const cgst = inserts.filter((i) => i.values.taxType === "cgst");
      const utgst = inserts.filter((i) => i.values.taxType === "utgst");
      expect(cgst).toHaveLength(1);
      expect(cgst[0].values.taxPayable).toBe("90");
      expect(utgst).toHaveLength(1);
      expect(utgst[0].values.taxPayable).toBe("90");
    });
  });
});
