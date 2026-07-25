"use client";

import Image from "next/image";
import { Play, Plus } from "lucide-react";
import { useState } from "react";
import type { ExperienceDetailMedia } from "@/server/repositories/catalog";

const VISIBLE_TILES = 6;

type DetailGalleryStripProps = {
  media: ExperienceDetailMedia[];
  title: string;
};

export function DetailGalleryStrip({ media, title }: DetailGalleryStripProps) {
  const [expanded, setExpanded] = useState(false);
  const galleryMedia = media.filter(
    (item) => item.placementKey !== "hero" && item.url
  );

  if (galleryMedia.length === 0) return null;

  const overflow = Math.max(0, galleryMedia.length - VISIBLE_TILES);
  const visible = expanded
    ? galleryMedia
    : galleryMedia.slice(0, VISIBLE_TILES);

  return (
    <div
      className="xp-gallery-strip mt-3 grid w-full max-w-[42rem] grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"
      role="list"
      aria-label={`${title} gallery`}
    >
      {visible.map((item, index) => {
        const isLastCollapsed =
          !expanded &&
          overflow > 0 &&
          index === visible.length - 1 &&
          galleryMedia.length > VISIBLE_TILES;
        const showVideo = item.mediaType === "video";

        return (
          <div key={item.id} className="xp-gallery-tile" role="listitem">
            {showVideo ? (
              <div className="xp-gallery-video">
                {item.url ? (
                  <video
                    src={item.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="xp-gallery-image"
                    aria-label={item.altText ?? `${title} video`}
                  />
                ) : null}
                <span className="xp-gallery-play" aria-hidden>
                  <Play size={18} fill="currentColor" />
                </span>
              </div>
            ) : item.url ? (
              <Image
                src={item.url}
                alt={item.altText ?? `${title} photo ${index + 1}`}
                fill
                sizes="160px"
                className="xp-gallery-image"
                style={{ objectPosition: `${item.focalX}% ${item.focalY}%` }}
              />
            ) : (
              <div className="xp-gallery-fallback" aria-hidden />
            )}

            {isLastCollapsed ? (
              <button
                type="button"
                className="xp-gallery-more"
                onClick={() => setExpanded(true)}
              >
                <Plus size={16} aria-hidden />
                {overflow} View more
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
