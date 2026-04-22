import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import { selfAssessmentLedger, itrReturns } from "@complianceos/db";
import { paySelfAssessmentTax } from "./pay-self-assessment-tax";
import { appendEvent } from "../lib/event-store";

vi.mock("../lib/event-store", () => ({
  appendEvent: vi.fn(),
}));

describe("paySelfAssessmentTax", () => {
  const mockDB = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
    delete: vi.fn(),
  } as any;

  const tenantId = "550e8400-e29b-41d4-a716-446655440000";
  const actorId = "660e8400-e29b-41d4-a716-446655440001";
  const assessmentYear = "2026-27";
  const itrReturnId = "770e8400-e29b-41d4-a716-446655440002";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records self-assessment tax payment for balance amount", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "50000",
      challanNumber: "CHN101",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          {
            id: itrReturnId,
            tenantId,
            status: "computed",
            taxPayable: "100000",
            advanceTaxPaid: "30000",
            tdsTcsCredit: "20000",
            balancePayable: "50000",
          }
        ]),
      })),
    }));

    const result = await paySelfAssessmentTax(mockDB, tenantId, actorId, input);

    expect(result).toMatchObject({
      paymentId: expect.any(String),
      amount: "50000",
      balanceAfterPayment: "0",
    });

    expect(mockDB.insert).toHaveBeenCalledWith(selfAssessmentLedger);
    expect(mockDB.update).toHaveBeenCalledWith(itrReturns);
    expect(appendEvent).toHaveBeenCalledWith(
      mockDB,
      tenantId,
      "itr_return",
      itrReturnId,
      "self_assessment_tax_paid",
      expect.any(Object),
      actorId
    );
  });

  it("validates assessment year format", async () => {
    const input = {
      assessmentYear: "invalid",
      itrReturnId,
      amount: "50000",
      challanNumber: "CHN102",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow();
  });

  it("validates ITR return exists", async () => {
    const input = {
      assessmentYear,
      itrReturnId: "non-existent-id",
      amount: "50000",
      challanNumber: "CHN103",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    }));

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/ITR return.*not found/i);
  });

  it("validates ITR return belongs to tenant", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "50000",
      challanNumber: "CHN104",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          {
            id: itrReturnId,
            tenantId: "different-tenant-id",
            status: "computed",
          }
        ]),
      })),
    }));

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/not belong/i);
  });

  it("validates ITR return is in computed status", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "50000",
      challanNumber: "CHN105",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          {
            id: itrReturnId,
            tenantId,
            status: "draft",
            taxPayable: "100000",
            advanceTaxPaid: "30000",
            tdsTcsCredit: "20000",
            balancePayable: "50000",
          }
        ]),
      })),
    }));

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/status.*computed/i);
  });

  it("validates payment amount matches balance payable", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "40000",
      challanNumber: "CHN106",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          {
            id: itrReturnId,
            tenantId,
            status: "computed",
            taxPayable: "100000",
            advanceTaxPaid: "30000",
            tdsTcsCredit: "20000",
            balancePayable: "50000",
          }
        ]),
      })),
    }));

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/amount.*balance/i);
  });

  it("rejects zero or negative amount", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "0",
      challanNumber: "CHN107",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          {
            id: itrReturnId,
            tenantId,
            status: "computed",
            taxPayable: "100000",
            advanceTaxPaid: "30000",
            tdsTcsCredit: "20000",
            balancePayable: "50000",
          }
        ]),
      })),
    }));

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow();
  });

  it("prevents duplicate self-assessment tax payment", async () => {
    const input = {
      assessmentYear,
      itrReturnId,
      amount: "50000",
      challanNumber: "CHN108",
      challanDate: "2026-07-25",
      paymentMode: "online" as const,
    };

    let callCount = 0;
    (mockDB.select as any).mockImplementation(() => {
      callCount++;
      return {
        from: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(
            callCount === 1
              ? [{
                  id: itrReturnId,
                  tenantId,
                  status: "computed",
                  taxPayable: "100000",
                  advanceTaxPaid: "30000",
                  tdsTcsCredit: "20000",
                  balancePayable: "50000",
                  selfAssessmentTax: "50000",
                }]
              : [{ id: "existing-payment", paidAmount: "50000" }]
          ),
        })),
      };
    });

    await expect(paySelfAssessmentTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/already paid/i);
  });
});
