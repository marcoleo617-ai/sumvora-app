import { NextResponse } from "next/server";
import { verifyPaddleWebhookSignature } from "@/lib/paddle/verify-signature";
import { handlePaddleWebhookEvent } from "@/lib/paddle/webhook-handlers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 },
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "[paddle-webhook] SUPABASE_SERVICE_ROLE_KEY is not configured — cannot update plans.",
    );
    return NextResponse.json(
      { error: "Server misconfigured for plan updates." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  console.log("[paddle-webhook] request received", {
    hasSignature: Boolean(signature),
    bodyLength: rawBody.length,
    hasServiceRoleKey: true,
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  });

  const verification = verifyPaddleWebhookSignature(
    rawBody,
    signature,
    webhookSecret,
  );

  if (!verification.ok) {
    console.error(
      "[paddle-webhook] signature verification failed:",
      verification.error,
    );
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  console.log("[paddle-webhook] signature verification success", {
    timestamp: verification.timestamp,
  });

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown JSON parse error.";
    console.error("[paddle-webhook] JSON parse failed:", message);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const result = await handlePaddleWebhookEvent(
      payload as Parameters<typeof handlePaddleWebhookEvent>[0],
    );

    if (!result.handled) {
      console.error(
        "[paddle-webhook] handler failed (will retry):",
        result.error ?? "Unknown error.",
      );
      return NextResponse.json(
        { error: result.error ?? "Failed to process webhook." },
        { status: 500 },
      );
    }

    console.log("[paddle-webhook] processed successfully");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook processing error.";
    console.error("[paddle-webhook] unhandled processing error:", message);
    return NextResponse.json(
      { error: "Failed to process webhook." },
      { status: 500 },
    );
  }
}
