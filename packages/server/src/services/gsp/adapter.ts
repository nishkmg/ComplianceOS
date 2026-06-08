export interface GspAdapter {
  uploadGstr1(json: unknown): Promise<{ arn: string }>;
  getGstr2b(period: string): Promise<unknown>;
  pushGstr3b(json: unknown): Promise<{ arn: string }>;
  getStatus(arn: string): Promise<{ status: string; error?: string }>;
}
