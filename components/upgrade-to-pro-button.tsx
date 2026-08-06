"use client";

import { usePaddle } from "@/hooks/use-paddle";

type UpgradeToProButtonProps = {
  email: string | null;
  userId: string;
};

export default function UpgradeToProButton({
  email,
  userId,
}: UpgradeToProButtonProps) {
  const paddle = usePaddle();
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID;

  const handleUpgrade = () => {
    if (!paddle) {
      return;
    }

    if (!priceId) {
      console.warn("NEXT_PUBLIC_PADDLE_PRO_PRICE_ID is not set.");
      return;
    }

    // Paddle customData values must be strings. Both user_id and user_email
    // are included so webhooks can resolve the Sumvora account reliably.
    const customData: Record<string, string> = {
      user_id: userId,
    };

    if (email) {
      customData.user_email = email;
    }

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
      customData,
    });
  };

  const isDisabled = !paddle || !priceId;

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
