import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhanushbattu.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/resume/Battu_Dhanush_Resume.pdf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/llms.txt`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
