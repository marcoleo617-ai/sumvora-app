"use client";

import { usePaddle } from "@/hooks/use-paddle";
import {
  getCheckoutSuccessUrl,
  SUMVORA_PRO_PRICE_ID,
} from "@/lib/paddle/config";

type UpgradeToProButtonProps = {
  email: string | null;
  userId: string;
};

export default function UpgradeToProButton({
  email,
  userId,
}: UpgradeToProButtonProps) {
  const paddle = usePaddle();

  const handleUpgrade = () => {
    if (!paddle) {
      return;
    }

    if (!SUMVORA_PRO_PRICE_ID) {
      console.warn("Sumvora Pro Paddle price ID is not configured.");
      return;
    }

    // customData values must be strings so webhooks can map the buyer to Supabase.
    const customData: Record<string, string> = {
      user_id: userId,
    };

    if (email) {
      customData.user_email = email;
    }

    paddle.Checkout.open({
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: getCheckoutSuccessUrl(),
      },
      items: [{ priceId: SUMVORA_PRO_PRICE_ID, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
      customData,
    });
  };

  const isDisabled = !paddle || !SUMVORA_PRO_PRICE_ID;

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={isDisabled}
      className="btn-primary w-full"
    >
      Upgrade to Pro
    </button>
  );
}
