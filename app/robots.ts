import type { MetadataRoute } from "next";
import { PROJECT } from "../lib/project";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${PROJECT.siteUrl}/sitemap.xml`,
    host: PROJECT.siteUrl,
  };
}
