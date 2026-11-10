import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhanushbattu.in";

/** Everyone may crawl. AI crawlers are named explicitly so their owners can see they're welcome. */
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot",
  "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent", "DuckAssistBot",
];

/**
 * Images kept out of image search. The only photo meant to show up in Google/Bing Images is the
 * opening-screen photo (img/dhanush-hero.webp). The scroll-film portrait and the résumé page images
 * still load normally on the site; search engines just don't index them.
 */
const hiddenImages = ["/img/dhanush-portrait.webp", "/img/dhanush-portrait-map.png", "/img/resume-full.webp", "/img/resume-preview.webp"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: hiddenImages },
      { userAgent: "Googlebot-Image", allow: "/", disallow: hiddenImages },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/", disallow: hiddenImages })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
