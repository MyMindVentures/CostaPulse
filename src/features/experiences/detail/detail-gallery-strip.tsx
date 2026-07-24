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

  if (media.length === 0) return null;

  const overflow = Math.max(0, media.length - VISIBLE_TILES);
  const visible = expanded ? media : media.slice(0, VISIBLE_TILES);

  return (
    <div className="xp-gallery-strip" role="list" aria-label={`${title} gallery`}>
      {visible.map((item, index) => {
        const isLastCollapsed =
          !expanded && overflow > 0 && index === visible.length - 1 && media.length > VISIBLE_TILES;
        const showVideo = item.mediaType === "video";

        return (
          <div key={item.id} className="xp-gallery-tile" role="listitem">
            {item.url ? (
              showVideo ? (
                <div className="xp-gallery-video">
                  <Image
                    src={item.url}
                    alt={item.altText ?? `${title} video`}
                    fill
                    sizes="160px"
                    className="xp-gallery-image"
                  />
                  <span className="xp-gallery-play" aria-hidden>
                    <Play size={18} fill="currentColor" />
                  </span>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={item.altText ?? `${title} photo ${index + 1}`}
                  fill
                  sizes="160px"
                  className="xp-gallery-image"
                />
              )
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
