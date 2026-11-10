import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhanushbattu.in";

/** Everyone may crawl. AI crawlers are named explicitly so their owners can see they're welcome. */
const aiCrawlers = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot",
  "Perplexity-User", "Google-Extended", "Applebot-Extended", "Bingbot", "CCBot", "meta-externalagent", "DuckAssistBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
