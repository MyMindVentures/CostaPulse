import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const DEBUG_SESSION_ID = "20f0e2";
const MAX_BODY_BYTES = 8_192;

/**
 * Same-origin debug ingest so browser logs bypass CSP connect-src limits.
 * Writes NDJSON to the session debug log file.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const entry = {
    ...payload,
    sessionId: DEBUG_SESSION_ID,
    timestamp:
      typeof (payload as { timestamp?: unknown }).timestamp === "number"
        ? (payload as { timestamp: number }).timestamp
        : Date.now()
  };

  const logDir = path.join(process.cwd(), ".cursor");
  const logPath = path.join(logDir, `debug-${DEBUG_SESSION_ID}.log`);

  try {
    await mkdir(logDir, { recursive: true });
    await appendFile(logPath, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
