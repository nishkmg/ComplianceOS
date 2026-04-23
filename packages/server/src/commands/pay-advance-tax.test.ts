// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from "vitest";
import { eq, and } from "drizzle-orm";
import { advanceTaxLedger, itrReturns } from "../../../db/src/index";
import { payAdvanceTax } from "./pay-advance-tax";
import { appendEvent } from "../lib/event-store";
import { ADVANCE_TAX_DUE_DATES, AdvanceTaxInstallmentNumber } from "../../../shared/src/index";

vi.mock("../lib/event-store", () => ({
  appendEvent: vi.fn(),
}));

describe("payAdvanceTax", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records advance tax payment for 1st installment (June 15)", async () => {
    const input = {
      assessmentYear,
      installmentNumber: AdvanceTaxInstallmentNumber.INSTALLMENT_1,
      amount: "25000",
      challanNumber: "CHN001",
      challanDate: "2026-06-10",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    }));

    const result = await payAdvanceTax(mockDB, tenantId, actorId, input);

    expect(result).toMatchObject({
      installmentId: expect.any(String),
      amount: "25000",
      dueDate: expect.any(String),
      interest234C: "0",
    });

    expect(mockDB.insert).toHaveBeenCalledWith(advanceTaxLedger);
    expect(appendEvent).toHaveBeenCalledWith(
      mockDB,
      tenantId,
      "itr_return",
      expect.any(String),
      "advance_tax_paid",
      expect.any(Object),
      actorId
    );
  });

  it("calculates interest 234C for delayed payment", async () => {
    const input = {
      assessmentYear,
      installmentNumber: AdvanceTaxInstallmentNumber.INSTALLMENT_1,
      amount: "25000",
      challanNumber: "CHN002",
      challanDate: "2026-07-20",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    }));

    const result = await payAdvanceTax(mockDB, tenantId, actorId, input);

    expect(parseFloat(result.interest234C)).toBeGreaterThan(0);
  });

  it("validates assessment year format", async () => {
    const input = {
      assessmentYear: "invalid",
      installmentNumber: AdvanceTaxInstallmentNumber.INSTALLMENT_1,
      amount: "25000",
      challanNumber: "CHN003",
      challanDate: "2026-06-10",
      paymentMode: "online" as const,
    };

    await expect(payAdvanceTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow();
  });

  it("validates installment number (1-4)", async () => {
    const input = {
      assessmentYear,
      installmentNumber: "5" as any,
      amount: "25000",
      challanNumber: "CHN004",
      challanDate: "2026-06-10",
      paymentMode: "online" as const,
    };

    await expect(payAdvanceTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow();
  });

  it("rejects zero or negative amount", async () => {
    const input = {
      assessmentYear,
      installmentNumber: AdvanceTaxInstallmentNumber.INSTALLMENT_2,
      amount: "0",
      challanNumber: "CHN005",
      challanDate: "2026-09-10",
      paymentMode: "online" as const,
    };

    await expect(payAdvanceTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow();
  });

  it("prevents duplicate installment payment", async () => {
    const input = {
      assessmentYear,
      installmentNumber: AdvanceTaxInstallmentNumber.INSTALLMENT_1,
      amount: "25000",
      challanNumber: "CHN006",
      challanDate: "2026-06-10",
      paymentMode: "online" as const,
    };

    (mockDB.select as any).mockImplementation(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([
          { id: "existing-id", paidAmount: "25000" }
        ]),
      })),
    }));

    await expect(payAdvanceTax(mockDB, tenantId, actorId, input))
      .rejects.toThrow(/already paid/i);
  });
});
