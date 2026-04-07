import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/gems/"],
        disallow: ["/render/", "/api/"],
      },
    ],
    sitemap: "https://gems.m3000.io/sitemap.xml",
  };
}
