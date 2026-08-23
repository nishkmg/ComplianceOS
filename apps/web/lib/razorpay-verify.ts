import { createHmac } from "crypto";

/** Razorpay checkout handshake: HMAC-SHA256 of `${order_id}|${payment_id}`. */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

/** Razorpay webhook: HMAC-SHA256 of the RAW request body. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
