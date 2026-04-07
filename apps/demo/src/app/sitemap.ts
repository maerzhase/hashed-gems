import type { MetadataRoute } from "next";
import { DEMO_USERS } from "@/lib/demoUsers";

const BASE_URL = "https://gems.m3000.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...DEMO_USERS.map((seed) => ({
      url: `${BASE_URL}/gem/${encodeURIComponent(seed)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
