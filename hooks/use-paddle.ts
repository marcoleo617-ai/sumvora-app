"use client";

import type { Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";
import { getPaddle } from "@/lib/paddle/client";

export function usePaddle(): Paddle | undefined {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    let active = true;

    getPaddle().then((instance) => {
      if (active) {
        setPaddle(instance);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return paddle;
}
