import { NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/server/availability/schema";
import { getAvailabilityForExperience } from "@/server/availability/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const url = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    variantId: url.searchParams.get("variantId"),
    date: url.searchParams.get("date"),
    partySize: url.searchParams.get("partySize")
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "invalid_request",
        error: "The availability query is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  const result = await getAvailabilityForExperience(slug, parsed.data);
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

  return NextResponse.json(result.body, { status: result.status });
}
