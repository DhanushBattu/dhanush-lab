import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/caveat";
import "./globals.css";
import { profile, education } from "@/content/profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = "DHANUSH LAB — the digital laboratory of Battu Dhanush, AI/ML engineer and software builder. Play with his live projects and see what he builds.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dhanush — AI/ML Builder | DHANUSH LAB",
  description,
  applicationName: "DHANUSH LAB",
  authors: [{ name: profile.name, url: profile.github }],
  keywords: ["Battu Dhanush", "AI/ML", "Machine Learning", "Portfolio", "BMSIT", "IIT Madras", "Flutter", "Data Science"],
  openGraph: {
    type: "website",
    title: "Dhanush — AI/ML Builder | DHANUSH LAB",
    description,
    siteName: "DHANUSH LAB",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dhanush — AI/ML Builder | DHANUSH LAB",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2ede3",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI/ML Engineer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  alumniOf: education.slice(0, 2).map((e) => ({ "@type": "CollegeOrUniversity", name: e.place })),
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: ["Artificial Intelligence", "Machine Learning", "Python", "Data Analysis", "Flutter", "Firebase"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body className="grain">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
