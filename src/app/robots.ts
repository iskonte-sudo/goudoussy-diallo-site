import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin"]
      }
    ],
    sitemap: `${process.env.NEXTAUTH_URL ?? "https://goudoussydiallo.gn"}/sitemap.xml`
  };
}
