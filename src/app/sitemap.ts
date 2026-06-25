import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Fallback to the production domain. The user can customize this or define NEXT_PUBLIC_SITE_URL in .env
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bootanimdeck.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/studio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video-to-bootanimation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
