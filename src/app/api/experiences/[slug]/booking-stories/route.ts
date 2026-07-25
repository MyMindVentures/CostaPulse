import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicExperienceBookingStories } from "@/server/repositories/booking-stories";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).default(6),
  offset: z.coerce.number().int().min(0).default(0)
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid pagination" }, { status: 400 });
  }
  try {
    const page = await getPublicExperienceBookingStories({
      experienceSlug: slug,
      ...parsed.data
    });
    return NextResponse.json(page, {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch {
    return NextResponse.json(
      { error: "Booking stories are temporarily unavailable" },
      { status: 503 }
    );
  }
}
