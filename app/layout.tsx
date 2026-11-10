import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/caveat";
import "./globals.css";
import { profile, education } from "@/content/profile";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhanushbattu.in";
const title = "Dhanush Battu · Software Engineer, AI & Full-Stack";
const description =
  "Dhanush Battu (Battu Dhanush) is a software engineer in Bengaluru building AI and full-stack systems. B.E. in AI & ML at BMSIT. See his projects, résumé and contact details.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  applicationName: "DHANUSH LAB",
  authors: [{ name: profile.name, url: profile.github }],
  keywords: ["Dhanush Battu", "Battu Dhanush", "Dhanush Battu portfolio", "Software Engineer", "AI/ML", "Machine Learning", "Portfolio", "BMSIT", "IIT Madras", "Flutter", "Data Science"],
  openGraph: {
    type: "website",
    title,
    description,
    url: "/",
    siteName: "DHANUSH LAB",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2ede3",
  colorScheme: "light",
};

const person = {
  "@type": "Person",
  "@id": `${siteUrl}/#person`,
  name: profile.name,
  alternateName: ["Dhanush Battu", "Dhanush"],
  givenName: "Dhanush",
  familyName: "Battu",
  url: siteUrl,
  image: `${siteUrl}/img/dhanush-hero.webp`,
  jobTitle: "Software Development Engineer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  alumniOf: education.slice(0, 2).map((e) => ({ "@type": "CollegeOrUniversity", name: e.place })),
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: ["Artificial Intelligence", "Machine Learning", "Python", "Data Analysis", "Flutter", "Firebase"],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "Dhanush Battu", alternateName: "DHANUSH LAB", about: { "@id": `${siteUrl}/#person` } },
    { "@type": "ProfilePage", url: siteUrl, name: title, mainEntity: { "@id": `${siteUrl}/#person` } },
  ],
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
