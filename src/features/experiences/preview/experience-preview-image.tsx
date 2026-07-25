"use client";

import Image from "next/image";
import { useState } from "react";

type ExperiencePreviewImageProps = {
  src: string;
  alt: string;
  focalX?: number;
  focalY?: number;
  priority?: boolean;
};

export function ExperiencePreviewImage({
  src,
  alt,
  focalX = 50,
  focalY = 50,
  priority = false
}: ExperiencePreviewImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
      className="experience-card-image"
      style={{ objectFit: "cover", objectPosition: `${focalX}% ${focalY}%` }}
      onError={() => setFailed(true)}
    />
  );
}
