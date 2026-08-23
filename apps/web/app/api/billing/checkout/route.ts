import { getToken } from "next-auth/jwt";
import { getDb } from "@/lib/db";
import { tenants } from "@complianceos/db";
import { eq } from "drizzle-orm";
import { planPricePaise } from "@/lib/pricing";

export const runtime = "nodejs";

/**
 * Creates a Razorpay order for a plan upgrade. Requires an authenticated
 * session. Honest 501 when Razorpay env is not configured — never a fake
 * success.
 */
export async function POST(req: Request) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub || !token.tenantId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return Response.json(
        { error: "Payments are not configured yet." },
        { status: 501 },
      );
    }

    const body = await req.json().catch(() => null);
    const plan = body?.plan;
    const period = body?.period;
    if (plan !== "pro" && plan !== "business") {
      return Response.json({ error: "plan must be pro or business" }, { status: 400 });
    }
    if (period !== "monthly" && period !== "annual") {
      return Response.json({ error: "period must be monthly or annual" }, { status: 400 });
    }

    const amountPaise = planPricePaise(plan, period);

    // Create the Razorpay order (Basic auth over the Orders API).
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `${String(token.tenantId).slice(0, 18)}-${plan}-${period}`.slice(0, 40),
        notes: { tenantId: String(token.tenantId), plan, period },
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("razorpay order failed:", res.status, detail.slice(0, 200));
      return Response.json(
        { error: "Could not create the payment order. Try again." },
        { status: 502 },
      );
    }

    const order = (await res.json()) as { id: string; amount: number };

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: "INR",
      keyId,
      plan,
      period,
    });
  } catch (err) {
    console.error("billing checkout error:", err);
    return Response.json({ error: "Checkout failed." }, { status: 500 });
  }
}
