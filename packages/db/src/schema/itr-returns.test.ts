import { describe, it, expect } from "vitest";
import {
  itrReturns,
  itrReturnLines,
  itrSchedules,
} from "./itr-returns";
import {
  itrReturnTypeEnum,
  itrReturnStatusEnum,
  incomeHeadEnum,
  taxRegimeEnum,
  presumptiveSchemeEnum,
} from "./enums";

describe("ITR Returns Schema", () => {
  it("itr_returns table has required columns", () => {
    expect(itrReturns.id).toBeDefined();
    expect(itrReturns.tenantId).toBeDefined();
    expect(itrReturns.assessmentYear).toBeDefined();
    expect(itrReturns.financialYear).toBeDefined();
    expect(itrReturns.returnType).toBeDefined();
    expect(itrReturns.status).toBeDefined();
    expect(itrReturns.taxRegime).toBeDefined();
    expect(itrReturns.presumptiveScheme).toBeDefined();
    expect(itrReturns.grossTotalIncome).toBeDefined();
    expect(itrReturns.totalDeductions).toBeDefined();
    expect(itrReturns.totalIncome).toBeDefined();
    expect(itrReturns.taxPayable).toBeDefined();
    expect(itrReturns.surcharge).toBeDefined();
    expect(itrReturns.cess).toBeDefined();
    expect(itrReturns.rebate87a).toBeDefined();
    expect(itrReturns.advanceTaxPaid).toBeDefined();
    expect(itrReturns.selfAssessmentTax).toBeDefined();
    expect(itrReturns.tdsTcsCredit).toBeDefined();
    expect(itrReturns.totalTaxPaid).toBeDefined();
    expect(itrReturns.balancePayable).toBeDefined();
    expect(itrReturns.refundDue).toBeDefined();
    expect(itrReturns.generatedAt).toBeDefined();
    expect(itrReturns.filedAt).toBeDefined();
    expect(itrReturns.itrAckNumber).toBeDefined();
    expect(itrReturns.verificationDate).toBeDefined();
    expect(itrReturns.verificationMode).toBeDefined();
    expect(itrReturns.itrJsonUrl).toBeDefined();
    expect(itrReturns.createdAt).toBeDefined();
  });

  it("itr_returns indexes are defined", () => {
    expect(itrReturns).toBeDefined();
  });

  it("itr_return_lines table has required columns", () => {
    expect(itrReturnLines.id).toBeDefined();
    expect(itrReturnLines.returnId).toBeDefined();
    expect(itrReturnLines.scheduleCode).toBeDefined();
    expect(itrReturnLines.fieldCode).toBeDefined();
    expect(itrReturnLines.fieldValue).toBeDefined();
    expect(itrReturnLines.description).toBeDefined();
  });

  it("itr_schedules table has required columns", () => {
    expect(itrSchedules.id).toBeDefined();
    expect(itrSchedules.returnId).toBeDefined();
    expect(itrSchedules.scheduleCode).toBeDefined();
    expect(itrSchedules.scheduleData).toBeDefined();
    expect(itrSchedules.totalAmount).toBeDefined();
  });

  it("enums are defined for ITR", () => {
    expect(itrReturnTypeEnum).toBeDefined();
    expect(itrReturnStatusEnum).toBeDefined();
    expect(incomeHeadEnum).toBeDefined();
    expect(taxRegimeEnum).toBeDefined();
    expect(presumptiveSchemeEnum).toBeDefined();
  });
});
