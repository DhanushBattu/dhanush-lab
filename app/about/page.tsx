import type { Metadata } from "next";
import Link from "next/link";
import { faq } from "@/content/faq";
import { profile, education, achievements } from "@/content/profile";

/**
 * A plain, text-first page about Dhanush. The home page is long and heavy with animation markup,
 * so search engines and AI assistants that only read the start of a page can miss the facts.
 * This page is a few KB of real HTML with no client JavaScript: bio, quick answers and links.
 */
export const metadata: Metadata = {
  title: "About Dhanush Battu · Software Engineer in Bengaluru",
  description:
    "Who Dhanush Battu (Battu Dhanush) is: a software engineer in Bengaluru building AI and full-stack systems, studying AI & ML at BMSIT. Projects, education and contact.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About Dhanush Battu", type: "profile" },
};

const links = [
  { label: "Portfolio", href: "/", note: "projects with live simulations" },
  { label: "Résumé (PDF)", href: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/${profile.resumePdf}`, note: "one page", file: true },
  { label: "GitHub", href: profile.github, note: "github.com/DhanushBattu" },
  { label: "LinkedIn", href: profile.linkedin, note: "linkedin.com/in/dhanush-battu-263089301" },
  { label: "Email", href: `mailto:${profile.email}`, note: profile.email },
];

export default function About() {
  return (
    <main className="relative mx-auto max-w-[820px] px-5 pb-24 pt-14 md:px-10 md:pt-20">
      <Link href="/" className="label underline-offset-4 hover:text-fg hover:underline">
        ← dhanushbattu.in
      </Link>

      <header className="mt-10">
        <p className="hand text-[26px]">about</p>
        <h1 className="display mt-2 text-[clamp(44px,8vw,88px)]">Dhanush Battu</h1>
        <p className="mt-3 text-[15px] font-medium text-muted">Also written Battu Dhanush · Software Development Engineer · Bengaluru, India</p>
      </header>

      <section aria-labelledby="bio" className="mt-10">
        <h2 id="bio" className="sr-only">
          Short bio
        </h2>
        <p className="text-[18px] leading-relaxed text-fg">{faq[0].a}</p>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">{profile.summary}</p>
      </section>

      <section aria-labelledby="answers" className="mt-14">
        <h2 id="answers" className="font-display text-[28px] font-bold tracking-[-0.02em]">
          Quick answers
        </h2>
        <div className="mt-6 border-t border-line">
          {faq.slice(1).map((f) => (
            <section key={f.q} className="border-b border-line py-6">
              <h3 className="font-display text-[20px] font-bold leading-snug tracking-[-0.01em]">{f.q}</h3>
              <p className="mt-2 text-[16px] leading-relaxed text-muted">{f.a}</p>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="education" className="mt-14">
        <h2 id="education" className="font-display text-[28px] font-bold tracking-[-0.02em]">
          Education
        </h2>
        <ul className="mt-5 space-y-3 text-[16px] leading-relaxed text-muted">
          {education.map((e) => (
            <li key={e.title}>
              <span className="font-semibold text-fg">{e.title}</span>, {e.place}. {e.year}
              {e.meta ? ` · ${e.meta}` : ""}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">
          {achievements.highlight.map((a) => `Tech Quiz winner, ${a.sub.replace(" · ", ", ")}.`).join(" ")} Certifications:{" "}
          {achievements.certs.map((c) => `${c.name}: ${c.title}`).join("; ")}.
        </p>
      </section>

      <section aria-labelledby="find" className="mt-14">
        <h2 id="find" className="font-display text-[28px] font-bold tracking-[-0.02em]">
          Find him
        </h2>
        <ul className="mt-5 border-t border-line">
          {links.map((l) => (
            <li key={l.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-4">
              {l.href === "/" ? (
                <Link href={l.href} className="font-display text-[19px] font-bold underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} rel={"file" in l || l.href.startsWith("mailto:") ? undefined : "me noopener"} className="font-display text-[19px] font-bold underline-offset-4 hover:underline">
                  {l.label}
                </a>
              )}
              <span className="text-[15px] text-muted">{l.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
