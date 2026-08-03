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

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      ...(email ? { customer: { email } } : {}),
      customData: {
        user_id: userId,
      },
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
