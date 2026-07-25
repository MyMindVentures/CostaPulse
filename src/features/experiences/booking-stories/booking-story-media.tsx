"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { BookingStoryMedia as Media } from "@/lib/view-models/booking-story";

export function BookingStoryMedia({
  media,
  active = true,
  preview = false,
  priority = false,
  sizes = "(max-width: 640px) 88vw, (max-width: 1024px) 55vw, 38vw",
  className
}: {
  media: Media;
  active?: boolean;
  preview?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) videoRef.current?.pause();
  }, [active]);

  if (media.mediaType === "video") {
    return (
      <video
        ref={videoRef}
        className={className}
        src={media.url}
        controls={active && !preview}
        muted={preview}
        playsInline
        preload={active || preview ? "metadata" : "none"}
        aria-label={media.altText}
      />
    );
  }

  return (
    <Image
      src={media.url}
      alt={media.altText}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
