import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/caveat";
import "./globals.css";
import { profile, education, achievements, veriai, rental, cafe, ipl, experience } from "@/content/profile";
import { faq } from "@/content/faq";

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
    type: "profile",
    firstName: "Dhanush",
    lastName: "Battu",
    username: "DhanushBattu",
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

const personId = `${siteUrl}/#person`;
const byHim = { "@id": personId };

const person = {
  "@type": "Person",
  "@id": personId,
  name: profile.name,
  alternateName: ["Dhanush Battu", "Battu Dhanush", "Dhanush"],
  givenName: "Dhanush",
  familyName: "Battu",
  url: siteUrl,
  image: `${siteUrl}/img/dhanush-hero.webp`,
  description:
    "Software engineer in Bengaluru, India, building full-stack web, cross-platform mobile and machine-learning applications. B.E. in Artificial Intelligence and Machine Learning at BMS Institute of Technology and Management.",
  jobTitle: "Software Development Engineer",
  hasOccupation: { "@type": "Occupation", name: "Software Development Engineer", occupationLocation: { "@type": "City", name: "Bengaluru" } },
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
  homeLocation: { "@type": "Place", name: "Bengaluru, Karnataka, India" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: education[0].place, alternateName: "BMSIT" },
    { "@type": "CollegeOrUniversity", name: education[1].place },
  ],
  award: achievements.highlight.map((a) => `${a.title.charAt(0)}${a.title.slice(1).toLowerCase()}, ${a.sub}`),
  hasCredential: achievements.certs.map((c) => ({
    "@type": "EducationalOccupationalCredential",
    name: c.title,
    credentialCategory: "certificate",
    recognizedBy: { "@type": "Organization", name: c.name },
  })),
  sameAs: [profile.github, profile.linkedin],
  knowsAbout: [
    "Artificial Intelligence", "Machine Learning", "Generative AI", "Large Language Models", "Full-stack web development",
    "Cross-platform mobile development", "Python", "Java", "JavaScript", "TypeScript", "Dart", "SQL", "FastAPI", "Flask",
    "React", "Flutter", "Firebase", "PyTorch", "Hugging Face Transformers", "scikit-learn", "Data structures and algorithms",
  ],
};

const code = (name: string, description: string, repo: string, langs: string[]) => ({
  "@type": "SoftwareSourceCode",
  name,
  description,
  codeRepository: repo,
  programmingLanguage: langs,
  author: byHim,
});

const projects = [
  code(veriai.title, veriai.summary, profile.repos.veriai, ["Python", "TypeScript"]),
  code("Cross-platform Rental App", rental.summary, profile.repos.rental, ["Dart"]),
  code("IPL Intelligence", ipl.summary, profile.repos.ipl, ["Python"]),
  { "@type": "SoftwareApplication", name: "Cyber Café Management System", description: cafe.summary, applicationCategory: "BusinessApplication", author: byHim },
  {
    "@type": "CreativeWork",
    name: `${experience.org}: AI digital marketing assistant and marketing automation workflow`,
    description: experience.points.join(". ") + ".",
    author: byHim,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    person,
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "Dhanush Battu", alternateName: ["Battu Dhanush", "DHANUSH LAB"], inLanguage: "en-IN", about: byHim, publisher: byHim },
    { "@type": "ProfilePage", "@id": `${siteUrl}/#profile`, url: siteUrl, name: title, description, inLanguage: "en-IN", isPartOf: { "@id": `${siteUrl}/#website` }, mainEntity: byHim, about: byHim, hasPart: projects },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      url: `${siteUrl}/#faq`,
      about: byHim,
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
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
