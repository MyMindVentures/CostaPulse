import { NextResponse } from "next/server";
import { z } from "zod";
import { createBookingCheckoutSession } from "@/server/bookings/checkout";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const bodySchema = z.object({
  experienceSlug: z.string().trim().min(1).max(120),
  email: z.email().optional(),
  sessionId: z.string().uuid().optional()
});

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success || (!parsed.data.email && !parsed.data.sessionId)) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "Provide experienceSlug and email or sessionId."
      },
      { status: 400 }
    );
  }

  const result = await createBookingCheckoutSession({
    bookingId: id,
    experienceSlug: parsed.data.experienceSlug,
    accessEmail: parsed.data.email,
    anonymousSessionId: parsed.data.sessionId
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        status: "error",
        code: result.code,
        error: result.message
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    status: "ok",
    checkoutUrl: result.checkoutUrl,
    sessionId: result.sessionId
  });
}
