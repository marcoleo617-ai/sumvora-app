import crypto from "crypto";

/**
 * Replay-attack window. Paddle's SDK default is 5s, which is too tight for
 * Vercel cold starts and webhook retries. Five minutes matches common practice
 * (and our earlier working tolerance).
 */
const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1_000;

export type PaddleSignatureVerificationResult =
  | { ok: true; timestamp: string }
  | { ok: false; error: string };

function parsePaddleSignatureHeader(signatureHeader: string): {
  timestamp: string;
  signatures: string[];
} | null {
  const timestamps: string[] = [];
  const signatures: string[] = [];

  for (const part of signatureHeader.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key === "ts") {
      timestamps.push(value);
    }

    if (key === "h1" && value) {
      signatures.push(value);
    }
  }

  const timestamp = timestamps[0];

  if (!timestamp || signatures.length === 0) {
    return null;
  }

  return { timestamp, signatures };
}

function signaturesMatch(
  expectedSignature: string,
  receivedSignatures: string[],
): boolean {
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  return receivedSignatures.some((receivedSignature) => {
    try {
      const receivedBuffer = Buffer.from(receivedSignature, "utf8");

      return (
        receivedBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      );
    } catch {
      return false;
    }
  });
}

export function verifyPaddleWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): PaddleSignatureVerificationResult {
  if (!signatureHeader?.trim()) {
    return { ok: false, error: "Missing Paddle-Signature header." };
  }

  const trimmedSecret = secret.trim();
  if (!trimmedSecret) {
    return { ok: false, error: "Empty PADDLE_WEBHOOK_SECRET." };
  }

  const parsed = parsePaddleSignatureHeader(signatureHeader);
  if (!parsed) {
    return {
      ok: false,
      error: `Invalid Paddle-Signature header format: "${signatureHeader}".`,
    };
  }

  const timestampMs = Number(parsed.timestamp) * 1_000;
  if (!Number.isFinite(timestampMs)) {
    return {
      ok: false,
      error: `Invalid timestamp in Paddle-Signature header: "${parsed.timestamp}".`,
    };
  }

  const ageMs = Date.now() - timestampMs;
  if (ageMs > MAX_SIGNATURE_AGE_MS) {
    return {
      ok: false,
      error: `Webhook timestamp is too old (${ageMs}ms; tolerance is ${MAX_SIGNATURE_AGE_MS}ms).`,
    };
  }

  const signedPayload = `${parsed.timestamp}:${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", trimmedSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  if (!signaturesMatch(expectedSignature, parsed.signatures)) {
    return {
      ok: false,
      error:
        "Computed HMAC signature does not match any h1 value in Paddle-Signature header.",
    };
  }

  return { ok: true, timestamp: parsed.timestamp };
}
