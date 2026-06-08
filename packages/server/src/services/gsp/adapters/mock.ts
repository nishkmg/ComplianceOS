import type { GspAdapter } from "../adapter";

export class MockGspAdapter implements GspAdapter {
  async uploadGstr1(_json: unknown): Promise<{ arn: string }> {
    const arn = `AAACS${Date.now().toString(36).toUpperCase().slice(0, 10)}F001`;
    return { arn };
  }

  async getGstr2b(period: string): Promise<unknown> {
    return {
      period,
      generatedAt: new Date().toISOString(),
      supplierCount: 0,
      invoiceCount: 0,
      totalItc: 0,
      lines: [],
    };
  }

  async pushGstr3b(_json: unknown): Promise<{ arn: string }> {
    const arn = `AAACS${Date.now().toString(36).toUpperCase().slice(0, 10)}F003`;
    return { arn };
  }

  async getStatus(_arn: string): Promise<{ status: string; error?: string }> {
    return { status: "ACCEPTED" };
  }
}
