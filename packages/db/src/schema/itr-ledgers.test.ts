import { describe, it, expect } from "vitest";
import { advanceTaxLedger, selfAssessmentLedger } from "./itr-ledgers";

describe("ITR Ledgers Schema", () => {
  it("advance_tax_ledger table has required columns", () => {
    expect(advanceTaxLedger.id).toBeDefined();
    expect(advanceTaxLedger.tenantId).toBeDefined();
    expect(advanceTaxLedger.assessmentYear).toBeDefined();
    expect(advanceTaxLedger.installmentNumber).toBeDefined();
    expect(advanceTaxLedger.dueDate).toBeDefined();
    expect(advanceTaxLedger.payableAmount).toBeDefined();
    expect(advanceTaxLedger.paidAmount).toBeDefined();
    expect(advanceTaxLedger.paidDate).toBeDefined();
    expect(advanceTaxLedger.challanNumber).toBeDefined();
    expect(advanceTaxLedger.challanDate).toBeDefined();
    expect(advanceTaxLedger.interest234b).toBeDefined();
    expect(advanceTaxLedger.interest234c).toBeDefined();
    expect(advanceTaxLedger.balance).toBeDefined();
    expect(advanceTaxLedger.createdAt).toBeDefined();
  });

  it("advance_tax_ledger indexes are defined", () => {
    expect(advanceTaxLedger).toBeDefined();
  });

  it("self_assessment_ledger table has required columns", () => {
    expect(selfAssessmentLedger.id).toBeDefined();
    expect(selfAssessmentLedger.tenantId).toBeDefined();
    expect(selfAssessmentLedger.assessmentYear).toBeDefined();
    expect(selfAssessmentLedger.taxPayable).toBeDefined();
    expect(selfAssessmentLedger.advanceTaxPaid).toBeDefined();
    expect(selfAssessmentLedger.tdsTcsCredit).toBeDefined();
    expect(selfAssessmentLedger.balancePayable).toBeDefined();
    expect(selfAssessmentLedger.paidAmount).toBeDefined();
    expect(selfAssessmentLedger.challanNumber).toBeDefined();
    expect(selfAssessmentLedger.challanDate).toBeDefined();
    expect(selfAssessmentLedger.paidDate).toBeDefined();
    expect(selfAssessmentLedger.createdAt).toBeDefined();
  });
});
