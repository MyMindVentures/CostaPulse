import { NextResponse } from "next/server";
import { setParticipantsInputSchema } from "@/server/bookings/schema";
import { setBookingParticipants } from "@/server/bookings/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = setParticipantsInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "The participants payload is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const result = await setBookingParticipants(id, parsed.data);
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
    participantCount: result.participantCount
  });
}
