import type { EfilingAdapter } from "../adapter";

export class MockEfilingAdapter implements EfilingAdapter {
  async login(_pan: string, _password: string): Promise<{ sessionId: string }> {
    return { sessionId: `mock_session_${Date.now()}` };
  }

  async uploadItr(_json: unknown): Promise<{ ackNo: string }> {
    const ackNo = `ITR-V-2026-27-${Date.now().toString(36).toUpperCase().padEnd(15, "0")}`;
    return { ackNo };
  }

  async verifyAadhaarOtp(_sessionId: string, otp: string): Promise<boolean> {
    return otp === "000000";
  }

  async downloadItrV(_ackNo: string): Promise<{ pdfBase64: string }> {
    return { pdfBase64: "" };
  }

  async getStatus(_ackNo: string): Promise<{ status: string; error?: string }> {
    return { status: "ACKNOWLEDGED" };
  }
}
