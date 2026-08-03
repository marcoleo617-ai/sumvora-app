import { NextResponse } from "next/server";
import { verifyPaddleWebhookSignature } from "@/lib/paddle/verify-signature";
import { handlePaddleWebhookEvent } from "@/lib/paddle/webhook-handlers";

export async function POST(request: Request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("PADDLE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  const verification = verifyPaddleWebhookSignature(
    rawBody,
    signature,
    webhookSecret,
  );

  if (!verification.ok) {
    console.error("Paddle webhook signature verification failed:", verification.error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown JSON parse error.";
    console.error("Paddle webhook JSON parse failed:", message);
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const result = await handlePaddleWebhookEvent(
    payload as Parameters<typeof handlePaddleWebhookEvent>[0],
  );

  if (!result.handled) {
    console.error("Paddle webhook handler failed:", result.error ?? "Unknown error.");
    return NextResponse.json(
      { error: result.error ?? "Failed to process webhook." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
