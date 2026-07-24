"use client";

import Image from "next/image";
import { useState } from "react";

type ExperienceCardImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
};

export function ExperienceCardImage({
  src,
  alt,
  priority = false
}: ExperienceCardImageProps) {
  const [failed, setFailed] = useState(false);

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
      onError={() => setFailed(true)}
    />
  );
}
