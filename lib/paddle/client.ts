"use client";

import { initializePaddle, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddleEnvironment(
  token: string,
): "sandbox" | "production" | undefined {
  if (token.startsWith("test_")) {
    return "sandbox";
  }

  if (token.startsWith("live_")) {
    return "production";
  }

  return undefined;
}

export function getPaddle(): Promise<Paddle | undefined> {
  if (paddlePromise) {
    return paddlePromise;
  }

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

  if (!token) {
    console.warn("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set.");
    paddlePromise = Promise.resolve(undefined);
    return paddlePromise;
  }

  const environment = getPaddleEnvironment(token);

  if (!environment) {
    console.warn(
      "NEXT_PUBLIC_PADDLE_CLIENT_TOKEN must start with test_ or live_.",
    );
    paddlePromise = Promise.resolve(undefined);
    return paddlePromise;
  }

  paddlePromise = initializePaddle({
    environment,
    token,
  });

  return paddlePromise;
}
