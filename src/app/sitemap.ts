import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

function absolute(path: string): string {
  return `${siteUrl.replace(/\/+$/, "")}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: absolute("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: absolute("/experiences"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: absolute("/experiences/map"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: absolute("/team"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];
}
