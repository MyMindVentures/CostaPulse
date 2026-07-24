import { NextResponse } from "next/server";
import { createDraftBookingInputSchema } from "@/server/bookings/schema";
import { createDraftBooking } from "@/server/bookings/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = createDraftBookingInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "The booking draft payload is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const result = await createDraftBooking(parsed.data);
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

  return NextResponse.json(
    {
      status: "created",
      booking: result.booking
    },
    { status: result.status }
  );
}
