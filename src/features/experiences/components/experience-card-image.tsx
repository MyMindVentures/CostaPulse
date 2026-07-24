"use client";

import Image from "next/image";
import { useState } from "react";

type ExperienceCardImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>
) {
  // #region agent log
  fetch("/api/debug-ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "20f0e2" },
    body: JSON.stringify({
      sessionId: "20f0e2",
      runId: "post-fix",
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now()
    })
  }).catch(() => {});
  // #endregion
}

export function ExperienceCardImage({
  src,
  alt,
  priority = false
}: ExperienceCardImageProps) {
  const [failed, setFailed] = useState(false);

  // #region agent log
  debugLog("D", "experience-card-image.tsx:render", "card image render attempt", {
    src,
    alt,
    priority,
    failed
  });
  // #endregion

  if (failed) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
      className="experience-card-image"
      style={{ objectFit: "cover", objectPosition: "center" }}
      onError={(event) => {
        // #region agent log
        debugLog("C", "experience-card-image.tsx:onError", "next/image onError fired", {
          src,
          alt,
          targetSrc: (event.currentTarget as HTMLImageElement | null)?.currentSrc ?? null
        });
        // #endregion
        setFailed(true);
      }}
      onLoad={(event) => {
        // #region agent log
        const img = event.currentTarget;
        debugLog("E", "experience-card-image.tsx:onLoad", "next/image onLoad fired", {
          src,
          currentSrc: img.currentSrc,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });
        // #endregion
      }}
    />
  );
}
