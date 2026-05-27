import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ name: "auth", max: 5, windowSec: 60 });

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  const rl = limiter.check(request);
  if (rl.limited) return rl.response!;
  return handlers.POST(request);
}
