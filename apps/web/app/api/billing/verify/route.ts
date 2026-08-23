import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { tenants, subscriptions } from "@complianceos/db";
import type { Database } from "@complianceos/db";
import { eq } from "drizzle-orm";
import { verifyRazorpaySignature } from "@/lib/razorpay-verify";

export const runtime = "nodejs";

/**
 * Client-side Razorpay checkout success handler. Verifies the HMAC
 * signature server-side (never trust the browser), then flips the tenant
 * plan and records the subscription.
 */
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token.tenantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const paymentId = typeof body?.paymentId === "string" ? body.paymentId : "";
    const signature = typeof body?.signature === "string" ? body.signature : "";
    const plan = body?.plan;
    const period = body?.period;

    if (!orderId || !paymentId || !signature) {
      return Response.json({ error: "Missing payment confirmation fields." }, { status: 400 });
    }
    if ((plan !== "pro" && plan !== "business") || (period !== "monthly" && period !== "annual")) {
      return Response.json({ error: "Invalid plan or period." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return Response.json({ error: "Payments are not configured yet." }, { status: 501 });
    }

    // Server-side verification — the browser cannot forge this without the secret.
    const valid = verifyRazorpaySignature(orderId, paymentId, signature, keySecret);
    if (!valid) {
      return Response.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const tenantId = String(token.tenantId);
    const amountPaise =
      plan === "pro"
        ? period === "monthly" ? 90000 : 900000
        : period === "monthly" ? 240000 : 2400000;
    const currentPeriodEnd = new Date(
      Date.now() + (period === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
    );

    const database = getDb();
    await (database as any).transaction(async (tx: any) => {
      await tx.update(tenants).set({
        plan,
        planStatus: "active",
        updatedAt: new Date(),
      }).where(eq(tenants.id, String(token.tenantId)));

      // One subscription row per tenant — update or insert (idempotent).
      const [existing] = await tx.select({ id: subscriptions.id }).from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
      if (existing) {
        await tx.update(subscriptions).set({
          plan,
          status: "active",
          providerSubscriptionId: paymentId,
          amountPaise,
          period,
          currentPeriodEnd,
          updatedAt: new Date(),
        }).where(eq(subscriptions.id, existing.id));
      } else {
        await tx.insert(subscriptions).values({
          tenantId,
          plan,
          status: "active",
          provider: "razorpay",
          providerSubscriptionId: paymentId,
          amountPaise,
          currency: "INR",
          period,
          currentPeriodEnd,
        });
      }
    });

    return Response.json({ ok: true, plan });
  } catch (err) {
    console.error("billing verify error:", err);
    return Response.json({ error: "Could not confirm the payment." }, { status: 500 });
  }
}
