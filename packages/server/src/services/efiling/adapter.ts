export interface EfilingAdapter {
  login(pan: string, password: string): Promise<{ sessionId: string }>;
  uploadItr(json: unknown): Promise<{ ackNo: string }>;
  verifyAadhaarOtp(sessionId: string, otp: string): Promise<boolean>;
  downloadItrV(ackNo: string): Promise<{ pdfBase64: string }>;
  getStatus(ackNo: string): Promise<{ status: string; error?: string }>;
}
