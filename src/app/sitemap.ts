import type { MetadataRoute } from "next";
import { getPublishedTeamMembers } from "@/server/repositories/team";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.costapulse.club";

function absolute(path: string): string {
  return `${siteUrl.replace(/\/+$/, "")}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const teamMembers = await getPublishedTeamMembers();
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
    },
    {
      url: absolute("/availability"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: absolute("/why-costapulse"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    ...teamMembers.map((member) => ({
      url: absolute(`/team/${member.slug}/availability`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7
    }))
  ];
}
