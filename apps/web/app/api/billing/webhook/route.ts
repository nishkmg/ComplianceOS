import { getDb } from "@/lib/db";
import { tenants, subscriptions } from "@complianceos/db";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature } from "@/lib/razorpay-verify";

export const runtime = "nodejs";

/**
 * Razorpay webhook — payment.authorized / payment.failed events.
 * No session: authenticates via the x-razorpay-signature HMAC over the RAW
 * body with RAZORPAY_WEBHOOK_SECRET. Idempotent: a duplicate event for an
 * already-active subscription is a no-op. Returns 200 after processing
 * (Razorpay retries non-2xx).
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: "Webhook not configured." }, { status: 501 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  const database = getDb();
  try {
    const payload = JSON.parse(rawBody);
    const event = payload?.event as string | undefined;
    const payment = payload?.payload?.payment?.entity;
    if (!payment) {
      return Response.json({ ok: true, ignored: "no payment entity" });
    }

    const notes = (payment.notes ?? {}) as Record<string, string>;
    const tenantId = notes.tenantId;
    const plan = notes.plan;
    if (!tenantId || !plan) {
      return Response.json({ ok: true, ignored: "no tenant note" });
    }

    if (event === "payment.failed") {
      // Mark past_due so the tenant knows a renewal failed — do NOT downgrade
      // immediately; grace period is a product decision for later.
      await (database as any).update(tenants).set({ planStatus: "past_due", updatedAt: new Date() }).where(eq(tenants.id, tenantId));
      await (database as any).update(subscriptions).set({ status: "past_due", updatedAt: new Date() }).where(eq(subscriptions.tenantId, tenantId));
      return Response.json({ ok: true });
    }

    if (event !== "payment.authorized" && event !== "order.paid") {
      return Response.json({ ok: true, ignored: `unhandled event ${event}` });
    }

    const providerSubscriptionId = String(payment.id ?? "");
    const period = (notes.period === "annual" ? "annual" : "monthly") as "monthly" | "annual";
    const currentPeriodEnd = new Date(
      Date.now() + (period === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
    );

    // Idempotency: if this exact payment already activated the subscription,
    // replaying the webhook must not double-write or reset the period end.
    const [existing] = await (database as any).select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
    if (
      existing &&
      existing.providerSubscriptionId === providerSubscriptionId &&
      existing.status === "active"
    ) {
      return Response.json({ ok: true, idempotent: true });
    }

    await (database as any).transaction(async (tx: any) => {
      await tx.update(tenants).set({
        plan,
        planStatus: "active",
        updatedAt: new Date(),
      }).where(eq(tenants.id, tenantId));

      if (existing) {
        await tx.update(subscriptions).set({
          plan,
          status: "active",
          providerSubscriptionId,
          amountPaise: Number(payment.amount ?? 0),
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
          providerSubscriptionId,
          amountPaise: Number(payment.amount ?? 0),
          currency: payment.currency ?? "INR",
          period,
          currentPeriodEnd,
        });
      }
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("billing webhook error:", err);
    return Response.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
