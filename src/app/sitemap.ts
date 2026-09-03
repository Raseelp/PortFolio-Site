import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

// A single-page site — one entry is all a sitemap needs here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
