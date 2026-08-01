import type { MetadataRoute } from "next";
import { PROJECT } from "../lib/project";

const releasedAt = new Date("2026-08-01T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: PROJECT.siteUrl,
      lastModified: releasedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${PROJECT.siteUrl}/beta`,
      lastModified: releasedAt,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${PROJECT.siteUrl}/prototype`,
      lastModified: releasedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${PROJECT.siteUrl}/extension`,
      lastModified: releasedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${PROJECT.siteUrl}/transparency`,
      lastModified: releasedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
