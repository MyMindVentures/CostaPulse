import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostname = (forwardedHost ?? request.nextUrl.hostname).split(":")[0];

  if (hostname === "costapulse.club") {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.host = "www.costapulse.club";

    return NextResponse.redirect(url, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};
