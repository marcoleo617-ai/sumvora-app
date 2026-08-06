import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets and the Paddle webhook (no session cookies; avoid
     * touching auth on signed webhook POSTs).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks/paddle|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
