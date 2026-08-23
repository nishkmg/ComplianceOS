import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { verifyRazorpaySignature, verifyWebhookSignature } from "../../../../../apps/web/lib/razorpay-verify";

// The helper lives in apps/web/lib — import via relative path across the
// workspace (same repo, tsconfig paths resolve).
const SECRET = "test-webhook-secret";
const ORDER = "order_Nabc123";
const PAYMENT = "pay_Xyz789";

function expectedSig(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

describe("razorpay signature verification", () => {
  it("checkout signature: valid pair verifies", () => {
    const sig = expectedSig(`${ORDER}|${PAYMENT}`);
    expect(verifyRazorpaySignature(ORDER, PAYMENT, sig, SECRET)).toBe(true);
  });

  it("checkout signature: tampered payment id fails", () => {
    const sig = expectedSig(`${ORDER}|${PAYMENT}`);
    expect(verifyRazorpaySignature(ORDER, "pay_TAMPERED", sig, SECRET)).toBe(false);
  });

  it("checkout signature: wrong secret fails", () => {
    const sig = expectedSig(`${ORDER}|${PAYMENT}`);
    expect(verifyRazorpaySignature(ORDER, PAYMENT, sig, "wrong-secret")).toBe(false);
  });

  it("webhook signature: valid raw body verifies", () => {
    const body = JSON.stringify({ event: "payment.authorized" });
    const sig = expectedSig(body);
    expect(verifyWebhookSignature(body, sig, SECRET)).toBe(true);
  });

  it("webhook signature: modified body fails", () => {
    const body = JSON.stringify({ event: "payment.authorized" });
    const sig = expectedSig(body);
    expect(verifyWebhookSignature(body + " ", sig, SECRET)).toBe(false);
  });
});
